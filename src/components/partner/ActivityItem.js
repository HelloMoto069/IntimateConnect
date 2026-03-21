import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {COUPLE_ACTIVITY_TYPES, SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const ActivityItem = ({activity, isLast}) => {
  const {theme} = useTheme();

  const typeInfo = COUPLE_ACTIVITY_TYPES[activity.type] || {
    label: 'Activity',
    icon: '📌',
  };

  const timeAgo = activity.createdAt
    ? formatTimeAgo(
        new Date(activity.createdAt.toDate?.() || activity.createdAt),
      )
    : '';

  return (
    <View style={styles.container}>
      {/* Timeline line */}
      <View style={styles.timeline}>
        <View style={[styles.dot, {backgroundColor: theme.colors.primary}]}>
          <Text style={styles.dotIcon}>{typeInfo.icon}</Text>
        </View>
        {!isLast && (
          <View style={[styles.line, {backgroundColor: theme.colors.surfaceLight}]} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.description, {color: theme.colors.text}]}>
          {activity.description}
        </Text>
        <Text style={[styles.meta, {color: theme.colors.textSecondary}]}>
          {activity.actorName} {timeAgo ? `• ${timeAgo}` : ''}
        </Text>
      </View>
    </View>
  );
};

function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timeline: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotIcon: {
    fontSize: 14,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  description: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
  },
  meta: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
});

export default ActivityItem;
