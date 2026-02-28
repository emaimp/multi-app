use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub password_hash: String,
    pub master_key_hash: String,
    pub avatar: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserResponse {
    pub id: i32,
    pub username: String,
    pub avatar: Option<String>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        UserResponse {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Vault {
    pub id: String,
    pub user_id: i32,
    pub name: String,
    pub color: String,
    pub image: Option<String>,
    pub created_at: i64,
    pub position: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Note {
    pub id: String,
    pub vault_id: String,
    pub title: String,
    pub content: String,
    pub created_at: i64,
    pub position: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Collection {
    pub id: String,
    pub user_id: i32,
    pub name: String,
    pub vault_ids: Vec<String>,
    pub position: i32,
    pub created_at: i64,
}
