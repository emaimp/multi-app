// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod auth;
mod crypto;
mod db;
mod models;

use auth::Database;
use models::{UserResponse, Vault, Note};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn login(username: String, password: String, state: tauri::State<Database>) -> Result<UserResponse, String> {
    let user = state.login(&username, &password)?;
    Ok(user.into())
}

#[tauri::command]
fn register(username: String, password: String, master_key: String, state: tauri::State<Database>) -> Result<UserResponse, String> {
    let user = state.register(&username, &password, &master_key)?;
    Ok(user.into())
}

#[tauri::command]
fn init_session(user_id: i32, master_key: String, state: tauri::State<Database>) -> Result<(), String> {
    state.init_session(user_id, &master_key)
}

#[tauri::command]
fn logout(user_id: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.clear_session(user_id);
    Ok(())
}

#[tauri::command]
fn recover_password(username: String, master_key: String, new_password: String, state: tauri::State<Database>) -> Result<(), String> {
    state.recover_password(&username, &master_key, &new_password)
}

#[tauri::command]
fn update_avatar(user_id: i32, avatar: Vec<u8>, state: tauri::State<Database>) -> Result<(), String> {
    state.update_avatar(user_id, &avatar)
}

// Vault commands
#[tauri::command]
fn get_vaults(user_id: i32, state: tauri::State<Database>) -> Result<Vec<Vault>, String> {
    state.get_vaults(user_id)
}

#[tauri::command]
fn create_vault(user_id: i32, name: String, color: String, state: tauri::State<Database>) -> Result<Vault, String> {
    state.create_vault(user_id, &name, &color)
}

#[tauri::command]
fn update_vault(vault: String, name: String, color: String, state: tauri::State<Database>) -> Result<(), String> {
    let vault_model: Vault = serde_json::from_str(&vault).map_err(|e| e.to_string())?;
    let updated_vault = Vault {
        name,
        color,
        ..vault_model
    };
    state.update_vault(&updated_vault)
}

#[tauri::command]
fn delete_vault(vault_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_vault(&vault_id)
}

#[tauri::command]
fn get_vault(vault_id: String, state: tauri::State<Database>) -> Result<Option<Vault>, String> {
    state.get_vault(&vault_id)
}

// Note commands
#[tauri::command]
fn get_notes_decrypted(vault_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Vec<Note>, String> {
    state.get_notes_decrypted(&vault_id, user_id)
}

#[tauri::command]
fn create_note(vault_id: String, title: String, content: String, user_id: i32, state: tauri::State<Database>) -> Result<Note, String> {
    state.create_note(&vault_id, &title, &content, user_id)
}

#[tauri::command]
fn update_note(note_id: String, title: String, content: String, user_id: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.update_note(&note_id, &title, &content, user_id)
}

#[tauri::command]
fn delete_note(note_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_note(&note_id)
}

#[tauri::command]
fn get_note_with_content(note_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Option<Note>, String> {
    state.get_note_with_content(&note_id, user_id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Database::new().expect("Failed to initialize database");
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(db)
        .invoke_handler(tauri::generate_handler![
            greet,
            login,
            register,
            recover_password,
            update_avatar,
            init_session,
            logout,
            get_vaults,
            create_vault,
            update_vault,
            delete_vault,
            get_vault,
            get_notes_decrypted,
            create_note,
            update_note,
            delete_note,
            get_note_with_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
