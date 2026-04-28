use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use generic_array::GenericArray;
use typenum::U32;
use rand::thread_rng;

use crate::crypto::{encrypt_to_base64, decrypt_from_base64};
use crate::models::User;
use super::database::Database;

impl Database {
    pub fn login(&self, username: &str, password: &str, master_key: &str) -> Result<User, String> {
        let (user_id, username_encrypted, username_nonce, password_hash, master_key_hash) = {
            let conn = self.conn.lock().unwrap();
            let mut stmt = conn.prepare("SELECT id, username_encrypted, username_nonce, password_hash, master_key_hash FROM users").map_err(|e| e.to_string())?;
            let all_users: Vec<(i32, String, String, String, String)> = stmt.query_map([], |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                ))
            }).map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

            let mut found = None;
            for (id, enc_user, nonce, pwd_hash, mkey_hash) in all_users {
                let salt = extract_salt_from_hash(&mkey_hash)?;
                let key = derive_key(master_key, &salt)?;
                
                if let Ok(decrypted_username) = decrypt_from_base64(&enc_user, &nonce, &key) {
                    if decrypted_username == username {
                        found = Some((id, enc_user, nonce, pwd_hash, mkey_hash));
                        break;
                    }
                }
            }

            found.ok_or("User not found".to_string())?
        };

        let parsed_hash = PasswordHash::new(&password_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(password.as_bytes(), &parsed_hash).map_err(|_| "Invalid password".to_string())?;

        let parsed_master_hash = PasswordHash::new(&master_key_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(master_key.as_bytes(), &parsed_master_hash).map_err(|_| "Invalid master key".to_string())?;

        Ok(User {
            id: user_id,
            username: username.to_string(),
            username_encrypted: Some(username_encrypted),
            username_nonce: Some(username_nonce),
            password_hash,
            master_key_hash,
            avatar: None,
        })
    }

    pub fn register(&self, username: &str, password: &str, master_key: &str) -> Result<User, String> {
        let conn = self.conn.lock().unwrap();

        let count: i32 = conn.query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0)).unwrap_or(0);
        if count > 0 {
            let mut stmt = conn.prepare("SELECT username_encrypted, username_nonce, master_key_hash FROM users").map_err(|e| e.to_string())?;
            let all_users: Vec<(String, String, String)> = stmt.query_map([], |row| {
                Ok((row.get(0)?, row.get(1)?, row.get(2)?))
            }).map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

            for (enc_user, nonce, stored_master_hash) in all_users {
                let salt = extract_salt_from_hash(&stored_master_hash)?;
                let key = derive_key(master_key, &salt)?;
                
                if let Ok(decrypted) = decrypt_from_base64(&enc_user, &nonce, &key) {
                    if decrypted == username {
                        return Err("User already exists".to_string());
                    }
                }
            }
        }

        let master_salt = SaltString::generate(&mut thread_rng());
        let argon2 = Argon2::default();
        let master_key_hash = argon2.hash_password(master_key.as_bytes(), &master_salt).map_err(|e| e.to_string())?.to_string();
        
        let salt = extract_salt_from_hash(&master_key_hash)?;
        let key = derive_key(master_key, &salt)?;
        let (username_encrypted, username_nonce) = encrypt_to_base64(username, &key).map_err(|e| e.to_string())?;

        let salt = SaltString::generate(&mut thread_rng());
        let password_hash = argon2.hash_password(password.as_bytes(), &salt).map_err(|e| e.to_string())?.to_string();
        
        conn.execute("INSERT INTO users (username_encrypted, username_nonce, password_hash, master_key_hash) VALUES (?, ?, ?, ?)", [&username_encrypted, &username_nonce, &password_hash, &master_key_hash]).map_err(|e| e.to_string())?;
        
        let user_id = conn.last_insert_rowid() as i32;

        Ok(User { 
            id: user_id, 
            username: username.to_string(),
            username_encrypted: Some(username_encrypted),
            username_nonce: Some(username_nonce),
            password_hash, 
            master_key_hash, 
            avatar: None 
        })
    }

    pub fn recover_password(&self, username: &str, master_key: &str, new_password: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        
        let mut stmt = conn.prepare("SELECT id, username_encrypted, username_nonce, master_key_hash FROM users").map_err(|e| e.to_string())?;
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

        let mut found_id = None;
        for (id, enc_user, nonce, stored_master_hash) in all_users {
            let salt = extract_salt_from_hash(&stored_master_hash)?;
            let key = derive_key(master_key, &salt)?;
            
            if let Ok(decrypted_username) = decrypt_from_base64(&enc_user, &nonce, &key) {
                if decrypted_username == username {
                    found_id = Some(id);
                    break;
                }
            }
        }

        let id = found_id.ok_or("User not found".to_string())?;

        let salt = SaltString::generate(&mut thread_rng());
        let new_password_hash = Argon2::default().hash_password(new_password.as_bytes(), &salt).map_err(|e| e.to_string())?.to_string();

        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", [&new_password_hash, &id.to_string()]).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn change_password(&self, user_id: i32, master_key: &str, new_password: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        
        let stored_master_hash: String = conn.query_row(
            "SELECT master_key_hash FROM users WHERE id = ?",
            [user_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;

        let parsed_hash = PasswordHash::new(&stored_master_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(master_key.as_bytes(), &parsed_hash).map_err(|_| "Invalid master key".to_string())?;

        let salt = SaltString::generate(&mut thread_rng());
        let new_password_hash = Argon2::default().hash_password(new_password.as_bytes(), &salt).map_err(|e| e.to_string())?.to_string();

        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [&new_password_hash, &user_id.to_string()]
        ).map_err(|e| e.to_string())?;

        Ok(())
    }
}

fn derive_key(master_key: &str, salt: &[u8]) -> Result<GenericArray<u8, U32>, String> {
    use argon2::{Argon2, Params};
    use generic_array::GenericArray;
    use typenum::U32;
    
    let mut key = GenericArray::<u8, U32>::clone_from_slice(&[0u8; 32]);
    let argon2 = Argon2::new(
        argon2::Algorithm::Argon2id,
        argon2::Version::V0x13,
        Params::new(65536, 3, 1, Some(32)).map_err(|e| e.to_string())?,
    );
    
    argon2.hash_password_into(
        master_key.as_bytes(),
        salt,
        &mut key,
    ).map_err(|e| e.to_string())?;
    
    Ok(key)
}

fn extract_salt_from_hash(hash: &str) -> Result<Vec<u8>, String> {
    let parsed_hash = PasswordHash::new(hash).map_err(|e| e.to_string())?;
    let salt = parsed_hash.salt
        .ok_or("Salt not found in hash".to_string())?;
    Ok(salt.as_ref().as_bytes().to_vec())
}