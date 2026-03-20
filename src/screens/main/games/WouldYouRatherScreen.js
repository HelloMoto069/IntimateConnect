import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import FilterChips from '@components/common/FilterChips';
import GradientButton from '@components/common/GradientButton';
import {GAME_LEVELS, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const WouldYouRatherScreen = () => {
  const {theme} = useTheme();
  const {games} = useContent();
  const navigation = useNavigation();
  const {medium, selection, success} = useHaptic();

  const [phase, setPhase] = useState('setup'); // setup | partnerA | pass | partnerB | reveal
  const [level, setLevel] = useState(games.levelPreference);
  const [currentCard, setCurrentCard] = useState(null);
  const [partnerAChoice, setPartnerAChoice] = useState(null);
  const [partnerBChoice, setPartnerBChoice] = useState(null);

  const levelChips = GAME_LEVELS.map(l => ({id: l.id, label: l.label}));

  const startGame = useCallback(() => {
    medium();
    const card = games.getRandomCard('would-you-rather', level);
    setCurrentCard(card);
    setPartnerAChoice(null);
    setPartnerBChoice(null);
    setPhase('partnerA');
  }, [games, level, medium]);

  const handleChoiceA = useCallback(
    choice => {
      selection();
      if (phase === 'partnerA') {
        setPartnerAChoice(choice);
        setPhase('pass');
      } else if (phase === 'partnerB') {
        setPartnerBChoice(choice);
        success();
        setPhase('reveal');
      }
    },
    [phase, selection, success],
  );

  const nextRound = useCallback(() => {
    const card = games.getRandomCard('would-you-rather', level);
    setCurrentCard(card);
    setPartnerAChoice(null);
    setPartnerBChoice(null);
    setPhase('partnerA');
    selection();
  }, [games, level, selection]);

  // Setup screen
  if (phase === 'setup') {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.text}]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <View style={styles.setupContent}>
          <Text style={styles.setupIcon}>🤔</Text>
          <Text style={[styles.setupTitle, {color: theme.colors.text}]}>
            Would You Rather
          </Text>
          <Text
            style={[styles.setupSubtitle, {color: theme.colors.textSecondary}]}>
            Pass the phone between partners
          </Text>
          <View style={styles.setupSection}>
            <Text
              style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>
              Intensity
            </Text>
            <FilterChips
              chips={levelChips}
              selectedId={level}
              onSelect={setLevel}
            />
          </View>
          <GradientButton
            title="Start Game"
            onPress={startGame}
            style={styles.startBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Pass phone screen
  if (phase === 'pass') {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.passContent}>
          <Animated.View entering={FadeIn.duration(400)}>
            <Text style={styles.passIcon}>📱</Text>
            <Text style={[styles.passTitle, {color: theme.colors.text}]}>
              Pass the phone to
            </Text>
            <Text style={[styles.passPartner, {color: theme.colors.primary}]}>
              Partner B
            </Text>
            <Text
              style={[
                styles.passSubtitle,
                {color: theme.colors.textSecondary},
              ]}>
              Don't peek at each other's answers!
            </Text>
            <GradientButton
              title="I'm Ready"
              onPress={() => {
                setPhase('partnerB');
                selection();
              }}
              style={styles.readyBtn}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Reveal screen
  if (phase === 'reveal' && currentCard) {
    const isMatch = partnerAChoice === partnerBChoice;
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.revealContent}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.revealHeader}>
            <Text style={styles.revealIcon}>{isMatch ? '🎉' : '😮'}</Text>
            <Text style={[styles.revealTitle, {color: theme.colors.text}]}>
              {isMatch ? 'You matched!' : 'Different choices!'}
            </Text>
          </Animated.View>

          <View style={styles.revealCards}>
            <Animated.View
              entering={FadeInDown.delay(200).duration(300)}
              style={[
                styles.revealCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    partnerAChoice === 'A'
                      ? theme.colors.primary
                      : theme.colors.surfaceLight,
                },
              ]}>
              <Text style={[styles.revealLabel, {color: theme.colors.textSecondary}]}>
                Partner A chose:
              </Text>
              <Text style={[styles.revealChoice, {color: theme.colors.text}]}>
                {partnerAChoice === 'A' ? currentCard.optionA : currentCard.optionB}
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400).duration(300)}
              style={[
                styles.revealCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    partnerBChoice === 'A'
                      ? theme.colors.accent
                      : theme.colors.surfaceLight,
                },
              ]}>
              <Text style={[styles.revealLabel, {color: theme.colors.textSecondary}]}>
                Partner B chose:
              </Text>
              <Text style={[styles.revealChoice, {color: theme.colors.text}]}>
                {partnerBChoice === 'A' ? currentCard.optionA : currentCard.optionB}
              </Text>
            </Animated.View>
          </View>

          {currentCard.discussionPrompt && (
            <Animated.View
              entering={FadeInDown.delay(600).duration(300)}
              style={[
                styles.discussionCard,
                {backgroundColor: theme.colors.surfaceLight},
              ]}>
              <Text style={styles.discussionLabel}>💬 Discuss</Text>
              <Text
                style={[
                  styles.discussionText,
                  {color: theme.colors.text},
                ]}>
                {currentCard.discussionPrompt}
              </Text>
            </Animated.View>
          )}

          <GradientButton
            title="Next Question"
            onPress={nextRound}
            style={styles.nextBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Partner A or Partner B choosing
  const isPartnerA = phase === 'partnerA';
  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.chooseHeader}>
        <TouchableOpacity
          onPress={() => (isPartnerA ? setPhase('setup') : null)}
          style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.text}]}>
            {isPartnerA ? '← Setup' : ''}
          </Text>
        </TouchableOpacity>
        <View
          style={[
            styles.partnerBadge,
            {backgroundColor: theme.colors.primary + '20'},
          ]}>
          <Text style={[styles.partnerBadgeText, {color: theme.colors.primary}]}>
            {isPartnerA ? 'Partner A' : 'Partner B'}
          </Text>
        </View>
      </View>

      <View style={styles.chooseContent}>
        <Text
          style={[styles.chooseTitle, {color: theme.colors.textSecondary}]}>
          Would you rather...
        </Text>

        {currentCard && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleChoiceA('A')}
              style={[
                styles.optionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.primary + '40',
                },
              ]}>
              <Text style={[styles.optionLabel, {color: theme.colors.primary}]}>
                A
              </Text>
              <Text style={[styles.optionText, {color: theme.colors.text}]}>
                {currentCard.optionA}
              </Text>
            </TouchableOpacity>

            <Text
              style={[styles.orText, {color: theme.colors.textSecondary}]}>
              — OR —
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleChoiceA('B')}
              style={[
                styles.optionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.accent + '40',
                },
              ]}>
              <Text style={[styles.optionLabel, {color: theme.colors.accent}]}>
                B
              </Text>
              <Text style={[styles.optionText, {color: theme.colors.text}]}>
                {currentCard.optionB}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  backBtn: {paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(16), fontWeight: '500'},
  setupContent: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg},
  setupIcon: {fontSize: 64, marginBottom: SPACING.md, textAlign: 'center'},
  setupTitle: {...TYPOGRAPHY.hero, textAlign: 'center'},
  setupSubtitle: {...TYPOGRAPHY.body, marginBottom: SPACING.xl, textAlign: 'center'},
  setupSection: {width: '100%', marginBottom: SPACING.lg},
  sectionLabel: {...TYPOGRAPHY.bodySmall, fontWeight: '600', marginBottom: SPACING.sm},
  startBtn: {marginTop: SPACING.lg, width: '80%'},
  passContent: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg},
  passIcon: {fontSize: 64, textAlign: 'center', marginBottom: SPACING.md},
  passTitle: {...TYPOGRAPHY.h2, textAlign: 'center'},
  passPartner: {...TYPOGRAPHY.hero, textAlign: 'center', marginVertical: SPACING.sm},
  passSubtitle: {...TYPOGRAPHY.body, textAlign: 'center', marginBottom: SPACING.xl},
  readyBtn: {marginTop: SPACING.md, width: 200, alignSelf: 'center'},
  revealContent: {flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl},
  revealHeader: {alignItems: 'center', marginBottom: SPACING.lg},
  revealIcon: {fontSize: 48, marginBottom: SPACING.sm},
  revealTitle: {...TYPOGRAPHY.h1, textAlign: 'center'},
  revealCards: {gap: SPACING.md, marginBottom: SPACING.lg},
  revealCard: {padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 2},
  revealLabel: {...TYPOGRAPHY.caption, fontWeight: '600', marginBottom: SPACING.xs},
  revealChoice: {...TYPOGRAPHY.body, fontWeight: '600'},
  discussionCard: {padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg},
  discussionLabel: {fontSize: normalize(13), fontWeight: '600', color: '#FF9800', marginBottom: SPACING.xs},
  discussionText: {...TYPOGRAPHY.body},
  nextBtn: {alignSelf: 'center', width: '60%'},
  chooseHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: SPACING.lg},
  partnerBadge: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full},
  partnerBadgeText: {fontSize: normalize(13), fontWeight: '600'},
  chooseContent: {flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg},
  chooseTitle: {...TYPOGRAPHY.h3, textAlign: 'center', marginBottom: SPACING.lg},
  optionsContainer: {gap: SPACING.md},
  optionCard: {padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 2, minHeight: 100, justifyContent: 'center'},
  optionLabel: {...TYPOGRAPHY.hero, marginBottom: SPACING.xs},
  optionText: {...TYPOGRAPHY.body, lineHeight: 24},
  orText: {...TYPOGRAPHY.body, textAlign: 'center', fontWeight: '600'},
});

export default WouldYouRatherScreen;
