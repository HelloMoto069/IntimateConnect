import React, {useCallback, useMemo} from 'react';
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
  GUIDE_CATEGORIES,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@utils/constants';
import {normalize} from '@utils/helpers';
import FilterChips from '@components/common/FilterChips';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeInDown} from 'react-native-reanimated';

const DIFFICULTY_COLORS = {
  beginner: '#4CAF50',
  intermediate: '#FF9800',
  advanced: '#F44336',
};

const GuidesScreen = () => {
  const {theme, isDark} = useTheme();
  const {health} = useContent();
  const navigation = useNavigation();
  const {selection} = useHaptic();

  const gradients = isDark ? GRADIENTS.dark : GRADIENTS.light;

  const filterOptions = useMemo(
    () => GUIDE_CATEGORIES.map(c => ({value: c.id, label: `${c.icon} ${c.label}`})),
    [],
  );

  const handleGuidePress = useCallback(
    guideId => {
      selection();
      navigation.navigate(SCREEN_NAMES.HEALTH_GUIDE_PLAYER, {guideId});
    },
    [navigation, selection],
  );

  const renderGuideCard = ({item, index}) => {
    const completed = health.isGuideCompleted(item.id);
    const diffColor = DIFFICULTY_COLORS[item.difficulty] || '#999';

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleGuidePress(item.id)}
          style={[styles.guideCard, {backgroundColor: theme.colors.surface}]}>
          <LinearGradient
            colors={[gradients.primary[0] + '15', gradients.primary[1] + '05']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientOverlay}
          />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.guideIcon}>{item.icon}</Text>
              {completed && <Text style={styles.completedIcon}>✅</Text>}
            </View>
            <Text style={[styles.guideName, {color: theme.colors.text}]}>
              {item.title}
            </Text>
            <Text
              style={[styles.guideDesc, {color: theme.colors.textSecondary}]}
              numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.metaRow}>
                <Text style={[styles.duration, {color: theme.colors.textSecondary}]}>
                  {item.duration} min
                </Text>
                <View style={[styles.diffBadge, {backgroundColor: diffColor + '20'}]}>
                  <Text style={[styles.diffText, {color: diffColor}]}>
                    {item.difficulty}
                  </Text>
                </View>
              </View>
              <View style={[styles.startBtn, {backgroundColor: theme.colors.primary + '20'}]}>
                <Text style={[styles.startText, {color: theme.colors.primary}]}>
                  {completed ? 'Redo' : 'Start'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Wellness Guides
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Step-by-step practices for your wellbeing
        </Text>
      </View>

      {/* Category Filter */}
      <View style={styles.filterRow}>
        <FilterChips
          options={filterOptions}
          selected={health.guideCategoryFilter}
          onSelect={health.filterGuidesByCategory}
        />
      </View>

      {/* Guides List */}
      <FlatList
        data={health.filteredGuides}
        renderItem={renderGuideCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
              No guides found
            </Text>
          </View>
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
    ...TYPOGRAPHY.hero,
    marginTop: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.xs,
  },
  filterRow: {
    paddingVertical: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  guideCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  guideIcon: {
    fontSize: 32,
  },
  completedIcon: {
    fontSize: 20,
  },
  guideName: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  guideDesc: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  duration: {
    ...TYPOGRAPHY.caption,
  },
  diffBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  diffText: {
    fontSize: normalize(11),
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  startBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  startText: {
    fontSize: normalize(13),
    fontWeight: '600',
  },
  emptyContainer: {
    paddingTop: SPACING.xxl * 2,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
  },
});

export default GuidesScreen;
