use crate::auth::Database;
use crate::models::Collection;

#[tauri::command]
pub fn get_collections(user_id: i32, state: tauri::State<Database>) -> Result<Vec<Collection>, String> {
    state.get_collections(user_id)
}

#[tauri::command]
pub fn create_collection(user_id: i32, name: String, state: tauri::State<Database>) -> Result<Collection, String> {
    state.create_collection(user_id, &name)
}

#[tauri::command]
pub fn update_collection(collection: String, state: tauri::State<Database>) -> Result<(), String> {
    let collection_model: Collection = serde_json::from_str(&collection).map_err(|e| e.to_string())?;
    state.update_collection(&collection_model)
}

#[tauri::command]
pub fn add_vault_to_collection(collection_id: String, vault_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.add_vault_to_collection(&collection_id, &vault_id)
}

#[tauri::command]
pub fn remove_vault_from_collection(collection_id: String, vault_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.remove_vault_from_collection(&collection_id, &vault_id)
}

#[tauri::command]
pub fn delete_collection(collection_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_collection(&collection_id)
}
