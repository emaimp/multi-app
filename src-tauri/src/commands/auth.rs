use crate::auth::Database;
use crate::models::{UserResponse, RegisterStep1Response};

#[tauri::command]
pub fn login(username: String, totp_code: String, master_key: String, state: tauri::State<Database>) -> Result<UserResponse, String> {
    let user = state.login(&username, &totp_code, &master_key)?;
    Ok(user.into())
}

#[tauri::command]
pub fn register(username: String, master_key: String, state: tauri::State<Database>) -> Result<RegisterStep1Response, String> {
    let response = state.register_step1(&username, &master_key)?;
    Ok(response)
}

#[tauri::command]
pub fn confirm_register(user_id: i32, totp_code: String, master_key: String, state: tauri::State<Database>) -> Result<UserResponse, String> {
    let user = state.register_step2(user_id, &totp_code, &master_key)?;
    Ok(user.into())
}

#[tauri::command]
pub fn init_session(user_id: i32, master_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.init_session(user_id, &master_key)
}

#[tauri::command]
pub fn logout(user_id: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.clear_session(user_id);
    Ok(())
}

#[tauri::command]
pub fn get_user_avatar(user_id: i32, state: tauri::State<Database>) -> Result<Option<String>, String> {
    state.get_user_avatar(user_id)
}

#[tauri::command]
pub fn update_avatar(user_id: i32, avatar: Option<Vec<u8>>, state: tauri::State<Database>) -> Result<(), String> {
    state.update_avatar(user_id, avatar.as_deref())
}

#[tauri::command]
pub fn delete_user(user_id: i32, master_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_user(user_id, &master_key)
}