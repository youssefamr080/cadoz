import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export interface EncryptedData {
  encryptedValue: string;  // Base64 encoded
  iv: string;             // Base64 encoded
  authTag: string;        // Base64 encoded
}

export function encryptField(text: string): EncryptedData {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  return {
    encryptedValue: encrypted,
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64')
  };
}

export function decryptField(encryptedData: EncryptedData): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(encryptedData.iv, 'base64')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));
  
  let decrypted = decipher.update(encryptedData.encryptedValue, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function hashSensitiveData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

// Helper to mask sensitive data for logging
export function maskSensitiveData(data: string): string {
  if (!data) return '';
  if (data.length <= 4) return '*'.repeat(data.length);
  return data.slice(0, 2) + '*'.repeat(data.length - 4) + data.slice(-2);
}
