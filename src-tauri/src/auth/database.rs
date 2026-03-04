use rusqlite::Connection;
use std::sync::Mutex;
use generic_array::GenericArray;
use typenum::U32;

use super::schema::create_tables;

pub struct Database {
    pub conn: Mutex<Connection>,
    pub encryption_keys: Mutex<std::collections::HashMap<i32, GenericArray<u8, U32>>>,
}

impl Database {
    pub fn new() -> Result<Self, rusqlite::Error> {
        let data_dir = dirs::data_dir().unwrap().join("multi-app");
        std::fs::create_dir_all(&data_dir).unwrap();
        let db_path = data_dir.join("users.db");
        let conn = Connection::open(db_path)?;
        
        create_tables(&conn)?;

        Ok(Database {
            conn: Mutex::new(conn),
            encryption_keys: Mutex::new(std::collections::HashMap::new()),
        })
    }
}
