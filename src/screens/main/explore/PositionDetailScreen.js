import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {GradientButton, GlassCard} from '@components/common';
import {showToast} from '@components/common/Toast';
import {DifficultyStars, IntimacyMeter, StepByStepGuide, PositionCard, AnimatedPositionSVG} from '@components/positions';
import {SPACING, BORDER_RADIUS, SCREEN_NAMES} from '@utils/constants';

const PositionDetailScreen = ({route, navigation}) => {
  const {positionId} = route.params;
  const {theme} = useTheme();
  const {light, success, selection} = useHaptic();
  const {
    getPositionById,
    getUserPositionData,
    getDecryptedNote,
    toggleFavorite,
    setRating,
    markAsTried,
    savePersonalNote,
    favorites,
  } = useContent();

  const position = useMemo(
    () => getPositionById(positionId),
    [getPositionById, positionId],
  );
  const userData = useMemo(
    () => getUserPositionData(positionId),
    [getUserPositionData, positionId],
  );

  const [noteText, setNoteText] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [selectedRating, setSelectedRating] = useState(userData.userRating || 0);
  const [activeHowToStep, setActiveHowToStep] = useState(null);

  // Load decrypted note when entering edit mode
  const handleEditNote = useCallback(() => {
    const decrypted = getDecryptedNote(positionId);
    setNoteText(decrypted || '');
    setEditingNote(true);
  }, [getDecryptedNote, positionId]);

  const handleSaveNote = useCallback(async () => {
    await savePersonalNote(positionId, noteText);
    setEditingNote(false);
    showToast('success', 'Note saved', 'Your personal note has been encrypted and saved.');
  }, [savePersonalNote, positionId, noteText]);

  const handleRate = useCallback(
    async rating => {
      selection();
      setSelectedRating(rating);
      await setRating(positionId, rating);
      showToast('success', 'Rated!', `You rated this position ${rating}/5`);
    },
    [setRating, positionId, selection],
  );

  const handleMarkTried = useCallback(async () => {
    success();
    await markAsTried(positionId);
    showToast('success', 'Marked as tried!', 'Added to your tried positions.');
  }, [markAsTried, positionId, success]);

  const handleToggleFavorite = useCallback(() => {
    selection();
    toggleFavorite(positionId);
  }, [toggleFavorite, positionId, selection]);

  if (!position) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <Text style={{color: theme.colors.text, textAlign: 'center', marginTop: 40}}>
          Position not found.
        </Text>
      </SafeAreaView>
    );
  }

  const isFavorite = favorites.includes(positionId);
  const relatedPositions = (position.relatedPositions || [])
    .map(id => getPositionById(id))
    .filter(Boolean);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            light();
            navigation.goBack();
          }}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Text style={{color: theme.colors.text, fontSize: 24}}>{'\u2190'}</Text>
        </TouchableOpacity>

        {/* Hero illustration with animated figures */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <LinearGradient
            colors={[theme.colors.primary + '40', theme.colors.secondary + '40']}
            style={styles.heroArea}>
            <AnimatedPositionSVG
              positionId={positionId}
              stepCount={position.howTo?.length || 3}
              size="large"
              activeStep={activeHowToStep}
              autoPlay={activeHowToStep === null}
              autoPlayInterval={2500}
            />
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          {/* Name + alternate names */}
          <Text style={[styles.name, {color: theme.colors.text}]}>
            {position.name}
          </Text>
          {position.alternateNames?.length > 0 && (
            <Text style={[styles.altNames, {color: theme.colors.textSecondary}]}>
              Also known as: {position.alternateNames.join(', ')}
            </Text>
          )}

          {/* Stats row */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.statsContainer}>
            <GlassCard style={styles.statsCard}>
              <DifficultyStars
                rating={position.difficulty}
                label="Difficulty"
                size={18}
              />
              <View style={styles.statDivider} />
              <IntimacyMeter
                level={position.intimacyLevel}
                label="Intimacy"
                style={styles.meter}
              />
              <View style={styles.statDivider} />
              <View style={styles.statRow}>
                <View style={styles.statBadge}>
                  <Text style={styles.statEmoji}>{'\uD83E\uDD38'}</Text>
                  <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    Flexibility
                  </Text>
                  <Text style={[styles.statValue, {color: theme.colors.text}]}>
                    {position.flexibilityRequired}/5
                  </Text>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statEmoji}>{'\u26A1'}</Text>
                  <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    Stamina
                  </Text>
                  <Text style={[styles.statValue, {color: theme.colors.text}]}>
                    {position.staminaRequired}/5
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={[styles.description, {color: theme.colors.text}]}>
              {position.description}
            </Text>
          </Animated.View>

          {/* How-To Steps */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <StepByStepGuide
              steps={position.howTo}
              activeStep={activeHowToStep}
              onStepPress={(stepNum) => setActiveHowToStep(stepNum - 1)}
            />
          </Animated.View>

          {/* Tips */}
          {position.tips?.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <GlassCard style={styles.tipsCard}>
                <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                  {'\uD83D\uDCA1'} Tips
                </Text>
                {position.tips.map((tip, index) => (
                  <View key={index} style={styles.tipRow}>
                    <Text style={{color: theme.colors.primary}}>{'\u2022'}</Text>
                    <Text style={[styles.tipText, {color: theme.colors.text}]}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}

          {/* Physical Notes */}
          {position.physicalNotes && (
            <GlassCard style={styles.noteCard}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                {'\uD83C\uDFCB\uFE0F'} Physical Notes
              </Text>
              <Text style={[styles.noteText, {color: theme.colors.textSecondary}]}>
                {position.physicalNotes}
              </Text>
            </GlassCard>
          )}

          {/* Best For chips */}
          {position.bestFor?.length > 0 && (
            <View style={styles.bestForSection}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Best For
              </Text>
              <View style={styles.chipRow}>
                {position.bestFor.map(tag => (
                  <View
                    key={tag}
                    style={[
                      styles.bestForChip,
                      {backgroundColor: theme.colors.primary + '20'},
                    ]}>
                    <Text style={{color: theme.colors.primary, fontSize: 13}}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Bar */}
          <View style={styles.actionBar}>
            {/* Favorite */}
            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={[styles.actionButton, {backgroundColor: theme.colors.surface}]}
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Text style={{fontSize: 20}}>
                {isFavorite ? '\u2764\uFE0F' : '\u{1F90D}'}
              </Text>
              <Text style={[styles.actionLabel, {color: theme.colors.textSecondary}]}>
                {isFavorite ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>

            {/* Mark as Tried */}
            <TouchableOpacity
              onPress={handleMarkTried}
              style={[styles.actionButton, {backgroundColor: theme.colors.surface}]}
              disabled={userData.hasTried}
              accessibilityLabel={userData.hasTried ? 'Already tried' : 'Mark as tried'}>
              <Text style={{fontSize: 20}}>
                {userData.hasTried ? '\u2705' : '\u{1F64B}'}
              </Text>
              <Text style={[styles.actionLabel, {color: theme.colors.textSecondary}]}>
                {userData.hasTried ? 'Tried' : 'Try It'}
              </Text>
            </TouchableOpacity>

            {/* Note */}
            <TouchableOpacity
              onPress={handleEditNote}
              style={[styles.actionButton, {backgroundColor: theme.colors.surface}]}
              accessibilityLabel="Add personal note">
              <Text style={{fontSize: 20}}>{'\uD83D\uDD12'}</Text>
              <Text style={[styles.actionLabel, {color: theme.colors.textSecondary}]}>
                Note
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rating */}
          <GlassCard style={styles.ratingCard}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Your Rating
            </Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRate(star)}
                  accessibilityLabel={`Rate ${star} stars`}>
                  <Text style={{fontSize: 32}}>
                    {star <= selectedRating ? '\u2B50' : '\u2606'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Personal Note Editor */}
          {editingNote && (
            <GlassCard style={styles.noteEditor}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                {'\uD83D\uDD12'} Personal Note (Encrypted)
              </Text>
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                multiline
                numberOfLines={4}
                placeholder="Write your personal notes here..."
                placeholderTextColor={theme.colors.textSecondary + '80'}
                style={[
                  styles.noteInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surfaceLight,
                    borderColor: theme.colors.primary + '40',
                  },
                ]}
              />
              <View style={styles.noteActions}>
                <TouchableOpacity
                  onPress={() => setEditingNote(false)}
                  style={styles.cancelButton}>
                  <Text style={{color: theme.colors.textSecondary}}>Cancel</Text>
                </TouchableOpacity>
                <GradientButton
                  title="Save Note"
                  onPress={handleSaveNote}
                  size="sm"
                />
              </View>
            </GlassCard>
          )}

          {/* Related Positions */}
          {relatedPositions.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Related Positions
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}>
                {relatedPositions.map(related => (
                  <View key={related.id} style={styles.relatedCard}>
                    <PositionCard
                      position={related}
                      mode="grid"
                      isFavorite={favorites.includes(related.id)}
                      onToggleFavorite={toggleFavorite}
                      style={{width: 160}}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArea: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 64,
  },
  content: {
    padding: SPACING.md,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  altNames: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsCard: {
    gap: 12,
  },
  statDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  meter: {
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBadge: {
    alignItems: 'center',
    gap: 2,
  },
  statEmoji: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  tipsCard: {
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    paddingRight: 8,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  noteCard: {
    marginBottom: 12,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bestForSection: {
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bestForChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingCard: {
    marginBottom: 12,
    alignItems: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 12,
  },
  noteEditor: {
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  relatedSection: {
    marginTop: 16,
    marginBottom: 40,
  },
  relatedScroll: {
    gap: 12,
  },
  relatedCard: {
    width: 160,
  },
});

export default PositionDetailScreen;
