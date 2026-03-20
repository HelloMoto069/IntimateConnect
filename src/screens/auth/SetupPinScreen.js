import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {PinInput, GradientButton} from '@components/common';
import {showToast} from '@components/common/Toast';
import {useAppLock} from '@hooks/useAppLock';
import {useHaptic} from '@hooks/useHaptic';
import {validatePin} from '@utils/validators';

const SetupPinScreen = () => {
  const {theme} = useTheme();
  const {setPin, unlockApp} = useAuth();
  const {isBiometricAvailable, biometricType, enableBiometric} = useAppLock();
  const {success: hapticSuccess} = useHaptic();
  const [step, setStep] = useState('create'); // 'create' | 'confirm' | 'biometric'
  const [firstPin, setFirstPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleFirstPin = pin => {
    const result = validatePin(pin);
    if (!result.valid) {
      showToast('error', 'Invalid PIN', result.error);
      setPinError(true);
      return;
    }
    setFirstPin(pin);
    setStep('confirm');
  };

  const handleConfirmPin = async pin => {
    if (pin !== firstPin) {
      showToast('error', 'Mismatch', 'PINs do not match. Try again.');
      setPinError(true);
      setStep('create');
      setFirstPin('');
      return;
    }

    await setPin(pin);
    hapticSuccess();

    if (isBiometricAvailable) {
      setStep('biometric');
    } else {
      unlockApp();
    }
  };

  const handleEnableBiometric = async () => {
    const result = await enableBiometric();
    if (result) {
      showToast('success', 'Enabled', 'Biometric unlock enabled');
    }
    unlockApp();
  };

  const handleSkipBiometric = () => {
    unlockApp();
  };

  if (step === 'biometric') {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.content}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            Enable Biometric Unlock?
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            Use{' '}
            {biometricType === 'FaceID'
              ? 'Face ID'
              : biometricType === 'TouchID'
              ? 'Touch ID'
              : 'fingerprint'}{' '}
            for quick access
          </Text>

          <View style={styles.biometricIcon}>
            <Text style={{fontSize: 64}}>
              {biometricType === 'FaceID' ? '🔒' : '👆'}
            </Text>
          </View>

          <GradientButton
            title="Enable"
            onPress={handleEnableBiometric}
            size="lg"
            style={styles.button}
          />
          <GradientButton
            title="Skip"
            onPress={handleSkipBiometric}
            variant="outline"
            size="md"
            style={styles.skipButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.content}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          {step === 'create' ? 'Set Your PIN' : 'Confirm Your PIN'}
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          {step === 'create'
            ? 'Choose a 4-digit PIN to secure your app'
            : 'Enter the same PIN again to confirm'}
        </Text>

        <View style={styles.pinContainer}>
          <PinInput
            key={step} // reset on step change
            onComplete={step === 'create' ? handleFirstPin : handleConfirmPin}
            error={pinError}
            onReset={() => setPinError(false)}
          />
        </View>
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  pinContainer: {
    width: '100%',
    alignItems: 'center',
  },
  biometricIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(233,69,96,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  skipButton: {
    width: '100%',
  },
});

export default SetupPinScreen;
