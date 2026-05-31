use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use rand::{Rng, thread_rng};
use generic_array::GenericArray;
use typenum::U32;
use sha2::{Sha256, Digest};

use crate::crypto::{encrypt_to_base64, decrypt_from_base64, derive_encryption_key};
use crate::models::{User, UserResponse};
use super::database::Database;
use base64::Engine as _;

const DATA_KEY_LENGTH: usize = 32;

fn generate_data_key() -> String {
    let mut rng = rand::thread_rng();
    let key_bytes: [u8; DATA_KEY_LENGTH] = rng.gen();
    base64::engine::general_purpose::STANDARD.encode(key_bytes)
}

fn hash_username(username: &str, access_key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(username.as_bytes());
    hasher.update(b":");
    hasher.update(access_key.as_bytes());
    let result = hasher.finalize();
    base64::engine::general_purpose::STANDARD.encode(result)
}

impl Database {
    pub fn login(&self, username: &str, access_key: &str) -> Result<UserResponse, String> {
        let conn = self.conn.lock().unwrap();
        let username_hash = hash_username(username, access_key);

        let (id, username_encrypted_access, username_nonce_access, access_key_hash): (i32, String, String, String) = conn.query_row(
            "SELECT id, username_encrypted_access, username_nonce_access, access_key_hash FROM users WHERE username_hash = ?",
            [&username_hash],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
        ).map_err(|_| "User not found".to_string())?;

        let parsed_hash = PasswordHash::new(&access_key_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(access_key.as_bytes(), &parsed_hash)
            .map_err(|_| "Invalid access key".to_string())?;

        let access_salt = parsed_hash.salt.ok_or("Salt not found in hash".to_string())?.as_ref().as_bytes().to_vec();
        let access_key_derived = derive_encryption_key(access_key, &access_salt)?;

        let decrypted = decrypt_from_base64(&username_encrypted_access, &username_nonce_access, &access_key_derived)
            .map_err(|_| "Invalid access key".to_string())?;

        if decrypted != username {
            return Err("User not found".to_string());
        }

        Ok(UserResponse {
            id,
            username: username.to_string(),
            avatar: None,
        })
    }

    pub fn register(&self, username: &str, access_key: &str) -> Result<User, String> {
        let conn = self.conn.lock().unwrap();
        let username_hash = hash_username(username, access_key);

        let data_key = generate_data_key();
        
        let access_salt = SaltString::generate(&mut thread_rng());
        let argon2 = Argon2::default();
        let access_key_hash = argon2.hash_password(access_key.as_bytes(), &access_salt).map_err(|e| e.to_string())?.to_string();
        
        let access_salt_bytes = access_salt.as_ref().as_bytes().to_vec();
        let access_key_derived = derive_encryption_key(access_key, &access_salt_bytes)?;
        
        let (data_key_encrypted_access, data_key_nonce_access) = encrypt_to_base64(&data_key, &access_key_derived).map_err(|e| e.to_string())?;
        
        let (username_encrypted_access, username_nonce_access) = encrypt_to_base64(username, &access_key_derived).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO users (username_hash, username_encrypted_access, username_nonce_access, access_key_hash, data_key_encrypted_access, data_key_nonce_access) VALUES (?, ?, ?, ?, ?, ?)",
            rusqlite::params![&username_hash, &username_encrypted_access, &username_nonce_access, &access_key_hash, &data_key_encrypted_access, &data_key_nonce_access],
        ).map_err(|e| match e {
            rusqlite::Error::SqliteFailure(err, _) if err.code == rusqlite::ffi::ErrorCode::ConstraintViolation => "User already exists".to_string(),
            e => e.to_string(),
        })?;

        let user_id = conn.last_insert_rowid() as i32;

        Ok(User {
            id: user_id,
            username: username.to_string(),
            username_encrypted: Some(username_encrypted_access),
            username_nonce: Some(username_nonce_access),
            access_key_hash,
            avatar: None,
        })
    }

    pub fn get_data_key_from_access(&self, user_id: i32, access_key: &str) -> Result<GenericArray<u8, U32>, String> {
        let conn = self.conn.lock().unwrap();
        let (access_key_hash, data_key_enc, data_key_nonce): (String, String, String) = conn.query_row(
            "SELECT access_key_hash, data_key_encrypted_access, data_key_nonce_access FROM users WHERE id = ?",
            [user_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        ).map_err(|e| e.to_string())?;

        let parsed_hash = PasswordHash::new(&access_key_hash).map_err(|e| e.to_string())?;
        let access_salt = parsed_hash.salt.ok_or("Salt not found in hash".to_string())?.as_ref().as_bytes().to_vec();
        let access_key_derived = derive_encryption_key(access_key, &access_salt).map_err(|e| e.to_string())?;

        let data_key = decrypt_from_base64(&data_key_enc, &data_key_nonce, &access_key_derived)
            .map_err(|e| e.to_string())?;

        let data_key_bytes = base64::engine::general_purpose::STANDARD.decode(&data_key)
            .map_err(|e| format!("Failed to decode data key: {}", e))?;
        let data_key_derived = GenericArray::clone_from_slice(&data_key_bytes);

        Ok(data_key_derived)
    }

    pub fn change_password(&self, user_id: i32, current_access_key: &str, new_access_key: &str) -> Result<(), String> {
        let (data_key, username) = {
            let conn = self.conn.lock().unwrap();
            let (access_key_hash, data_key_enc, data_key_nonce, username_enc, username_nonce): (String, String, String, String, String) = conn.query_row(
                "SELECT access_key_hash, data_key_encrypted_access, data_key_nonce_access, username_encrypted_access, username_nonce_access FROM users WHERE id = ?",
                [user_id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?))
            ).map_err(|e| e.to_string())?;

            let parsed_hash = PasswordHash::new(&access_key_hash).map_err(|e| e.to_string())?;
            Argon2::default().verify_password(current_access_key.as_bytes(), &parsed_hash)
                .map_err(|_| "Invalid access key".to_string())?;

            let access_salt = parsed_hash.salt.ok_or("Salt not found in hash".to_string())?.as_ref().as_bytes().to_vec();
            let access_key_derived = derive_encryption_key(current_access_key, &access_salt)?;

            let data_key = decrypt_from_base64(&data_key_enc, &data_key_nonce, &access_key_derived)
                .map_err(|_| "Invalid access key".to_string())?;
            let username = decrypt_from_base64(&username_enc, &username_nonce, &access_key_derived)
                .map_err(|_| "Invalid access key".to_string())?;

            (data_key, username)
        };

        let new_username_hash = hash_username(&username, new_access_key);

        let new_access_salt = SaltString::generate(&mut thread_rng());
        let argon2 = Argon2::default();
        let new_access_key_hash = argon2.hash_password(new_access_key.as_bytes(), &new_access_salt)
            .map_err(|e| e.to_string())?.to_string();

        let new_access_salt_bytes = new_access_salt.as_ref().as_bytes().to_vec();
        let new_access_key_derived = derive_encryption_key(new_access_key, &new_access_salt_bytes)?;

        let (new_data_key_enc, new_data_key_nonce) = encrypt_to_base64(&data_key, &new_access_key_derived)?;
        let (new_username_enc, new_username_nonce) = encrypt_to_base64(&username, &new_access_key_derived)?;

        let data_key_bytes = base64::engine::general_purpose::STANDARD.decode(&data_key)
            .map_err(|e| format!("Failed to decode data key: {}", e))?;
        let new_data_key_derived = GenericArray::clone_from_slice(&data_key_bytes);

        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE users SET access_key_hash = ?, data_key_encrypted_access = ?, data_key_nonce_access = ?, username_encrypted_access = ?, username_nonce_access = ?, username_hash = ? WHERE id = ?",
            rusqlite::params![&new_access_key_hash, &new_data_key_enc, &new_data_key_nonce, &new_username_enc, &new_username_nonce, &new_username_hash, user_id],
        ).map_err(|e| e.to_string())?;

        let mut keys = self.encryption_keys.lock().unwrap();
        keys.insert(user_id, new_data_key_derived);

        Ok(())
    }

    pub fn change_username(&self, user_id: i32, current_access_key: &str, new_username: &str) -> Result<String, String> {
        let (_username, access_key_derived) = {
            let conn = self.conn.lock().unwrap();
            let (access_key_hash, username_enc, username_nonce, _data_key_enc, _data_key_nonce): (String, String, String, String, String) = conn.query_row(
                "SELECT access_key_hash, username_encrypted_access, username_nonce_access, data_key_encrypted_access, data_key_nonce_access FROM users WHERE id = ?",
                [user_id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?))
            ).map_err(|e| e.to_string())?;

            let parsed_hash = PasswordHash::new(&access_key_hash).map_err(|e| e.to_string())?;
            Argon2::default().verify_password(current_access_key.as_bytes(), &parsed_hash)
                .map_err(|_| "Invalid access key".to_string())?;

            let access_salt = parsed_hash.salt.ok_or("Salt not found in hash".to_string())?.as_ref().as_bytes().to_vec();
            let access_key_derived = derive_encryption_key(current_access_key, &access_salt)?;

            let username = decrypt_from_base64(&username_enc, &username_nonce, &access_key_derived)
                .map_err(|_| "Invalid access key".to_string())?;

            (username, access_key_derived)
        };

        let new_username_hash = hash_username(new_username, current_access_key);
        let (new_username_enc, new_username_nonce) = encrypt_to_base64(new_username, &access_key_derived)?;

        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE users SET username_hash = ?, username_encrypted_access = ?, username_nonce_access = ? WHERE id = ?",
            rusqlite::params![&new_username_hash, &new_username_enc, &new_username_nonce, user_id],
        ).map_err(|e| e.to_string())?;

        Ok(new_username.to_string())
    }
}