import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {WELLNESS_MOODS, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import GradientButton from '@components/common/GradientButton';
import GlassCard from '@components/common/GlassCard';
import {MoodSelector} from '@components/health';
import Animated, {FadeInDown} from 'react-native-reanimated';

const WellnessCheckInScreen = () => {
  const {theme} = useTheme();
  const {health} = useContent();
  const navigation = useNavigation();
  const {selection, success} = useHaptic();

  const [selectedMood, setSelectedMood] = useState(health.todaysMood?.moodId || null);
  const [note, setNote] = useState('');
  const [justLogged, setJustLogged] = useState(false);

  const handleMoodSelect = useCallback(
    moodId => {
      selection();
      setSelectedMood(moodId);
    },
    [selection],
  );

  const handleLogMood = useCallback(() => {
    if (!selectedMood) return;
    success();
    health.addMoodEntry(selectedMood, note.trim() || undefined);
    setNote('');
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);
  }, [selectedMood, note, health, success]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const moodMap = {};
  WELLNESS_MOODS.forEach(m => {
    moodMap[m.id] = m;
  });

  const renderHistoryItem = ({item, index}) => {
    const mood = moodMap[item.moodId];
    const date = new Date(item.date);
    const dayLabel = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const isToday =
      date.toDateString() === today.toDateString();

    return (
      <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
        <View
          style={[
            styles.historyItem,
            {backgroundColor: theme.colors.surface},
            isToday && {borderColor: theme.colors.primary, borderWidth: 1},
          ]}>
          <View style={styles.historyLeft}>
            <Text style={styles.historyEmoji}>{mood?.emoji || '❓'}</Text>
            <View>
              <Text style={[styles.historyMood, {color: mood?.color || theme.colors.text}]}>
                {mood?.label || item.moodId}
              </Text>
              <Text style={[styles.historyDate, {color: theme.colors.textSecondary}]}>
                {isToday ? 'Today' : dayLabel}
              </Text>
            </View>
          </View>
          {item.note && (
            <Text style={styles.historyNoteIcon}>📝</Text>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                  <Text style={[styles.backText, {color: theme.colors.primary}]}>
                    ← Back
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.title, {color: theme.colors.text}]}>
                  Wellness Check-In
                </Text>
                <Text style={[styles.dateText, {color: theme.colors.textSecondary}]}>
                  {dateStr}
                </Text>
              </View>

              {/* Mood Selection */}
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <GlassCard style={styles.moodCard}>
                  <Text style={[styles.questionText, {color: theme.colors.text}]}>
                    How are you feeling?
                  </Text>
                  <MoodSelector
                    moods={WELLNESS_MOODS}
                    selectedId={selectedMood}
                    onSelect={handleMoodSelect}
                  />
                </GlassCard>
              </Animated.View>

              {/* Note Input */}
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <View style={styles.noteSection}>
                  <Text style={[styles.noteLabel, {color: theme.colors.textSecondary}]}>
                    Add a private note (encrypted)
                  </Text>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="How's your day going..."
                    placeholderTextColor={theme.colors.textSecondary + '60'}
                    style={[
                      styles.noteInput,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.surfaceLight,
                      },
                    ]}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </Animated.View>

              {/* Log Button */}
              <View style={styles.logBtnContainer}>
                <GradientButton
                  label={
                    justLogged
                      ? 'Logged!'
                      : health.todaysMood
                      ? 'Update Mood'
                      : 'Log Mood'
                  }
                  onPress={handleLogMood}
                  disabled={!selectedMood}
                  style={styles.logBtn}
                />
              </View>

              {/* History Header */}
              {health.moodHistory.length > 0 && (
                <Text style={[styles.historyTitle, {color: theme.colors.text}]}>
                  Recent History
                </Text>
              )}
            </>
          }
          data={health.moodHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => `${item.date}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
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
  dateText: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.xs,
  },
  // Mood card
  moodCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  questionText: {
    ...TYPOGRAPHY.h3,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  // Note
  noteSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  noteLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  noteInput: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    fontSize: normalize(14),
    minHeight: 80,
    lineHeight: 22,
  },
  // Log button
  logBtnContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  logBtn: {
    width: '100%',
  },
  // History
  historyTitle: {
    ...TYPOGRAPHY.h3,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  historyEmoji: {
    fontSize: 28,
  },
  historyMood: {
    fontSize: normalize(14),
    fontWeight: '600',
  },
  historyDate: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  historyNoteIcon: {
    fontSize: 16,
  },
});

export default WellnessCheckInScreen;
