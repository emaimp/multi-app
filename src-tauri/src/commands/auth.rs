use crate::auth::Database;
use crate::models::UserResponse;

#[tauri::command]
pub fn login(username: String, password: String, master_key: String, state: tauri::State<Database>) -> Result<UserResponse, String> {
    let user = state.login(&username, &password, &master_key)?;
    Ok(user.into())
}

#[tauri::command]
pub fn register(username: String, password: String, master_key: String, state: tauri::State<Database>) -> Result<UserResponse, String> {
    let user = state.register(&username, &password, &master_key)?;
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
pub fn recover_password(username: String, master_key: String, new_password: String, state: tauri::State<Database>) -> Result<(), String> {
    state.recover_password(&username, &master_key, &new_password)
}

#[tauri::command]
pub fn change_password(user_id: i32, master_key: String, new_password: String, state: tauri::State<Database>) -> Result<(), String> {
    state.change_password(user_id, &master_key, &new_password)
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
pub fn delete_user(user_id: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_user(user_id)
}
