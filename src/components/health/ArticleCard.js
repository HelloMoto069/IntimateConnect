import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY, HEALTH_CATEGORIES} from '@utils/constants';
import {normalize} from '@utils/helpers';

const ArticleCard = ({article, onPress, isBookmarked, readingPercent, style}) => {
  const {theme} = useTheme();

  const category = HEALTH_CATEGORIES.find(c => c.id === article.category);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        {backgroundColor: theme.colors.surface},
        style,
      ]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{article.icon || category?.icon || '📄'}</Text>
        <View style={styles.headerRight}>
          {category && (
            <View
              style={[
                styles.categoryBadge,
                {backgroundColor: theme.colors.primary + '15'},
              ]}>
              <Text style={[styles.categoryText, {color: theme.colors.primary}]}>
                {category.label}
              </Text>
            </View>
          )}
          {isBookmarked && (
            <Text style={styles.bookmarkIcon}>🔖</Text>
          )}
        </View>
      </View>

      <Text
        style={[styles.title, {color: theme.colors.text}]}
        numberOfLines={2}>
        {article.title}
      </Text>

      <Text
        style={[styles.summary, {color: theme.colors.textSecondary}]}
        numberOfLines={2}>
        {article.summary}
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.readTime, {color: theme.colors.textSecondary}]}>
          {article.readTimeMinutes} min read
        </Text>
      </View>

      {readingPercent > 0 && (
        <View
          style={[
            styles.progressBar,
            {backgroundColor: theme.colors.surfaceLight},
          ]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${Math.min(readingPercent, 100)}%`,
              },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 28,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    fontSize: normalize(11),
    fontWeight: '600',
  },
  bookmarkIcon: {
    fontSize: 16,
  },
  title: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  summary: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    ...TYPOGRAPHY.caption,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default ArticleCard;
