use crate::auth::Database;
use crate::models::{Vault, Note};
use crate::crypto::{encrypt_to_base64, decrypt_from_base64};
use base64::Engine as _;
use chrono::Utc;
use rusqlite::{Row, OptionalExtension};
use generic_array::GenericArray;
use typenum::U32;

impl Database {
    pub fn get_vaults(&self, user_id: i32) -> Result<Vec<Vault>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, user_id, name_encrypted, color, image, name_nonce, created_at FROM vaults WHERE user_id = ? ORDER BY created_at DESC"
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

    pub fn create_vault(&self, user_id: i32, name: &str, color: &str) -> Result<Vault, String> {
        let conn = self.conn.lock().unwrap();
        let id = uuid::Uuid::new_v4().to_string();
        let created_at = Utc::now().timestamp_millis();

        let key = self.get_encryption_key(user_id)?;
        let (name_encrypted, name_nonce) = encrypt_to_base64(name, &key)?;

        conn.execute(
            "INSERT INTO vaults (id, user_id, name_encrypted, color, name_nonce, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [&id, &user_id.to_string(), &name_encrypted, color, &name_nonce, &created_at.to_string()],
        ).map_err(|e| e.to_string())?;

        Ok(Vault {
            id,
            user_id,
            name: name.to_string(),
            color: color.to_string(),
            image: None,
            created_at,
        })
    }

    pub fn update_vault(&self, vault: &Vault) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let key = self.get_encryption_key(vault.user_id)?;
        let (name_encrypted, name_nonce) = encrypt_to_base64(&vault.name, &key)?;

        conn.execute(
            "UPDATE vaults SET name_encrypted = ?, color = ?, name_nonce = ? WHERE id = ?",
            [&name_encrypted, &vault.color, &name_nonce, &vault.id],
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
        let updated_at = created_at;

        let key = self.get_encryption_key(user_id)?;
        let (title_encrypted, title_nonce) = encrypt_to_base64(title, &key)?;
        let (content_encrypted, content_nonce) = encrypt_to_base64(content, &key)?;

        conn.execute(
            "INSERT INTO notes (id, vault_id, title_encrypted, content_encrypted, title_nonce, content_nonce, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [&id, vault_id, &title_encrypted, &content_encrypted, &title_nonce, &content_nonce, &created_at.to_string(), &updated_at.to_string()],
        ).map_err(|e| e.to_string())?;

        Ok(Note {
            id,
            vault_id: vault_id.to_string(),
            title: title.to_string(),
            content: content.to_string(),
            created_at,
            updated_at,
        })
    }

    pub fn update_note(&self, note_id: &str, title: &str, content: &str, user_id: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let updated_at = Utc::now().timestamp_millis();

        let key = self.get_encryption_key(user_id)?;
        let (title_encrypted, title_nonce) = encrypt_to_base64(title, &key)?;
        let (content_encrypted, content_nonce) = encrypt_to_base64(content, &key)?;

        conn.execute(
            "UPDATE notes SET title_encrypted = ?, content_encrypted = ?, title_nonce = ?, content_nonce = ?, updated_at = ? WHERE id = ?",
            [&title_encrypted, &content_encrypted, &title_nonce, &content_nonce, &updated_at.to_string(), note_id],
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

        let (id, vault_id, title_encrypted, content_encrypted, title_nonce, content_nonce, created_at, updated_at): (String, String, String, String, String, String, i64, i64) = conn.query_row(
            "SELECT n.id, n.vault_id, n.title_encrypted, n.content_encrypted, n.title_nonce, n.content_nonce, n.created_at, n.updated_at
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
            updated_at,
        }))
    }

    pub fn get_notes_decrypted(&self, vault_id: &str, user_id: i32) -> Result<Vec<Note>, String> {
        let conn = self.conn.lock().unwrap();

        let key = self.get_encryption_key(user_id)?;

        let mut stmt = conn.prepare(
            "SELECT id, vault_id, title_encrypted, content_encrypted, title_nonce, content_nonce, created_at, updated_at FROM notes WHERE vault_id = ? ORDER BY updated_at DESC"
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
            let (id, vault_id, title_encrypted, content_encrypted, title_nonce, content_nonce, created_at, updated_at): (String, String, String, String, String, String, i64, i64) = note_data.map_err(|e| e.to_string())?;
            let title = decrypt_from_base64(&title_encrypted, &title_nonce, &key)?;
            let content = decrypt_from_base64(&content_encrypted, &content_nonce, &key)?;
            result.push(Note {
                id,
                vault_id,
                title,
                content,
                created_at,
                updated_at,
            });
        }
        Ok(result)
    }
}

fn vault_from_row(row: &Row, user_id: i32, key: &GenericArray<u8, U32>) -> Result<Vault, rusqlite::Error> {
    let name_encrypted: String = row.get(2)?;
    let name_nonce: String = row.get(5)?;
    let image_bytes: Option<Vec<u8>> = row.get(4)?;
    let image_b64 = image_bytes.map(|bytes| base64::engine::general_purpose::STANDARD.encode(&bytes));

    let name = match decrypt_from_base64(&name_encrypted, &name_nonce, key) {
        Ok(n) => n,
        Err(_) => return Err(rusqlite::Error::InvalidColumnName("Decryption failed".to_string())),
    };

    Ok(Vault {
        id: row.get(0)?,
        user_id,
        name,
        color: row.get(3)?,
        image: image_b64,
        created_at: row.get(6)?,
    })
}
