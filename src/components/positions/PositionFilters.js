import React, {useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import {BottomSheet, GradientButton, FilterChips} from '@components/common';
import {
  POSITION_CATEGORIES,
  SORT_OPTIONS,
  BORDER_RADIUS,
  SPACING,
} from '@utils/constants';

const RangeSelector = ({label, min, max, value, onChange, theme}) => {
  const buttons = [];
  for (let i = min; i <= max; i++) {
    const isInRange = i >= value[0] && i <= value[1];
    buttons.push(
      <TouchableOpacity
        key={i}
        style={[
          styles.rangeButton,
          {
            backgroundColor: isInRange
              ? theme.colors.primary + '30'
              : theme.colors.surfaceLight,
            borderColor: isInRange ? theme.colors.primary : 'transparent',
          },
        ]}
        onPress={() => {
          // Tap selects as min or max depending on current state
          if (i < value[0]) {
            onChange([i, value[1]]);
          } else if (i > value[1]) {
            onChange([value[0], i]);
          } else if (i === value[0] && i === value[1]) {
            onChange([min, max]); // Reset
          } else if (i === value[0]) {
            onChange([i + 1 <= value[1] ? i + 1 : i, value[1]]);
          } else if (i === value[1]) {
            onChange([value[0], i - 1 >= value[0] ? i - 1 : i]);
          } else {
            // In middle — set as new single selection
            onChange([i, i]);
          }
        }}
        accessibilityLabel={`${label} level ${i}`}
        accessibilityRole="button">
        <Text
          style={[
            styles.rangeButtonText,
            {color: isInRange ? theme.colors.primary : theme.colors.textSecondary},
          ]}>
          {i}
        </Text>
      </TouchableOpacity>,
    );
  }

  return (
    <View style={styles.rangeContainer}>
      <Text style={[styles.rangeLabel, {color: theme.colors.text}]}>{label}</Text>
      <View style={styles.rangeButtons}>{buttons}</View>
    </View>
  );
};

const PositionFilters = ({visible, onClose, filters, onApply, sortConfig, onSort}) => {
  const {theme} = useTheme();
  const {selection} = useHaptic();

  // Local filter state (only committed on Apply)
  const [localCategories, setLocalCategories] = useState(filters.categories);
  const [localDifficulty, setLocalDifficulty] = useState([
    filters.difficultyMin,
    filters.difficultyMax,
  ]);
  const [localIntimacy, setLocalIntimacy] = useState([
    filters.intimacyMin,
    filters.intimacyMax,
  ]);
  const [localSort, setLocalSort] = useState(
    SORT_OPTIONS.find(
      s => s.field === sortConfig.field && s.direction === sortConfig.direction,
    )?.id || 'name_asc',
  );

  // Sync local state when filters change externally
  React.useEffect(() => {
    setLocalCategories(filters.categories);
    setLocalDifficulty([filters.difficultyMin, filters.difficultyMax]);
    setLocalIntimacy([filters.intimacyMin, filters.intimacyMax]);
  }, [filters]);

  const categoryOptions = POSITION_CATEGORIES.map(c => ({
    value: c.id,
    label: `${c.icon} ${c.label}`,
  }));

  const handleApply = useCallback(() => {
    selection();
    const sortOption = SORT_OPTIONS.find(s => s.id === localSort);
    onApply({
      categories: localCategories,
      difficultyMin: localDifficulty[0],
      difficultyMax: localDifficulty[1],
      intimacyMin: localIntimacy[0],
      intimacyMax: localIntimacy[1],
    });
    if (sortOption) {
      onSort(sortOption.field, sortOption.direction);
    }
    onClose();
  }, [
    localCategories,
    localDifficulty,
    localIntimacy,
    localSort,
    onApply,
    onSort,
    onClose,
    selection,
  ]);

  const handleReset = useCallback(() => {
    setLocalCategories([]);
    setLocalDifficulty([1, 5]);
    setLocalIntimacy([1, 5]);
    setLocalSort('name_asc');
  }, []);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filters">
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Categories
        </Text>
        <FilterChips
          options={categoryOptions}
          selected={localCategories}
          onSelect={setLocalCategories}
          multiple
          style={styles.chips}
        />

        {/* Difficulty Range */}
        <RangeSelector
          label="Difficulty"
          min={1}
          max={5}
          value={localDifficulty}
          onChange={setLocalDifficulty}
          theme={theme}
        />

        {/* Intimacy Range */}
        <RangeSelector
          label="Intimacy Level"
          min={1}
          max={5}
          value={localIntimacy}
          onChange={setLocalIntimacy}
          theme={theme}
        />

        {/* Sort */}
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Sort By
        </Text>
        <View style={styles.sortOptions}>
          {SORT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                {
                  backgroundColor:
                    localSort === option.id
                      ? theme.colors.primary + '20'
                      : theme.colors.surfaceLight,
                  borderColor:
                    localSort === option.id
                      ? theme.colors.primary
                      : 'transparent',
                },
              ]}
              onPress={() => setLocalSort(option.id)}
              accessibilityRole="radio"
              accessibilityState={{selected: localSort === option.id}}>
              <Text
                style={[
                  styles.sortOptionText,
                  {
                    color:
                      localSort === option.id
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                  },
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.resetButton, {borderColor: theme.colors.textSecondary}]}
            onPress={handleReset}
            accessibilityRole="button"
            accessibilityLabel="Reset all filters">
            <Text style={{color: theme.colors.textSecondary, fontWeight: '600'}}>
              Reset
            </Text>
          </TouchableOpacity>
          <GradientButton
            title="Apply Filters"
            onPress={handleApply}
            style={styles.applyButton}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    maxHeight: 500,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
  },
  chips: {
    paddingHorizontal: 0,
  },
  rangeContainer: {
    marginTop: 16,
  },
  rangeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  rangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rangeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  applyButton: {
    flex: 1,
  },
});

export default PositionFilters;
