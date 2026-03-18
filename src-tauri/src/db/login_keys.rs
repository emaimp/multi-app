use chrono::Utc;

use crate::auth::Database;
use crate::crypto::{decrypt_bytes_from_base64, decrypt_from_base64, encrypt_bytes_to_base64, encrypt_to_base64};
use crate::models::LoginKey;
use base64::Engine as _;

impl Database {
    pub fn get_login_keys_decrypted(&self, vault_id: &str, user_id: i32) -> Result<Vec<LoginKey>, String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;

        let mut stmt = conn.prepare(
            "SELECT id, vault_id, site_name_encrypted, site_name_nonce, url_encrypted, url_nonce, username_encrypted, username_nonce, password_encrypted, password_nonce, details_encrypted, details_nonce, color, image, image_nonce, created_at, updated_at, position FROM login_keys WHERE vault_id = ? ORDER BY position ASC, created_at ASC"
        ).map_err(|e| e.to_string())?;

        let mut result = Vec::new();
        let login_iter = stmt.query_map([vault_id], |row| {
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
                row.get(9)?,
                row.get(10)?,
                row.get(11)?,
                row.get(12)?,
                row.get(13)?,
                row.get(14)?,
                row.get(15)?,
                row.get(16)?,
                row.get(17)?,
            ))
        }).map_err(|e| e.to_string())?;

        for login_data in login_iter {
            let (
                id, vault_id, site_name_encrypted, site_name_nonce, 
                url_encrypted, url_nonce, username_encrypted, username_nonce,
                password_encrypted, password_nonce, details_encrypted, details_nonce,
                color, image_encrypted, image_nonce, created_at, updated_at, position
            ): (String, String, String, String, Option<String>, Option<String>, String, String, String, String, Option<String>, Option<String>, String, Option<String>, Option<String>, i64, i64, i32) = login_data.map_err(|e| e.to_string())?;

            let site_name = decrypt_from_base64(&site_name_encrypted, &site_name_nonce, &key)?;
            let username = decrypt_from_base64(&username_encrypted, &username_nonce, &key)?;
            let password = decrypt_from_base64(&password_encrypted, &password_nonce, &key)?;
            
            let url = match (url_encrypted, url_nonce) {
                (Some(enc), Some(nonce)) => Some(decrypt_from_base64(&enc, &nonce, &key).unwrap_or_default()),
                _ => None,
            };

            let details = match (details_encrypted, details_nonce) {
                (Some(enc), Some(nonce)) => Some(decrypt_from_base64(&enc, &nonce, &key).unwrap_or_default()),
                _ => None,
            };

            let image_b64 = match (image_encrypted, image_nonce) {
                (Some(enc), Some(nonce)) => {
                    match decrypt_bytes_from_base64(&enc, &nonce, &key) {
                        Ok(decrypted) => {
                            let b64 = base64::engine::general_purpose::STANDARD.encode(&decrypted);
                            Some(format!("data:image/webp;base64,{}", b64))
                        }
                        Err(_) => {
                            let fallback = base64::engine::general_purpose::STANDARD.decode(&enc).ok();
                            fallback.map(|bytes| {
                                let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
                                format!("data:image/webp;base64,{}", b64)
                            })
                        }
                    }
                }
                _ => None,
            };

            result.push(LoginKey {
                id,
                vault_id,
                site_name,
                url,
                username,
                password,
                details,
                color,
                image: image_b64,
                created_at,
                updated_at,
                position,
            });
        }
        Ok(result)
    }

    pub fn get_login_key_with_content(&self, login_key_id: &str, user_id: i32) -> Result<Option<LoginKey>, String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;

        let (id, vault_id, site_name_encrypted, site_name_nonce, url_encrypted, url_nonce, username_encrypted, username_nonce, password_encrypted, password_nonce, details_encrypted, details_nonce, color, image_encrypted, image_nonce, created_at, updated_at, position): (String, String, String, String, Option<String>, Option<String>, String, String, String, String, Option<String>, Option<String>, String, Option<String>, Option<String>, i64, i64, i32) = conn.query_row(
            "SELECT id, vault_id, site_name_encrypted, site_name_nonce, url_encrypted, url_nonce, username_encrypted, username_nonce, password_encrypted, password_nonce, details_encrypted, details_nonce, color, image, image_nonce, created_at, updated_at, position
             FROM login_keys
             WHERE id = ?",
            [login_key_id],
            |row| Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
                row.get(7)?,
                row.get(8)?,
                row.get(9)?,
                row.get(10)?,
                row.get(11)?,
                row.get(12)?,
                row.get(13)?,
                row.get(14)?,
                row.get(15)?,
                row.get(16)?,
                row.get(17)?,
            ))
        ).map_err(|e| e.to_string())?;

        let site_name = decrypt_from_base64(&site_name_encrypted, &site_name_nonce, &key)?;
        let username = decrypt_from_base64(&username_encrypted, &username_nonce, &key)?;
        let password = decrypt_from_base64(&password_encrypted, &password_nonce, &key)?;

        let url = match (url_encrypted, url_nonce) {
            (Some(enc), Some(nonce)) => Some(decrypt_from_base64(&enc, &nonce, &key).unwrap_or_default()),
            _ => None,
        };

        let details = match (details_encrypted, details_nonce) {
            (Some(enc), Some(nonce)) => Some(decrypt_from_base64(&enc, &nonce, &key).unwrap_or_default()),
            _ => None,
        };

        let image_b64 = match (image_encrypted, image_nonce) {
            (Some(enc), Some(nonce)) => {
                match decrypt_bytes_from_base64(&enc, &nonce, &key) {
                    Ok(decrypted) => {
                        let b64 = base64::engine::general_purpose::STANDARD.encode(&decrypted);
                        Some(format!("data:image/webp;base64,{}", b64))
                    }
                    Err(_) => {
                        let fallback = base64::engine::general_purpose::STANDARD.decode(&enc).ok();
                        fallback.map(|bytes| {
                            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
                            format!("data:image/webp;base64,{}", b64)
                        })
                    }
                }
            }
            _ => None,
        };

        Ok(Some(LoginKey {
            id,
            vault_id,
            site_name,
            url,
            username,
            password,
            details,
            color,
            image: image_b64,
            created_at,
            updated_at,
            position,
        }))
    }

    pub fn create_login_key(
        &self,
        vault_id: &str,
        site_name: &str,
        url: Option<&str>,
        username: &str,
        password: &str,
        details: Option<&str>,
        color: &str,
        image: Option<&[u8]>,
        user_id: i32,
    ) -> Result<LoginKey, String> {
        let conn = self.conn.lock().unwrap();
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().timestamp_millis();

        let key = self.get_encryption_key(user_id)?;
        let (site_name_encrypted, site_name_nonce) = encrypt_to_base64(site_name, &key)?;
        let (username_encrypted, username_nonce) = encrypt_to_base64(username, &key)?;
        let (password_encrypted, password_nonce) = encrypt_to_base64(password, &key)?;

        let (url_encrypted, url_nonce) = match url {
            Some(u) => {
                let (enc, nonce) = encrypt_to_base64(u, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        let (details_encrypted, details_nonce) = match details {
            Some(d) => {
                let (enc, nonce) = encrypt_to_base64(d, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        let (image_encrypted, image_nonce) = match image {
            Some(img) => {
                let (enc, nonce) = encrypt_bytes_to_base64(img, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        let max_position: i32 = conn.query_row(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM login_keys WHERE vault_id = ?",
            [vault_id],
            |row| row.get(0)
        ).unwrap_or(0);

        conn.execute(
            "INSERT INTO login_keys (id, vault_id, site_name_encrypted, site_name_nonce, url_encrypted, url_nonce, username_encrypted, username_nonce, password_encrypted, password_nonce, details_encrypted, details_nonce, color, image, image_nonce, created_at, updated_at, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![
                &id, vault_id, &site_name_encrypted, &site_name_nonce, &url_encrypted, &url_nonce, &username_encrypted, &username_nonce, &password_encrypted, &password_nonce, &details_encrypted, &details_nonce, color, &image_encrypted, &image_nonce, now, now, max_position
            ],
        ).map_err(|e| e.to_string())?;

        Ok(LoginKey {
            id,
            vault_id: vault_id.to_string(),
            site_name: site_name.to_string(),
            url: url.map(|s| s.to_string()),
            username: username.to_string(),
            password: password.to_string(),
            details: details.map(|s| s.to_string()),
            color: color.to_string(),
            image: None,
            created_at: now,
            updated_at: now,
            position: max_position,
        })
    }

    pub fn update_login_key(
        &self,
        login_key_id: &str,
        site_name: &str,
        url: Option<&str>,
        username: &str,
        password: &str,
        details: Option<&str>,
        color: &str,
        image: Option<&[u8]>,
        user_id: i32,
    ) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;
        let now = Utc::now().timestamp_millis();

        let (site_name_encrypted, site_name_nonce) = encrypt_to_base64(site_name, &key)?;
        let (username_encrypted, username_nonce) = encrypt_to_base64(username, &key)?;
        let (password_encrypted, password_nonce) = encrypt_to_base64(password, &key)?;

        let (url_encrypted, url_nonce) = match url {
            Some(u) => {
                let (enc, nonce) = encrypt_to_base64(u, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        let (details_encrypted, details_nonce) = match details {
            Some(d) => {
                let (enc, nonce) = encrypt_to_base64(d, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        let (image_encrypted, image_nonce) = match image {
            Some(img) => {
                let (enc, nonce) = encrypt_bytes_to_base64(img, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        conn.execute(
            "UPDATE login_keys SET site_name_encrypted = ?, site_name_nonce = ?, url_encrypted = ?, url_nonce = ?, username_encrypted = ?, username_nonce = ?, password_encrypted = ?, password_nonce = ?, details_encrypted = ?, details_nonce = ?, color = ?, image = ?, image_nonce = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![&site_name_encrypted, &site_name_nonce, &url_encrypted, &url_nonce, &username_encrypted, &username_nonce, &password_encrypted, &password_nonce, &details_encrypted, &details_nonce, color, &image_encrypted, &image_nonce, now, login_key_id],
        ).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn update_login_key_position(&self, login_key_id: &str, new_position: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE login_keys SET position = ? WHERE id = ?",
            rusqlite::params![new_position, login_key_id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_login_key(&self, login_key_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM login_keys WHERE id = ?", [login_key_id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
