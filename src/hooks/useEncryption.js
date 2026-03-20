import {fastStore, secureStore, encryptData, decryptData} from '@utils/encryptionUtils';

export const useEncryption = () => {
  return {
    fastStore,
    secureStore,
    encryptData,
    decryptData,
  };
};
