import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {GOAL_CATEGORIES, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const GoalCard = ({goal, onPress, onComplete, onDelete}) => {
  const {theme} = useTheme();
  const category = GOAL_CATEGORIES.find(c => c.id === goal.category);
  const catColor = category?.color || theme.colors.primary;

  const targetLabel = goal.targetDate
    ? new Date(goal.targetDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.catIcon}>{category?.icon || '🎯'}</Text>
          <Text style={[styles.title, {color: theme.colors.text}]} numberOfLines={1}>
            {goal.title}
          </Text>
        </View>
        {goal.isCompleted && <Text style={styles.checkmark}>✅</Text>}
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, {backgroundColor: theme.colors.surfaceLight}]}>
        <View
          style={[
            styles.progressFill,
            {backgroundColor: catColor, width: `${Math.min(goal.progress, 100)}%`},
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.progressText, {color: catColor}]}>
          {goal.progress}%
        </Text>
        {targetLabel && (
          <Text style={[styles.targetDate, {color: theme.colors.textSecondary}]}>
            Target: {targetLabel}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  catIcon: {
    fontSize: 20,
  },
  title: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  checkmark: {
    fontSize: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: normalize(12),
    fontWeight: '700',
  },
  targetDate: {
    ...TYPOGRAPHY.caption,
  },
});

export default GoalCard;
