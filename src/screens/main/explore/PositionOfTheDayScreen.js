import React, {useCallback} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {GradientButton, GlassCard} from '@components/common';
import {DifficultyStars, IntimacyMeter} from '@components/positions';
import {SPACING, BORDER_RADIUS, SCREEN_NAMES} from '@utils/constants';

const PositionOfTheDayScreen = ({navigation}) => {
  const {theme} = useTheme();
  const {light} = useHaptic();
  const {positionOfTheDay: position, favorites, toggleFavorite} = useContent();

  const handleViewDetails = useCallback(() => {
    light();
    navigation.navigate(SCREEN_NAMES.POSITION_DETAIL, {positionId: position.id});
  }, [navigation, position, light]);

  const isFavorite = favorites.includes(position?.id);

  if (!position) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <Text style={{color: theme.colors.text, textAlign: 'center', marginTop: 40}}>
          No position available today.
        </Text>
      </SafeAreaView>
    );
  }

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
          accessibilityLabel="Go back">
          <Text style={{color: '#FFF', fontSize: 24}}>{'\u2190'}</Text>
        </TouchableOpacity>

        {/* Hero */}
        <LinearGradient
          colors={theme.gradients.warm}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.hero}>
          <Animated.View entering={FadeInDown.duration(600)} style={styles.heroContent}>
            <Text style={styles.todayLabel}>POSITION OF THE DAY</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.heroEmoji}>
              {'\uD83D\uDD25'}
            </Text>
            <Text style={styles.heroName}>{position.name}</Text>
            {position.alternateNames?.length > 0 && (
              <Text style={styles.heroAlt}>
                {position.alternateNames.join(' \u2022 ')}
              </Text>
            )}
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Quick Stats */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <GlassCard style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <DifficultyStars rating={position.difficulty} size={18} />
                  <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    Difficulty
                  </Text>
                </View>
                <View style={[styles.statDividerV, {backgroundColor: theme.colors.surfaceLight}]} />
                <View style={styles.statItem}>
                  <Text style={{fontSize: 18}}>
                    {'\u2764\uFE0F'} {position.intimacyLevel}/5
                  </Text>
                  <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    Intimacy
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <Text style={[styles.description, {color: theme.colors.text}]}>
              {position.description}
            </Text>
          </Animated.View>

          {/* Best For tags */}
          {position.bestFor?.length > 0 && (
            <Animated.View entering={FadeInUp.delay(400).duration(400)}>
              <View style={styles.tagsRow}>
                {position.bestFor.map(tag => (
                  <View
                    key={tag}
                    style={[styles.tag, {backgroundColor: theme.colors.primary + '20'}]}>
                    <Text style={{color: theme.colors.primary, fontSize: 13}}>{tag}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Actions */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.actions}>
            <GradientButton
              title="View Full Details"
              onPress={handleViewDetails}
              style={styles.detailsButton}
            />
            <TouchableOpacity
              onPress={() => toggleFavorite(position.id)}
              style={[styles.favButton, {borderColor: theme.colors.primary}]}
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Text style={{fontSize: 22}}>
                {isFavorite ? '\u2764\uFE0F' : '\u{1F90D}'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Tips preview */}
          {position.tips?.length > 0 && (
            <Animated.View entering={FadeInUp.delay(600).duration(400)}>
              <GlassCard>
                <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                  {'\uD83D\uDCA1'} Quick Tip
                </Text>
                <Text style={[styles.tipText, {color: theme.colors.textSecondary}]}>
                  {position.tips[0]}
                </Text>
              </GlassCard>
            </Animated.View>
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
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  todayLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  dateText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  heroEmoji: {
    fontSize: 64,
    marginVertical: 16,
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  heroAlt: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    padding: SPACING.md,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDividerV: {
    width: 1,
    height: 40,
  },
  statLabel: {
    fontSize: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  detailsButton: {
    flex: 1,
  },
  favButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default PositionOfTheDayScreen;
