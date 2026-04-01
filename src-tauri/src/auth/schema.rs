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
            title_nonce TEXT NOT NULL,
            content_encrypted TEXT NOT NULL,
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
        "CREATE TABLE IF NOT EXISTS login_keys (
            id TEXT PRIMARY KEY,
            vault_id TEXT NOT NULL,
            site_name_encrypted TEXT NOT NULL,
            site_name_nonce TEXT NOT NULL,
            url_encrypted TEXT,
            url_nonce TEXT,
            username_encrypted TEXT NOT NULL,
            username_nonce TEXT NOT NULL,
            password_encrypted TEXT NOT NULL,
            password_nonce TEXT NOT NULL,
            details_encrypted TEXT,
            details_nonce TEXT,
            color TEXT NOT NULL,
            image BLOB,
            image_nonce TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
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

    conn.execute(
        "CREATE TABLE IF NOT EXISTS id_cards (
            id TEXT PRIMARY KEY,
            vault_id TEXT NOT NULL,
            id_type_encrypted TEXT NOT NULL,
            id_type_nonce TEXT NOT NULL,
            full_name_encrypted TEXT NOT NULL,
            full_name_nonce TEXT NOT NULL,
            id_number_encrypted TEXT NOT NULL,
            id_number_nonce TEXT NOT NULL,
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
        "CREATE TABLE IF NOT EXISTS credit_cards (
            id TEXT PRIMARY KEY,
            vault_id TEXT NOT NULL,
            card_name_encrypted TEXT NOT NULL,
            card_name_nonce TEXT NOT NULL,
            holder_name_encrypted TEXT NOT NULL,
            holder_name_nonce TEXT NOT NULL,
            card_number_encrypted TEXT NOT NULL,
            card_number_nonce TEXT NOT NULL,
            expiry_encrypted TEXT NOT NULL,
            expiry_nonce TEXT NOT NULL,
            cvv_encrypted TEXT NOT NULL,
            cvv_nonce TEXT NOT NULL,
            color TEXT NOT NULL,
            image BLOB,
            image_nonce TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            position INTEGER DEFAULT 0,
            FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
        )",
        [],
    )?;

    Ok(())
}
