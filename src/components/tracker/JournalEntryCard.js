import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import GlassCard from '@components/common/GlassCard';
import {WELLNESS_MOODS, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize, truncateText} from '@utils/helpers';

const JournalEntryCard = ({entry, onPress}) => {
  const {theme} = useTheme();
  const mood = WELLNESS_MOODS.find(m => m.id === entry.moodTag);

  const dateLabel = entry.createdAt
    ? new Date(entry.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <GlassCard onPress={onPress}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.text}]} numberOfLines={1}>
          {entry.title || 'Untitled'}
        </Text>
        {mood && <Text style={styles.moodEmoji}>{mood.emoji}</Text>}
      </View>
      {entry.content && (
        <Text
          style={[styles.preview, {color: theme.colors.textSecondary}]}
          numberOfLines={2}>
          {truncateText(entry.content, 80)}
        </Text>
      )}
      <View style={styles.footer}>
        <Text style={[styles.date, {color: theme.colors.textSecondary}]}>
          {dateLabel}
        </Text>
        {entry.tags?.length > 0 && (
          <View style={styles.tags}>
            {entry.tags.slice(0, 3).map(tag => (
              <View
                key={tag}
                style={[styles.tag, {backgroundColor: theme.colors.primary + '15'}]}>
                <Text style={[styles.tagText, {color: theme.colors.primary}]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h3,
    flex: 1,
  },
  moodEmoji: {
    fontSize: 20,
    marginLeft: SPACING.sm,
  },
  preview: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...TYPOGRAPHY.caption,
  },
  tags: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  tagText: {
    fontSize: normalize(10),
    fontWeight: '600',
  },
});

export default JournalEntryCard;
