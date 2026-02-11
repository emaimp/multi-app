use argon2::{Argon2, Params};
use aes_gcm::{Aes256Gcm, aead::{Aead, KeyInit}};
use generic_array::GenericArray;
use typenum::U32;
use rand::Rng;
use base64::{Engine as _, engine::general_purpose::STANDARD};
use std::fmt;

pub const KEY_LENGTH: usize = 32;
pub const NONCE_LENGTH: usize = 12;

#[derive(Debug)]
pub enum CryptoError {
    EncryptionFailed(String),
    DecryptionFailed(String),
    KeyDerivationFailed(String),
}

impl fmt::Display for CryptoError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CryptoError::EncryptionFailed(msg) => write!(f, "Encryption failed: {}", msg),
            CryptoError::DecryptionFailed(msg) => write!(f, "Decryption failed: {}", msg),
            CryptoError::KeyDerivationFailed(msg) => write!(f, "Key derivation failed: {}", msg),
        }
    }
}

impl std::error::Error for CryptoError {}

impl From<CryptoError> for String {
    fn from(e: CryptoError) -> Self {
        e.to_string()
    }
}

pub fn derive_encryption_key(master_key: &str, salt: &[u8]) -> Result<GenericArray<u8, U32>, CryptoError> {
    let mut key = GenericArray::<u8, U32>::clone_from_slice(&[0u8; 32]);
    let argon2 = Argon2::new(
        argon2::Algorithm::Argon2id,
        argon2::Version::V0x13,
        Params::new(65536, 3, 1, Some(KEY_LENGTH)).map_err(|e| CryptoError::KeyDerivationFailed(e.to_string()))?,
    );
    
    argon2.hash_password_into(
        master_key.as_bytes(),
        salt,
        &mut key,
    ).map_err(|e| CryptoError::KeyDerivationFailed(e.to_string()))?;
    
    Ok(key)
}

pub fn generate_nonce() -> [u8; NONCE_LENGTH] {
    let mut nonce = [0u8; NONCE_LENGTH];
    rand::thread_rng().fill(&mut nonce);
    nonce
}

pub fn encrypt(content: &str, key: &GenericArray<u8, U32>, nonce: &[u8; NONCE_LENGTH]) -> Result<Vec<u8>, CryptoError> {
    let cipher = Aes256Gcm::new(key);
    let ciphertext = cipher.encrypt(
        aes_gcm::Nonce::from_slice(nonce),
        content.as_bytes()
    ).map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;
    Ok(ciphertext)
}

pub fn decrypt(encrypted: &[u8], key: &GenericArray<u8, U32>, nonce: &[u8; NONCE_LENGTH]) -> Result<String, CryptoError> {
    let cipher = Aes256Gcm::new(key);
    let plaintext = cipher.decrypt(
        aes_gcm::Nonce::from_slice(nonce),
        encrypted
    ).map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;
    Ok(String::from_utf8(plaintext).map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?)
}

pub fn encrypt_to_base64(content: &str, key: &GenericArray<u8, U32>) -> Result<(String, String), CryptoError> {
    let nonce = generate_nonce();
    let encrypted = encrypt(content, key, &nonce)?;
    let encrypted_b64 = STANDARD.encode(&encrypted);
    let nonce_b64 = STANDARD.encode(&nonce);
    Ok((encrypted_b64, nonce_b64))
}

pub fn decrypt_from_base64(encrypted_b64: &str, nonce_b64: &str, key: &GenericArray<u8, U32>) -> Result<String, CryptoError> {
    let encrypted = STANDARD.decode(encrypted_b64).map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;
    let nonce_bytes = STANDARD.decode(nonce_b64).map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;
    
    if nonce_bytes.len() != NONCE_LENGTH {
        return Err(CryptoError::DecryptionFailed("Invalid nonce length".to_string()));
    }
    
    let mut nonce = [0u8; NONCE_LENGTH];
    nonce.copy_from_slice(&nonce_bytes[..NONCE_LENGTH]);
    
    decrypt(&encrypted, key, &nonce)
}
