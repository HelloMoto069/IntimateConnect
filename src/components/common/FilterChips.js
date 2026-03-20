import React from 'react';
import {ScrollView, TouchableOpacity, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import {BORDER_RADIUS} from '@utils/constants';

const FilterChips = ({options = [], selected, onSelect, multiple = false, style}) => {
  const {theme} = useTheme();
  const {selection} = useHaptic();

  const isSelected = value => {
    if (multiple) {
      return Array.isArray(selected) && selected.includes(value);
    }
    return selected === value;
  };

  const handleSelect = value => {
    selection();
    if (multiple) {
      const current = Array.isArray(selected) ? selected : [];
      const newSelected = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      onSelect?.(newSelected);
    } else {
      onSelect?.(selected === value ? null : value);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}>
      {options.map(option => {
        const active = isSelected(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleSelect(option.value)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{selected: active}}
            accessibilityLabel={option.label}>
            {active ? (
              <LinearGradient
                colors={theme.gradients.primary}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.chip}>
                <Text style={[styles.chipText, {color: '#FFFFFF'}]}>
                  {option.label}
                </Text>
              </LinearGradient>
            ) : (
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceLight,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.chipText,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FilterChips;
