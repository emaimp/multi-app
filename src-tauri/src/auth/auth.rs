use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use rand::thread_rng;
use totp_rs::{Secret, TOTP};

use crate::crypto::{encrypt_to_base64, decrypt_from_base64, derive_encryption_key};
use crate::models::{User, RegisterStep1Response};
use super::database::Database;

impl Database {
    pub fn login(&self, username: &str, totp_code: &str, master_key: &str) -> Result<User, String> {
        let (user_id, username_encrypted, username_nonce, master_key_hash, totp_secret_encrypted, totp_secret_nonce, totp_confirmed, failed_attempts, lockout_until) = {
            let conn = self.conn.lock().unwrap();
            let mut stmt = conn.prepare("SELECT id, username_encrypted, username_nonce, master_key_hash, totp_secret_encrypted, totp_secret_nonce, totp_confirmed, failed_attempts, lockout_until FROM users").map_err(|e| e.to_string())?;
            let all_users: Vec<(i32, String, String, String, Option<String>, Option<String>, i32, i32, i64)> = stmt.query_map([], |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                    row.get(5)?,
                    row.get(6)?,
                    row.get(7)?,
                    row.get(8)?,
                ))
            }).map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

            let mut found = None;
            for (id, enc_user, nonce, mkey_hash, totp_enc, totp_nonce, totp_conf, failed, lockout) in all_users {
                let salt = extract_salt_from_hash(&mkey_hash)?;
                let key = derive_encryption_key(master_key, &salt)?;
                
                if let Ok(decrypted_username) = decrypt_from_base64(&enc_user, &nonce, &key) {
                    if decrypted_username == username {
                        found = Some((id, enc_user, nonce, mkey_hash, totp_enc, totp_nonce, totp_conf, failed, lockout));
                        break;
                    }
                }
            }

            found.ok_or("User not found".to_string())?
        };

        let now = chrono::Utc::now().timestamp();
        if lockout_until > 0 && now < lockout_until {
            return Err("Account temporarily locked due to too many failed attempts".to_string());
        }

        if totp_confirmed == 0 {
            return Err("Account not fully registered. Please confirm TOTP code first.".to_string());
        }

        let totp_secret = match (totp_secret_encrypted.clone(), totp_secret_nonce.clone()) {
            (Some(enc), Some(nonce)) => {
                let salt = extract_salt_from_hash(&master_key_hash)?;
                let key = derive_encryption_key(master_key, &salt)?;
                decrypt_from_base64(&enc, &nonce, &key)?
            }
            _ => return Err("TOTP not configured".to_string()),
        };

        if !verify_totp_code(&totp_secret, totp_code) {
            self.increment_failed_attempts(user_id, failed_attempts)?;
            return Err("Invalid TOTP code".to_string());
        }

        self.reset_failed_attempts(user_id)?;

        let parsed_master_hash = PasswordHash::new(&master_key_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(master_key.as_bytes(), &parsed_master_hash).map_err(|_| "Invalid master key".to_string())?;

        Ok(User {
            id: user_id,
            username: username.to_string(),
            username_encrypted: Some(username_encrypted),
            username_nonce: Some(username_nonce),
            master_key_hash,
            totp_secret_encrypted,
            totp_secret_nonce,
            totp_confirmed: totp_confirmed == 1,
            failed_attempts,
            lockout_until,
            avatar: None,
        })
    }

    pub fn register_step1(&self, username: &str, master_key: &str) -> Result<RegisterStep1Response, String> {
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
                let key = derive_encryption_key(master_key, &salt)?;
                
                if let Ok(decrypted) = decrypt_from_base64(&enc_user, &nonce, &key) {
                    if decrypted == username {
                        return Err("User already exists".to_string());
                    }
                }
            }
        }

        let (totp_secret, otpauth_url) = generate_totp_secret(username);

        Ok(RegisterStep1Response {
            totp_secret,
            otpauth_url,
        })
    }

    pub fn register_step2(&self, username: &str, master_key: &str, totp_code: &str) -> Result<User, String> {
        let (totp_secret, _) = generate_totp_secret(username);

        if !verify_totp_code(&totp_secret, totp_code) {
            return Err("Invalid TOTP code".to_string());
        }

        let conn = self.conn.lock().unwrap();

        let master_salt = SaltString::generate(&mut thread_rng());
        let argon2 = Argon2::default();
        let master_key_hash = argon2.hash_password(master_key.as_bytes(), &master_salt).map_err(|e| e.to_string())?.to_string();
        
        let salt = extract_salt_from_hash(&master_key_hash)?;
        let key = derive_encryption_key(master_key, &salt)?;
        let (username_encrypted, username_nonce) = encrypt_to_base64(username, &key).map_err(|e| e.to_string())?;

        let (totp_secret_encrypted, totp_secret_nonce) = encrypt_to_base64(&totp_secret, &key).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO users (username_encrypted, username_nonce, master_key_hash, totp_secret_encrypted, totp_secret_nonce, totp_confirmed, failed_attempts, lockout_until) VALUES (?, ?, ?, ?, ?, 1, 0, 0)",
            [&username_encrypted, &username_nonce, &master_key_hash, &totp_secret_encrypted, &totp_secret_nonce],
        ).map_err(|e| e.to_string())?;
        
        let user_id = conn.last_insert_rowid() as i32;

        Ok(User {
            id: user_id,
            username: username.to_string(),
            username_encrypted: Some(username_encrypted),
            username_nonce: Some(username_nonce),
            master_key_hash,
            totp_secret_encrypted: Some(totp_secret_encrypted),
            totp_secret_nonce: Some(totp_secret_nonce),
            totp_confirmed: true,
            failed_attempts: 0,
            lockout_until: 0,
            avatar: None,
        })
    }

    fn increment_failed_attempts(&self, user_id: i32, current_attempts: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let new_attempts = current_attempts + 1;
        
        let (new_lockout, lockout_duration) = if new_attempts >= 3 {
            let lockout_duration = 300 * (new_attempts - 2).min(10) as i64;
            let lockout_until = chrono::Utc::now().timestamp() + lockout_duration;
            (lockout_until, lockout_duration)
        } else {
            (0i64, 0i64)
        };

        conn.execute(
            "UPDATE users SET failed_attempts = ?, lockout_until = ? WHERE id = ?",
            rusqlite::params![new_attempts, new_lockout, user_id],
        ).map_err(|e| e.to_string())?;

        if new_lockout > 0 {
            return Err(format!("Account locked for {} seconds due to too many failed attempts", lockout_duration));
        }

        Ok(())
    }

    fn reset_failed_attempts(&self, user_id: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE users SET failed_attempts = 0, lockout_until = 0 WHERE id = ?",
            [user_id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }
}

fn generate_totp_secret(username: &str) -> (String, String) {
    let secret = Secret::generate_secret();
    let secret_encoded = secret.to_encoded().to_string();

    let otpauth_url = format!("otpauth://totp/n-cryption:{}?secret={}&issuer=n-cryption", username, secret_encoded);

    (secret_encoded, otpauth_url)
}

fn verify_totp_code(secret: &str, code: &str) -> bool {
    use base64::Engine as _;
    
    let secret_bytes = match base64::engine::general_purpose::STANDARD.decode(secret) {
        Ok(bytes) => bytes,
        Err(_) => return false,
    };
    
    let totp = match TOTP::new(
        totp_rs::Algorithm::SHA1,
        6,
        1,
        30,
        secret_bytes,
        Some("n-cryption".to_string()),
        String::new(),
    ) {
        Ok(t) => t,
        Err(_) => return false,
    };

    let now = chrono::Utc::now().timestamp() as u64;
    totp.check(code, now)
}

fn extract_salt_from_hash(hash: &str) -> Result<Vec<u8>, String> {
    let parsed_hash = PasswordHash::new(hash).map_err(|e| e.to_string())?;
    let salt = parsed_hash.salt
        .ok_or("Salt not found in hash".to_string())?;
    Ok(salt.as_ref().as_bytes().to_vec())
}