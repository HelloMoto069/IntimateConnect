import React, {useState, useCallback, useMemo} from 'react';
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
import {useTrackerContext} from '@context/TrackerContext';
import {BADGE_DEFINITIONS, SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import BottomSheet from '@components/common/BottomSheet';
import {BadgeCard} from '@components/tracker';
import Animated, {FadeInDown} from 'react-native-reanimated';

const BadgesScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const tracker = useTrackerContext();

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const earnedMap = useMemo(() => {
    const map = {};
    tracker.earnedBadges.forEach(b => {
      map[b.badgeId] = b.earnedAt;
    });
    return map;
  }, [tracker.earnedBadges]);

  // Earned first, then unearned
  const sortedBadges = useMemo(() => {
    const earned = BADGE_DEFINITIONS.filter(b => earnedMap[b.id]);
    const unearned = BADGE_DEFINITIONS.filter(b => !earnedMap[b.id]);
    return [...earned, ...unearned];
  }, [earnedMap]);

  const handleBadgePress = useCallback(badge => {
    setSelectedBadge(badge);
    setDetailVisible(true);
  }, []);

  const renderItem = ({item, index}) => {
    const isEarned = !!earnedMap[item.id];
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(300)}
        style={styles.cardWrapper}>
        <BadgeCard
          badge={item}
          isEarned={isEarned}
          earnedAt={earnedMap[item.id]}
          onPress={() => handleBadgePress(item)}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, {color: theme.colors.text}]}>Achievements</Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          {tracker.badgeCount} of {BADGE_DEFINITIONS.length} badges earned
        </Text>
      </View>

      <FlatList
        data={sortedBadges}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Badge Detail BottomSheet */}
      <BottomSheet
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        title={selectedBadge?.name}>
        {selectedBadge && (
          <View style={styles.detailContent}>
            <Text style={styles.detailIcon}>{selectedBadge.icon}</Text>
            <Text style={[styles.detailDescription, {color: theme.colors.text}]}>
              {selectedBadge.description}
            </Text>
            {earnedMap[selectedBadge.id] && (
              <Text style={[styles.detailEarned, {color: theme.colors.primary}]}>
                Earned on{' '}
                {new Date(earnedMap[selectedBadge.id]).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            )}
            {!earnedMap[selectedBadge.id] && (
              <Text style={[styles.detailLocked, {color: theme.colors.textSecondary}]}>
                Not yet earned — keep going!
              </Text>
            )}
          </View>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.md},
  backBtn: {paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(15), fontWeight: '600'},
  title: {...TYPOGRAPHY.hero, marginTop: SPACING.sm},
  subtitle: {...TYPOGRAPHY.bodySmall, marginTop: SPACING.xs},
  list: {paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl},
  row: {gap: SPACING.md, marginBottom: SPACING.md},
  cardWrapper: {flex: 1},
  // Detail
  detailContent: {alignItems: 'center', paddingHorizontal: 20, paddingBottom: SPACING.xl},
  detailIcon: {fontSize: 56, marginBottom: SPACING.md},
  detailDescription: {...TYPOGRAPHY.body, textAlign: 'center', marginBottom: SPACING.md},
  detailEarned: {fontSize: normalize(14), fontWeight: '600'},
  detailLocked: {...TYPOGRAPHY.bodySmall, fontStyle: 'italic'},
});

export default BadgesScreen;
