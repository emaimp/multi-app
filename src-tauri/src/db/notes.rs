use chrono::Utc;

use crate::auth::Database;
use crate::crypto::{decrypt_from_base64, encrypt_to_base64};
use crate::models::Note;

impl Database {
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

    pub fn update_note_position(&self, note_id: &str, new_position: i32) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE notes SET position = ? WHERE id = ?",
            rusqlite::params![new_position, note_id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_note(&self, note_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM notes WHERE id = ?", [note_id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
