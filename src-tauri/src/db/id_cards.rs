use chrono::Utc;

use crate::auth::Database;
use crate::crypto::{decrypt_bytes_from_base64, decrypt_from_base64, encrypt_bytes_to_base64, encrypt_to_base64};
use crate::models::IdCard;
use base64::Engine as _;

impl Database {
    pub fn get_id_cards_decrypted(&self, vault_id: &str, user_id: i32) -> Result<Vec<IdCard>, String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;

        let mut stmt = conn.prepare(
            "SELECT id, vault_id, id_name_encrypted, id_name_nonce, id_type_encrypted, id_type_nonce, full_name_encrypted, full_name_nonce, id_number_encrypted, id_number_nonce, color, image, image_nonce, created_at, position FROM id_cards WHERE vault_id = ? ORDER BY position ASC, created_at ASC"
        ).map_err(|e| e.to_string())?;

        let mut result = Vec::new();
        let card_iter = stmt.query_map([vault_id], |row| {
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
            ))
        }).map_err(|e| e.to_string())?;

        for card_data in card_iter {
            let (
                id, vault_id, id_name_encrypted, id_name_nonce, id_type_encrypted, id_type_nonce,
                full_name_encrypted, full_name_nonce, id_number_encrypted, id_number_nonce,
                color, image_encrypted, image_nonce, created_at, position
            ): (String, String, String, String, String, String, String, String, String, String, String, Option<String>, Option<String>, i64, i32) = card_data.map_err(|e| e.to_string())?;

            let id_name = decrypt_from_base64(&id_name_encrypted, &id_name_nonce, &key)?;
            let id_type = decrypt_from_base64(&id_type_encrypted, &id_type_nonce, &key)?;
            let full_name = decrypt_from_base64(&full_name_encrypted, &full_name_nonce, &key)?;
            let id_number = decrypt_from_base64(&id_number_encrypted, &id_number_nonce, &key)?;
            
            let image_b64 = match (image_encrypted, image_nonce) {
                (Some(enc), Some(nonce)) => {
                    match decrypt_bytes_from_base64(&enc, &nonce, &key) {
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

            result.push(IdCard {
                id,
                vault_id,
                id_name,
                id_type,
                full_name,
                id_number,
                color,
                image: image_b64,
                created_at,
                position,
            });
        }
        Ok(result)
    }

    pub fn get_id_card_with_content(&self, card_id: &str, user_id: i32) -> Result<Option<IdCard>, String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;

        let (id, vault_id, id_name_encrypted, id_name_nonce, id_type_encrypted, id_type_nonce, full_name_encrypted, full_name_nonce, id_number_encrypted, id_number_nonce, color, image_encrypted, image_nonce, created_at, position): (String, String, String, String, String, String, String, String, String, String, String, Option<String>, Option<String>, i64, i32) = conn.query_row(
            "SELECT id, vault_id, id_name_encrypted, id_name_nonce, id_type_encrypted, id_type_nonce, full_name_encrypted, full_name_nonce, id_number_encrypted, id_number_nonce, color, image, image_nonce, created_at, position
             FROM id_cards
             WHERE id = ?",
            [card_id],
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
            ))
        ).map_err(|e| e.to_string())?;

        let id_name = decrypt_from_base64(&id_name_encrypted, &id_name_nonce, &key)?;
        let id_type = decrypt_from_base64(&id_type_encrypted, &id_type_nonce, &key)?;
        let full_name = decrypt_from_base64(&full_name_encrypted, &full_name_nonce, &key)?;
        let id_number = decrypt_from_base64(&id_number_encrypted, &id_number_nonce, &key)?;

        let image_b64 = match (image_encrypted, image_nonce) {
            (Some(enc), Some(nonce)) => {
                match decrypt_bytes_from_base64(&enc, &nonce, &key) {
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

        Ok(Some(IdCard {
            id,
            vault_id,
            id_name,
            id_type,
            full_name,
            id_number,
            color,
            image: image_b64,
            created_at,
            position,
        }))
    }

    pub fn create_id_card(
        &self,
        vault_id: &str,
        id_name: &str,
        id_type: &str,
        full_name: &str,
        id_number: &str,
        color: &str,
        image: Option<&[u8]>,
        user_id: i32,
    ) -> Result<IdCard, String> {
        let conn = self.conn.lock().unwrap();
        let id = uuid::Uuid::new_v4().to_string();
        let created_at = Utc::now().timestamp_millis();

        let key = self.get_encryption_key(user_id)?;
        let (id_name_encrypted, id_name_nonce) = encrypt_to_base64(id_name, &key)?;
        let (id_type_encrypted, id_type_nonce) = encrypt_to_base64(id_type, &key)?;
        let (full_name_encrypted, full_name_nonce) = encrypt_to_base64(full_name, &key)?;
        let (id_number_encrypted, id_number_nonce) = encrypt_to_base64(id_number, &key)?;

        let (image_encrypted, image_nonce) = match image {
            Some(img) => {
                let (enc, nonce) = encrypt_bytes_to_base64(img, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        let max_position: i32 = conn.query_row(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM id_cards WHERE vault_id = ?",
            [vault_id],
            |row| row.get(0)
        ).unwrap_or(0);

        conn.execute(
            "INSERT INTO id_cards (id, vault_id, id_name_encrypted, id_name_nonce, id_type_encrypted, id_type_nonce, full_name_encrypted, full_name_nonce, id_number_encrypted, id_number_nonce, color, image, image_nonce, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![
                &id, vault_id, &id_name_encrypted, &id_name_nonce, &id_type_encrypted, &id_type_nonce, &full_name_encrypted, &full_name_nonce, &id_number_encrypted, &id_number_nonce, color, &image_encrypted, &image_nonce, created_at, max_position
            ],
        ).map_err(|e| e.to_string())?;

        Ok(IdCard {
            id,
            vault_id: vault_id.to_string(),
            id_name: id_name.to_string(),
            id_type: id_type.to_string(),
            full_name: full_name.to_string(),
            id_number: id_number.to_string(),
            color: color.to_string(),
            image: None,
            created_at,
            position: max_position,
        })
    }

    pub fn update_id_card(
        &self,
        card_id: &str,
        id_name: &str,
        id_type: &str,
        full_name: &str,
        id_number: &str,
        color: &str,
        image: Option<&[u8]>,
        user_id: i32,
    ) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;

        let (id_name_encrypted, id_name_nonce) = encrypt_to_base64(id_name, &key)?;
        let (id_type_encrypted, id_type_nonce) = encrypt_to_base64(id_type, &key)?;
        let (full_name_encrypted, full_name_nonce) = encrypt_to_base64(full_name, &key)?;
        let (id_number_encrypted, id_number_nonce) = encrypt_to_base64(id_number, &key)?;

        let (image_encrypted, image_nonce) = match image {
            Some(img) => {
                let (enc, nonce) = encrypt_bytes_to_base64(img, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        conn.execute(
            "UPDATE id_cards SET id_name_encrypted = ?, id_name_nonce = ?, id_type_encrypted = ?, id_type_nonce = ?, full_name_encrypted = ?, full_name_nonce = ?, id_number_encrypted = ?, id_number_nonce = ?, color = ?, image = ?, image_nonce = ? WHERE id = ?",
            rusqlite::params![&id_name_encrypted, &id_name_nonce, &id_type_encrypted, &id_type_nonce, &full_name_encrypted, &full_name_nonce, &id_number_encrypted, &id_number_nonce, color, &image_encrypted, &image_nonce, card_id],
        ).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn update_id_card_position(&self, card_id: &str, new_position: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE id_cards SET position = ? WHERE id = ?",
            rusqlite::params![new_position, card_id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_id_card(&self, card_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM id_cards WHERE id = ?", [card_id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
