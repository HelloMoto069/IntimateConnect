import React, {useState, useCallback, useEffect, useRef} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {SearchBar} from '@components/common';
import {PositionCard} from '@components/positions';
import {SPACING} from '@utils/constants';
import {debounce} from '@utils/helpers';

const SearchScreen = ({navigation}) => {
  const {theme} = useTheme();
  const {light} = useHaptic();
  const {
    filteredPositions,
    searchPositions,
    favorites,
    toggleFavorite,
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useContent();

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [getRecentSearches]);

  // Debounced search
  const debouncedSearch = useRef(
    debounce(q => {
      searchPositions(q);
      setHasSearched(true);
    }, 300),
  ).current;

  const handleQueryChange = useCallback(
    text => {
      setQuery(text);
      if (text.trim()) {
        debouncedSearch(text);
      } else {
        searchPositions('');
        setHasSearched(false);
      }
    },
    [debouncedSearch, searchPositions],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    searchPositions('');
    setHasSearched(false);
  }, [searchPositions]);

  const handleRecentSearch = useCallback(
    term => {
      setQuery(term);
      searchPositions(term);
      setHasSearched(true);
    },
    [searchPositions],
  );

  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
    }
  }, [query, addRecentSearch, getRecentSearches]);

  const handleClearHistory = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, [clearRecentSearches]);

  // Clean up search on unmount
  useEffect(() => {
    return () => {
      searchPositions('');
    };
  }, [searchPositions]);

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

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            light();
            navigation.goBack();
          }}
          style={styles.backButton}
          accessibilityLabel="Go back">
          <Text style={{color: theme.colors.text, fontSize: 24}}>{'\u2190'}</Text>
        </TouchableOpacity>
        <SearchBar
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search positions..."
          onClear={handleClear}
          style={styles.searchBar}
        />
      </View>

      {/* Recent searches (when no query) */}
      {!hasSearched && recentSearches.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, {color: theme.colors.text}]}>
              Recent Searches
            </Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={{color: theme.colors.primary, fontSize: 13}}>Clear</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((term, index) => (
            <TouchableOpacity
              key={`${term}-${index}`}
              style={[styles.recentItem, {borderBottomColor: theme.colors.surfaceLight}]}
              onPress={() => handleRecentSearch(term)}>
              <Text style={{color: theme.colors.textSecondary, marginRight: 8}}>
                {'\uD83D\uDD52'}
              </Text>
              <Text style={[styles.recentText, {color: theme.colors.text}]}>
                {term}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search results */}
      {hasSearched && (
        <FlatList
          data={filteredPositions}
          renderItem={renderPositionCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={handleSubmit}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>{'\uD83D\uDD0D'}</Text>
              <Text style={[styles.emptyText, {color: theme.colors.text}]}>
                No positions found
              </Text>
              <Text style={[styles.emptySubtext, {color: theme.colors.textSecondary}]}>
                Try a different search term
              </Text>
            </View>
          }
          ListHeaderComponent={
            filteredPositions.length > 0 ? (
              <Text style={[styles.resultCount, {color: theme.colors.textSecondary}]}>
                {filteredPositions.length} result{filteredPositions.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
  },
  recentSection: {
    paddingHorizontal: SPACING.md,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recentText: {
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 100,
  },
  resultCount: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
  },
});

export default SearchScreen;
