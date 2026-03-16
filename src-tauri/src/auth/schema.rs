use rusqlite::Connection;

pub fn create_tables(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            master_key_hash TEXT NOT NULL,
            avatar BLOB,
            avatar_nonce TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS vaults (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name_encrypted TEXT NOT NULL,
            name_nonce TEXT NOT NULL,
            color TEXT NOT NULL,
            image BLOB,
            image_nonce TEXT,
            created_at INTEGER NOT NULL,
            position INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            vault_id TEXT NOT NULL,
            title_encrypted TEXT NOT NULL,
            content_encrypted TEXT NOT NULL,
            title_nonce TEXT NOT NULL,
            content_nonce TEXT NOT NULL,
            color TEXT NOT NULL,
            image BLOB,
            image_nonce TEXT,
            created_at INTEGER NOT NULL,
            position INTEGER DEFAULT 0,
            FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS collections (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name_encrypted TEXT NOT NULL,
            name_nonce TEXT NOT NULL,
            vault_ids TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            position INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        [],
    )?;

    Ok(())
}
