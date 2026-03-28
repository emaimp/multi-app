use chrono::Utc;
use generic_array::GenericArray;
use typenum::U32;

use crate::auth::Database;
use crate::crypto::{decrypt_from_base64, encrypt_to_base64};
use crate::models::Collection;

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

    pub fn delete_collection(&self, collection_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        
        // Get vault_ids from the collection before deleting
        let vault_ids_json: String = conn.query_row(
            "SELECT vault_ids FROM collections WHERE id = ?",
            [collection_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;

        let vault_ids: Vec<String> = serde_json::from_str(&vault_ids_json).unwrap_or_default();

        // Delete all vaults in the collection
        for vault_id in vault_ids {
            let _ = conn.execute("DELETE FROM vaults WHERE id = ?", [&vault_id]);
        }

        // Delete the collection
        conn.execute("DELETE FROM collections WHERE id = ?", [collection_id])
            .map_err(|e| e.to_string())?;
        
        Ok(())
    }

    pub fn get_or_create_general_collection(&self, user_id: i32) -> Result<Collection, String> {
        // First try to find existing "General" collection
        let collections = self.get_collections(user_id)?;
        for c in collections {
            if c.name == "General" {
                return Ok(c);
            }
        }
        
        // If not found, create it
        self.create_collection(user_id, "General")
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
        created_at: row.get(5)?,
        position: row.get(6)?,
    })
}
