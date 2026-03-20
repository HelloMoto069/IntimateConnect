import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {STORAGE_KEYS} from '@utils/constants';
import {fastStore, secureStore, hashPin, verifyPin} from '@utils/encryptionUtils';
import {
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signUpWithEmail as firebaseSignUp,
  signInWithEmail as firebaseSignIn,
  signOut as firebaseSignOut,
  getUserProfile,
  subscribeToUserProfile,
} from '@api/firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppLocked, setIsAppLocked] = useState(true);

  // Read persisted flags synchronously from MMKV
  const [isAgeVerified, setIsAgeVerified] = useState(
    () => fastStore.getBoolean(STORAGE_KEYS.AGE_VERIFIED),
  );
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(
    () => fastStore.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE),
  );
  const [isPinSet, setIsPinSet] = useState(false);

  // Check if PIN exists on mount
  useEffect(() => {
    const checkPin = async () => {
      const storedHash = await secureStore.get(STORAGE_KEYS.PIN_HASH);
      setIsPinSet(!!storedHash);
    };
    checkPin();
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = firebaseOnAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Subscribe to Firestore profile
        unsubscribeProfile = subscribeToUserProfile(
          firebaseUser.uid,
          profile => {
            setUserProfile(profile);
          },
        );
      } else {
        setUser(null);
        setUserProfile(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const verifyAge = useCallback(dateOfBirth => {
    fastStore.setBoolean(STORAGE_KEYS.AGE_VERIFIED, true);
    setIsAgeVerified(true);
  }, []);

  const completeOnboarding = useCallback(() => {
    fastStore.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    setIsOnboardingComplete(true);
  }, []);

  const signUp = useCallback(async (email, password, displayName) => {
    const firebaseUser = await firebaseSignUp(email, password, displayName);
    return firebaseUser;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const firebaseUser = await firebaseSignIn(email, password);
    return firebaseUser;
  }, []);

  const logout = useCallback(async () => {
    await firebaseSignOut();
    setIsAppLocked(true);
  }, []);

  const setPin = useCallback(async pin => {
    const hash = hashPin(pin);
    await secureStore.set(STORAGE_KEYS.PIN_HASH, hash);
    setIsPinSet(true);
  }, []);

  const checkPin = useCallback(async inputPin => {
    const storedHash = await secureStore.get(STORAGE_KEYS.PIN_HASH);
    if (!storedHash) return false;
    return verifyPin(inputPin, storedHash);
  }, []);

  const unlockApp = useCallback(() => {
    setIsAppLocked(false);
  }, []);

  const lockApp = useCallback(() => {
    setIsAppLocked(true);
  }, []);

  const isAuthenticated = !!user;

  const value = useMemo(
    () => ({
      user,
      userProfile,
      isLoading,
      isAuthenticated,
      isAgeVerified,
      isOnboardingComplete,
      isPinSet,
      isAppLocked,
      verifyAge,
      completeOnboarding,
      signUp,
      signIn,
      logout,
      setPin,
      checkPin,
      unlockApp,
      lockApp,
    }),
    [
      user,
      userProfile,
      isLoading,
      isAuthenticated,
      isAgeVerified,
      isOnboardingComplete,
      isPinSet,
      isAppLocked,
      verifyAge,
      completeOnboarding,
      signUp,
      signIn,
      logout,
      setPin,
      checkPin,
      unlockApp,
      lockApp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
