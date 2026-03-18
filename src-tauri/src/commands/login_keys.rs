use crate::auth::Database;
use crate::models::LoginKey;

#[tauri::command]
pub fn get_login_keys_decrypted(vault_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Vec<LoginKey>, String> {
    state.get_login_keys_decrypted(&vault_id, user_id)
}

#[tauri::command]
pub fn get_login_key_with_content(login_key_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Option<LoginKey>, String> {
    state.get_login_key_with_content(&login_key_id, user_id)
}

#[tauri::command]
pub fn create_login_key(
    vault_id: String,
    site_name: String,
    url: Option<String>,
    username: String,
    password: String,
    details: Option<String>,
    color: String,
    image: Option<Vec<u8>>,
    user_id: i32,
    state: tauri::State<Database>
) -> Result<LoginKey, String> {
    state.create_login_key(
        &vault_id,
        &site_name,
        url.as_deref(),
        &username,
        &password,
        details.as_deref(),
        &color,
        image.as_deref(),
        user_id
    )
}

#[tauri::command]
pub fn update_login_key(
    login_key_id: String,
    site_name: String,
    url: Option<String>,
    username: String,
    password: String,
    details: Option<String>,
    color: String,
    image: Option<Vec<u8>>,
    user_id: i32,
    state: tauri::State<Database>
) -> Result<(), String> {
    state.update_login_key(
        &login_key_id,
        &site_name,
        url.as_deref(),
        &username,
        &password,
        details.as_deref(),
        &color,
        image.as_deref(),
        user_id
    )
}

#[tauri::command]
pub fn update_login_key_position(login_key_id: String, new_position: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.update_login_key_position(&login_key_id, new_position)
}

#[tauri::command]
pub fn delete_login_key(login_key_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_login_key(&login_key_id)
}
