import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';

const AnimatedToggle = ({value, onToggle, label, size = 'md'}) => {
  const {theme} = useTheme();
  const {selection} = useHaptic();
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {damping: 15, stiffness: 200});
  }, [value]);

  const sizes = {
    sm: {trackW: 40, trackH: 24, thumbSize: 18, offset: 3},
    md: {trackW: 50, trackH: 30, thumbSize: 24, offset: 3},
    lg: {trackW: 60, trackH: 36, thumbSize: 28, offset: 4},
  };

  const {trackW, trackH, thumbSize, offset} = sizes[size] || sizes.md;

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.surfaceLight, theme.colors.primary],
    );
    return {backgroundColor};
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(
            progress.value * (trackW - thumbSize - offset * 2),
            {damping: 15, stiffness: 200},
          ),
        },
      ],
    };
  });

  const handleToggle = () => {
    selection();
    onToggle?.(!value);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggle}
      activeOpacity={0.8}
      accessibilityRole="switch"
      accessibilityState={{checked: value}}
      accessibilityLabel={label || 'Toggle'}>
      {label && (
        <Text style={[styles.label, {color: theme.colors.text}]}>{label}</Text>
      )}
      <Animated.View
        style={[
          styles.track,
          {width: trackW, height: trackH, borderRadius: trackH / 2},
          trackStyle,
        ]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              top: offset,
              left: offset,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  track: {
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default AnimatedToggle;
