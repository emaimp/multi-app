use rusqlite::Connection;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use std::sync::Mutex;
use dirs;
use base64::{Engine as _, engine::general_purpose::STANDARD};
use crate::models::User;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new() -> Result<Self, rusqlite::Error> {
        let data_dir = dirs::data_dir().unwrap().join("multi-app");
        std::fs::create_dir_all(&data_dir).unwrap();
        let db_path = data_dir.join("users.db");
        let conn = Connection::open(db_path)?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                master_key_hash TEXT NOT NULL,
                avatar BLOB
            )",
            [],
        )?;
        Ok(Database {
            conn: Mutex::new(conn),
        })
    }

    pub fn login(&self, username: &str, password: &str) -> Result<User, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, username, password_hash, master_key_hash, avatar FROM users WHERE username = ?").map_err(|e| e.to_string())?;
        let user = stmt.query_row([username], |row| {
            let avatar_bytes: Option<Vec<u8>> = row.get(4)?;
            let avatar_base64 = avatar_bytes.map(|bytes| STANDARD.encode(&bytes));
            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: row.get(2)?,
                master_key_hash: row.get(3)?,
                avatar: avatar_base64,
            })
        }).map_err(|_| "User not found".to_string())?;

        let parsed_hash = PasswordHash::new(&user.password_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(password.as_bytes(), &parsed_hash).map_err(|_| "Invalid password".to_string())?;
        Ok(user)
    }

    pub fn register(&self, username: &str, password: &str, master_key: &str) -> Result<User, String> {
        let conn = self.conn.lock().unwrap();
        let count: i32 = conn.query_row("SELECT COUNT(*) FROM users WHERE username = ?", [username], |row| row.get(0)).unwrap_or(0);
        if count > 0 {
            return Err("User already exists".to_string());
        }
        let salt = SaltString::generate(&mut rand::thread_rng());
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password.as_bytes(), &salt).map_err(|e| e.to_string())?.to_string();
        let master_salt = SaltString::generate(&mut rand::thread_rng());
        let master_key_hash = argon2.hash_password(master_key.as_bytes(), &master_salt).map_err(|e| e.to_string())?.to_string();
        conn.execute("INSERT INTO users (username, password_hash, master_key_hash) VALUES (?, ?, ?)", [username, &password_hash, &master_key_hash]).map_err(|e| e.to_string())?;
        let id = conn.last_insert_rowid() as i32;
        Ok(User { id, username: username.to_string(), password_hash, master_key_hash, avatar: None })
    }

    pub fn recover_password(&self, username: &str, master_key: &str, new_password: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        // Get user and verify master key
        let mut stmt = conn.prepare("SELECT id, username, master_key_hash FROM users WHERE username = ?").map_err(|e| e.to_string())?;
        let (id, _, stored_master_hash): (i32, String, String) = stmt.query_row([username], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        }).map_err(|_| "User not found".to_string())?;

        let parsed_hash = PasswordHash::new(&stored_master_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(master_key.as_bytes(), &parsed_hash).map_err(|_| "Invalid master key".to_string())?;

        // Hash new password
        let salt = SaltString::generate(&mut rand::thread_rng());
        let new_password_hash = Argon2::default().hash_password(new_password.as_bytes(), &salt).map_err(|e| e.to_string())?.to_string();

        // Update password
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", [&new_password_hash, &id.to_string()]).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn update_avatar(&self, user_id: i32, avatar: &[u8]) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let avatar_vec = avatar.to_vec();
        conn.execute(
            "UPDATE users SET avatar = ? WHERE id = ?",
            rusqlite::params![avatar_vec, user_id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }
}