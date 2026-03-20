import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';

const SkeletonLoader = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const {theme} = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, {duration: 1200}), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.surface, theme.colors.surfaceLight],
    );
    return {backgroundColor};
  });

  return (
    <Animated.View
      style={[{width, height, borderRadius}, animatedStyle, style]}
    />
  );
};

export default SkeletonLoader;
