use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use rand::thread_rng;
use generic_array::GenericArray;
use typenum::U32;

use crate::crypto::{encrypt_to_base64, decrypt_from_base64, derive_encryption_key, encrypt_bytes_to_base64, decrypt_bytes_from_base64};
use crate::models::User;
use super::database::Database;
use base64::Engine as _;

impl Database {
    pub fn login(&self, username: &str, master_key: &str) -> Result<User, String> {
        let (user_id, username_encrypted, username_nonce, master_key_hash) = {
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

            let mut found = None;
            for (id, enc_user, nonce, mkey_hash) in all_users {
                let salt = extract_salt_from_hash(&mkey_hash)?;
                let key = derive_encryption_key(master_key, &salt)?;
                
                if let Ok(decrypted_username) = decrypt_from_base64(&enc_user, &nonce, &key) {
                    if decrypted_username == username {
                        found = Some((id, enc_user, nonce, mkey_hash));
                        break;
                    }
                }
            }

            found.ok_or("User not found".to_string())?
        };

        let parsed_master_hash = PasswordHash::new(&master_key_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(master_key.as_bytes(), &parsed_master_hash).map_err(|_| "Invalid master key".to_string())?;

        Ok(User {
            id: user_id,
            username: username.to_string(),
            username_encrypted: Some(username_encrypted),
            username_nonce: Some(username_nonce),
            master_key_hash,
            avatar: None,
        })
    }

    pub fn register(&self, username: &str, master_key: &str) -> Result<User, String> {
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

        let master_salt = SaltString::generate(&mut thread_rng());
        let argon2 = Argon2::default();
        let master_key_hash = argon2.hash_password(master_key.as_bytes(), &master_salt).map_err(|e| e.to_string())?.to_string();
        
        let salt = extract_salt_from_hash(&master_key_hash)?;
        let key = derive_encryption_key(master_key, &salt)?;
        let (username_encrypted, username_nonce) = encrypt_to_base64(username, &key).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO users (username_encrypted, username_nonce, master_key_hash) VALUES (?, ?, ?)",
            [&username_encrypted, &username_nonce, &master_key_hash],
        ).map_err(|e| e.to_string())?;

        let user_id = conn.last_insert_rowid() as i32;

        Ok(User {
            id: user_id,
            username: username.to_string(),
            username_encrypted: Some(username_encrypted),
            username_nonce: Some(username_nonce),
            master_key_hash,
            avatar: None,
        })
    }

    pub fn change_master_key(&self, user_id: i32, current_master_key: &str, new_master_key: &str) -> Result<(), String> {
        let (old_key, _old_master_key_hash, username_encrypted, username_nonce) = {
            let conn = self.conn.lock().unwrap();
            let master_key_hash: String = conn.query_row(
                "SELECT master_key_hash FROM users WHERE id = ?",
                [user_id],
                |row| row.get(0)
            ).map_err(|e| e.to_string())?;

            let parsed_hash = PasswordHash::new(&master_key_hash).map_err(|e| e.to_string())?;
            Argon2::default().verify_password(current_master_key.as_bytes(), &parsed_hash)
                .map_err(|_| "Invalid master key".to_string())?;

            let old_salt = parsed_hash.salt.ok_or("Salt not found in hash")?.as_ref().as_bytes().to_vec();
            let old_key = derive_encryption_key(current_master_key, &old_salt).map_err(|e| e.to_string())?;

            let username_enc: String = conn.query_row(
                "SELECT username_encrypted FROM users WHERE id = ?",
                [user_id],
                |row| row.get(0)
            ).map_err(|e| e.to_string())?;

            let username_nonce: String = conn.query_row(
                "SELECT username_nonce FROM users WHERE id = ?",
                [user_id],
                |row| row.get(0)
            ).map_err(|e| e.to_string())?;

            (old_key, master_key_hash, username_enc, username_nonce)
        };

        let _username = decrypt_from_base64(&username_encrypted, &username_nonce, &old_key)
            .map_err(|e| e.to_string())?;

        let new_salt = SaltString::generate(&mut thread_rng());
        let new_argon2 = Argon2::default();
        let new_master_key_hash = new_argon2.hash_password(new_master_key.as_bytes(), &new_salt)
            .map_err(|e| e.to_string())?.to_string();

        let new_salt_bytes = extract_salt_from_hash(&new_master_key_hash)?;
        let new_key = derive_encryption_key(new_master_key, &new_salt_bytes)
            .map_err(|e| e.to_string())?;

        let (new_username_enc, new_username_nonce) = encrypt_to_base64(&_username, &new_key)
            .map_err(|e| e.to_string())?;

        self.reencrypt_all_data(user_id, &old_key, &new_key)?;

        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE users SET master_key_hash = ?, username_encrypted = ?, username_nonce = ? WHERE id = ?",
            rusqlite::params![&new_master_key_hash, &new_username_enc, &new_username_nonce, user_id],
        ).map_err(|e| e.to_string())?;

        let mut keys = self.encryption_keys.lock().unwrap();
        keys.insert(user_id, new_key);

        Ok(())
    }

    fn reencrypt_all_data(&self, user_id: i32, old_key: &GenericArray<u8, U32>, new_key: &GenericArray<u8, U32>) -> Result<(), String> {
        self.reencrypt_vaults(user_id, old_key, new_key)?;
        self.reencrypt_collections(user_id, old_key, new_key)?;
        self.reencrypt_login_keys(user_id, old_key, new_key)?;
        self.reencrypt_credit_cards(user_id, old_key, new_key)?;
        self.reencrypt_id_cards(user_id, old_key, new_key)?;
        self.reencrypt_notes(user_id, old_key, new_key)?;
        Ok(())
    }

    fn reencrypt_vaults(&self, user_id: i32, old_key: &GenericArray<u8, U32>, new_key: &GenericArray<u8, U32>) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name_encrypted, name_nonce, image, image_nonce FROM vaults WHERE user_id = ?"
        ).map_err(|e| e.to_string())?;

        let vaults: Vec<(String, String, String, Option<String>, Option<String>)> = stmt.query_map([user_id], |row| {
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

        drop(stmt);

        for (id, name_enc, name_nonce, image_enc, image_nonce) in vaults {
            let name = decrypt_from_base64(&name_enc, &name_nonce, old_key).map_err(|e| e.to_string())?;
            let (new_name_enc, new_name_nonce) = encrypt_to_base64(&name, new_key).map_err(|e| e.to_string())?;

            let (new_image_enc, new_image_nonce) = match (image_enc, image_nonce) {
                (Some(enc), Some(nonce)) => {
                    let img_data = decrypt_bytes_from_base64(&enc, &nonce, old_key).unwrap_or_else(|_| {
                        base64::engine::general_purpose::STANDARD.decode(&enc).unwrap_or_default()
                    });
                    let (new_enc, new_nonce) = encrypt_bytes_to_base64(&img_data, new_key).map_err(|e| e.to_string())?;
                    (Some(new_enc), Some(new_nonce))
                }
                _ => (None, None),
            };

            conn.execute(
                "UPDATE vaults SET name_encrypted = ?, name_nonce = ?, image = ?, image_nonce = ? WHERE id = ?",
                rusqlite::params![&new_name_enc, &new_name_nonce, &new_image_enc, &new_image_nonce, &id],
            ).map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    fn reencrypt_collections(&self, user_id: i32, old_key: &GenericArray<u8, U32>, new_key: &GenericArray<u8, U32>) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name_encrypted, name_nonce FROM collections WHERE user_id = ?"
        ).map_err(|e| e.to_string())?;

        let collections: Vec<(String, String, String)> = stmt.query_map([user_id], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
            ))
        }).map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

        drop(stmt);

        for (id, name_enc, name_nonce) in collections {
            let name = decrypt_from_base64(&name_enc, &name_nonce, old_key).map_err(|e| e.to_string())?;
            let (new_name_enc, new_name_nonce) = encrypt_to_base64(&name, new_key).map_err(|e| e.to_string())?;

            conn.execute(
                "UPDATE collections SET name_encrypted = ?, name_nonce = ? WHERE id = ?",
                [&new_name_enc, &new_name_nonce, &id],
            ).map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    fn reencrypt_login_keys(&self, user_id: i32, old_key: &GenericArray<u8, U32>, new_key: &GenericArray<u8, U32>) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, site_name_encrypted, site_name_nonce, url_encrypted, url_nonce, username_encrypted, username_nonce, password_encrypted, password_nonce, details_encrypted, details_nonce, image, image_nonce FROM login_keys WHERE vault_id IN (SELECT id FROM vaults WHERE user_id = ?)"
        ).map_err(|e| e.to_string())?;

        let login_keys: Vec<(String, String, String, Option<String>, Option<String>, String, String, String, String, Option<String>, Option<String>, Option<String>, Option<String>)> = stmt.query_map([user_id], |row| {
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
            ))
        }).map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

        drop(stmt);

        for (id, site_name_enc, site_name_nonce, url_enc, url_nonce, username_enc, username_nonce, password_enc, password_nonce, details_enc, details_nonce, image_enc, image_nonce) in login_keys {
            let site_name = decrypt_from_base64(&site_name_enc, &site_name_nonce, old_key).map_err(|e| e.to_string())?;
            let username = decrypt_from_base64(&username_enc, &username_nonce, old_key).map_err(|e| e.to_string())?;
            let password = decrypt_from_base64(&password_enc, &password_nonce, old_key).map_err(|e| e.to_string())?;

            let url = match (url_enc, url_nonce) {
                (Some(enc), Some(nonce)) => decrypt_from_base64(&enc, &nonce, old_key).ok(),
                _ => None,
            };

            let details = match (details_enc, details_nonce) {
                (Some(enc), Some(nonce)) => decrypt_from_base64(&enc, &nonce, old_key).ok(),
                _ => None,
            };

            let (new_site_name_enc, new_site_name_nonce) = encrypt_to_base64(&site_name, new_key).map_err(|e| e.to_string())?;
            let (new_username_enc, new_username_nonce) = encrypt_to_base64(&username, new_key).map_err(|e| e.to_string())?;
            let (new_password_enc, new_password_nonce) = encrypt_to_base64(&password, new_key).map_err(|e| e.to_string())?;

            let (new_url_enc, new_url_nonce) = match url {
                Some(u) => {
                    let (enc, nonce) = encrypt_to_base64(&u, new_key).map_err(|e| e.to_string())?;
                    (Some(enc), Some(nonce))
                }
                None => (None, None),
            };

            let (new_details_enc, new_details_nonce) = match details {
                Some(d) => {
                    let (enc, nonce) = encrypt_to_base64(&d, new_key).map_err(|e| e.to_string())?;
                    (Some(enc), Some(nonce))
                }
                None => (None, None),
            };

            let (new_image_enc, new_image_nonce) = match (image_enc, image_nonce) {
                (Some(enc), Some(nonce)) => {
                    let img_data = decrypt_bytes_from_base64(&enc, &nonce, old_key).unwrap_or_else(|_| {
                        base64::engine::general_purpose::STANDARD.decode(&enc).unwrap_or_default()
                    });
                    let (new_enc, new_nonce) = encrypt_bytes_to_base64(&img_data, new_key).map_err(|e| e.to_string())?;
                    (Some(new_enc), Some(new_nonce))
                }
                _ => (None, None),
            };

            conn.execute(
                "UPDATE login_keys SET site_name_encrypted = ?, site_name_nonce = ?, url_encrypted = ?, url_nonce = ?, username_encrypted = ?, username_nonce = ?, password_encrypted = ?, password_nonce = ?, details_encrypted = ?, details_nonce = ?, image = ?, image_nonce = ? WHERE id = ?",
                rusqlite::params![&new_site_name_enc, &new_site_name_nonce, &new_url_enc, &new_url_nonce, &new_username_enc, &new_username_nonce, &new_password_enc, &new_password_nonce, &new_details_enc, &new_details_nonce, &new_image_enc, &new_image_nonce, &id],
            ).map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    fn reencrypt_credit_cards(&self, user_id: i32, old_key: &GenericArray<u8, U32>, new_key: &GenericArray<u8, U32>) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, card_name_encrypted, card_name_nonce, holder_name_encrypted, holder_name_nonce, card_number_encrypted, card_number_nonce, expiry_encrypted, expiry_nonce, cvv_encrypted, cvv_nonce, image, image_nonce FROM credit_cards WHERE vault_id IN (SELECT id FROM vaults WHERE user_id = ?)"
        ).map_err(|e| e.to_string())?;

        let cards: Vec<(String, String, String, String, String, String, String, String, String, String, String, Option<String>, Option<String>)> = stmt.query_map([user_id], |row| {
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
            ))
        }).map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

        drop(stmt);

        for (id, card_name_enc, card_name_nonce, holder_name_enc, holder_name_nonce, card_number_enc, card_number_nonce, expiry_enc, expiry_nonce, cvv_enc, cvv_nonce, image_enc, image_nonce) in cards {
            let card_name = decrypt_from_base64(&card_name_enc, &card_name_nonce, old_key).map_err(|e| e.to_string())?;
            let holder_name = decrypt_from_base64(&holder_name_enc, &holder_name_nonce, old_key).map_err(|e| e.to_string())?;
            let card_number = decrypt_from_base64(&card_number_enc, &card_number_nonce, old_key).map_err(|e| e.to_string())?;
            let expiry = decrypt_from_base64(&expiry_enc, &expiry_nonce, old_key).map_err(|e| e.to_string())?;
            let cvv = decrypt_from_base64(&cvv_enc, &cvv_nonce, old_key).map_err(|e| e.to_string())?;

            let (new_card_name_enc, new_card_name_nonce) = encrypt_to_base64(&card_name, new_key).map_err(|e| e.to_string())?;
            let (new_holder_name_enc, new_holder_name_nonce) = encrypt_to_base64(&holder_name, new_key).map_err(|e| e.to_string())?;
            let (new_card_number_enc, new_card_number_nonce) = encrypt_to_base64(&card_number, new_key).map_err(|e| e.to_string())?;
            let (new_expiry_enc, new_expiry_nonce) = encrypt_to_base64(&expiry, new_key).map_err(|e| e.to_string())?;
            let (new_cvv_enc, new_cvv_nonce) = encrypt_to_base64(&cvv, new_key).map_err(|e| e.to_string())?;

            let (new_image_enc, new_image_nonce) = match (image_enc, image_nonce) {
                (Some(enc), Some(nonce)) => {
                    let img_data = decrypt_bytes_from_base64(&enc, &nonce, old_key).unwrap_or_else(|_| {
                        base64::engine::general_purpose::STANDARD.decode(&enc).unwrap_or_default()
                    });
                    let (new_enc, new_nonce) = encrypt_bytes_to_base64(&img_data, new_key).map_err(|e| e.to_string())?;
                    (Some(new_enc), Some(new_nonce))
                }
                _ => (None, None),
            };

            conn.execute(
                "UPDATE credit_cards SET card_name_encrypted = ?, card_name_nonce = ?, holder_name_encrypted = ?, holder_name_nonce = ?, card_number_encrypted = ?, card_number_nonce = ?, expiry_encrypted = ?, expiry_nonce = ?, cvv_encrypted = ?, cvv_nonce = ?, image = ?, image_nonce = ? WHERE id = ?",
                rusqlite::params![&new_card_name_enc, &new_card_name_nonce, &new_holder_name_enc, &new_holder_name_nonce, &new_card_number_enc, &new_card_number_nonce, &new_expiry_enc, &new_expiry_nonce, &new_cvv_enc, &new_cvv_nonce, &new_image_enc, &new_image_nonce, &id],
            ).map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    fn reencrypt_id_cards(&self, user_id: i32, old_key: &GenericArray<u8, U32>, new_key: &GenericArray<u8, U32>) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, id_name_encrypted, id_name_nonce, id_type_encrypted, id_type_nonce, full_name_encrypted, full_name_nonce, id_number_encrypted, id_number_nonce, image, image_nonce FROM id_cards WHERE vault_id IN (SELECT id FROM vaults WHERE user_id = ?)"
        ).map_err(|e| e.to_string())?;

        let id_cards: Vec<(String, String, String, String, String, String, String, String, String, Option<String>, Option<String>)> = stmt.query_map([user_id], |row| {
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
            ))
        }).map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

        drop(stmt);

        for (id, id_name_enc, id_name_nonce, id_type_enc, id_type_nonce, full_name_enc, full_name_nonce, id_number_enc, id_number_nonce, image_enc, image_nonce) in id_cards {
            let id_name = decrypt_from_base64(&id_name_enc, &id_name_nonce, old_key).map_err(|e| e.to_string())?;
            let id_type = decrypt_from_base64(&id_type_enc, &id_type_nonce, old_key).map_err(|e| e.to_string())?;
            let full_name = decrypt_from_base64(&full_name_enc, &full_name_nonce, old_key).map_err(|e| e.to_string())?;
            let id_number = decrypt_from_base64(&id_number_enc, &id_number_nonce, old_key).map_err(|e| e.to_string())?;

            let (new_id_name_enc, new_id_name_nonce) = encrypt_to_base64(&id_name, new_key).map_err(|e| e.to_string())?;
            let (new_id_type_enc, new_id_type_nonce) = encrypt_to_base64(&id_type, new_key).map_err(|e| e.to_string())?;
            let (new_full_name_enc, new_full_name_nonce) = encrypt_to_base64(&full_name, new_key).map_err(|e| e.to_string())?;
            let (new_id_number_enc, new_id_number_nonce) = encrypt_to_base64(&id_number, new_key).map_err(|e| e.to_string())?;

            let (new_image_enc, new_image_nonce) = match (image_enc, image_nonce) {
                (Some(enc), Some(nonce)) => {
                    let img_data = decrypt_bytes_from_base64(&enc, &nonce, old_key).unwrap_or_else(|_| {
                        base64::engine::general_purpose::STANDARD.decode(&enc).unwrap_or_default()
                    });
                    let (new_enc, new_nonce) = encrypt_bytes_to_base64(&img_data, new_key).map_err(|e| e.to_string())?;
                    (Some(new_enc), Some(new_nonce))
                }
                _ => (None, None),
            };

            conn.execute(
                "UPDATE id_cards SET id_name_encrypted = ?, id_name_nonce = ?, id_type_encrypted = ?, id_type_nonce = ?, full_name_encrypted = ?, full_name_nonce = ?, id_number_encrypted = ?, id_number_nonce = ?, image = ?, image_nonce = ? WHERE id = ?",
                rusqlite::params![&new_id_name_enc, &new_id_name_nonce, &new_id_type_enc, &new_id_type_nonce, &new_full_name_enc, &new_full_name_nonce, &new_id_number_enc, &new_id_number_nonce, &new_image_enc, &new_image_nonce, &id],
            ).map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    fn reencrypt_notes(&self, user_id: i32, old_key: &GenericArray<u8, U32>, new_key: &GenericArray<u8, U32>) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, note_name_encrypted, note_name_nonce, content_encrypted, content_nonce, image, image_nonce FROM notes WHERE vault_id IN (SELECT id FROM vaults WHERE user_id = ?)"
        ).map_err(|e| e.to_string())?;

        let notes: Vec<(String, String, String, String, String, Option<String>, Option<String>)> = stmt.query_map([user_id], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
            ))
        }).map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

        drop(stmt);

        for (id, note_name_enc, note_name_nonce, content_enc, content_nonce, image_enc, image_nonce) in notes {
            let note_name = decrypt_from_base64(&note_name_enc, &note_name_nonce, old_key).map_err(|e| e.to_string())?;
            let content = decrypt_from_base64(&content_enc, &content_nonce, old_key).map_err(|e| e.to_string())?;

            let (new_note_name_enc, new_note_name_nonce) = encrypt_to_base64(&note_name, new_key).map_err(|e| e.to_string())?;
            let (new_content_enc, new_content_nonce) = encrypt_to_base64(&content, new_key).map_err(|e| e.to_string())?;

            let (new_image_enc, new_image_nonce) = match (image_enc, image_nonce) {
                (Some(enc), Some(nonce)) => {
                    let img_data = decrypt_bytes_from_base64(&enc, &nonce, old_key).unwrap_or_else(|_| {
                        base64::engine::general_purpose::STANDARD.decode(&enc).unwrap_or_default()
                    });
                    let (new_enc, new_nonce) = encrypt_bytes_to_base64(&img_data, new_key).map_err(|e| e.to_string())?;
                    (Some(new_enc), Some(new_nonce))
                }
                _ => (None, None),
            };

            conn.execute(
                "UPDATE notes SET note_name_encrypted = ?, note_name_nonce = ?, content_encrypted = ?, content_nonce = ?, image = ?, image_nonce = ? WHERE id = ?",
                rusqlite::params![&new_note_name_enc, &new_note_name_nonce, &new_content_enc, &new_content_nonce, &new_image_enc, &new_image_nonce, &id],
            ).map_err(|e| e.to_string())?;
        }

        Ok(())
    }
}

fn extract_salt_from_hash(hash: &str) -> Result<Vec<u8>, String> {
    let parsed_hash = PasswordHash::new(hash).map_err(|e| e.to_string())?;
    let salt = parsed_hash.salt
        .ok_or("Salt not found in hash".to_string())?;
    Ok(salt.as_ref().as_bytes().to_vec())
}