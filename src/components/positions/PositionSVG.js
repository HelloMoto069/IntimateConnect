/**
 * PositionSVG.js
 * Composes two smooth HumanFigure silhouettes in an SVG viewBox.
 * Person A rendered first (behind), Person B on top (front).
 * Uses contrasting colors with slight opacity for depth.
 */

import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import Svg, {Defs, RadialGradient, Stop, Rect} from 'react-native-svg';
import {useTheme} from '@context/ThemeContext';
import {getPoseForPosition} from '@data/positionPoses';
import HumanFigure from './HumanFigure';

const SIZES = {
  small: {width: 80, height: 80},
  medium: {width: 160, height: 160},
  large: {width: 280, height: 220},
};

// Contrasting color pairs for better visual distinction
const getColors = (theme, colorA, colorB) => {
  if (colorA && colorB) return {a: colorA, b: colorB};
  const isDark = theme.dark !== false;
  return {
    a: isDark ? '#E94560' : '#D63031',   // warm red/coral
    b: isDark ? '#7C5CFC' : '#6C5CE7',   // cool purple/violet
  };
};

const PositionSVG = ({
  positionId,
  size = 'medium',
  colorA,
  colorB,
  style,
}) => {
  const {theme} = useTheme();
  const dimensions = SIZES[size] || SIZES.medium;
  const colors = useMemo(() => getColors(theme, colorA, colorB), [theme, colorA, colorB]);
  const pose = useMemo(() => getPoseForPosition(positionId), [positionId]);

  return (
    <View
      style={[
        {
          width: dimensions.width,
          height: dimensions.height,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <Svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 200">
        {/* Subtle radial glow behind figures */}
        <Defs>
          <RadialGradient id="bgGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.a} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={colors.a} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="200" height="200" fill="url(#bgGlow)" />

        {/* Person A (behind — slightly more transparent) */}
        <HumanFigure pose={pose.personA} color={colors.a} opacity={0.8} />
        {/* Person B (front — more opaque) */}
        <HumanFigure pose={pose.personB} color={colors.b} opacity={0.9} />
      </Svg>
    </View>
  );
};

export default memo(PositionSVG, (prev, next) => {
  return (
    prev.positionId === next.positionId &&
    prev.size === next.size &&
    prev.colorA === next.colorA &&
    prev.colorB === next.colorB
  );
});
