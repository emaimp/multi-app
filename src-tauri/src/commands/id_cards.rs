use crate::auth::Database;
use crate::models::IdCard;

#[tauri::command]
pub fn get_id_cards_decrypted(vault_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Vec<IdCard>, String> {
    state.get_id_cards_decrypted(&vault_id, user_id)
}

#[tauri::command]
pub fn get_id_card_with_content(card_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Option<IdCard>, String> {
    state.get_id_card_with_content(&card_id, user_id)
}

#[tauri::command]
pub fn create_id_card(
    vault_id: String,
    id_type: String,
    full_name: String,
    id_number: String,
    color: String,
    image: Option<Vec<u8>>,
    user_id: i32,
    state: tauri::State<Database>,
) -> Result<IdCard, String> {
    state.create_id_card(&vault_id, &id_type, &full_name, &id_number, &color, image.as_deref(), user_id)
}

#[tauri::command]
pub fn update_id_card(
    card_id: String,
    id_type: String,
    full_name: String,
    id_number: String,
    color: String,
    image: Option<Vec<u8>>,
    user_id: i32,
    state: tauri::State<Database>,
) -> Result<(), String> {
    state.update_id_card(&card_id, &id_type, &full_name, &id_number, &color, image.as_deref(), user_id)
}

#[tauri::command]
pub fn update_id_card_position(card_id: String, new_position: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.update_id_card_position(&card_id, new_position)
}

#[tauri::command]
pub fn delete_id_card(card_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_id_card(&card_id)
}
