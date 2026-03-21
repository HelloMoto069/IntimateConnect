import React, {useState, useCallback} from 'react';
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
import {usePartner} from '@hooks/usePartner';
import {SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import {PositionCard} from '@components/positions';
import EmptyState from '@components/common/EmptyState';
import Animated, {FadeInDown} from 'react-native-reanimated';

const SharedFavoritesScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const couple = usePartner();
  const {positions, favorites, toggleFavorite} = useContent();
  const [refreshing, setRefreshing] = useState(false);

  // Resolve position objects from shared favorite IDs
  const sharedPositions = positions.filter(p =>
    couple.sharedFavorites.includes(p.id),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await couple.refreshSharedFavorites();
    setRefreshing(false);
  }, [couple]);

  const renderItem = ({item, index}) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={styles.cardWrapper}>
      <PositionCard
        position={item}
        mode="grid"
        isFavorite={favorites.includes(item.id)}
        onToggleFavorite={() => toggleFavorite(item.id)}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Shared Favorites
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          {sharedPositions.length} position{sharedPositions.length !== 1 ? 's' : ''} you both love
        </Text>
      </View>

      <FlatList
        data={sharedPositions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <EmptyState
            title="No Shared Favorites Yet"
            subtitle="Both you and your partner need to favorite the same positions for them to appear here."
          />
        }
      />
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
  title: {
    ...TYPOGRAPHY.h1,
    marginTop: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: SPACING.xs,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  row: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardWrapper: {
    flex: 1,
  },
});

export default SharedFavoritesScreen;
