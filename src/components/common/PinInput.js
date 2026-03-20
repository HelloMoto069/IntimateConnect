import React, {useState, useRef, useEffect} from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import {PIN_LENGTH} from '@utils/constants';

const PinInput = ({
  length = PIN_LENGTH,
  onComplete,
  error = false,
  onReset,
  autoFocus = true,
}) => {
  const {theme} = useTheme();
  const {light, error: hapticError} = useHaptic();
  const [pin, setPin] = useState('');
  const inputRef = useRef(null);
  const shakeX = useSharedValue(0);
  const dotScales = Array.from({length}, () => useSharedValue(0.8));

  useEffect(() => {
    if (error) {
      hapticError();
      // Shake animation
      shakeX.value = withSequence(
        withTiming(-10, {duration: 50}),
        withTiming(10, {duration: 50}),
        withTiming(-10, {duration: 50}),
        withTiming(10, {duration: 50}),
        withTiming(0, {duration: 50}),
      );
      // Reset after shake
      setTimeout(() => {
        setPin('');
        onReset?.();
      }, 300);
    }
  }, [error]);

  const handleChange = text => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, length);
    setPin(numericText);

    if (numericText.length > pin.length) {
      // New digit entered
      light();
      const idx = numericText.length - 1;
      if (idx < length) {
        dotScales[idx].value = withSpring(1.2, {damping: 10, stiffness: 300});
        setTimeout(() => {
          dotScales[idx].value = withSpring(1, {damping: 15, stiffness: 200});
        }, 100);
      }
    }

    if (numericText.length === length) {
      setTimeout(() => onComplete?.(numericText), 100);
    }
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shakeX.value}],
  }));

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.dotsContainer, shakeStyle]}
        onTouchEnd={focusInput}
        accessible
        accessibilityLabel="PIN input"
        accessibilityHint={`Enter your ${length}-digit PIN`}>
        {Array.from({length}, (_, i) => {
          const dotScale = dotScales[i];
          const animatedDotStyle = useAnimatedStyle(() => ({
            transform: [{scale: dotScale.value}],
          }));
          const isFilled = i < pin.length;
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  borderColor: isFilled
                    ? theme.colors.primary
                    : theme.colors.surfaceLight,
                  backgroundColor: isFilled
                    ? theme.colors.primary
                    : 'transparent',
                },
                animatedDotStyle,
              ]}
            />
          );
        })}
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={pin}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        style={styles.hiddenInput}
        caretHidden
        accessibilityElementsHidden
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
});

export default PinInput;
