use chrono::Utc;
use generic_array::GenericArray;
use rusqlite::{Row, OptionalExtension};
use typenum::U32;

use crate::auth::Database;
use crate::crypto::{decrypt_bytes_from_base64, decrypt_from_base64, encrypt_bytes_to_base64, encrypt_to_base64};
use crate::models::Vault;
use base64::Engine as _;

impl Database {
    pub fn get_vaults(&self, user_id: i32) -> Result<Vec<Vault>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, user_id, name_encrypted, color, image, image_nonce, name_nonce, created_at, position FROM vaults WHERE user_id = ? ORDER BY position ASC, created_at ASC"
        ).map_err(|e| e.to_string())?;

        let key = self.get_encryption_key(user_id)?;

        let mut result = Vec::new();
        let vault_iter = stmt.query_map([user_id], move |row| {
            vault_from_row(row, user_id, &key)
        }).map_err(|e| e.to_string())?;

        for vault in vault_iter {
            result.push(vault.map_err(|e| e.to_string())?);
        }
        Ok(result)
    }

    pub fn get_vault(&self, vault_id: &str) -> Result<Option<Vault>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, user_id, name_encrypted, color, image, name_nonce, created_at FROM vaults WHERE id = ?"
        ).map_err(|e| e.to_string())?;

        let user_id: i32 = conn.query_row(
            "SELECT user_id FROM vaults WHERE id = ?",
            [vault_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;

        let key = self.get_encryption_key(user_id)?;

        let vault = stmt.query_row([vault_id], |row| {
            vault_from_row(row, user_id, &key)
        }).optional().map_err(|e| e.to_string())?;

        Ok(vault)
    }

    pub fn create_vault(&self, user_id: i32, name: &str, color: &str, image: Option<&[u8]>) -> Result<Vault, String> {
        let conn = self.conn.lock().unwrap();
        let id = uuid::Uuid::new_v4().to_string();
        let created_at = Utc::now().timestamp_millis();

        let key = self.get_encryption_key(user_id)?;
        let (name_encrypted, name_nonce) = encrypt_to_base64(name, &key)?;

        let (image_encrypted, image_nonce) = match image {
            Some(img) => {
                let (enc, nonce) = encrypt_bytes_to_base64(img, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        let vault_position: i32 = conn.query_row(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM vaults WHERE user_id = ?",
            [user_id],
            |row| row.get(0)
        ).unwrap_or(0);

        conn.execute(
            "INSERT INTO vaults (id, user_id, name_encrypted, color, name_nonce, image, image_nonce, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![&id, user_id, &name_encrypted, color, &name_nonce, image_encrypted, image_nonce, created_at, vault_position],
        ).map_err(|e| e.to_string())?;

        Ok(Vault {
            id,
            user_id,
            name: name.to_string(),
            color: color.to_string(),
            image: None,
            created_at,
            position: vault_position,
        })
    }

    pub fn update_vault(&self, vault: &Vault, image: Option<&[u8]>) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let key = self.get_encryption_key(vault.user_id)?;
        let (name_encrypted, name_nonce) = encrypt_to_base64(&vault.name, &key)?;

        let (image_encrypted, image_nonce) = match image {
            Some(img) => {
                let (enc, nonce) = encrypt_bytes_to_base64(img, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        conn.execute(
            "UPDATE vaults SET name_encrypted = ?, color = ?, name_nonce = ?, image = ?, image_nonce = ? WHERE id = ?",
            rusqlite::params![&name_encrypted, &vault.color, &name_nonce, image_encrypted, image_nonce, &vault.id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn update_vault_position(&self, vault_id: &str, new_position: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE vaults SET position = ? WHERE id = ?",
            rusqlite::params![new_position, vault_id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_vault(&self, vault_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM vaults WHERE id = ?", [vault_id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}

fn vault_from_row(row: &Row, user_id: i32, key: &GenericArray<u8, U32>) -> Result<Vault, rusqlite::Error> {
    let name_encrypted: String = row.get(2)?;
    let name_nonce: String = row.get(6)?;
    let image_encrypted: Option<String> = row.get(4)?;
    let image_nonce: Option<String> = row.get(5)?;

    let name = match decrypt_from_base64(&name_encrypted, &name_nonce, key) {
        Ok(n) => n,
        Err(_) => return Err(rusqlite::Error::InvalidColumnName("Decryption failed".to_string())),
    };

    let image_b64 = match (image_encrypted, image_nonce) {
        (Some(enc), Some(nonce)) => {
            match decrypt_bytes_from_base64(&enc, &nonce, key) {
                Ok(decrypted) => {
                    let mime = if decrypted.starts_with(b"\x89PNG\r\n\x1a\n") {
                        "image/png"
                    } else if decrypted.starts_with(&[0xff, 0xd8, 0xff]) {
                        "image/jpeg"
                    } else if decrypted.starts_with(b"<svg") {
                        "image/svg+xml"
                    } else {
                        "image/webp"
                    };
                    let b64 = base64::engine::general_purpose::STANDARD.encode(&decrypted);
                    Some(format!("data:{};base64,{}", mime, b64))
                }
                Err(_) => {
                    let fallback = base64::engine::general_purpose::STANDARD.decode(&enc).ok();
                    fallback.map(|bytes| {
                        let mime = if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
                            "image/png"
                        } else if bytes.starts_with(&[0xff, 0xd8, 0xff]) {
                            "image/jpeg"
                    } else if bytes.starts_with(b"<svg") {
                        "image/svg+xml"
                        } else {
                            "image/webp"
                        };
                        let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
                        format!("data:{};base64,{}", mime, b64)
                    })
                }
            }
        }
        _ => None,
    };

    Ok(Vault {
        id: row.get(0)?,
        user_id,
        name,
        color: row.get(3)?,
        image: image_b64,
        created_at: row.get(7)?,
        position: row.get(8)?,
    })
}
