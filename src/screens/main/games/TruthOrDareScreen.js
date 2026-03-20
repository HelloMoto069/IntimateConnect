import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {GameCard} from '@components/games';
import FilterChips from '@components/common/FilterChips';
import GradientButton from '@components/common/GradientButton';
import {GAME_LEVELS, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const TruthOrDareScreen = () => {
  const {theme} = useTheme();
  const {games} = useContent();
  const navigation = useNavigation();
  const {medium, selection} = useHaptic();

  const [phase, setPhase] = useState('setup'); // setup | playing
  const [level, setLevel] = useState(games.levelPreference);
  const [cardType, setCardType] = useState(null); // null = both, 'truth', 'dare'
  const [currentCard, setCurrentCard] = useState(null);
  const [cardKey, setCardKey] = useState(0);

  const levelChips = GAME_LEVELS.map(l => ({id: l.id, label: l.label}));
  const typeChips = [
    {id: 'both', label: 'Both'},
    {id: 'truth', label: 'Truth'},
    {id: 'dare', label: 'Dare'},
  ];

  const startGame = useCallback(() => {
    medium();
    const card = games.getRandomCard('truth-or-dare', level);
    setCurrentCard(card);
    setCardKey(k => k + 1);
    setPhase('playing');
  }, [games, level, medium]);

  const nextCard = useCallback(() => {
    selection();
    let card;
    if (cardType && cardType !== 'both') {
      // Filter by type — get random until matching type
      for (let i = 0; i < 20; i++) {
        card = games.getRandomCard('truth-or-dare', level);
        if (card && card.type === cardType) break;
      }
    } else {
      card = games.getRandomCard('truth-or-dare', level);
    }
    setCurrentCard(card);
    setCardKey(k => k + 1);
  }, [games, level, cardType, selection]);

  const handleFavorite = useCallback(() => {
    if (currentCard) {
      selection();
      games.toggleFavoritePrompt(currentCard.id);
    }
  }, [currentCard, games, selection]);

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
          <Text style={styles.setupIcon}>🎭</Text>
          <Text style={[styles.setupTitle, {color: theme.colors.text}]}>
            Truth or Dare
          </Text>
          <Text
            style={[
              styles.setupSubtitle,
              {color: theme.colors.textSecondary},
            ]}>
            Choose your intensity level
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

          <View style={styles.setupSection}>
            <Text
              style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>
              Card Type
            </Text>
            <FilterChips
              chips={typeChips}
              selectedId={cardType || 'both'}
              onSelect={id => setCardType(id === 'both' ? null : id)}
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

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.playHeader}>
        <TouchableOpacity
          onPress={() => setPhase('setup')}
          style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.text}]}>
            ← Setup
          </Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <View
            style={[
              styles.levelIndicator,
              {
                backgroundColor:
                  (GAME_LEVELS.find(l => l.id === level)?.color || '#888') +
                  '20',
              },
            ]}>
            <Text
              style={{
                color: GAME_LEVELS.find(l => l.id === level)?.color || '#888',
                fontWeight: '600',
                fontSize: normalize(12),
              }}>
              {GAME_LEVELS.find(l => l.id === level)?.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        {currentCard ? (
          <GameCard
            text={currentCard.text}
            subtitle={currentCard.followUp}
            level={currentCard.level}
            type={currentCard.type}
            onNext={nextCard}
            onFavorite={handleFavorite}
            isFavorite={games.isPromptFavorite(currentCard.id)}
            cardKey={cardKey}
          />
        ) : (
          <Text style={[styles.noCards, {color: theme.colors.textSecondary}]}>
            No cards available for this filter
          </Text>
        )}
      </View>

      {/* Type Toggle */}
      <View style={styles.typeToggle}>
        {typeChips.map(chip => (
          <TouchableOpacity
            key={chip.id}
            onPress={() => {
              setCardType(chip.id === 'both' ? null : chip.id);
              selection();
            }}
            style={[
              styles.typeBtn,
              {
                backgroundColor:
                  (cardType || 'both') === chip.id
                    ? theme.colors.primary + '20'
                    : theme.colors.surfaceLight,
              },
            ]}>
            <Text
              style={[
                styles.typeBtnText,
                {
                  color:
                    (cardType || 'both') === chip.id
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backText: {
    fontSize: normalize(16),
    fontWeight: '500',
  },
  setupContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  setupIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  setupTitle: {
    ...TYPOGRAPHY.hero,
    marginBottom: SPACING.xs,
  },
  setupSubtitle: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.xl,
  },
  setupSection: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  startBtn: {
    marginTop: SPACING.lg,
    width: '80%',
  },
  playHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: SPACING.lg,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIndicator: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCards: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
  },
  typeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  typeBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
  },
  typeBtnText: {
    fontSize: normalize(14),
    fontWeight: '600',
  },
});

export default TruthOrDareScreen;
