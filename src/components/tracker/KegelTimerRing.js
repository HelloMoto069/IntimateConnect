import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {normalize} from '@utils/helpers';

const KegelTimerRing = ({progress, size = 200, color, label, sublabel}) => {
  const {theme} = useTheme();
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;

  // Simple ring via border trick — fill arc via rotating halves
  const angle = progress * 360;
  const halfSize = size / 2;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      {/* Background circle */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: halfSize,
            borderWidth: strokeWidth,
            borderColor: theme.colors.surfaceLight,
          },
        ]}
      />

      {/* Progress — right half */}
      <View style={[styles.halfClip, {width: halfSize, height: size, left: halfSize}]}>
        <View
          style={[
            styles.halfRing,
            {
              width: size,
              height: size,
              borderRadius: halfSize,
              borderWidth: strokeWidth,
              borderColor: color,
              left: -halfSize,
              transform: [{rotate: `${Math.min(angle, 180)}deg`}],
            },
          ]}
        />
      </View>

      {/* Progress — left half (only when > 180deg) */}
      {angle > 180 && (
        <View style={[styles.halfClip, {width: halfSize, height: size, left: 0}]}>
          <View
            style={[
              styles.halfRing,
              {
                width: size,
                height: size,
                borderRadius: halfSize,
                borderWidth: strokeWidth,
                borderColor: color,
                left: 0,
                transform: [{rotate: `${angle - 180}deg`}],
              },
            ]}
          />
        </View>
      )}

      {/* Center text */}
      <View style={[styles.center, {width: size, height: size}]}>
        <Text style={[styles.label, {color}]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.sublabel, {color: theme.colors.textSecondary}]}>
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  halfClip: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  halfRing: {
    position: 'absolute',
    top: 0,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: normalize(36),
    fontWeight: '800',
  },
  sublabel: {
    fontSize: normalize(14),
    fontWeight: '500',
    marginTop: 4,
  },
});

export default KegelTimerRing;
