import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY, GRADIENTS} from '@utils/constants';
import {wp, hp, normalize} from '@utils/helpers';

const DiceRoller = ({
  actionResult,
  bodyPartResult,
  onRoll,
  timerDuration,
  onTimerEnd,
}) => {
  const {theme, isDark} = useTheme();
  const diceRotation1 = useSharedValue(0);
  const diceRotation2 = useSharedValue(0);
  const diceScale = useSharedValue(1);
  const [isRolling, setIsRolling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);

    // Shake animation
    diceScale.value = withSequence(
      withSpring(0.8, {damping: 5, stiffness: 300}),
      withSpring(1.1, {damping: 5, stiffness: 300}),
      withSpring(1, {damping: 10, stiffness: 200}),
    );

    diceRotation1.value = withSequence(
      withTiming(-15, {duration: 80}),
      withTiming(15, {duration: 80}),
      withTiming(-10, {duration: 80}),
      withTiming(10, {duration: 80}),
      withTiming(0, {duration: 80}),
    );

    diceRotation2.value = withSequence(
      withTiming(15, {duration: 80}),
      withTiming(-15, {duration: 80}),
      withTiming(10, {duration: 80}),
      withTiming(-10, {duration: 80}),
      withTiming(0, {duration: 80}),
    );

    setTimeout(() => {
      onRoll();
      setIsRolling(false);
      if (timerDuration && timerDuration > 0) {
        startTimer(timerDuration);
      }
    }, 500);
  };

  const startTimer = seconds => {
    setTimeLeft(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          onTimerEnd?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const dice1Style = useAnimatedStyle(() => ({
    transform: [
      {rotate: `${diceRotation1.value}deg`},
      {scale: diceScale.value},
    ],
  }));

  const dice2Style = useAnimatedStyle(() => ({
    transform: [
      {rotate: `${diceRotation2.value}deg`},
      {scale: diceScale.value},
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Dice Display */}
      <View style={styles.diceRow}>
        <Animated.View
          style={[
            styles.dice,
            {backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary},
            dice1Style,
          ]}>
          <Text style={styles.diceEmoji}>🎬</Text>
          <Text
            style={[styles.diceLabel, {color: theme.colors.textSecondary}]}>
            Action
          </Text>
          <Text style={[styles.diceResult, {color: theme.colors.text}]}>
            {actionResult?.text || '?'}
          </Text>
        </Animated.View>

        <Text style={[styles.plusSign, {color: theme.colors.textSecondary}]}>
          +
        </Text>

        <Animated.View
          style={[
            styles.dice,
            {backgroundColor: theme.colors.accent + '20', borderColor: theme.colors.accent},
            dice2Style,
          ]}>
          <Text style={styles.diceEmoji}>💫</Text>
          <Text
            style={[styles.diceLabel, {color: theme.colors.textSecondary}]}>
            Body Part
          </Text>
          <Text style={[styles.diceResult, {color: theme.colors.text}]}>
            {bodyPartResult?.text || '?'}
          </Text>
        </Animated.View>
      </View>

      {/* Combined Result */}
      {actionResult && bodyPartResult && (
        <View
          style={[
            styles.resultCard,
            {backgroundColor: theme.colors.surfaceLight},
          ]}>
          <Text style={[styles.resultText, {color: theme.colors.primary}]}>
            {actionResult.text} {bodyPartResult.text}
          </Text>
        </View>
      )}

      {/* Timer */}
      {timeLeft > 0 && (
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, {color: theme.colors.primary}]}>
            ⏱️ {timeLeft}s
          </Text>
        </View>
      )}

      {/* Roll Button */}
      <TouchableOpacity
        onPress={handleRoll}
        disabled={isRolling}
        style={[
          styles.rollBtn,
          {
            backgroundColor: isRolling
              ? theme.colors.textSecondary
              : theme.colors.primary,
          },
        ]}>
        <Text style={styles.rollText}>
          {isRolling ? 'Rolling...' : '🎲 Roll Dice'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  diceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  dice: {
    width: wp(35),
    height: wp(35),
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  diceEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  diceLabel: {
    fontSize: normalize(11),
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  diceResult: {
    ...TYPOGRAPHY.h3,
    textAlign: 'center',
  },
  plusSign: {
    fontSize: 28,
    fontWeight: '700',
    marginHorizontal: SPACING.md,
  },
  resultCard: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  resultText: {
    ...TYPOGRAPHY.h2,
    textAlign: 'center',
  },
  timerContainer: {
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: normalize(36),
    fontWeight: '800',
  },
  rollBtn: {
    paddingHorizontal: SPACING.xl + 8,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  rollText: {
    color: '#FFFFFF',
    ...TYPOGRAPHY.button,
    fontSize: normalize(18),
  },
});

export default DiceRoller;
