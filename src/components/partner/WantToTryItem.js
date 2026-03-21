import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const WantToTryItem = ({item, positionName, addedByName, onMarkTried, onRemove}) => {
  const {theme} = useTheme();

  const dateLabel = item.addedAt
    ? new Date(item.addedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.info}>
        <Text style={[styles.name, {color: theme.colors.text}]}>
          {positionName || 'Unknown Position'}
        </Text>
        <Text style={[styles.meta, {color: theme.colors.textSecondary}]}>
          Added by {addedByName} {dateLabel ? `• ${dateLabel}` : ''}
        </Text>
      </View>
      <View style={styles.actions}>
        {!item.tried && onMarkTried && (
          <TouchableOpacity
            onPress={() => onMarkTried(item.id)}
            style={[styles.actionBtn, {backgroundColor: theme.colors.primary + '20'}]}>
            <Text style={[styles.actionText, {color: theme.colors.primary}]}>
              Tried
            </Text>
          </TouchableOpacity>
        )}
        {item.tried && (
          <View style={[styles.triedBadge, {backgroundColor: '#4CAF50' + '20'}]}>
            <Text style={[styles.actionText, {color: '#4CAF50'}]}>Done</Text>
          </View>
        )}
        {onRemove && (
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={[styles.actionBtn, {backgroundColor: theme.colors.surfaceLight}]}>
            <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
  meta: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  triedBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  actionText: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
});

export default WantToTryItem;
