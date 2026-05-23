use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use rand::{Rng, thread_rng};
use generic_array::GenericArray;
use typenum::U32;

use crate::crypto::{encrypt_to_base64, decrypt_from_base64, derive_encryption_key};
use crate::models::User;
use super::database::Database;
use base64::Engine as _;

const DATA_KEY_LENGTH: usize = 32;

fn generate_data_key() -> String {
    let mut rng = rand::thread_rng();
    let key_bytes: [u8; DATA_KEY_LENGTH] = rng.gen();
    base64::engine::general_purpose::STANDARD.encode(key_bytes)
}

impl Database {
    pub fn login(&self, username: &str, access_key: &str) -> Result<User, String> {
        let (user_id, username_encrypted_access, username_nonce_access, data_key_encrypted, data_key_nonce, access_key_hash) = {
            let conn = self.conn.lock().unwrap();
            let mut stmt = conn.prepare("SELECT id, username_encrypted_access, username_nonce_access, data_key_encrypted_access, data_key_nonce_access, access_key_hash FROM users").map_err(|e| e.to_string())?;
            let all_users: Vec<(i32, String, String, String, String, String)> = stmt.query_map([], |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                    row.get(5)?,
                ))
            }).map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

            let mut found = None;
            for (id, enc_user, nonce, data_key_enc, data_key_nonce, access_hash) in all_users {
                let access_salt = extract_salt_from_hash(&access_hash)?;
                let access_key_derived = derive_encryption_key(access_key, &access_salt)?;
                
                if let Ok(decrypted_username) = decrypt_from_base64(&enc_user, &nonce, &access_key_derived) {
                    if decrypted_username == username {
                        found = Some((id, enc_user, nonce, data_key_enc, data_key_nonce, access_hash));
                        break;
                    }
                }
            }

            found.ok_or("User not found".to_string())?
        };

        let parsed_access_hash = PasswordHash::new(&access_key_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(access_key.as_bytes(), &parsed_access_hash).map_err(|_| "Invalid access key".to_string())?;

        let access_salt = extract_salt_from_hash(&access_key_hash)?;
        let access_key_derived = derive_encryption_key(access_key, &access_salt)?;

        let _data_key = decrypt_from_base64(&data_key_encrypted, &data_key_nonce, &access_key_derived)
            .map_err(|e| e.to_string())?;

        Ok(User {
            id: user_id,
            username: username.to_string(),
            username_encrypted: Some(username_encrypted_access),
            username_nonce: Some(username_nonce_access),
            master_key_hash: access_key_hash,
            avatar: None,
        })
    }

    pub fn register(&self, username: &str, access_key: &str, master_key: &str) -> Result<(User, String), String> {
        let conn = self.conn.lock().unwrap();

        let count: i32 = conn.query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0)).unwrap_or(0);
        if count > 0 {
            let mut stmt = conn.prepare("SELECT username_encrypted_access, username_nonce_access, access_key_hash FROM users").map_err(|e| e.to_string())?;
            let all_users: Vec<(String, String, String)> = stmt.query_map([], |row| {
                Ok((row.get(0)?, row.get(1)?, row.get(2)?))
            }).map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

            for (enc_user, nonce, stored_access_hash) in all_users {
                let salt = extract_salt_from_hash(&stored_access_hash)?;
                let key = derive_encryption_key(access_key, &salt)?;
                
                if let Ok(decrypted) = decrypt_from_base64(&enc_user, &nonce, &key) {
                    if decrypted == username {
                        return Err("User already exists".to_string());
                    }
                }
            }
        }

        let data_key = generate_data_key();
        
        let access_salt = SaltString::generate(&mut thread_rng());
        let argon2 = Argon2::default();
        let access_key_hash = argon2.hash_password(access_key.as_bytes(), &access_salt).map_err(|e| e.to_string())?.to_string();
        
        let access_salt_bytes = extract_salt_from_hash(&access_key_hash)?;
        let access_key_derived = derive_encryption_key(access_key, &access_salt_bytes)?;
        
        let (data_key_encrypted_access, data_key_nonce_access) = encrypt_to_base64(&data_key, &access_key_derived).map_err(|e| e.to_string())?;
        
        let master_salt = SaltString::generate(&mut thread_rng());
        let master_key_hash = argon2.hash_password(master_key.as_bytes(), &master_salt).map_err(|e| e.to_string())?.to_string();
        
        let master_salt_bytes = extract_salt_from_hash(&master_key_hash)?;
        let master_key_derived = derive_encryption_key(master_key, &master_salt_bytes)?;
        
        let (data_key_encrypted_master, data_key_nonce_master) = encrypt_to_base64(&data_key, &master_key_derived).map_err(|e| e.to_string())?;
        
        let (username_encrypted_access, username_nonce_access) = encrypt_to_base64(username, &access_key_derived).map_err(|e| e.to_string())?;
        let (username_encrypted_master, username_nonce_master) = encrypt_to_base64(username, &master_key_derived).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO users (username_encrypted_access, username_nonce_access, username_encrypted_master, username_nonce_master, access_key_hash, master_key_hash, data_key_encrypted_access, data_key_nonce_access, data_key_encrypted_master, data_key_nonce_master) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [&username_encrypted_access, &username_nonce_access, &username_encrypted_master, &username_nonce_master, &access_key_hash, &master_key_hash, &data_key_encrypted_access, &data_key_nonce_access, &data_key_encrypted_master, &data_key_nonce_master],
        ).map_err(|e| e.to_string())?;

        let user_id = conn.last_insert_rowid() as i32;

        Ok((User {
            id: user_id,
            username: username.to_string(),
            username_encrypted: Some(username_encrypted_access),
            username_nonce: Some(username_nonce_access),
            master_key_hash: access_key_hash,
            avatar: None,
        }, master_key.to_string()))
    }

    pub fn get_user_by_master_key(&self, username: &str, master_key: &str) -> Result<i32, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, username_encrypted_master, username_nonce_master, master_key_hash FROM users")
            .map_err(|e| e.to_string())?;
        
        let all_users: Vec<(i32, String, String, String)> = stmt.query_map([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
            ))
        }).map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

        for (id, enc_user_master, nonce_master, master_key_hash) in all_users {
            let parsed_hash = match PasswordHash::new(&master_key_hash) {
                Ok(hash) => hash,
                Err(_) => continue,
            };
            
            if Argon2::default().verify_password(master_key.as_bytes(), &parsed_hash).is_err() {
                continue;
            }
            
            let master_salt = match extract_salt_from_hash(&master_key_hash) {
                Ok(salt) => salt,
                Err(_) => continue,
            };
            
            let key = match derive_encryption_key(master_key, &master_salt) {
                Ok(k) => k,
                Err(_) => continue,
            };
            
            if let Ok(decrypted) = decrypt_from_base64(&enc_user_master, &nonce_master, &key) {
                if decrypted == username {
                    return Ok(id);
                }
            }
        }

        Err("User not found".to_string())
    }

    pub fn verify_master_key(&self, user_id: i32, master_key: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let (master_key_hash, data_key_enc, data_key_nonce): (String, String, String) = conn.query_row(
            "SELECT master_key_hash, data_key_encrypted_master, data_key_nonce_master FROM users WHERE id = ?",
            [user_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        ).map_err(|e| e.to_string())?;

        let parsed_hash = PasswordHash::new(&master_key_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(master_key.as_bytes(), &parsed_hash)
            .map_err(|_| "Invalid master key".to_string())?;

        let master_salt = extract_salt_from_hash(&master_key_hash)?;
        let master_key_derived = derive_encryption_key(master_key, &master_salt).map_err(|e| e.to_string())?;

        decrypt_from_base64(&data_key_enc, &data_key_nonce, &master_key_derived)
            .map_err(|_| "Invalid master key".to_string())?;

        Ok(())
    }

    pub fn get_data_key_from_access(&self, user_id: i32, access_key: &str) -> Result<GenericArray<u8, U32>, String> {
        let conn = self.conn.lock().unwrap();
        let (access_key_hash, data_key_enc, data_key_nonce): (String, String, String) = conn.query_row(
            "SELECT access_key_hash, data_key_encrypted_access, data_key_nonce_access FROM users WHERE id = ?",
            [user_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        ).map_err(|e| e.to_string())?;

        let access_salt = extract_salt_from_hash(&access_key_hash)?;
        let access_key_derived = derive_encryption_key(access_key, &access_salt).map_err(|e| e.to_string())?;

        let data_key = decrypt_from_base64(&data_key_enc, &data_key_nonce, &access_key_derived)
            .map_err(|e| e.to_string())?;

        let data_key_bytes = base64::engine::general_purpose::STANDARD.decode(&data_key)
            .map_err(|e| format!("Failed to decode data key: {}", e))?;
        let data_key_derived = GenericArray::clone_from_slice(&data_key_bytes);

        Ok(data_key_derived)
    }

    pub fn change_access_key(&self, user_id: i32, master_key: &str, new_access_key: &str) -> Result<(), String> {
        let (data_key, username) = {
            let conn = self.conn.lock().unwrap();
            let (master_key_hash, data_key_enc, data_key_nonce, username_enc, username_nonce): (String, String, String, String, String) = conn.query_row(
                "SELECT master_key_hash, data_key_encrypted_master, data_key_nonce_master, username_encrypted_master, username_nonce_master FROM users WHERE id = ?",
                [user_id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?))
            ).map_err(|e| e.to_string())?;

            let parsed_hash = PasswordHash::new(&master_key_hash).map_err(|e| e.to_string())?;
            Argon2::default().verify_password(master_key.as_bytes(), &parsed_hash)
                .map_err(|_| "Invalid master key".to_string())?;

            let master_salt = parsed_hash.salt.ok_or("Salt not found in hash")?.as_ref().as_bytes().to_vec();
            let master_key_derived = derive_encryption_key(master_key, &master_salt).map_err(|e| e.to_string())?;

            let data_key = decrypt_from_base64(&data_key_enc, &data_key_nonce, &master_key_derived)
                .map_err(|_| "Invalid master key".to_string())?;

            let username = decrypt_from_base64(&username_enc, &username_nonce, &master_key_derived)
                .map_err(|_| "Invalid master key".to_string())?;

            (data_key, username)
        };

        let new_access_salt = SaltString::generate(&mut thread_rng());
        let argon2 = Argon2::default();
        let new_access_key_hash = argon2.hash_password(new_access_key.as_bytes(), &new_access_salt)
            .map_err(|e| e.to_string())?.to_string();

        let new_access_salt_bytes = extract_salt_from_hash(&new_access_key_hash)?;
        let new_access_key_derived = derive_encryption_key(new_access_key, &new_access_salt_bytes)
            .map_err(|e| e.to_string())?;

        let (new_data_key_enc, new_data_key_nonce) = encrypt_to_base64(&data_key, &new_access_key_derived)
            .map_err(|e| e.to_string())?;

        let (new_username_enc, new_username_nonce) = encrypt_to_base64(&username, &new_access_key_derived)
            .map_err(|e| e.to_string())?;

        let data_key_bytes = base64::engine::general_purpose::STANDARD.decode(&data_key)
            .map_err(|e| format!("Failed to decode data key: {}", e))?;
        let data_key_derived = GenericArray::clone_from_slice(&data_key_bytes);

        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE users SET access_key_hash = ?, data_key_encrypted_access = ?, data_key_nonce_access = ?, username_encrypted_access = ?, username_nonce_access = ? WHERE id = ?",
            rusqlite::params![&new_access_key_hash, &new_data_key_enc, &new_data_key_nonce, &new_username_enc, &new_username_nonce, user_id],
        ).map_err(|e| e.to_string())?;

        let mut keys = self.encryption_keys.lock().unwrap();
        keys.insert(user_id, data_key_derived);

        Ok(())
    }
}

fn extract_salt_from_hash(hash: &str) -> Result<Vec<u8>, String> {
    let parsed_hash = PasswordHash::new(hash).map_err(|e| e.to_string())?;
    let salt = parsed_hash.salt
        .ok_or("Salt not found in hash".to_string())?;
    Ok(salt.as_ref().as_bytes().to_vec())
}