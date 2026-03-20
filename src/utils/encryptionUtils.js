import {MMKV} from 'react-native-mmkv';
import EncryptedStorage from 'react-native-encrypted-storage';
import CryptoJS from 'crypto-js';

// MMKV instance for fast, non-sensitive data
const mmkv = new MMKV({id: 'intimate-connect-storage'});

// Fast store: MMKV for theme, flags, preferences
export const fastStore = {
  set: (key, value) => {
    try {
      if (typeof value === 'string') {
        mmkv.set(key, value);
      } else {
        mmkv.set(key, JSON.stringify(value));
      }
      return true;
    } catch {
      return false;
    }
  },

  get: key => {
    try {
      return mmkv.getString(key) || null;
    } catch {
      return null;
    }
  },

  getBoolean: key => {
    try {
      return mmkv.getBoolean(key) || false;
    } catch {
      return false;
    }
  },

  setBoolean: (key, value) => {
    try {
      mmkv.set(key, value);
      return true;
    } catch {
      return false;
    }
  },

  remove: key => {
    try {
      mmkv.delete(key);
      return true;
    } catch {
      return false;
    }
  },

  clearAll: () => {
    try {
      mmkv.clearAll();
      return true;
    } catch {
      return false;
    }
  },
};

// Secure store: EncryptedStorage for tokens, PIN, sensitive data
export const secureStore = {
  set: async (key, value) => {
    try {
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await EncryptedStorage.setItem(key, stringValue);
      return true;
    } catch {
      return false;
    }
  },

  get: async key => {
    try {
      const value = await EncryptedStorage.getItem(key);
      return value || null;
    } catch {
      return null;
    }
  },

  remove: async key => {
    try {
      await EncryptedStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clearAll: async () => {
    try {
      await EncryptedStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

// PIN hashing
export const hashPin = pin => {
  return CryptoJS.SHA256(pin).toString();
};

export const verifyPin = (inputPin, storedHash) => {
  return hashPin(inputPin) === storedHash;
};

// Data encryption for sensitive content (journal, messages, etc.)
export const encryptData = (data, key) => {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, key).toString();
  } catch {
    return null;
  }
};

export const decryptData = (ciphertext, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch {
    return null;
  }
};
