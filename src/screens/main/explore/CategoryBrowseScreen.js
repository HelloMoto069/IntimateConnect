import React, {useState, useCallback, useMemo} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {PositionCard} from '@components/positions';
import {
  POSITION_CATEGORIES,
  SPACING,
  BORDER_RADIUS,
  SCREEN_NAMES,
} from '@utils/constants';
import {wp} from '@utils/helpers';

const CategoryBrowseScreen = ({route, navigation}) => {
  const initialCategory = route.params?.category || null;
  const {theme} = useTheme();
  const {light} = useHaptic();
  const {positions, favorites, toggleFavorite} = useContent();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Count positions per category
  const categoryData = useMemo(() => {
    return POSITION_CATEGORIES.map(cat => ({
      ...cat,
      count: positions.filter(p => (p.category || []).includes(cat.id)).length,
    })).filter(c => c.count > 0);
  }, [positions]);

  // Filtered by selected category
  const filteredPositions = useMemo(() => {
    if (!selectedCategory) return [];
    return positions.filter(p => (p.category || []).includes(selectedCategory));
  }, [positions, selectedCategory]);

  const handleCategorySelect = useCallback(
    catId => {
      light();
      setSelectedCategory(prev => (prev === catId ? null : catId));
    },
    [light],
  );

  const renderPositionCard = useCallback(
    ({item}) => (
      <PositionCard
        position={item}
        mode="list"
        isFavorite={favorites.includes(item.id)}
        onToggleFavorite={toggleFavorite}
      />
    ),
    [favorites, toggleFavorite],
  );

  const keyExtractor = useCallback(item => item.id, []);

  // Category grid (when no category selected)
  const renderCategoryCard = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor:
              selectedCategory === item.id
                ? theme.colors.primary
                : 'transparent',
          },
        ]}
        onPress={() => handleCategorySelect(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.label}: ${item.count} positions`}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={[styles.categoryLabel, {color: theme.colors.text}]}>
          {item.label}
        </Text>
        <Text style={[styles.categoryCount, {color: theme.colors.textSecondary}]}>
          {item.count} positions
        </Text>
      </TouchableOpacity>
    ),
    [theme, selectedCategory, handleCategorySelect],
  );

  const selectedCategoryInfo = POSITION_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            light();
            if (selectedCategory && !initialCategory) {
              setSelectedCategory(null);
            } else {
              navigation.goBack();
            }
          }}
          accessibilityLabel="Go back">
          <Text style={{color: theme.colors.text, fontSize: 24}}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          {selectedCategory ? selectedCategoryInfo?.label || 'Category' : 'Browse Categories'}
        </Text>
        <View style={{width: 24}} />
      </View>

      {selectedCategory ? (
        // Filtered position list
        <FlatList
          data={filteredPositions}
          renderItem={renderPositionCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
              No positions in this category.
            </Text>
          }
        />
      ) : (
        // Category grid
        <FlatList
          data={categoryData}
          renderItem={renderCategoryCard}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  gridContent: {
    padding: SPACING.sm,
    paddingBottom: 100,
  },
  listContent: {
    paddingBottom: 100,
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

export default CategoryBrowseScreen;
