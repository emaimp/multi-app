pub mod auth;
pub mod collections;
pub mod login_keys;
pub mod notes;
pub mod vaults;

use crate::auth::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Database::new().expect("Failed to initialize database");
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(db)
        .invoke_handler(tauri::generate_handler![
            auth::login,
            auth::register,
            auth::init_session,
            auth::logout,
            auth::recover_password,
            auth::change_password,
            auth::get_user_avatar,
            auth::update_avatar,
            auth::delete_user,
            vaults::get_vaults,
            vaults::get_vault,
            vaults::create_vault,
            vaults::update_vault,
            vaults::update_vault_position,
            vaults::delete_vault,
            notes::get_notes_decrypted,
            notes::get_note_with_content,
            notes::create_note,
            notes::update_note,
            notes::update_note_position,
            notes::delete_note,
            login_keys::get_login_keys_decrypted,
            login_keys::get_login_key_with_content,
            login_keys::create_login_key,
            login_keys::update_login_key,
            login_keys::update_login_key_position,
            login_keys::delete_login_key,
            collections::get_collections,
            collections::create_collection,
            collections::update_collection,
            collections::add_vault_to_collection,
            collections::remove_vault_from_collection,
            collections::delete_collection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
