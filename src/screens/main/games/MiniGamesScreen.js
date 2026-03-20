import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {DiceRoller} from '@components/games';
import GradientButton from '@components/common/GradientButton';
import GlassCard from '@components/common/GlassCard';
import FilterChips from '@components/common/FilterChips';
import BottomSheet from '@components/common/BottomSheet';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {wp, normalize} from '@utils/helpers';

// ─── Dice Tab ───────────────────────────────────────────
const DiceTab = () => {
  const {theme} = useTheme();
  const {games} = useContent();
  const {heavy} = useHaptic();
  const [timerDuration, setTimerDuration] = useState(0);

  const timerChips = [
    {id: '0', label: 'No Timer'},
    {id: '30', label: '30s'},
    {id: '60', label: '60s'},
    {id: '120', label: '2min'},
  ];

  const handleRoll = useCallback(() => {
    heavy();
    games.rollDice();
  }, [games, heavy]);

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={[styles.tabTitle, {color: theme.colors.text}]}>
        🎲 Desire Dice
      </Text>
      <Text style={[styles.tabSubtitle, {color: theme.colors.textSecondary}]}>
        Roll for a spontaneous action combo
      </Text>

      <DiceRoller
        actionResult={games.diceResult?.action}
        bodyPartResult={games.diceResult?.bodyPart}
        onRoll={handleRoll}
        timerDuration={timerDuration}
        onTimerEnd={() => {}}
      />

      <View style={styles.timerSection}>
        <Text
          style={[styles.timerLabel, {color: theme.colors.textSecondary}]}>
          Timer Duration
        </Text>
        <FilterChips
          chips={timerChips}
          selectedId={String(timerDuration)}
          onSelect={id => setTimerDuration(parseInt(id, 10))}
        />
      </View>
    </ScrollView>
  );
};

// ─── 36 Questions Tab ───────────────────────────────────
const ThirtySixTab = () => {
  const {theme} = useTheme();
  const {games} = useContent();
  const {selection} = useHaptic();
  const [showReset, setShowReset] = useState(false);

  const currentQuestion = games.getCurrentThirtySixQuestion();
  const totalInSet = 12;
  const overallProgress =
    ((games.thirtySixState.set - 1) * 12 + games.thirtySixState.question) / 36;
  const isComplete =
    games.thirtySixState.set === 3 && games.thirtySixState.question === 12;

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={[styles.tabTitle, {color: theme.colors.text}]}>
        💬 36 Questions
      </Text>
      <Text style={[styles.tabSubtitle, {color: theme.colors.textSecondary}]}>
        Questions designed to deepen your bond
      </Text>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text
            style={[styles.setLabel, {color: theme.colors.primary}]}>
            Set {games.thirtySixState.set} of 3
          </Text>
          <Text
            style={[styles.questionNum, {color: theme.colors.textSecondary}]}>
            Question {games.thirtySixState.question} of {totalInSet}
          </Text>
        </View>
        <View
          style={[
            styles.progressBarBg,
            {backgroundColor: theme.colors.surfaceLight},
          ]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${overallProgress * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Question Card */}
      {currentQuestion && (
        <GlassCard style={styles.questionCard}>
          <Text
            style={[styles.questionNumber, {color: theme.colors.primary}]}>
            #{(games.thirtySixState.set - 1) * 12 + games.thirtySixState.question}
          </Text>
          <Text style={[styles.questionText, {color: theme.colors.text}]}>
            {currentQuestion.text}
          </Text>
        </GlassCard>
      )}

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => {
            games.prev36Question();
            selection();
          }}
          disabled={
            games.thirtySixState.set === 1 &&
            games.thirtySixState.question === 1
          }
          style={[
            styles.navBtn,
            {
              backgroundColor: theme.colors.surfaceLight,
              opacity:
                games.thirtySixState.set === 1 &&
                games.thirtySixState.question === 1
                  ? 0.4
                  : 1,
            },
          ]}>
          <Text style={[styles.navBtnText, {color: theme.colors.text}]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            games.advance36Question();
            selection();
          }}
          disabled={isComplete}
          style={[
            styles.navBtn,
            {
              backgroundColor: isComplete
                ? theme.colors.surfaceLight
                : theme.colors.primary + '20',
              opacity: isComplete ? 0.4 : 1,
            },
          ]}>
          <Text
            style={[
              styles.navBtnText,
              {color: isComplete ? theme.colors.text : theme.colors.primary},
            ]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      {isComplete && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.completeBanner}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={[styles.completeText, {color: theme.colors.text}]}>
            You've completed all 36 questions!
          </Text>
        </Animated.View>
      )}

      <TouchableOpacity
        onPress={() => setShowReset(true)}
        style={styles.resetLink}>
        <Text
          style={[styles.resetLinkText, {color: theme.colors.textSecondary}]}>
          Reset Progress
        </Text>
      </TouchableOpacity>

      <BottomSheet
        isVisible={showReset}
        onClose={() => setShowReset(false)}
        title="Reset Progress?">
        <Text
          style={[styles.resetMessage, {color: theme.colors.textSecondary}]}>
          This will start you back at Question 1, Set 1. Your progress cannot
          be recovered.
        </Text>
        <GradientButton
          title="Reset"
          onPress={() => {
            games.reset36Progress();
            setShowReset(false);
          }}
          variant="secondary"
        />
      </BottomSheet>
    </ScrollView>
  );
};

// ─── Mood Match Tab ─────────────────────────────────────
const MoodMatchTab = () => {
  const {theme} = useTheme();
  const {games} = useContent();
  const {selection, success} = useHaptic();
  const [selectedCards, setSelectedCards] = useState([]);

  const isPartnerA = games.moodState.phase === 'partnerA';
  const isPartnerB = games.moodState.phase === 'partnerB';
  const isReveal = games.moodState.phase === 'reveal';

  const toggleCard = useCallback(
    cardId => {
      selection();
      setSelectedCards(prev => {
        if (prev.includes(cardId)) {
          return prev.filter(id => id !== cardId);
        }
        if (prev.length >= 3) return prev;
        return [...prev, cardId];
      });
    },
    [selection],
  );

  const lockIn = useCallback(() => {
    if (selectedCards.length !== 3) return;
    success();
    games.selectMoodCards(isPartnerA ? 'A' : 'B', selectedCards);
    setSelectedCards([]);
  }, [selectedCards, games, isPartnerA, success]);

  const handleNewRound = useCallback(() => {
    games.resetMoodMatch();
    setSelectedCards([]);
    selection();
  }, [games, selection]);

  // Reveal Phase
  if (isReveal) {
    const results = games.getMoodMatchResults();
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Text style={[styles.tabTitle, {color: theme.colors.text}]}>
            {results.matchCount >= 2 ? '🎉' : '😮'} Mood Match Results
          </Text>
          <Text
            style={[styles.tabSubtitle, {color: theme.colors.textSecondary}]}>
            {results.matchCount} of 3 moods matched!
          </Text>

          <View style={styles.moodResultsRow}>
            <View style={styles.moodResultColumn}>
              <Text
                style={[
                  styles.moodResultLabel,
                  {color: theme.colors.textSecondary},
                ]}>
                Partner A
              </Text>
              {results.partnerA.map(cardId => {
                const card = games.moodCards.find(c => c.id === cardId);
                const isMatch = results.matches.includes(cardId);
                return (
                  <Animated.View
                    key={cardId}
                    entering={FadeInDown.delay(200).duration(300)}
                    style={[
                      styles.moodResultCard,
                      {
                        backgroundColor: isMatch
                          ? card.color + '30'
                          : theme.colors.surfaceLight,
                        borderColor: isMatch ? card.color : 'transparent',
                        borderWidth: isMatch ? 2 : 0,
                      },
                    ]}>
                    <Text style={styles.moodResultEmoji}>{card?.emoji}</Text>
                    <Text
                      style={[
                        styles.moodResultName,
                        {color: theme.colors.text},
                      ]}>
                      {card?.label}
                    </Text>
                    {isMatch && <Text style={styles.matchBadge}>✨</Text>}
                  </Animated.View>
                );
              })}
            </View>

            <View style={styles.moodResultColumn}>
              <Text
                style={[
                  styles.moodResultLabel,
                  {color: theme.colors.textSecondary},
                ]}>
                Partner B
              </Text>
              {results.partnerB.map(cardId => {
                const card = games.moodCards.find(c => c.id === cardId);
                const isMatch = results.matches.includes(cardId);
                return (
                  <Animated.View
                    key={cardId}
                    entering={FadeInDown.delay(400).duration(300)}
                    style={[
                      styles.moodResultCard,
                      {
                        backgroundColor: isMatch
                          ? card.color + '30'
                          : theme.colors.surfaceLight,
                        borderColor: isMatch ? card.color : 'transparent',
                        borderWidth: isMatch ? 2 : 0,
                      },
                    ]}>
                    <Text style={styles.moodResultEmoji}>{card?.emoji}</Text>
                    <Text
                      style={[
                        styles.moodResultName,
                        {color: theme.colors.text},
                      ]}>
                      {card?.label}
                    </Text>
                    {isMatch && <Text style={styles.matchBadge}>✨</Text>}
                  </Animated.View>
                );
              })}
            </View>
          </View>

          <GradientButton
            title="Play Again"
            onPress={handleNewRound}
            style={styles.playAgainBtn}
          />
        </Animated.View>
      </ScrollView>
    );
  }

  // Selection Phase (Partner A or B)
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View
        style={[
          styles.partnerIndicator,
          {backgroundColor: theme.colors.primary + '20'},
        ]}>
        <Text style={[styles.partnerIndicatorText, {color: theme.colors.primary}]}>
          {isPartnerA ? 'Partner A' : 'Partner B'} — Pick 3 Moods
        </Text>
      </View>

      <Text style={[styles.tabSubtitle, {color: theme.colors.textSecondary}]}>
        How are you feeling tonight? Select 3 cards.
      </Text>

      <View style={styles.moodGrid}>
        {games.moodCards.map(card => {
          const isSelected = selectedCards.includes(card.id);
          return (
            <TouchableOpacity
              key={card.id}
              onPress={() => toggleCard(card.id)}
              activeOpacity={0.7}
              style={[
                styles.moodCard,
                {
                  backgroundColor: isSelected
                    ? card.color + '30'
                    : theme.colors.surface,
                  borderColor: isSelected ? card.color : theme.colors.surfaceLight,
                },
              ]}>
              <Text style={styles.moodEmoji}>{card.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  {color: isSelected ? card.color : theme.colors.text},
                ]}>
                {card.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text
        style={[styles.selectionCount, {color: theme.colors.textSecondary}]}>
        {selectedCards.length}/3 selected
      </Text>

      <GradientButton
        title="Lock In"
        onPress={lockIn}
        disabled={selectedCards.length !== 3}
        style={styles.lockInBtn}
      />

      {/* Pass phone reminder for between partners */}
      {isPartnerB && (
        <Text style={[styles.passReminder, {color: theme.colors.textSecondary}]}>
          Don't let Partner A see your choices!
        </Text>
      )}
    </ScrollView>
  );
};

// ─── Main Screen ────────────────────────────────────────
const TABS = [
  {id: 'dice', label: '🎲 Dice'},
  {id: '36questions', label: '💬 36 Q'},
  {id: 'moodmatch', label: '🎨 Mood'},
];

const MiniGamesScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const {selection} = useHaptic();
  const [activeTab, setActiveTab] = useState(
    route.params?.initialTab || 'dice',
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.text}]}>
            ← Back
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => {
              setActiveTab(tab.id);
              selection();
            }}
            style={[
              styles.tabItem,
              {
                backgroundColor:
                  activeTab === tab.id
                    ? theme.colors.primary + '20'
                    : theme.colors.surfaceLight,
              },
            ]}>
            <Text
              style={[
                styles.tabItemText,
                {
                  color:
                    activeTab === tab.id
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'dice' && <DiceTab />}
      {activeTab === '36questions' && <ThirtySixTab />}
      {activeTab === 'moodmatch' && <MoodMatchTab />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center'},
  backBtn: {paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(16), fontWeight: '500'},
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  tabItemText: {fontSize: normalize(13), fontWeight: '600'},
  tabContent: {paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl},
  tabTitle: {...TYPOGRAPHY.h1, textAlign: 'center', marginBottom: SPACING.xs},
  tabSubtitle: {...TYPOGRAPHY.bodySmall, textAlign: 'center', marginBottom: SPACING.lg},

  // Dice
  timerSection: {marginTop: SPACING.lg, alignItems: 'center'},
  timerLabel: {...TYPOGRAPHY.bodySmall, fontWeight: '600', marginBottom: SPACING.sm},

  // 36 Questions
  progressSection: {marginBottom: SPACING.lg},
  progressRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm},
  setLabel: {...TYPOGRAPHY.bodySmall, fontWeight: '700'},
  questionNum: {...TYPOGRAPHY.caption},
  progressBarBg: {height: 6, borderRadius: 3, overflow: 'hidden'},
  progressBarFill: {height: '100%', borderRadius: 3},
  questionCard: {padding: SPACING.xl, marginBottom: SPACING.lg, minHeight: 200, justifyContent: 'center'},
  questionNumber: {fontSize: normalize(14), fontWeight: '700', marginBottom: SPACING.sm},
  questionText: {...TYPOGRAPHY.h3, lineHeight: 30, textAlign: 'center'},
  navRow: {flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg},
  navBtn: {flex: 1, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center'},
  navBtnText: {...TYPOGRAPHY.button},
  completeBanner: {alignItems: 'center', marginBottom: SPACING.lg},
  completeEmoji: {fontSize: 48, marginBottom: SPACING.sm},
  completeText: {...TYPOGRAPHY.body, textAlign: 'center'},
  resetLink: {alignSelf: 'center', padding: SPACING.sm},
  resetLinkText: {...TYPOGRAPHY.bodySmall, textDecorationLine: 'underline'},
  resetMessage: {...TYPOGRAPHY.body, marginBottom: SPACING.lg, textAlign: 'center'},

  // Mood Match
  partnerIndicator: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  partnerIndicatorText: {fontSize: normalize(14), fontWeight: '600'},
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  moodCard: {
    width: wp(27),
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  moodEmoji: {fontSize: 24, marginBottom: SPACING.xs},
  moodLabel: {fontSize: normalize(11), fontWeight: '600', textAlign: 'center'},
  selectionCount: {...TYPOGRAPHY.bodySmall, textAlign: 'center', marginBottom: SPACING.md},
  lockInBtn: {alignSelf: 'center', width: '60%'},
  passReminder: {...TYPOGRAPHY.caption, textAlign: 'center', marginTop: SPACING.md, fontStyle: 'italic'},

  // Mood Results
  moodResultsRow: {flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg},
  moodResultColumn: {flex: 1, gap: SPACING.sm},
  moodResultLabel: {...TYPOGRAPHY.bodySmall, fontWeight: '600', textAlign: 'center', marginBottom: SPACING.xs},
  moodResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
  },
  moodResultEmoji: {fontSize: 20, marginRight: SPACING.sm},
  moodResultName: {fontSize: normalize(13), fontWeight: '500', flex: 1},
  matchBadge: {fontSize: 16},
  playAgainBtn: {alignSelf: 'center', width: '60%'},
});

export default MiniGamesScreen;
