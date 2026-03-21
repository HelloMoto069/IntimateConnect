import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import GlassCard from '@components/common/GlassCard';
import {SCREEN_NAMES, SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import Animated, {FadeInDown} from 'react-native-reanimated';

const QuickCard = ({icon, label, value, onPress, delay, theme}) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.cardWrapper}>
    <GlassCard onPress={onPress} style={styles.quickCard}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={[styles.cardValue, {color: theme.colors.primary}]}>{value}</Text>
      <Text style={[styles.cardLabel, {color: theme.colors.textSecondary}]}>{label}</Text>
    </GlassCard>
  </Animated.View>
);

const TrackerDashboard = ({journalCount, kegelStats, goalStats, badgeCount}) => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const {selection} = useHaptic();

  const nav = screen => {
    selection();
    navigation.navigate(screen);
  };

  const navMood = () => {
    selection();
    navigation.navigate(SCREEN_NAMES.HEALTH, {
      screen: SCREEN_NAMES.HEALTH_CHECKIN,
    });
  };

  return (
    <View>
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        Wellness Tracker
      </Text>
      <View style={styles.grid}>
        <QuickCard
          icon="📝"
          label="Journal"
          value={journalCount}
          onPress={() => nav(SCREEN_NAMES.TRACKER_JOURNAL)}
          delay={50}
          theme={theme}
        />
        <QuickCard
          icon="💪"
          label="Kegel"
          value={kegelStats.totalSessions}
          onPress={() => nav(SCREEN_NAMES.TRACKER_KEGEL)}
          delay={100}
          theme={theme}
        />
        <QuickCard
          icon="🎯"
          label="Goals"
          value={goalStats.inProgress}
          onPress={() => nav(SCREEN_NAMES.TRACKER_GOALS)}
          delay={150}
          theme={theme}
        />
        <QuickCard
          icon="🏅"
          label="Badges"
          value={badgeCount}
          onPress={() => nav(SCREEN_NAMES.TRACKER_BADGES)}
          delay={200}
          theme={theme}
        />
      </View>

      {/* Mood shortcut */}
      <Animated.View entering={FadeInDown.delay(250).duration(400)}>
        <TouchableOpacity
          onPress={navMood}
          activeOpacity={0.7}
          style={[styles.moodRow, {backgroundColor: theme.colors.surface + 'B3'}]}>
          <Text style={styles.moodIcon}>💭</Text>
          <Text style={[styles.moodText, {color: theme.colors.text}]}>
            Mood Check-In
          </Text>
          <Text style={[styles.moodArrow, {color: theme.colors.textSecondary}]}>
            →
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardWrapper: {
    width: '47%',
  },
  quickCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  cardValue: {
    fontSize: normalize(24),
    fontWeight: '800',
  },
  cardLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.md,
  },
  moodIcon: {
    fontSize: 22,
  },
  moodText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  moodArrow: {
    fontSize: 18,
  },
});

export default TrackerDashboard;
