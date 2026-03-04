mod auth;
mod commands;
mod crypto;
mod db;
mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    commands::run()
}
