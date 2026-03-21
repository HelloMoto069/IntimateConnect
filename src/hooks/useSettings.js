import {useState, useCallback} from 'react';
import {Share, Alert} from 'react-native';
import {STORAGE_KEYS, DISGUISE_CONFIG} from '@utils/constants';
import {fastStore} from '@utils/encryptionUtils';
import {updateUserProfile, deleteAccount as firebaseDeleteAccount} from '@api/firebase/auth';
import {getDocument} from '@api/firebase/firestore';
import auth from '@react-native-firebase/auth';
import logger from '@utils/logger';

export const useSettings = () => {
  const currentUser = auth().currentUser;

  // ─── Disguise Mode ────────────────────────────────────
  const [disguiseMode, setDisguiseMode] = useState(
    () => fastStore.getBoolean(STORAGE_KEYS.DISGUISE_MODE) || false,
  );

  const toggleDisguiseMode = useCallback(() => {
    const newVal = !disguiseMode;
    setDisguiseMode(newVal);
    fastStore.setBoolean(STORAGE_KEYS.DISGUISE_MODE, newVal);

    // Sync to Firestore
    if (currentUser) {
      updateUserProfile({'preferences.disguiseMode': newVal}).catch(() => {});
    }
  }, [disguiseMode, currentUser]);

  const getAppName = useCallback(
    () => (disguiseMode ? DISGUISE_CONFIG.appName : 'IntimateConnect'),
    [disguiseMode],
  );

  const getAppSubtitle = useCallback(
    () =>
      disguiseMode
        ? DISGUISE_CONFIG.subtitle
        : 'Your private wellness companion',
    [disguiseMode],
  );

  // ─── Display Name ─────────────────────────────────────
  const updateDisplayName = useCallback(
    async name => {
      if (!currentUser || !name.trim()) return;
      await updateUserProfile({displayName: name.trim()});
    },
    [currentUser],
  );

  // ─── Data Export ──────────────────────────────────────
  const exportUserData = useCallback(async () => {
    if (!currentUser) return;

    try {
      // Collect user data from Firestore
      const profile = await getDocument('users', currentUser.uid);

      const exportData = {
        exportDate: new Date().toISOString(),
        profile: {
          displayName: profile?.displayName,
          email: profile?.email,
          createdAt: profile?.createdAt,
        },
        note: 'Journal content is encrypted and not included in export for privacy.',
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      await Share.share({
        message: jsonString,
        title: 'My Data Export',
      });
    } catch (error) {
      logger.error('Export data error:', error);
    }
  }, [currentUser]);

  // ─── Clear Cache ──────────────────────────────────────
  const clearLocalCache = useCallback(() => {
    // Save critical keys before clearing
    const ageVerified = fastStore.getBoolean(STORAGE_KEYS.AGE_VERIFIED);
    const onboardingComplete = fastStore.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE);
    const themeMode = fastStore.get(STORAGE_KEYS.THEME_MODE);
    const biometric = fastStore.getBoolean(STORAGE_KEYS.BIOMETRIC_ENABLED);
    const disguise = fastStore.getBoolean(STORAGE_KEYS.DISGUISE_MODE);

    fastStore.clearAll();

    // Restore critical keys
    if (ageVerified) fastStore.setBoolean(STORAGE_KEYS.AGE_VERIFIED, true);
    if (onboardingComplete) fastStore.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    if (themeMode) fastStore.set(STORAGE_KEYS.THEME_MODE, themeMode);
    if (biometric) fastStore.setBoolean(STORAGE_KEYS.BIOMETRIC_ENABLED, true);
    if (disguise) fastStore.setBoolean(STORAGE_KEYS.DISGUISE_MODE, true);
  }, []);

  // ─── Delete Account ───────────────────────────────────
  const requestDeleteAccount = useCallback(async () => {
    if (!currentUser) return;

    try {
      await firebaseDeleteAccount();
      fastStore.clearAll();
    } catch (error) {
      logger.error('Delete account error:', error);
      throw error;
    }
  }, [currentUser]);

  return {
    // Disguise mode
    disguiseMode,
    toggleDisguiseMode,
    getAppName,
    getAppSubtitle,

    // Account
    updateDisplayName,

    // Data
    exportUserData,
    clearLocalCache,
    requestDeleteAccount,
  };
};
