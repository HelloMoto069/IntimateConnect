import {useState, useEffect, useCallback} from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import {STORAGE_KEYS, DISGUISE_CONFIG} from '@utils/constants';
import {fastStore} from '@utils/encryptionUtils';

const rnBiometrics = new ReactNativeBiometrics();

export const useAppLock = () => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(
    () => fastStore.getBoolean(STORAGE_KEYS.BIOMETRIC_ENABLED),
  );

  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const {available, biometryType} =
          await rnBiometrics.isSensorAvailable();
        setIsBiometricAvailable(available);
        setBiometricType(biometryType || null);
      } catch {
        setIsBiometricAvailable(false);
      }
    };
    checkBiometric();
  }, []);

  const enableBiometric = useCallback(async () => {
    try {
      const {publicKey} = await rnBiometrics.createKeys();
      if (publicKey) {
        fastStore.setBoolean(STORAGE_KEYS.BIOMETRIC_ENABLED, true);
        setIsBiometricEnabled(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const disableBiometric = useCallback(async () => {
    try {
      await rnBiometrics.deleteKeys();
      fastStore.setBoolean(STORAGE_KEYS.BIOMETRIC_ENABLED, false);
      setIsBiometricEnabled(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  const verifyBiometric = useCallback(async () => {
    try {
      const isDisguised = fastStore.getBoolean(STORAGE_KEYS.DISGUISE_MODE);
      const promptMessage = isDisguised
        ? `Unlock ${DISGUISE_CONFIG.appName}`
        : 'Unlock IntimateConnect';

      const {success} = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Use PIN',
      });
      return success;
    } catch {
      return false;
    }
  }, []);

  return {
    isBiometricAvailable,
    biometricType,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
    verifyBiometric,
  };
};
