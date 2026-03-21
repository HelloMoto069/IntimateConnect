import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import GlassCard from '@components/common/GlassCard';
import {SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const BadgeCard = ({badge, isEarned, earnedAt, onPress}) => {
  const {theme} = useTheme();

  const dateLabel = earnedAt
    ? new Date(earnedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <GlassCard
      onPress={isEarned ? onPress : undefined}
      style={[styles.container, !isEarned && styles.locked]}>
      <Text style={[styles.icon, !isEarned && styles.lockedIcon]}>
        {badge.icon}
      </Text>
      <Text
        style={[
          styles.name,
          {color: isEarned ? theme.colors.text : theme.colors.textSecondary},
        ]}
        numberOfLines={1}>
        {badge.name}
      </Text>
      <Text
        style={[styles.description, {color: theme.colors.textSecondary}]}
        numberOfLines={2}>
        {badge.description}
      </Text>
      {isEarned && dateLabel ? (
        <Text style={[styles.earned, {color: theme.colors.primary}]}>
          Earned {dateLabel}
        </Text>
      ) : null}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  locked: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  name: {
    fontSize: normalize(13),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    lineHeight: 16,
  },
  earned: {
    fontSize: normalize(10),
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
});

export default BadgeCard;
