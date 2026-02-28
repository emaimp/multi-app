use crate::auth::Database;
use crate::models::{Vault, Note, Collection};
use crate::crypto::{encrypt_to_base64, decrypt_from_base64, encrypt_bytes_to_base64, decrypt_bytes_from_base64};
use base64::Engine as _;
use chrono::Utc;
use rusqlite::{Row, OptionalExtension};
use generic_array::GenericArray;
use typenum::U32;

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

        let max_position: i32 = conn.query_row(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM vaults WHERE user_id = ?",
            [user_id],
            |row| row.get(0)
        ).unwrap_or(0);

        conn.execute(
            "INSERT INTO vaults (id, user_id, name_encrypted, color, name_nonce, image, image_nonce, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![&id, user_id, &name_encrypted, color, &name_nonce, image_encrypted, image_nonce, created_at, max_position],
        ).map_err(|e| e.to_string())?;

        Ok(Vault {
            id,
            user_id,
            name: name.to_string(),
            color: color.to_string(),
            image: None,
            created_at,
            position: max_position,
        })
    }

    pub fn update_vault_position(&self, vault_id: &str, new_position: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE vaults SET position = ? WHERE id = ?",
            rusqlite::params![new_position, vault_id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn update_note_position(&self, note_id: &str, new_position: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE notes SET position = ? WHERE id = ?",
            rusqlite::params![new_position, note_id],
        ).map_err(|e| e.to_string())?;
        Ok(())
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

    pub fn delete_vault(&self, vault_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM vaults WHERE id = ?", [vault_id])
            .map_err(|e| e.to_string())?;
        Ok(())
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

    pub fn create_note(&self, vault_id: &str, title: &str, content: &str, user_id: i32) -> Result<Note, String> {
        let conn = self.conn.lock().unwrap();
        let id = uuid::Uuid::new_v4().to_string();
        let created_at = Utc::now().timestamp_millis();

        let key = self.get_encryption_key(user_id)?;
        let (title_encrypted, title_nonce) = encrypt_to_base64(title, &key)?;
        let (content_encrypted, content_nonce) = encrypt_to_base64(content, &key)?;

        let max_position: i32 = conn.query_row(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM notes WHERE vault_id = ?",
            [vault_id],
            |row| row.get(0)
        ).unwrap_or(0);

        conn.execute(
            "INSERT INTO notes (id, vault_id, title_encrypted, content_encrypted, title_nonce, content_nonce, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![&id, vault_id, &title_encrypted, &content_encrypted, &title_nonce, &content_nonce, created_at, max_position],
        ).map_err(|e| e.to_string())?;

        Ok(Note {
            id,
            vault_id: vault_id.to_string(),
            title: title.to_string(),
            content: content.to_string(),
            created_at,
            position: max_position,
        })
    }

    pub fn update_note(&self, note_id: &str, title: &str, content: &str, user_id: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;
        let (title_encrypted, title_nonce) = encrypt_to_base64(title, &key)?;
        let (content_encrypted, content_nonce) = encrypt_to_base64(content, &key)?;

        conn.execute(
            "UPDATE notes SET title_encrypted = ?, content_encrypted = ?, title_nonce = ?, content_nonce = ? WHERE id = ?",
            rusqlite::params![&title_encrypted, &content_encrypted, &title_nonce, &content_nonce, note_id],
        ).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn delete_note(&self, note_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM notes WHERE id = ?", [note_id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_note_with_content(&self, note_id: &str, user_id: i32) -> Result<Option<Note>, String> {
        let conn = self.conn.lock().unwrap();

        let (id, vault_id, title_encrypted, content_encrypted, title_nonce, content_nonce, created_at, position): (String, String, String, String, String, String, i64, i32) = conn.query_row(
            "SELECT n.id, n.vault_id, n.title_encrypted, n.content_encrypted, n.title_nonce, n.content_nonce, n.created_at, n.position
             FROM notes n
             WHERE n.id = ?",
            [note_id],
            |row| Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
                row.get(7)?,
            ))
        ).map_err(|e| e.to_string())?;

        let key = self.get_encryption_key(user_id)?;
        let title = decrypt_from_base64(&title_encrypted, &title_nonce, &key)?;
        let content = decrypt_from_base64(&content_encrypted, &content_nonce, &key)?;

        Ok(Some(Note {
            id,
            vault_id,
            title,
            content,
            created_at,
            position,
        }))
    }

    pub fn get_notes_decrypted(&self, vault_id: &str, user_id: i32) -> Result<Vec<Note>, String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;

        let mut stmt = conn.prepare(
            "SELECT id, vault_id, title_encrypted, content_encrypted, title_nonce, content_nonce, created_at, position FROM notes WHERE vault_id = ? ORDER BY position ASC, created_at ASC"
        ).map_err(|e| e.to_string())?;

        let mut result = Vec::new();
        let note_iter = stmt.query_map([vault_id], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
                row.get(7)?,
            ))
        }).map_err(|e| e.to_string())?;

        for note_data in note_iter {
            let (id, vault_id, title_encrypted, content_encrypted, title_nonce, content_nonce, created_at, position): (String, String, String, String, String, String, i64, i32) = note_data.map_err(|e| e.to_string())?;
            let title = decrypt_from_base64(&title_encrypted, &title_nonce, &key)?;
            let content = decrypt_from_base64(&content_encrypted, &content_nonce, &key)?;
            result.push(Note {
                id,
                vault_id,
                title,
                content,
                created_at,
                position,
            });
        }
        Ok(result)
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
                    let b64 = base64::engine::general_purpose::STANDARD.encode(&decrypted);
                    Some(format!("data:image/webp;base64,{}", b64))
                }
                Err(_) => {
                    // Fallback: treat as unencrypted (legacy data)
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

impl Database {
    pub fn get_collections(&self, user_id: i32) -> Result<Vec<Collection>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, user_id, name_encrypted, name_nonce, vault_ids, created_at, position FROM collections WHERE user_id = ? ORDER BY position ASC, created_at ASC"
        ).map_err(|e| e.to_string())?;

        let key = self.get_encryption_key(user_id)?;

        let mut result = Vec::new();
        let collection_iter = stmt.query_map([user_id], move |row| {
            collection_from_row(row, user_id, &key)
        }).map_err(|e| e.to_string())?;

        for collection in collection_iter {
            result.push(collection.map_err(|e| e.to_string())?);
        }
        Ok(result)
    }

    pub fn create_collection(&self, user_id: i32, name: &str) -> Result<Collection, String> {
        let conn = self.conn.lock().unwrap();
        let id = uuid::Uuid::new_v4().to_string();
        let created_at = Utc::now().timestamp_millis();

        let key = self.get_encryption_key(user_id)?;
        let (name_encrypted, name_nonce) = encrypt_to_base64(name, &key)?;

        let max_position: i32 = conn.query_row(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM collections WHERE user_id = ?",
            [user_id],
            |row| row.get(0)
        ).unwrap_or(0);

        let vault_ids_json = "[]".to_string();

        conn.execute(
            "INSERT INTO collections (id, user_id, name_encrypted, name_nonce, vault_ids, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![&id, user_id, &name_encrypted, &name_nonce, &vault_ids_json, created_at, max_position],
        ).map_err(|e| e.to_string())?;

        Ok(Collection {
            id,
            user_id,
            name: name.to_string(),
            vault_ids: vec![],
            position: max_position,
            created_at,
        })
    }

    pub fn update_collection(&self, collection: &Collection) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        
        let user_id = collection.user_id;
        let key = self.get_encryption_key(user_id)?;
        let (name_encrypted, name_nonce) = encrypt_to_base64(&collection.name, &key)?;

        let vault_ids_json = serde_json::to_string(&collection.vault_ids).map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE collections SET name_encrypted = ?, name_nonce = ?, vault_ids = ?, position = ? WHERE id = ?",
            rusqlite::params![&name_encrypted, &name_nonce, &vault_ids_json, collection.position, &collection.id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_collection(&self, collection_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM collections WHERE id = ?", [collection_id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn add_vault_to_collection(&self, collection_id: &str, vault_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        let vault_ids_json: String = conn.query_row(
            "SELECT vault_ids FROM collections WHERE id = ?",
            [collection_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;

        let mut vault_ids: Vec<String> = serde_json::from_str(&vault_ids_json).unwrap_or_default();
        if !vault_ids.contains(&vault_id.to_string()) {
            vault_ids.push(vault_id.to_string());
        }

        let vault_ids_json = serde_json::to_string(&vault_ids).map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE collections SET vault_ids = ? WHERE id = ?",
            rusqlite::params![&vault_ids_json, collection_id],
        ).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn remove_vault_from_collection(&self, collection_id: &str, vault_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        let vault_ids_json: String = conn.query_row(
            "SELECT vault_ids FROM collections WHERE id = ?",
            [collection_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;

        let mut vault_ids: Vec<String> = serde_json::from_str(&vault_ids_json).unwrap_or_default();
        vault_ids.retain(|id| id != vault_id);

        let vault_ids_json = serde_json::to_string(&vault_ids).map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE collections SET vault_ids = ? WHERE id = ?",
            rusqlite::params![&vault_ids_json, collection_id],
        ).map_err(|e| e.to_string())?;

        Ok(())
    }
}

fn collection_from_row(row: &rusqlite::Row, user_id: i32, key: &GenericArray<u8, U32>) -> Result<Collection, rusqlite::Error> {
    let name_encrypted: String = row.get(2)?;
    let name_nonce: String = row.get(3)?;
    let vault_ids_json: String = row.get(4)?;

    let name = match decrypt_from_base64(&name_encrypted, &name_nonce, key) {
        Ok(n) => n,
        Err(_) => return Err(rusqlite::Error::InvalidColumnName("Decryption failed".to_string())),
    };

    let vault_ids: Vec<String> = serde_json::from_str(&vault_ids_json).unwrap_or_default();

    Ok(Collection {
        id: row.get(0)?,
        user_id,
        name,
        vault_ids,
        position: row.get(5)?,
        created_at: row.get(6)?,
    })
}
