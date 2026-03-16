use crate::auth::Database;
use crate::models::Note;

#[tauri::command]
pub fn get_notes_decrypted(vault_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Vec<Note>, String> {
    state.get_notes_decrypted(&vault_id, user_id)
}

#[tauri::command]
pub fn get_note_with_content(note_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Option<Note>, String> {
    state.get_note_with_content(&note_id, user_id)
}

#[tauri::command]
pub fn create_note(vault_id: String, title: String, content: String, color: String, image: Option<Vec<u8>>, user_id: i32, state: tauri::State<Database>) -> Result<Note, String> {
    state.create_note(&vault_id, &title, &content, &color, image.as_deref(), user_id)
}

#[tauri::command]
pub fn update_note(note_id: String, title: String, content: String, color: String, image: Option<Vec<u8>>, user_id: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.update_note(&note_id, &title, &content, &color, image.as_deref(), user_id)
}

#[tauri::command]
pub fn update_note_position(note_id: String, new_position: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.update_note_position(&note_id, new_position)
}

#[tauri::command]
pub fn delete_note(note_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_note(&note_id)
}
