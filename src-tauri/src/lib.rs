// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod auth;
mod models;

use auth::Database;
use models::User;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn login(username: String, password: String, state: tauri::State<Database>) -> Result<User, String> {
    state.login(&username, &password)
}

#[tauri::command]
fn register(username: String, password: String, master_key: String, state: tauri::State<Database>) -> Result<User, String> {
    state.register(&username, &password, &master_key)
}

#[tauri::command]
fn recover_password(username: String, master_key: String, new_password: String, state: tauri::State<Database>) -> Result<(), String> {
    state.recover_password(&username, &master_key, &new_password)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Database::new().expect("Failed to initialize database");
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(db)
        .invoke_handler(tauri::generate_handler![greet, login, register, recover_password])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
