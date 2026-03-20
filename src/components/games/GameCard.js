import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {GAME_LEVELS, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {wp, normalize} from '@utils/helpers';

const LEVEL_COLORS = {
  mild: '#4CAF50',
  medium: '#FF9800',
  spicy: '#FF5722',
  extreme: '#F44336',
};

const GameCard = ({
  text,
  subtitle,
  level,
  type,
  onNext,
  onFavorite,
  isFavorite,
  cardKey,
  style,
}) => {
  const {theme} = useTheme();
  const flipProgress = useSharedValue(0);

  useEffect(() => {
    flipProgress.value = 0;
    flipProgress.value = withTiming(1, {duration: 400});
  }, [cardKey, flipProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 0.5, 1],
      [90, 45, 0],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      flipProgress.value,
      [0, 0.3, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{rotateY: `${rotateY}deg`}],
      opacity,
    };
  });

  const levelColor = LEVEL_COLORS[level] || theme.colors.primary;
  const levelLabel = GAME_LEVELS.find(l => l.id === level)?.label || level;

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: levelColor + '40',
          },
        ]}>
        {/* Level Badge */}
        <View style={styles.header}>
          <View style={[styles.levelBadge, {backgroundColor: levelColor + '20'}]}>
            <Text style={[styles.levelText, {color: levelColor}]}>
              {levelLabel}
            </Text>
          </View>
          {type && (
            <View
              style={[
                styles.typeBadge,
                {backgroundColor: theme.colors.surfaceLight},
              ]}>
              <Text style={[styles.typeText, {color: theme.colors.text}]}>
                {type === 'truth' ? 'Truth' : 'Dare'}
              </Text>
            </View>
          )}
          {onFavorite && (
            <TouchableOpacity onPress={onFavorite} style={styles.favoriteBtn}>
              <Text style={styles.favoriteIcon}>
                {isFavorite ? '🔖' : '📑'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Card Content */}
        <View style={styles.content}>
          <Text style={[styles.text, {color: theme.colors.text}]}>{text}</Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Accent line */}
        <View style={[styles.accentLine, {backgroundColor: levelColor}]} />

        {/* Next Button */}
        {onNext && (
          <TouchableOpacity
            onPress={onNext}
            style={[styles.nextBtn, {backgroundColor: levelColor + '15'}]}>
            <Text style={[styles.nextText, {color: levelColor}]}>
              Next Card →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: SPACING.md,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    minHeight: 280,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  levelBadge: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  levelText: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  typeText: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  favoriteBtn: {
    marginLeft: 'auto',
    padding: SPACING.xs,
  },
  favoriteIcon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  text: {
    ...TYPOGRAPHY.h2,
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  accentLine: {
    height: 3,
    borderRadius: 2,
    marginVertical: SPACING.md,
  },
  nextBtn: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
  },
  nextText: {
    fontSize: normalize(14),
    fontWeight: '600',
  },
});

export default GameCard;
