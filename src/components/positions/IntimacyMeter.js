import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';

const LEVEL_COLORS = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#E94560'];

const IntimacyMeter = ({
  level = 1,
  maxLevel = 5,
  label,
  showValue = true,
  style,
}) => {
  const {theme} = useTheme();
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming((level / maxLevel) * 100, {duration: 600});
  }, [level, maxLevel, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => {
    const colorIndex = Math.min(
      Math.floor((animatedWidth.value / 100) * LEVEL_COLORS.length),
      LEVEL_COLORS.length - 1,
    );
    return {
      width: `${animatedWidth.value}%`,
      backgroundColor: LEVEL_COLORS[Math.max(0, colorIndex)],
    };
  });

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={`${label || 'Intimacy'}: ${level} out of ${maxLevel}`}
      accessibilityRole="text">
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, {color: theme.colors.textSecondary}]}>
            {label}
          </Text>
          {showValue && (
            <Text style={[styles.value, {color: theme.colors.text}]}>
              {level}/{maxLevel}
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, {backgroundColor: theme.colors.surfaceLight}]}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default IntimacyMeter;
