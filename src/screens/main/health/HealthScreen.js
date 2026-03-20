import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {
  SCREEN_NAMES,
  HEALTH_CATEGORIES,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@utils/constants';
import {wp, normalize} from '@utils/helpers';
import LinearGradient from 'react-native-linear-gradient';
import GlassCard from '@components/common/GlassCard';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {ArticleCard} from '@components/health';

const HealthScreen = () => {
  const {theme, isDark} = useTheme();
  const {health} = useContent();
  const navigation = useNavigation();
  const {selection} = useHaptic();

  const gradients = isDark ? GRADIENTS.dark : GRADIENTS.light;

  const handleCategoryPress = useCallback(
    categoryId => {
      selection();
      navigation.navigate(SCREEN_NAMES.HEALTH_ARTICLE_DETAIL, {categoryId});
    },
    [navigation, selection],
  );

  const handleArticlePress = useCallback(
    articleId => {
      selection();
      navigation.navigate(SCREEN_NAMES.HEALTH_ARTICLE_DETAIL, {articleId});
    },
    [navigation, selection],
  );

  const handleQuickAccess = useCallback(
    screen => {
      selection();
      navigation.navigate(screen);
    },
    [navigation, selection],
  );

  // Get article counts per category
  const getCategoryCount = catId =>
    health.articles.filter(a => a.category === catId).length;

  // Recently read articles (last 5 with progress)
  const recentlyRead = health.articles
    .filter(a => (health.readingProgress[a.id] || 0) > 0)
    .sort((a, b) => (health.readingProgress[b.id] || 0) - (health.readingProgress[a.id] || 0))
    .slice(0, 5);

  const renderCategoryCard = ({item, index}) => {
    const gradient = gradients[item.gradient] || gradients.primary;
    const count = getCategoryCount(item.id);

    return (
      <Animated.View
        entering={FadeInDown.delay(100 + index * 60).duration(400)}
        style={styles.categoryCardWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleCategoryPress(item.id)}
          style={[styles.categoryCard, {backgroundColor: theme.colors.surface}]}>
          <LinearGradient
            colors={[gradient[0] + '30', gradient[1] + '10']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientOverlay}
          />
          <View style={styles.categoryContent}>
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text
              style={[styles.categoryLabel, {color: theme.colors.text}]}
              numberOfLines={2}>
              {item.label}
            </Text>
            <Text style={[styles.categoryCount, {color: theme.colors.textSecondary}]}>
              {count} {count === 1 ? 'article' : 'articles'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderRecentArticle = ({item}) => (
    <ArticleCard
      article={item}
      onPress={() => handleArticlePress(item.id)}
      isBookmarked={health.isBookmarked(item.id)}
      readingPercent={health.readingProgress[item.id] || 0}
      style={styles.recentCard}
    />
  );

  const quickAccessItems = [
    {icon: '🧘', label: 'Guides', screen: SCREEN_NAMES.HEALTH_GUIDES},
    {icon: '📖', label: 'Glossary', screen: SCREEN_NAMES.HEALTH_GLOSSARY},
    {icon: '💭', label: 'Check-In', screen: SCREEN_NAMES.HEALTH_CHECKIN},
  ];

  const ListHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Sexual Health
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Your wellness resource
        </Text>
      </View>

      {/* Daily Tip */}
      {health.featuredArticle && (
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <GlassCard
            onPress={() => handleArticlePress(health.featuredArticle.id)}
            style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={[styles.tipLabel, {color: theme.colors.primary}]}>
                Daily Featured
              </Text>
            </View>
            <Text
              style={[styles.tipTitle, {color: theme.colors.text}]}
              numberOfLines={2}>
              {health.featuredArticle.title}
            </Text>
            {health.dailyTip && (
              <Text
                style={[styles.tipText, {color: theme.colors.textSecondary}]}
                numberOfLines={2}>
                {health.dailyTip}
              </Text>
            )}
          </GlassCard>
        </Animated.View>
      )}

      {/* Category Grid Header */}
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        Browse Topics
      </Text>
    </>
  );

  const ListFooter = () => (
    <>
      {/* Quick Access */}
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        Quick Access
      </Text>
      <View style={styles.quickAccessRow}>
        {quickAccessItems.map((item, index) => (
          <Animated.View
            key={item.label}
            entering={FadeInDown.delay(500 + index * 80).duration(400)}
            style={styles.quickAccessWrapper}>
            <GlassCard
              onPress={() => handleQuickAccess(item.screen)}
              style={styles.quickAccessCard}>
              <Text style={styles.quickAccessIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.quickAccessLabel,
                  {color: theme.colors.text},
                ]}>
                {item.label}
              </Text>
            </GlassCard>
          </Animated.View>
        ))}
      </View>

      {/* Recently Read */}
      {recentlyRead.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Recently Read
          </Text>
          <FlatList
            data={recentlyRead}
            renderItem={renderRecentArticle}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
          />
        </>
      )}

      <View style={styles.bottomSpacer} />
    </>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <FlatList
        data={HEALTH_CATEGORIES}
        renderItem={renderCategoryCard}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.categoryRow}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.hero,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.xs,
  },
  // Daily Tip
  tipCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipLabel: {
    fontSize: normalize(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  tipText: {
    ...TYPOGRAPHY.bodySmall,
  },
  // Section Title
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  // Category Grid
  categoryRow: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  categoryCardWrapper: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  categoryCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    minHeight: 130,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryContent: {
    padding: SPACING.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  categoryLabel: {
    fontSize: normalize(14),
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  categoryCount: {
    ...TYPOGRAPHY.caption,
  },
  // Quick Access
  quickAccessRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  quickAccessWrapper: {
    flex: 1,
  },
  quickAccessCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  quickAccessIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  quickAccessLabel: {
    fontSize: normalize(13),
    fontWeight: '600',
  },
  // Recently Read
  recentList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  recentCard: {
    width: wp(70),
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default HealthScreen;
