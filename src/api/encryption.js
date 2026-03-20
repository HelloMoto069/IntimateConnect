import CryptoJS from 'crypto-js';

export const encryptMessage = (text, key) => {
  try {
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch {
    return null;
  }
};

export const decryptMessage = (ciphertext, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export const generateCoupleKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString();
};
