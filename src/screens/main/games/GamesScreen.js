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
  GAME_CATEGORIES,
  GAME_LEVELS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@utils/constants';
import {wp, hp, normalize} from '@utils/helpers';
import LinearGradient from 'react-native-linear-gradient';
import FilterChips from '@components/common/FilterChips';

const SCREEN_MAP = {
  'truth-or-dare': SCREEN_NAMES.GAME_TRUTH_OR_DARE,
  'would-you-rather': SCREEN_NAMES.GAME_WOULD_YOU_RATHER,
  'intimacy-quiz': SCREEN_NAMES.GAME_QUIZ,
  'desire-dice': {screen: SCREEN_NAMES.GAME_MINI, params: {initialTab: 'dice'}},
  '36-questions': {screen: SCREEN_NAMES.GAME_MINI, params: {initialTab: '36questions'}},
  'mood-match': {screen: SCREEN_NAMES.GAME_MINI, params: {initialTab: 'moodmatch'}},
};

const GamesScreen = () => {
  const {theme, isDark} = useTheme();
  const {games} = useContent();
  const navigation = useNavigation();
  const {selection} = useHaptic();

  const handleGamePress = useCallback(
    gameId => {
      selection();
      const target = SCREEN_MAP[gameId];
      if (typeof target === 'string') {
        navigation.navigate(target);
      } else {
        navigation.navigate(target.screen, target.params);
      }
      games.addGameSession(gameId);
    },
    [navigation, selection, games],
  );

  const formatLastPlayed = dateStr => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const gradients = isDark ? GRADIENTS.dark : GRADIENTS.light;

  const renderGameCard = ({item, index}) => {
    const lastPlayed = games.getLastPlayed(item.id);
    const gradient = gradients[item.gradient] || gradients.primary;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleGamePress(item.id)}
        style={styles.cardWrapper}>
        <View
          style={[
            styles.gameCard,
            {backgroundColor: theme.colors.surface},
          ]}>
          <LinearGradient
            colors={[gradient[0] + '30', gradient[1] + '10']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientOverlay}
          />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.gameIcon}>{item.icon}</Text>
              {lastPlayed && (
                <Text
                  style={[
                    styles.lastPlayed,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {formatLastPlayed(lastPlayed)}
                </Text>
              )}
            </View>
            <Text style={[styles.gameName, {color: theme.colors.text}]}>
              {item.label}
            </Text>
            <Text
              style={[
                styles.gameDescription,
                {color: theme.colors.textSecondary},
              ]}>
              {item.description}
            </Text>
            <View style={styles.playRow}>
              <View
                style={[
                  styles.playBtn,
                  {backgroundColor: gradient[0] + '20'},
                ]}>
                <Text style={[styles.playText, {color: gradient[0]}]}>
                  Play Now
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const levelChips = GAME_LEVELS.map(l => ({
    id: l.id,
    label: l.label,
  }));

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Couples Games
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Play together, grow closer
        </Text>
      </View>

      {/* Level Filter */}
      <View style={styles.filterRow}>
        <FilterChips
          chips={levelChips}
          selectedId={games.levelPreference}
          onSelect={games.setLevelPreference}
        />
      </View>

      {/* Games List */}
      <FlatList
        data={GAME_CATEGORIES}
        renderItem={renderGameCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  filterRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  cardWrapper: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gameCard: {
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
  gameIcon: {
    fontSize: 36,
  },
  lastPlayed: {
    ...TYPOGRAPHY.caption,
  },
  gameName: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xs,
  },
  gameDescription: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.md,
  },
  playRow: {
    flexDirection: 'row',
  },
  playBtn: {
    paddingHorizontal: SPACING.md + 4,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  playText: {
    fontSize: normalize(13),
    fontWeight: '600',
  },
});

export default GamesScreen;
