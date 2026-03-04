use generic_array::GenericArray;
use typenum::U32;

use crate::crypto::derive_encryption_key;
use super::database::Database;

impl Database {
    pub fn init_session(&self, user_id: i32, master_key: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let master_key_hash: String = conn.query_row(
            "SELECT master_key_hash FROM users WHERE id = ?",
            [user_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;
        
        let salt = extract_salt_from_hash(&master_key_hash)?;
        let key = derive_encryption_key(master_key, &salt).map_err(|e| e.to_string())?;

        let mut keys = self.encryption_keys.lock().unwrap();
        keys.insert(user_id, key);
        Ok(())
    }

    pub fn clear_session(&self, user_id: i32) {
        let mut keys = self.encryption_keys.lock().unwrap();
        keys.remove(&user_id);
    }

    pub fn get_encryption_key(&self, user_id: i32) -> Result<GenericArray<u8, U32>, String> {
        let keys = self.encryption_keys.lock().map_err(|e| e.to_string())?;
        Ok(keys.get(&user_id)
            .ok_or("Session not initialized. Call init_session first.".to_string())?
            .clone())
    }
}

fn extract_salt_from_hash(hash: &str) -> Result<Vec<u8>, String> {
    use argon2::PasswordHash;
    let parsed_hash = PasswordHash::new(hash).map_err(|e| e.to_string())?;
    let salt = parsed_hash.salt
        .ok_or("Salt not found in hash".to_string())?;
    Ok(salt.as_ref().as_bytes().to_vec())
}
