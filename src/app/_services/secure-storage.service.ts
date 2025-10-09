import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly ENCRYPTION_KEY = 'bc-flats-secure-key-2024';
  private readonly STORAGE_PREFIX = 'bc_secure_';

  constructor() {}

  /**
   * Encrypt sensitive data before storing
   */
  private encrypt(data: string): string {
    try {
      // Simple XOR encryption for demonstration
      // In production, use a proper encryption library like crypto-js
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(
          data.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        );
      }
      return btoa(encrypted); // Base64 encode
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }

  /**
   * Decrypt sensitive data after retrieving
   */
  private decrypt(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData); // Base64 decode
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(
          decoded.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        );
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData;
    }
  }

  /**
   * Store sensitive data securely
   */
  setSecureItem(key: string, value: any): void {
    try {
      const encryptedValue = this.encrypt(JSON.stringify(value));
      sessionStorage.setItem(this.STORAGE_PREFIX + key, encryptedValue);
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  /**
   * Retrieve sensitive data securely
   */
  getSecureItem(key: string): any {
    try {
      const encryptedValue = sessionStorage.getItem(this.STORAGE_PREFIX + key);
      if (!encryptedValue) return null;
      
      const decryptedValue = this.decrypt(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  /**
   * Remove sensitive data
   */
  removeSecureItem(key: string): void {
    sessionStorage.removeItem(this.STORAGE_PREFIX + key);
  }

  /**
   * Store non-sensitive data normally
   */
  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to store item:', error);
    }
  }

  /**
   * Retrieve non-sensitive data
   */
  getItem(key: string): any {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  }

  /**
   * Remove non-sensitive data
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all secure storage
   */
  clearSecureStorage(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  /**
   * Clear all storage
   */
  clearAllStorage(): void {
    this.clearSecureStorage();
    localStorage.clear();
  }

  /**
   * Obfuscate sensitive data for debugging (shows only first/last few characters)
   */
  obfuscateSensitiveData(data: any): any {
    if (!data) return data;
    
    const obfuscated = { ...data };
    
    // Obfuscate sensitive fields
    const sensitiveFields = ['jwtToken', 'refreshToken', 'password', 'token'];
    
    sensitiveFields.forEach(field => {
      if (obfuscated[field]) {
        const value = obfuscated[field].toString();
        if (value.length > 8) {
          obfuscated[field] = value.substring(0, 4) + '***' + value.substring(value.length - 4);
        } else {
          obfuscated[field] = '***';
        }
      }
    });
    
    return obfuscated;
  }
}

