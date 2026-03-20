import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const MoodButton = ({mood, isSelected, onSelect}) => {
  const {theme} = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.15, {damping: 10, stiffness: 300}, () => {
      scale.value = withSpring(1, {damping: 12, stiffness: 200});
    });
    onSelect(mood.id);
  };

  return (
    <Animated.View style={[styles.moodWrapper, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={[
          styles.moodBtn,
          {backgroundColor: theme.colors.surface},
          isSelected && {
            borderColor: mood.color,
            borderWidth: 2,
            backgroundColor: mood.color + '15',
          },
        ]}>
        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
        <Text
          style={[
            styles.moodLabel,
            {color: isSelected ? mood.color : theme.colors.textSecondary},
            isSelected && {fontWeight: '700'},
          ]}>
          {mood.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MoodSelector = ({moods, selectedId, onSelect}) => {
  return (
    <View style={styles.grid}>
      {moods.map(mood => (
        <MoodButton
          key={mood.id}
          mood={mood}
          isSelected={selectedId === mood.id}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  moodWrapper: {
    width: '18%',
    minWidth: 65,
  },
  moodBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    fontSize: normalize(11),
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MoodSelector;
