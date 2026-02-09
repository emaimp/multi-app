use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub password_hash: String,
    pub master_key_hash: String,
    pub avatar: Option<String>,
}