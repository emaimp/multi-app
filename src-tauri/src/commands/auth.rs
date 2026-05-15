use crate::auth::Database;
use crate::models::UserResponse;
use base64::Engine as _;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterResponse {
    pub user: UserResponse,
    pub master_key: String,
}

#[tauri::command(rename_all = "snake_case")]
pub fn login(username: String, access_key: String, state: tauri::State<Database>) -> Result<UserResponse, String> {
    let user = state.login(&username, &access_key)?;
    Ok(user.into())
}

#[tauri::command(rename_all = "snake_case")]
pub fn register(username: String, access_key: String, master_key: Option<String>, state: tauri::State<Database>) -> Result<RegisterResponse, String> {
    let generated_master_key = master_key.unwrap_or_else(|| {
        use rand::{Rng, thread_rng};
        let mut rng = thread_rng();
        let key_bytes: [u8; 32] = rng.gen();
        base64::engine::general_purpose::STANDARD.encode(key_bytes)
    });
    let (user, returned_master_key) = state.register(&username, &access_key, &generated_master_key)?;
    Ok(RegisterResponse {
        user: user.into(),
        master_key: returned_master_key,
    })
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

#[tauri::command]
pub fn delete_user(user_id: i32, master_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.verify_master_key(user_id, &master_key)?;
    let conn = state.conn.lock().unwrap();
    conn.execute("DELETE FROM users WHERE id = ?", [user_id])
        .map_err(|e| e.to_string())?;
    drop(conn);
    state.clear_session(user_id);
    Ok(())
}

#[tauri::command]
pub fn change_master_key(user_id: i32, current_master_key: String, new_master_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.change_master_key(user_id, &current_master_key, &new_master_key)
}

#[tauri::command]
pub fn verify_master_key(user_id: i32, master_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.verify_master_key(user_id, &master_key)
}

#[tauri::command]
pub fn change_access_key(user_id: i32, master_key: String, new_access_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.change_access_key(user_id, &master_key, &new_access_key)
}

#[tauri::command]
pub fn recover_access_key(user_id: i32, master_key: String, new_access_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.verify_master_key(user_id, &master_key)?;
    state.change_access_key(user_id, &master_key, &new_access_key)
}