import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import {ANIMATION_CONFIG} from '@utils/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const GradientButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const {theme} = useTheme();
  const {light} = useHaptic();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, ANIMATION_CONFIG.springFast);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATION_CONFIG.springFast);
  };

  const handlePress = () => {
    if (disabled || loading) return;
    light();
    onPress?.();
  };

  const sizeStyles = {
    sm: {paddingVertical: 10, paddingHorizontal: 20, fontSize: 14},
    md: {paddingVertical: 14, paddingHorizontal: 28, fontSize: 16},
    lg: {paddingVertical: 18, paddingHorizontal: 36, fontSize: 18},
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;
  const gradientColors = theme.gradients[variant] || theme.gradients.primary;
  const isOutline = variant === 'outline';

  if (isOutline) {
    return (
      <AnimatedTouchable
        style={[animatedStyle, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{disabled: disabled || loading}}>
        <View
          style={[
            styles.outlineContainer,
            {
              borderColor: theme.colors.primary,
              paddingVertical: currentSize.paddingVertical,
              paddingHorizontal: currentSize.paddingHorizontal,
              opacity: disabled ? 0.5 : 1,
            },
          ]}>
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <View style={styles.content}>
              {icon && <View style={styles.icon}>{icon}</View>}
              <Text
                style={[
                  styles.text,
                  {color: theme.colors.primary, fontSize: currentSize.fontSize},
                  textStyle,
                ]}>
                {title}
              </Text>
            </View>
          )}
        </View>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{disabled: disabled || loading}}>
      <LinearGradient
        colors={disabled ? ['#555', '#444'] : gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[
          styles.gradient,
          {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
            opacity: disabled ? 0.5 : 1,
          },
        ]}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles.text,
                {fontSize: currentSize.fontSize},
                textStyle,
              ]}>
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineContainer: {
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default GradientButton;
