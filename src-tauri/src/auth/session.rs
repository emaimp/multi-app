use generic_array::GenericArray;
use typenum::U32;

use super::database::Database;

impl Database {
    pub fn clear_session(&self, user_id: i32) {
        let mut keys = self.encryption_keys.lock().unwrap();
        keys.remove(&user_id);
        let mut access_keys = self.access_derived_keys.lock().unwrap();
        access_keys.remove(&user_id);
    }

    pub fn get_encryption_key(&self, user_id: i32) -> Result<GenericArray<u8, U32>, String> {
        let keys = self.encryption_keys.lock().map_err(|e| e.to_string())?;
        Ok(keys.get(&user_id)
            .ok_or("Session not initialized. Call init_session first.".to_string())?
            .clone())
    }

    pub fn get_access_derived_key(&self, user_id: i32) -> Result<GenericArray<u8, U32>, String> {
        let keys = self.access_derived_keys.lock().map_err(|e| e.to_string())?;
        Ok(keys.get(&user_id)
            .ok_or("Session not initialized. Call init_session first.".to_string())?
            .clone())
    }
}
