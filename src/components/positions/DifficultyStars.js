import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';

const DifficultyStars = ({
  rating = 0,
  maxStars = 5,
  size = 16,
  color,
  label,
  style,
}) => {
  const {theme} = useTheme();
  const starColor = color || theme.colors.primary;

  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <Text
        key={i}
        style={{fontSize: size, color: i <= rating ? starColor : theme.colors.textSecondary + '40'}}
        accessibilityElementsHidden>
        {i <= rating ? '\u2605' : '\u2606'}
      </Text>,
    );
  }

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={`${label || 'Rating'}: ${rating} out of ${maxStars}`}
      accessibilityRole="text">
      {label && (
        <Text style={[styles.label, {color: theme.colors.textSecondary}]}>
          {label}
        </Text>
      )}
      <View style={styles.stars}>{stars}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
});

export default DifficultyStars;
