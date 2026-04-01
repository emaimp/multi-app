use chrono::Utc;

use crate::auth::Database;
use crate::crypto::{decrypt_bytes_from_base64, decrypt_from_base64, encrypt_bytes_to_base64, encrypt_to_base64};
use crate::models::CreditCard;
use base64::Engine as _;

impl Database {
    pub fn get_credit_cards_decrypted(&self, vault_id: &str, user_id: i32) -> Result<Vec<CreditCard>, String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;

        let mut stmt = conn.prepare(
            "SELECT id, vault_id, card_name_encrypted, card_name_nonce, holder_name_encrypted, holder_name_nonce, card_number_encrypted, card_number_nonce, expiry_encrypted, expiry_nonce, cvv_encrypted, cvv_nonce, color, image, image_nonce, created_at, updated_at, position FROM credit_cards WHERE vault_id = ? ORDER BY position ASC, created_at ASC"
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
                row.get(15)?,
                row.get(16)?,
                row.get(17)?,
            ))
        }).map_err(|e| e.to_string())?;

        for card_data in card_iter {
            let (
                id, vault_id, card_name_encrypted, card_name_nonce,
                holder_name_encrypted, holder_name_nonce, card_number_encrypted, card_number_nonce,
                expiry_encrypted, expiry_nonce, cvv_encrypted, cvv_nonce,
                color, image_encrypted, image_nonce, created_at, updated_at, position
            ): (String, String, String, String, String, String, String, String, String, String, String, String, String, Option<String>, Option<String>, i64, i64, i32) = card_data.map_err(|e| e.to_string())?;

            let card_name = decrypt_from_base64(&card_name_encrypted, &card_name_nonce, &key)?;
            let holder_name = decrypt_from_base64(&holder_name_encrypted, &holder_name_nonce, &key)?;
            let card_number = decrypt_from_base64(&card_number_encrypted, &card_number_nonce, &key)?;
            let expiry = decrypt_from_base64(&expiry_encrypted, &expiry_nonce, &key)?;
            let cvv = decrypt_from_base64(&cvv_encrypted, &cvv_nonce, &key)?;
            
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

            result.push(CreditCard {
                id,
                vault_id,
                card_name,
                holder_name,
                card_number,
                expiry,
                cvv,
                color,
                image: image_b64,
                created_at,
                updated_at,
                position,
            });
        }
        Ok(result)
    }

    pub fn get_credit_card_with_content(&self, card_id: &str, user_id: i32) -> Result<Option<CreditCard>, String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;

        let (id, vault_id, card_name_encrypted, card_name_nonce, holder_name_encrypted, holder_name_nonce, card_number_encrypted, card_number_nonce, expiry_encrypted, expiry_nonce, cvv_encrypted, cvv_nonce, color, image_encrypted, image_nonce, created_at, updated_at, position): (String, String, String, String, String, String, String, String, String, String, String, String, String, Option<String>, Option<String>, i64, i64, i32) = conn.query_row(
            "SELECT id, vault_id, card_name_encrypted, card_name_nonce, holder_name_encrypted, holder_name_nonce, card_number_encrypted, card_number_nonce, expiry_encrypted, expiry_nonce, cvv_encrypted, cvv_nonce, color, image, image_nonce, created_at, updated_at, position
             FROM credit_cards
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
                row.get(15)?,
                row.get(16)?,
                row.get(17)?,
            ))
        ).map_err(|e| e.to_string())?;

        let card_name = decrypt_from_base64(&card_name_encrypted, &card_name_nonce, &key)?;
        let holder_name = decrypt_from_base64(&holder_name_encrypted, &holder_name_nonce, &key)?;
        let card_number = decrypt_from_base64(&card_number_encrypted, &card_number_nonce, &key)?;
        let expiry = decrypt_from_base64(&expiry_encrypted, &expiry_nonce, &key)?;
        let cvv = decrypt_from_base64(&cvv_encrypted, &cvv_nonce, &key)?;

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

        Ok(Some(CreditCard {
            id,
            vault_id,
            card_name,
            holder_name,
            card_number,
            expiry,
            cvv,
            color,
            image: image_b64,
            created_at,
            updated_at,
            position,
        }))
    }

    pub fn create_credit_card(
        &self,
        vault_id: &str,
        card_name: &str,
        holder_name: &str,
        card_number: &str,
        expiry: &str,
        cvv: &str,
        color: &str,
        image: Option<&[u8]>,
        user_id: i32,
    ) -> Result<CreditCard, String> {
        let conn = self.conn.lock().unwrap();
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().timestamp_millis();

        let key = self.get_encryption_key(user_id)?;
        let (card_name_encrypted, card_name_nonce) = encrypt_to_base64(card_name, &key)?;
        let (holder_name_encrypted, holder_name_nonce) = encrypt_to_base64(holder_name, &key)?;
        let (card_number_encrypted, card_number_nonce) = encrypt_to_base64(card_number, &key)?;
        let (expiry_encrypted, expiry_nonce) = encrypt_to_base64(expiry, &key)?;
        let (cvv_encrypted, cvv_nonce) = encrypt_to_base64(cvv, &key)?;

        let (image_encrypted, image_nonce) = match image {
            Some(img) => {
                let (enc, nonce) = encrypt_bytes_to_base64(img, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        let max_position: i32 = conn.query_row(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM credit_cards WHERE vault_id = ?",
            [vault_id],
            |row| row.get(0)
        ).unwrap_or(0);

        conn.execute(
            "INSERT INTO credit_cards (id, vault_id, card_name_encrypted, card_name_nonce, holder_name_encrypted, holder_name_nonce, card_number_encrypted, card_number_nonce, expiry_encrypted, expiry_nonce, cvv_encrypted, cvv_nonce, color, image, image_nonce, created_at, updated_at, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![
                &id, vault_id, &card_name_encrypted, &card_name_nonce, &holder_name_encrypted, &holder_name_nonce, &card_number_encrypted, &card_number_nonce, &expiry_encrypted, &expiry_nonce, &cvv_encrypted, &cvv_nonce, color, &image_encrypted, &image_nonce, now, now, max_position
            ],
        ).map_err(|e| e.to_string())?;

        Ok(CreditCard {
            id,
            vault_id: vault_id.to_string(),
            card_name: card_name.to_string(),
            holder_name: holder_name.to_string(),
            card_number: card_number.to_string(),
            expiry: expiry.to_string(),
            cvv: cvv.to_string(),
            color: color.to_string(),
            image: None,
            created_at: now,
            updated_at: now,
            position: max_position,
        })
    }

    pub fn update_credit_card(
        &self,
        card_id: &str,
        card_name: &str,
        holder_name: &str,
        card_number: &str,
        expiry: &str,
        cvv: &str,
        color: &str,
        image: Option<&[u8]>,
        user_id: i32,
    ) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;
        let now = Utc::now().timestamp_millis();

        let (card_name_encrypted, card_name_nonce) = encrypt_to_base64(card_name, &key)?;
        let (holder_name_encrypted, holder_name_nonce) = encrypt_to_base64(holder_name, &key)?;
        let (card_number_encrypted, card_number_nonce) = encrypt_to_base64(card_number, &key)?;
        let (expiry_encrypted, expiry_nonce) = encrypt_to_base64(expiry, &key)?;
        let (cvv_encrypted, cvv_nonce) = encrypt_to_base64(cvv, &key)?;

        let (image_encrypted, image_nonce) = match image {
            Some(img) => {
                let (enc, nonce) = encrypt_bytes_to_base64(img, &key)?;
                (Some(enc), Some(nonce))
            }
            None => (None, None),
        };

        conn.execute(
            "UPDATE credit_cards SET card_name_encrypted = ?, card_name_nonce = ?, holder_name_encrypted = ?, holder_name_nonce = ?, card_number_encrypted = ?, card_number_nonce = ?, expiry_encrypted = ?, expiry_nonce = ?, cvv_encrypted = ?, cvv_nonce = ?, color = ?, image = ?, image_nonce = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![&card_name_encrypted, &card_name_nonce, &holder_name_encrypted, &holder_name_nonce, &card_number_encrypted, &card_number_nonce, &expiry_encrypted, &expiry_nonce, &cvv_encrypted, &cvv_nonce, color, &image_encrypted, &image_nonce, now, card_id],
        ).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn update_credit_card_position(&self, card_id: &str, new_position: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE credit_cards SET position = ? WHERE id = ?",
            rusqlite::params![new_position, card_id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_credit_card(&self, card_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM credit_cards WHERE id = ?", [card_id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}