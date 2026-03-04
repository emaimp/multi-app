use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use rand::thread_rng;

use crate::models::User;
use super::database::Database;

impl Database {
    pub fn login(&self, username: &str, password: &str, master_key: &str) -> Result<User, String> {
        let (user_id, stored_username, password_hash, master_key_hash) = {
            let conn = self.conn.lock().unwrap();
            let mut stmt = conn.prepare("SELECT id, username, password_hash, master_key_hash FROM users WHERE username = ?").map_err(|e| e.to_string())?;
            let user_result: Result<(i32, String, String, String), _> = stmt.query_row([username], |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                ))
            });
            
            let result = user_result.map_err(|_| "User not found".to_string())?;

            let parsed_hash = PasswordHash::new(&result.2).map_err(|e| e.to_string())?;
            Argon2::default().verify_password(password.as_bytes(), &parsed_hash).map_err(|_| "Invalid password".to_string())?;

            let parsed_master_hash = PasswordHash::new(&result.3).map_err(|e| e.to_string())?;
            Argon2::default().verify_password(master_key.as_bytes(), &parsed_master_hash).map_err(|_| "Invalid master key".to_string())?;

            result
        };

        Ok(User {
            id: user_id,
            username: stored_username,
            password_hash,
            master_key_hash,
            avatar: None,
        })
    }

    pub fn register(&self, username: &str, password: &str, master_key: &str) -> Result<User, String> {
        let conn = self.conn.lock().unwrap();
        let count: i32 = conn.query_row("SELECT COUNT(*) FROM users WHERE username = ?", [username], |row| row.get(0)).unwrap_or(0);
        if count > 0 {
            return Err("User already exists".to_string());
        }
        
        let salt = SaltString::generate(&mut thread_rng());
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password.as_bytes(), &salt).map_err(|e| e.to_string())?.to_string();
        
        let master_salt = SaltString::generate(&mut thread_rng());
        let master_key_hash = argon2.hash_password(master_key.as_bytes(), &master_salt).map_err(|e| e.to_string())?.to_string();
        
        conn.execute("INSERT INTO users (username, password_hash, master_key_hash) VALUES (?, ?, ?)", [username, &password_hash, &master_key_hash]).map_err(|e| e.to_string())?;
        
        let id = conn.last_insert_rowid() as i32;
        Ok(User { id, username: username.to_string(), password_hash, master_key_hash, avatar: None })
    }

    pub fn recover_password(&self, username: &str, master_key: &str, new_password: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, username, master_key_hash FROM users WHERE username = ?").map_err(|e| e.to_string())?;
        let (id, _, stored_master_hash): (i32, String, String) = stmt.query_row([username], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        }).map_err(|_| "User not found".to_string())?;

        let parsed_hash = PasswordHash::new(&stored_master_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(master_key.as_bytes(), &parsed_hash).map_err(|_| "Invalid master key".to_string())?;

        let salt = SaltString::generate(&mut thread_rng());
        let new_password_hash = Argon2::default().hash_password(new_password.as_bytes(), &salt).map_err(|e| e.to_string())?.to_string();

        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", [&new_password_hash, &id.to_string()]).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn change_password(&self, user_id: i32, master_key: &str, new_password: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        
        let stored_master_hash: String = conn.query_row(
            "SELECT master_key_hash FROM users WHERE id = ?",
            [user_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;

        let parsed_hash = PasswordHash::new(&stored_master_hash).map_err(|e| e.to_string())?;
        Argon2::default().verify_password(master_key.as_bytes(), &parsed_hash).map_err(|_| "Invalid master key".to_string())?;

        let salt = SaltString::generate(&mut thread_rng());
        let new_password_hash = Argon2::default().hash_password(new_password.as_bytes(), &salt).map_err(|e| e.to_string())?.to_string();

        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [&new_password_hash, &user_id.to_string()]
        ).map_err(|e| e.to_string())?;

        Ok(())
    }
}
