import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import {BORDER_RADIUS, SHADOWS, ANIMATION_CONFIG, SCREEN_NAMES} from '@utils/constants';
import DifficultyStars from './DifficultyStars';
import PositionSVG from './PositionSVG';

// Category colors for placeholder illustration area
const CATEGORY_COLORS = {
  beginner: '#4CAF50',
  intermediate: '#FF9800',
  advanced: '#F44336',
  romantic: '#E91E63',
  passionate: '#FF5722',
  standing: '#2196F3',
  sitting: '#9C27B0',
  'lying-down': '#3F51B5',
  'side-by-side': '#00BCD4',
  'face-to-face': '#E94560',
  'rear-entry': '#FF7043',
  flexibility: '#8BC34A',
  quickie: '#FFC107',
  tantric: '#7C4DFF',
  'pregnancy-safe': '#26A69A',
  kamasutra: '#FF6B35',
};

const PositionCard = ({
  position,
  mode = 'grid',
  isFavorite = false,
  onToggleFavorite,
  style,
}) => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const {light, selection} = useHaptic();
  const heartScale = useSharedValue(1);

  const primaryCategory = position.category?.[0] || 'beginner';
  const placeholderColor = CATEGORY_COLORS[primaryCategory] || theme.colors.primary;

  const handlePress = useCallback(() => {
    light();
    navigation.navigate(SCREEN_NAMES.POSITION_DETAIL, {positionId: position.id});
  }, [navigation, position.id, light]);

  const handleFavoritePress = useCallback(() => {
    selection();
    heartScale.value = withSpring(1.3, ANIMATION_CONFIG.springFast, () => {
      heartScale.value = withSpring(1, ANIMATION_CONFIG.springFast);
    });
    onToggleFavorite?.(position.id);
  }, [position.id, onToggleFavorite, selection, heartScale]);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: heartScale.value}],
  }));

  const isGrid = mode === 'grid';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isGrid ? styles.gridCard : styles.listCard,
        {
          backgroundColor: theme.colors.surface + 'B3',
          borderColor: 'rgba(255,255,255,0.1)',
        },
        SHADOWS.medium,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${position.name}, difficulty ${position.difficulty} out of 5`}>
      {/* Position illustration */}
      <View
        style={[
          isGrid ? styles.gridIllustration : styles.listIllustration,
          {backgroundColor: placeholderColor + '15'},
        ]}>
        <PositionSVG
          positionId={position.id}
          size={isGrid ? 'small' : 'medium'}
        />
      </View>

      <View style={isGrid ? styles.gridContent : styles.listContent}>
        {/* Name */}
        <Text
          style={[styles.name, {color: theme.colors.text}]}
          numberOfLines={isGrid ? 2 : 1}>
          {position.name}
        </Text>

        {/* Difficulty stars */}
        <DifficultyStars rating={position.difficulty} size={isGrid ? 12 : 14} />

        {/* Category chips (max 2) */}
        <View style={styles.chipRow}>
          {(position.category || []).slice(0, 2).map(cat => (
            <View
              key={cat}
              style={[
                styles.chip,
                {backgroundColor: (CATEGORY_COLORS[cat] || theme.colors.primary) + '20'},
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {color: CATEGORY_COLORS[cat] || theme.colors.primary},
                ]}
                numberOfLines={1}>
                {cat.replace(/-/g, ' ')}
              </Text>
            </View>
          ))}
        </View>

        {/* List mode: show description */}
        {!isGrid && (
          <Text
            style={[styles.description, {color: theme.colors.textSecondary}]}
            numberOfLines={2}>
            {position.description}
          </Text>
        )}
      </View>

      {/* Favorite heart */}
      <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
        <TouchableOpacity
          onPress={handleFavoritePress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityRole="button">
          <Text style={styles.heart}>{isFavorite ? '\u2764\uFE0F' : '\u{1F90D}'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridCard: {
    flex: 1,
    margin: 6,
  },
  listCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
  },
  gridIllustration: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIllustration: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationEmoji: {
    fontSize: 32,
  },
  gridContent: {
    padding: 10,
  },
  listContent: {
    flex: 1,
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  heartContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  heart: {
    fontSize: 18,
  },
});

export default PositionCard;
