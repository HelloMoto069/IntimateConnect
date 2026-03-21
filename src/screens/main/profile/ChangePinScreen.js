import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, SafeAreaView, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import {PinInput} from '@components/common';
import {showToast} from '@components/common/Toast';
import {SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const STEPS = {
  VERIFY: 1,
  NEW: 2,
  CONFIRM: 3,
};

const STEP_TITLES = {
  [STEPS.VERIFY]: 'Enter Current PIN',
  [STEPS.NEW]: 'Enter New PIN',
  [STEPS.CONFIRM]: 'Confirm New PIN',
};

const ChangePinScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const {checkPin, setPin} = useAuth();
  const {success: hapticSuccess, error: hapticError} = useHaptic();

  const [step, setStep] = useState(STEPS.VERIFY);
  const [newPin, setNewPin] = useState(null);
  const [error, setError] = useState(false);

  const handlePinComplete = useCallback(
    async pin => {
      setError(false);

      if (step === STEPS.VERIFY) {
        const valid = await checkPin(pin);
        if (valid) {
          hapticSuccess();
          setStep(STEPS.NEW);
        } else {
          hapticError();
          setError(true);
          showToast('error', 'Incorrect PIN', 'Please try again');
        }
      } else if (step === STEPS.NEW) {
        hapticSuccess();
        setNewPin(pin);
        setStep(STEPS.CONFIRM);
      } else if (step === STEPS.CONFIRM) {
        if (pin === newPin) {
          await setPin(pin);
          hapticSuccess();
          showToast('success', 'PIN Changed', 'Your PIN has been updated');
          navigation.goBack();
        } else {
          hapticError();
          setError(true);
          setStep(STEPS.NEW);
          setNewPin(null);
          showToast('error', 'PINs Don\'t Match', 'Please try again');
        }
      }
    },
    [step, newPin, checkPin, setPin, hapticSuccess, hapticError, navigation],
  );

  // Step indicator dots
  const dots = [STEPS.VERIFY, STEPS.NEW, STEPS.CONFIRM];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Step dots */}
        <View style={styles.dots}>
          {dots.map(s => (
            <View
              key={s}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    s <= step ? theme.colors.primary : theme.colors.surfaceLight,
                },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.stepTitle, {color: theme.colors.text}]}>
          {STEP_TITLES[step]}
        </Text>

        <View style={styles.pinContainer}>
          <PinInput
            onComplete={handlePinComplete}
            error={error}
            onReset={() => setError(false)}
            autoFocus
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {paddingHorizontal: SPACING.lg, paddingTop: SPACING.md},
  backBtn: {paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(15), fontWeight: '600'},
  content: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl},
  dots: {flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl},
  dot: {width: 10, height: 10, borderRadius: 5},
  stepTitle: {...TYPOGRAPHY.h2, marginBottom: SPACING.xxl, textAlign: 'center'},
  pinContainer: {width: '100%', alignItems: 'center'},
});

export default ChangePinScreen;
