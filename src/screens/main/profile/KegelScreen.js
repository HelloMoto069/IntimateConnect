import React, {useMemo} from 'react';
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
import {SCREEN_NAMES, KEGEL_INTENSITIES, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import GlassCard from '@components/common/GlassCard';
import GradientButton from '@components/common/GradientButton';
import EmptyState from '@components/common/EmptyState';
import Animated, {FadeInDown} from 'react-native-reanimated';

const StatBox = ({value, label, theme}) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, {color: theme.colors.primary}]}>{value}</Text>
    <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>{label}</Text>
  </View>
);

const KegelScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const tracker = useTrackerContext();
  const {kegelStats, kegelSessions} = tracker;

  // Weekly bars
  const weekBars = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const counts = Array(7).fill(0);
    kegelSessions.forEach(s => {
      const d = new Date(s.completedAt);
      if (d >= weekStart) {
        counts[d.getDay()]++;
      }
    });

    const max = Math.max(...counts, 1);
    return days.map((day, i) => ({day, count: counts[i], pct: (counts[i] / max) * 100}));
  }, [kegelSessions]);

  const intensityMap = {};
  KEGEL_INTENSITIES.forEach(k => { intensityMap[k.id] = k; });

  const renderSession = ({item, index}) => {
    const intensity = intensityMap[item.intensity];
    const date = new Date(item.completedAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
    const mins = Math.round(item.durationSeconds / 60);

    return (
      <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
        <View style={[styles.sessionRow, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.sessionInfo}>
            <Text style={[styles.sessionDate, {color: theme.colors.text}]}>{date}</Text>
            <Text style={[styles.sessionMeta, {color: theme.colors.textSecondary}]}>
              {item.reps} reps • {mins} min
            </Text>
          </View>
          <View style={[styles.intensityBadge, {backgroundColor: (intensity?.color || '#999') + '20'}]}>
            <Text style={[styles.intensityText, {color: intensity?.color || '#999'}]}>
              {intensity?.label || item.intensity}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
              </TouchableOpacity>
              <Text style={[styles.title, {color: theme.colors.text}]}>Kegel Tracker</Text>
            </View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.delay(50).duration(400)}>
              <GlassCard style={styles.statsCard}>
                <View style={styles.statsRow}>
                  <StatBox value={kegelStats.totalSessions} label="Sessions" theme={theme} />
                  <View style={[styles.statDivider, {backgroundColor: theme.colors.surfaceLight}]} />
                  <StatBox value={kegelStats.totalMinutes} label="Minutes" theme={theme} />
                  <View style={[styles.statDivider, {backgroundColor: theme.colors.surfaceLight}]} />
                  <StatBox value={kegelStats.currentStreak} label={kegelStats.currentStreak > 0 ? 'Streak 🔥' : 'Streak'} theme={theme} />
                  <View style={[styles.statDivider, {backgroundColor: theme.colors.surfaceLight}]} />
                  <StatBox value={kegelStats.thisWeekSessions} label="This Week" theme={theme} />
                </View>
              </GlassCard>
            </Animated.View>

            {/* Start Session */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.startSection}>
              <GradientButton
                label="Start Session"
                onPress={() => navigation.navigate(SCREEN_NAMES.TRACKER_KEGEL_TIMER)}
                style={styles.startBtn}
              />
            </Animated.View>

            {/* Weekly Chart */}
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>This Week</Text>
              <View style={styles.weekChart}>
                {weekBars.map(bar => (
                  <View key={bar.day} style={styles.barCol}>
                    <View style={[styles.barTrack, {backgroundColor: theme.colors.surfaceLight}]}>
                      <View
                        style={[
                          styles.barFill,
                          {backgroundColor: theme.colors.primary, height: `${Math.max(bar.pct, 4)}%`},
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, {color: theme.colors.textSecondary}]}>{bar.day}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Recent Sessions</Text>
          </>
        }
        data={kegelSessions.slice(0, 20)}
        renderItem={renderSession}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No Sessions Yet"
            subtitle="Start your first kegel session to begin tracking."
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm},
  backBtn: {paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(15), fontWeight: '600'},
  title: {...TYPOGRAPHY.hero, marginTop: SPACING.sm},
  statsCard: {marginHorizontal: SPACING.md, marginTop: SPACING.md},
  statsRow: {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'},
  statBox: {alignItems: 'center', flex: 1},
  statValue: {fontSize: normalize(22), fontWeight: '800'},
  statLabel: {...TYPOGRAPHY.caption, fontWeight: '600', marginTop: 2},
  statDivider: {width: 1, height: 30},
  startSection: {paddingHorizontal: SPACING.md, marginTop: SPACING.lg},
  startBtn: {width: '100%'},
  sectionTitle: {...TYPOGRAPHY.h3, paddingHorizontal: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.md},
  weekChart: {flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, height: 100},
  barCol: {flex: 1, alignItems: 'center'},
  barTrack: {flex: 1, width: '100%', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end'},
  barFill: {width: '100%', borderRadius: 4},
  barLabel: {...TYPOGRAPHY.caption, marginTop: 4},
  list: {paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.sm},
  sessionRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.md},
  sessionInfo: {},
  sessionDate: {...TYPOGRAPHY.bodySmall, fontWeight: '600'},
  sessionMeta: {...TYPOGRAPHY.caption, marginTop: 2},
  intensityBadge: {paddingHorizontal: SPACING.sm + 2, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full},
  intensityText: {fontSize: normalize(11), fontWeight: '600'},
});

export default KegelScreen;
