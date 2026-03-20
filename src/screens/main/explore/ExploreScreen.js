import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {GlassCard} from '@components/common';
import {PositionCard, PositionFilters} from '@components/positions';
import {
  SCREEN_NAMES,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  POSITION_CATEGORIES,
} from '@utils/constants';
import {wp} from '@utils/helpers';

const ExploreScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const {light, selection} = useHaptic();
  const {
    filteredPositions,
    positionOfTheDay,
    favorites,
    toggleFavorite,
    filters,
    sortConfig,
    applyFilters,
    sortPositions,
    categories,
    isLoading,
  } = useContent();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const toggleViewMode = useCallback(() => {
    selection();
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  }, [selection]);

  const navigateToSearch = useCallback(() => {
    light();
    navigation.navigate(SCREEN_NAMES.SEARCH);
  }, [navigation, light]);

  const navigateToFavorites = useCallback(() => {
    light();
    navigation.navigate(SCREEN_NAMES.FAVORITES);
  }, [navigation, light]);

  const navigateToPOTD = useCallback(() => {
    light();
    navigation.navigate(SCREEN_NAMES.POSITION_OF_THE_DAY);
  }, [navigation, light]);

  const navigateToCategory = useCallback(
    categoryId => {
      light();
      navigation.navigate(SCREEN_NAMES.CATEGORY_BROWSE, {category: categoryId});
    },
    [navigation, light],
  );

  // FlatList key depends on view mode (to trigger re-layout for numColumns)
  const listKey = viewMode === 'grid' ? 'grid' : 'list';

  const renderPositionCard = useCallback(
    ({item}) => (
      <PositionCard
        position={item}
        mode={viewMode}
        isFavorite={favorites.includes(item.id)}
        onToggleFavorite={toggleFavorite}
      />
    ),
    [viewMode, favorites, toggleFavorite],
  );

  const keyExtractor = useCallback(item => item.id, []);

  // ─── Header Component ──────────────────────────────────
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Header bar */}
        <View style={styles.headerBar}>
          <Text style={[TYPOGRAPHY.h1, {color: theme.colors.text}]}>Explore</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={navigateToFavorites}
              style={styles.headerButton}
              accessibilityLabel="Favorites"
              accessibilityRole="button">
              <Text style={styles.headerIcon}>{'\u2764\uFE0F'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={navigateToSearch}
              style={styles.headerButton}
              accessibilityLabel="Search positions"
              accessibilityRole="button">
              <Text style={styles.headerIcon}>{'\uD83D\uDD0D'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                selection();
                setFiltersVisible(true);
              }}
              style={styles.headerButton}
              accessibilityLabel="Filter positions"
              accessibilityRole="button">
              <Text style={styles.headerIcon}>{'\u2699\uFE0F'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Position of the Day banner */}
        {positionOfTheDay && (
          <GlassCard
            onPress={navigateToPOTD}
            animated
            style={styles.potdCard}>
            <LinearGradient
              colors={theme.gradients.warm}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.potdGradient}>
              <View style={styles.potdContent}>
                <Text style={styles.potdLabel}>Position of the Day</Text>
                <Text style={styles.potdName}>{positionOfTheDay.name}</Text>
                <Text style={styles.potdDescription} numberOfLines={2}>
                  {positionOfTheDay.description}
                </Text>
              </View>
              <Text style={styles.potdEmoji}>
                {'\uD83D\uDD25'}
              </Text>
            </LinearGradient>
          </GlassCard>
        )}

        {/* Category horizontal scroll */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Categories
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => navigateToCategory(cat.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={cat.label}>
              <View
                style={[
                  styles.categoryCard,
                  {backgroundColor: theme.colors.surface},
                ]}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[styles.categoryLabel, {color: theme.colors.text}]}
                  numberOfLines={1}>
                  {cat.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View mode toggle + count */}
        <View style={styles.toolbar}>
          <Text style={[styles.resultCount, {color: theme.colors.textSecondary}]}>
            {filteredPositions.length} positions
          </Text>
          <TouchableOpacity
            onPress={toggleViewMode}
            style={[styles.viewToggle, {backgroundColor: theme.colors.surface}]}
            accessibilityLabel={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            accessibilityRole="button">
            <Text style={{fontSize: 16}}>
              {viewMode === 'grid' ? '\u2630' : '\u25A6'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [
      theme,
      positionOfTheDay,
      categories,
      filteredPositions.length,
      viewMode,
      navigateToSearch,
      navigateToFavorites,
      navigateToPOTD,
      navigateToCategory,
      toggleViewMode,
      selection,
    ],
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      <FlatList
        key={listKey}
        data={filteredPositions}
        renderItem={renderPositionCard}
        keyExtractor={keyExtractor}
        numColumns={viewMode === 'grid' ? 2 : 1}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />

      {/* Filter bottom sheet */}
      <PositionFilters
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={filters}
        onApply={applyFilters}
        sortConfig={sortConfig}
        onSort={sortPositions}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
  },
  potdCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: 0,
    overflow: 'hidden',
  },
  potdGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  potdContent: {
    flex: 1,
  },
  potdLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  potdName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  potdDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  potdEmoji: {
    fontSize: 40,
    marginLeft: 12,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: 10,
  },
  categoryCard: {
    width: wp(22),
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  resultCount: {
    fontSize: 14,
  },
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ExploreScreen;
