use crate::auth::Database;
use crate::models::CreditCard;

#[tauri::command]
pub fn get_credit_cards_decrypted(vault_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Vec<CreditCard>, String> {
    state.get_credit_cards_decrypted(&vault_id, user_id)
}

#[tauri::command]
pub fn get_credit_card_with_content(card_id: String, user_id: i32, state: tauri::State<Database>) -> Result<Option<CreditCard>, String> {
    state.get_credit_card_with_content(&card_id, user_id)
}

#[tauri::command]
pub fn create_credit_card(
    vault_id: String,
    card_name: String,
    holder_name: String,
    card_number: String,
    expiry: String,
    cvv: String,
    color: String,
    image: Option<Vec<u8>>,
    user_id: i32,
    state: tauri::State<Database>,
) -> Result<CreditCard, String> {
    state.create_credit_card(&vault_id, &card_name, &holder_name, &card_number, &expiry, &cvv, &color, image.as_deref(), user_id)
}

#[tauri::command]
pub fn update_credit_card(
    card_id: String,
    card_name: String,
    holder_name: String,
    card_number: String,
    expiry: String,
    cvv: String,
    color: String,
    image: Option<Vec<u8>>,
    user_id: i32,
    state: tauri::State<Database>,
) -> Result<(), String> {
    state.update_credit_card(&card_id, &card_name, &holder_name, &card_number, &expiry, &cvv, &color, image.as_deref(), user_id)
}

#[tauri::command]
pub fn update_credit_card_position(card_id: String, new_position: i32, state: tauri::State<Database>) -> Result<(), String> {
    state.update_credit_card_position(&card_id, new_position)
}

#[tauri::command]
pub fn delete_credit_card(card_id: String, state: tauri::State<Database>) -> Result<(), String> {
    state.delete_credit_card(&card_id)
}