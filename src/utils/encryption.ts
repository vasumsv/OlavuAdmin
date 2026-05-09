// WARNING: This is a simple encoding utility for backward compatibility
// For production use, implement proper password hashing (bcrypt, argon2)
const ENCRYPTION_KEY = 'olavubooks-secret-key-2024';

// Simple base64 decode function
export const decodePassword = (encodedPassword: string): string => {
  try {
    return atob(encodedPassword);
  } catch (error) {
    return '';
  }
};

// Simple base64 encode function
export const encodePassword = (password: string): string => {
  try {
    return btoa(password);
  } catch (error) {
    return '';
  }
};

export const encryptPassword = (password: string): string => {
  let encrypted = '';
  for (let i = 0; i < password.length; i++) {
    const charCode = password.charCodeAt(i);
    const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    encrypted += String.fromCharCode(charCode ^ keyChar);
  }
  return btoa(encrypted); // Base64 encode
};

export const decryptPassword = (encryptedPassword: string): string => {
  try {
    // First try base64 decode directly (for simple encoding)
    try {
      const directDecode = atob(encryptedPassword);
      if (directDecode && directDecode.length > 0) {
        return directDecode;
      }
    } catch (e) {
      // Continue with XOR decryption
    }
    
    // Original XOR decryption method
    const encrypted = atob(encryptedPassword); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i);
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode ^ keyChar);
    }
    return decrypted;
  } catch (error) {
    return '';
  }
};