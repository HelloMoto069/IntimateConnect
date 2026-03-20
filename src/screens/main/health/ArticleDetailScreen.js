import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {
  SCREEN_NAMES,
  HEALTH_CATEGORIES,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
} from '@utils/constants';
import {normalize} from '@utils/helpers';
import SearchBar from '@components/common/SearchBar';
import GlassCard from '@components/common/GlassCard';
import {ArticleCard} from '@components/health';
import Animated, {FadeInDown} from 'react-native-reanimated';

const ArticleDetailScreen = () => {
  const {theme} = useTheme();
  const {health} = useContent();
  const navigation = useNavigation();
  const route = useRoute();
  const {selection} = useHaptic();

  const {categoryId, articleId} = route.params || {};

  // If articleId is provided, show full article detail
  if (articleId) {
    return (
      <ArticleDetailView
        articleId={articleId}
        theme={theme}
        health={health}
        navigation={navigation}
        selection={selection}
      />
    );
  }

  // Otherwise show article list for category
  return (
    <ArticleListView
      categoryId={categoryId}
      theme={theme}
      health={health}
      navigation={navigation}
      selection={selection}
    />
  );
};

// ─── Article List Mode ─────────────────────────────────
const ArticleListView = ({categoryId, theme, health, navigation, selection}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const category = HEALTH_CATEGORIES.find(c => c.id === categoryId);

  const articles = searchQuery
    ? health.articles
        .filter(a => !categoryId || a.category === categoryId)
        .filter(a => {
          const q = searchQuery.toLowerCase();
          return (
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q) ||
            (a.tags || []).some(t => t.toLowerCase().includes(q))
          );
        })
    : categoryId
    ? health.getArticlesByCategory(categoryId)
    : health.articles;

  const handleArticlePress = useCallback(
    id => {
      selection();
      navigation.push(SCREEN_NAMES.HEALTH_ARTICLE_DETAIL, {articleId: id});
    },
    [navigation, selection],
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.primary}]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.listTitle, {color: theme.colors.text}]}>
          {category?.label || 'All Articles'}
        </Text>
        <Text style={[styles.listSubtitle, {color: theme.colors.textSecondary}]}>
          {articles.length} {articles.length === 1 ? 'article' : 'articles'}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search articles..."
        />
      </View>

      {/* Articles */}
      <FlatList
        data={articles}
        renderItem={({item, index}) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
            <ArticleCard
              article={item}
              onPress={() => handleArticlePress(item.id)}
              isBookmarked={health.isBookmarked(item.id)}
              readingPercent={health.readingProgress[item.id] || 0}
            />
          </Animated.View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.articleList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
              No articles found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// ─── Article Detail Mode ───────────────────────────────
const ArticleDetailView = ({articleId, theme, health, navigation, selection}) => {
  const article = health.getArticleById(articleId);
  const scrollRef = useRef(null);
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);

  const category = HEALTH_CATEGORIES.find(c => c.id === article?.category);
  const relatedArticles = article ? health.getRelatedArticles(article.id) : [];
  const bookmarked = article ? health.isBookmarked(article.id) : false;

  const handleScroll = useCallback(
    event => {
      if (!article) return;
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      const totalScrollable = contentSize.height - layoutMeasurement.height;
      if (totalScrollable <= 0) return;
      const percent = Math.round((contentOffset.y / totalScrollable) * 100);
      health.updateReadingProgress(article.id, Math.min(percent, 100));
    },
    [article, health],
  );

  const handleBookmarkToggle = useCallback(() => {
    if (!article) return;
    selection();
    health.toggleBookmark(article.id);
  }, [article, health, selection]);

  const handleRelatedPress = useCallback(
    id => {
      selection();
      navigation.push(SCREEN_NAMES.HEALTH_ARTICLE_DETAIL, {articleId: id});
    },
    [navigation, selection],
  );

  if (!article) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, {color: theme.colors.primary}]}>
              ← Back
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
            Article not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Top Bar */}
      <View style={styles.detailTopBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.primary}]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBookmarkToggle} style={styles.bookmarkBtn}>
          <Text style={styles.bookmarkEmoji}>{bookmarked ? '🔖' : '📑'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={200}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.detailContent}>
        {/* Article Header */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailIcon}>{article.icon || category?.icon || '📄'}</Text>
            {category && (
              <View
                style={[
                  styles.detailCategoryBadge,
                  {backgroundColor: theme.colors.primary + '15'},
                ]}>
                <Text style={[styles.detailCategoryText, {color: theme.colors.primary}]}>
                  {category.label}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.detailTitle, {color: theme.colors.text}]}>
            {article.title}
          </Text>

          <Text style={[styles.detailMeta, {color: theme.colors.textSecondary}]}>
            {article.readTimeMinutes} min read
          </Text>
        </Animated.View>

        {/* Sections */}
        {article.sections.map((section, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(100 + index * 60).duration(400)}>
            <Text style={[styles.sectionHeading, {color: theme.colors.text}]}>
              {section.heading}
            </Text>
            <Text style={[styles.sectionBody, {color: theme.colors.textSecondary}]}>
              {section.body}
            </Text>
          </Animated.View>
        ))}

        {/* Key Takeaways */}
        {article.keyTakeaways?.length > 0 && (
          <GlassCard style={styles.takeawaysCard}>
            <Text style={[styles.takeawaysTitle, {color: theme.colors.primary}]}>
              Key Takeaways
            </Text>
            {article.keyTakeaways.map((takeaway, i) => (
              <View key={i} style={styles.takeawayRow}>
                <Text style={[styles.takeawayBullet, {color: theme.colors.primary}]}>
                  •
                </Text>
                <Text style={[styles.takeawayText, {color: theme.colors.text}]}>
                  {takeaway}
                </Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Did You Know */}
        {article.didYouKnow && (
          <GlassCard style={styles.didYouKnowCard}>
            <View style={styles.dykHeader}>
              <Text style={styles.dykIcon}>💡</Text>
              <Text style={[styles.dykLabel, {color: theme.colors.primary}]}>
                Did You Know?
              </Text>
            </View>
            <Text style={[styles.dykText, {color: theme.colors.text}]}>
              {article.didYouKnow}
            </Text>
          </GlassCard>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={[styles.relatedTitle, {color: theme.colors.text}]}>
              Related Articles
            </Text>
            {relatedArticles.map(related => (
              <TouchableOpacity
                key={related.id}
                activeOpacity={0.7}
                onPress={() => handleRelatedPress(related.id)}
                style={[
                  styles.relatedCard,
                  {backgroundColor: theme.colors.surface},
                ]}>
                <Text style={styles.relatedIcon}>
                  {related.icon || '📄'}
                </Text>
                <View style={styles.relatedInfo}>
                  <Text
                    style={[styles.relatedName, {color: theme.colors.text}]}
                    numberOfLines={1}>
                    {related.title}
                  </Text>
                  <Text style={[styles.relatedMeta, {color: theme.colors.textSecondary}]}>
                    {related.readTimeMinutes} min read
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    paddingVertical: SPACING.sm,
  },
  backText: {
    fontSize: normalize(15),
    fontWeight: '600',
  },
  listTitle: {
    ...TYPOGRAPHY.h1,
    marginTop: SPACING.sm,
  },
  listSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: SPACING.xs,
  },
  searchRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  articleList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
  },
  // Detail mode
  detailTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  bookmarkBtn: {
    padding: SPACING.sm,
  },
  bookmarkEmoji: {
    fontSize: 22,
  },
  detailContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailIcon: {
    fontSize: 36,
  },
  detailCategoryBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  detailCategoryText: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  detailTitle: {
    ...TYPOGRAPHY.h1,
    marginBottom: SPACING.sm,
  },
  detailMeta: {
    ...TYPOGRAPHY.caption,
    marginBottom: SPACING.lg,
  },
  // Sections
  sectionHeading: {
    ...TYPOGRAPHY.h3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionBody: {
    ...TYPOGRAPHY.body,
    lineHeight: 26,
  },
  // Takeaways
  takeawaysCard: {
    marginTop: SPACING.xl,
  },
  takeawaysTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
  },
  takeawayRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  takeawayBullet: {
    fontSize: 16,
    marginTop: 2,
  },
  takeawayText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  // Did You Know
  didYouKnowCard: {
    marginTop: SPACING.md,
  },
  dykHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dykIcon: {
    fontSize: 18,
  },
  dykLabel: {
    fontSize: normalize(13),
    fontWeight: '700',
  },
  dykText: {
    ...TYPOGRAPHY.body,
    fontStyle: 'italic',
  },
  // Related
  relatedSection: {
    marginTop: SPACING.xl,
  },
  relatedTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  relatedIcon: {
    fontSize: 24,
  },
  relatedInfo: {
    flex: 1,
  },
  relatedName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
  relatedMeta: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});

export default ArticleDetailScreen;
