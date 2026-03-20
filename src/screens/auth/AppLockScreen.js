import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {PinInput} from '@components/common';
import {showToast} from '@components/common/Toast';
import {useAppLock} from '@hooks/useAppLock';
import {useHaptic} from '@hooks/useHaptic';
import {MAX_PIN_ATTEMPTS, PIN_LOCKOUT_SECONDS} from '@utils/constants';

const AppLockScreen = () => {
  const {theme} = useTheme();
  const {checkPin, unlockApp, logout} = useAuth();
  const {isBiometricEnabled, verifyBiometric} = useAppLock();
  const {success: hapticSuccess, error: hapticError} = useHaptic();
  const [pinError, setPinError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const isLocked = lockedUntil && new Date() < lockedUntil;

  // Try biometric on mount
  useEffect(() => {
    if (isBiometricEnabled) {
      tryBiometric();
    }
  }, [isBiometricEnabled]);

  // Countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - new Date()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setCountdown(0);
        setAttempts(0);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  const tryBiometric = useCallback(async () => {
    const success = await verifyBiometric();
    if (success) {
      hapticSuccess();
      unlockApp();
    }
  }, [verifyBiometric, hapticSuccess, unlockApp]);

  const handlePinComplete = async pin => {
    if (isLocked) return;

    const valid = await checkPin(pin);
    if (valid) {
      hapticSuccess();
      unlockApp();
    } else {
      hapticError();
      setPinError(true);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        const lockTime = new Date();
        lockTime.setSeconds(lockTime.getSeconds() + PIN_LOCKOUT_SECONDS);
        setLockedUntil(lockTime);
        setCountdown(PIN_LOCKOUT_SECONDS);
        showToast(
          'error',
          'Too Many Attempts',
          `Please wait ${PIN_LOCKOUT_SECONDS} seconds.`,
        );
      } else {
        showToast(
          'error',
          'Incorrect PIN',
          `${MAX_PIN_ATTEMPTS - newAttempts} attempts remaining`,
        );
      }
    }
  };

  const handleForgotPin = () => {
    logout();
    showToast('info', 'Logged Out', 'Please sign in again to reset your PIN.');
  };

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.content}>
        <Text style={[styles.appName, {color: theme.colors.primary}]}>
          IntimateConnect
        </Text>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Enter your PIN to unlock
        </Text>

        {isLocked ? (
          <View style={styles.lockedContainer}>
            <Text style={[styles.lockedText, {color: theme.colors.error}]}>
              Too many attempts
            </Text>
            <Text style={[styles.countdownText, {color: theme.colors.textSecondary}]}>
              Try again in {countdown}s
            </Text>
          </View>
        ) : (
          <View style={styles.pinContainer}>
            <PinInput
              onComplete={handlePinComplete}
              error={pinError}
              onReset={() => setPinError(false)}
              autoFocus={!isBiometricEnabled}
            />
          </View>
        )}

        {isBiometricEnabled && !isLocked && (
          <TouchableOpacity
            onPress={tryBiometric}
            style={styles.biometricButton}
            accessibilityLabel="Unlock with biometrics"
            accessibilityRole="button">
            <Text style={[styles.biometricText, {color: theme.colors.primary}]}>
              Use Biometric
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleForgotPin}
          style={styles.forgotButton}
          accessibilityLabel="Forgot PIN, sign in again"
          accessibilityRole="link">
          <Text style={[styles.forgotText, {color: theme.colors.textSecondary}]}>
            Forgot PIN? Sign in again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 48,
  },
  pinContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  lockedContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  lockedText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 24,
    fontWeight: '700',
  },
  biometricButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
  },
  forgotButton: {
    marginTop: 24,
  },
  forgotText: {
    fontSize: 14,
  },
});

export default AppLockScreen;
