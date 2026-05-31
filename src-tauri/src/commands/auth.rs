use crate::auth::Database;
use crate::models::UserResponse;
#[tauri::command(rename_all = "snake_case")]
pub fn login(username: String, access_key: String, state: tauri::State<Database>) -> Result<UserResponse, String> {
    state.login(&username, &access_key)
}

#[tauri::command(rename_all = "snake_case")]
pub fn register(username: String, access_key: String, state: tauri::State<Database>) -> Result<UserResponse, String> {
    state.register(&username, &access_key).map(|u| u.into())
}

#[tauri::command(rename_all = "snake_case")]
pub fn init_session(user_id: i32, access_key: String, state: tauri::State<Database>) -> Result<(), String> {
    let data_key = state.get_data_key_from_access(user_id, &access_key)?;
    let mut keys = state.encryption_keys.lock().unwrap();
    keys.insert(user_id, data_key);
    Ok(())
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

#[tauri::command(rename_all = "snake_case")]
pub fn change_password(user_id: i32, current_access_key: String, new_access_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.change_password(user_id, &current_access_key, &new_access_key)
}

#[tauri::command(rename_all = "snake_case")]
pub fn change_username(user_id: i32, current_access_key: String, new_username: String, state: tauri::State<Database>) -> Result<String, String> {
    state.change_username(user_id, &current_access_key, &new_username)
}

#[tauri::command]
pub fn delete_user(user_id: i32, current_access_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.get_data_key_from_access(user_id, &current_access_key)?;
    let conn = state.conn.lock().unwrap();
    conn.execute("DELETE FROM users WHERE id = ?", [user_id])
        .map_err(|e| e.to_string())?;
    drop(conn);
    state.clear_session(user_id);
    Ok(())
}