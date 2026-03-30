use crate::auth::Database;
use crate::models::Vault;

#[tauri::command]
pub fn get_vaults(user_id: i32, state: tauri::State<Database>) -> Result<Vec<Vault>, String> {
    state.get_vaults(user_id)
}

#[tauri::command]
pub fn get_vault(vault_id: String, state: tauri::State<Database>) -> Result<Option<Vault>, String> {
    state.get_vault(&vault_id)
}

#[tauri::command]
pub fn create_vault(user_id: i32, name: String, color: String, image: Option<Vec<u8>>, collection_id: Option<String>, state: tauri::State<Database>) -> Result<Vault, String> {
    state.create_vault(user_id, &name, &color, image.as_deref(), collection_id.as_deref())
}

#[tauri::command]
pub fn update_vault(vault: String, name: String, color: String, image: Option<Vec<u8>>, state: tauri::State<Database>) -> Result<(), String> {
    let vault_model: Vault = serde_json::from_str(&vault).map_err(|e| e.to_string())?;
    let updated_vault = Vault {
        name,
        color,
        ..vault_model
    };
    state.update_vault(&updated_vault, image.as_deref())
}

#[tauri::command]
pub fn update_vault_position(vault_id: String, new_position: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.update_vault_position(&vault_id, new_position)
}

#[tauri::command]
pub fn delete_vault(vault_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_vault(&vault_id)
}
