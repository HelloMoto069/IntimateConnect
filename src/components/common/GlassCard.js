import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {BORDER_RADIUS, SHADOWS} from '@utils/constants';

const GlassCard = ({
  children,
  style,
  onPress,
  animated = false,
  animationDelay = 0,
}) => {
  const {theme} = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface + 'B3', // 70% opacity
      borderColor: 'rgba(255,255,255,0.1)',
    },
    SHADOWS.medium,
    style,
  ];

  const content = onPress ? (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button">
      {children}
    </TouchableOpacity>
  ) : (
    <View style={cardStyle}>{children}</View>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeInDown.delay(animationDelay).duration(400)}>
        {content}
      </Animated.View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});

export default GlassCard;
