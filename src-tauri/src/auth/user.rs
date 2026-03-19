use argon2::{Argon2, PasswordHash, PasswordVerifier};
use base64::{Engine as _, engine::general_purpose::STANDARD};
use crate::crypto::{encrypt_bytes_to_base64, decrypt_bytes_from_base64};
use super::database::Database;

impl Database {
    pub fn update_avatar(&self, user_id: i32, avatar: Option<&[u8]>) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let key = self.get_encryption_key(user_id)?;
        
        match avatar {
            Some(data) => {
                let (avatar_encrypted, avatar_nonce) = encrypt_bytes_to_base64(data, &key)?;
                conn.execute(
                    "UPDATE users SET avatar = ?, avatar_nonce = ? WHERE id = ?",
                    rusqlite::params![avatar_encrypted, avatar_nonce, user_id],
                ).map_err(|e| e.to_string())?;
            }
            None => {
                conn.execute(
                    "UPDATE users SET avatar = NULL, avatar_nonce = NULL WHERE id = ?",
                    rusqlite::params![user_id],
                ).map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }

    pub fn get_user_avatar(&self, user_id: i32) -> Result<Option<String>, String> {
        let key = self.get_encryption_key(user_id)?;
        
        let conn = self.conn.lock().unwrap();
        let result: Result<(Option<String>, Option<String>), _> = conn.query_row(
            "SELECT avatar, avatar_nonce FROM users WHERE id = ?",
            [user_id],
            |row| Ok((row.get(0)?, row.get(1)?))
        );

        let (avatar_encrypted, avatar_nonce) = match result {
            Ok(r) => r,
            Err(_) => return Ok(None),
        };

        let avatar_base64 = match (avatar_encrypted, avatar_nonce) {
            (Some(enc), Some(nonce)) => {
                match decrypt_bytes_from_base64(&enc, &nonce, &key) {
                    Ok(decrypted) => {
                        let mime = if decrypted.starts_with(b"\x89PNG\r\n\x1a\n") {
                            "image/png"
                        } else if decrypted.starts_with(&[0xff, 0xd8, 0xff]) {
                            "image/jpeg"
                        } else if &decrypted[..4] == b"<svg" || (decrypted.len() > 3 && &decrypted[..4] == &[0xef, 0xbb, 0xbf, 0x3c] && &decrypted[3..7] == b"<svg") {
                            "image/svg+xml"
                        } else {
                            "image/webp"
                        };
                        let b64 = STANDARD.encode(&decrypted);
                        Some(format!("data:{};base64,{}", mime, b64))
                    }
                    Err(_) => {
                        let fallback = STANDARD.decode(&enc).ok();
                        fallback.map(|bytes| {
                            let mime = if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
                                "image/png"
                            } else if bytes.starts_with(&[0xff, 0xd8, 0xff]) {
                                "image/jpeg"
                            } else if &bytes[..4] == b"<svg" || (bytes.len() > 3 && &bytes[..4] == &[0xef, 0xbb, 0xbf, 0x3c] && &bytes[3..7] == b"<svg") {
                                "image/svg+xml"
                            } else {
                                "image/webp"
                            };
                            let b64 = STANDARD.encode(&bytes);
                            format!("data:{};base64,{}", mime, b64)
                        })
                    }
                }
            }
            _ => None,
        };

        Ok(avatar_base64)
    }

    pub fn delete_user(&self, user_id: i32, master_key: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        
        let stored_master_hash: String = conn.query_row(
            "SELECT master_key_hash FROM users WHERE id = ?",
            [user_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;

        let parsed_hash = PasswordHash::new(&stored_master_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(master_key.as_bytes(), &parsed_hash).map_err(|_| "Invalid master key".to_string())?;

        conn.execute("DELETE FROM users WHERE id = ?", [user_id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
