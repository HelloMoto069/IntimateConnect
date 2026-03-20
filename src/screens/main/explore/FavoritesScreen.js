import React, {useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {EmptyState} from '@components/common';
import {PositionCard} from '@components/positions';
import {SPACING} from '@utils/constants';

const FavoritesScreen = ({navigation}) => {
  const {theme} = useTheme();
  const {light} = useHaptic();
  const {favoritePositions, favorites, toggleFavorite} = useContent();

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
          accessibilityLabel="Go back">
          <Text style={{color: theme.colors.text, fontSize: 24}}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          Favorites
        </Text>
        <View style={{width: 24}} />
      </View>

      {favoritePositions.length > 0 ? (
        <FlatList
          data={favoritePositions}
          renderItem={renderPositionCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.countText, {color: theme.colors.textSecondary}]}>
              {favoritePositions.length} favorite{favoritePositions.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      ) : (
        <EmptyState
          title="No Favorites Yet"
          subtitle="Tap the heart icon on any position to save it to your favorites."
          actionLabel="Explore Positions"
          onAction={() => navigation.goBack()}
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
  countText: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 100,
  },
});

export default FavoritesScreen;
