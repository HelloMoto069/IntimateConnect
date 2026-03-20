import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import GlassCard from '@components/common/GlassCard';
import GradientButton from '@components/common/GradientButton';
import {GuideStepCard} from '@components/health';
import Animated, {FadeInDown} from 'react-native-reanimated';

const GuidePlayerScreen = () => {
  const {theme} = useTheme();
  const {health} = useContent();
  const navigation = useNavigation();
  const route = useRoute();
  const {selection, success} = useHaptic();

  const {guideId} = route.params || {};
  const guide = health.getGuideById(guideId);

  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  const step = guide?.steps?.[currentStep];

  // Initialize timer when step changes
  useEffect(() => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    if (step?.durationSeconds) {
      setTimerSeconds(step.durationSeconds);
    } else {
      setTimerSeconds(null);
    }
  }, [currentStep, step?.durationSeconds]);

  // Timer tick
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            success();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, success]);

  const handleTimerToggle = useCallback(() => {
    selection();
    setTimerRunning(prev => !prev);
  }, [selection]);

  const handleTimerReset = useCallback(() => {
    selection();
    clearInterval(timerRef.current);
    setTimerRunning(false);
    if (step?.durationSeconds) {
      setTimerSeconds(step.durationSeconds);
    }
  }, [selection, step]);

  const handleNext = useCallback(() => {
    selection();
    if (currentStep < guide.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      scrollRef.current?.scrollTo({y: 0, animated: true});
    }
  }, [currentStep, guide, selection]);

  const handlePrev = useCallback(() => {
    selection();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      scrollRef.current?.scrollTo({y: 0, animated: true});
    }
  }, [currentStep, selection]);

  const handleComplete = useCallback(() => {
    success();
    health.markGuideCompleted(guideId);
    setCompleted(true);
  }, [guideId, health, success]);

  if (!guide) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
            Guide not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Completion screen
  if (completed) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.centerContent}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.completionContainer}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={[styles.completionTitle, {color: theme.colors.text}]}>
              Guide Complete!
            </Text>
            <Text style={[styles.completionSubtitle, {color: theme.colors.textSecondary}]}>
              You finished "{guide.title}"
            </Text>
            {guide.benefits?.length > 0 && (
              <GlassCard style={styles.benefitsCard}>
                <Text style={[styles.benefitsTitle, {color: theme.colors.primary}]}>
                  Benefits
                </Text>
                {guide.benefits.map((benefit, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <Text style={[styles.benefitBullet, {color: theme.colors.primary}]}>•</Text>
                    <Text style={[styles.benefitText, {color: theme.colors.text}]}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </GlassCard>
            )}
            <GradientButton
              label="Done"
              onPress={() => navigation.goBack()}
              style={styles.doneBtn}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  const isLastStep = currentStep === guide.steps.length - 1;
  const progress = ((currentStep + 1) / guide.steps.length) * 100;

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.stepIndicator, {color: theme.colors.textSecondary}]}>
          Step {currentStep + 1} of {guide.steps.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, {backgroundColor: theme.colors.surfaceLight}]}>
        <View
          style={[
            styles.progressFill,
            {backgroundColor: theme.colors.primary, width: `${progress}%`},
          ]}
        />
      </View>

      {/* Guide Title */}
      <View style={styles.titleRow}>
        <Text style={styles.guideIcon}>{guide.icon}</Text>
        <Text style={[styles.guideTitle, {color: theme.colors.text}]} numberOfLines={1}>
          {guide.title}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <GuideStepCard
            step={step}
            totalSteps={guide.steps.length}
            isActive={true}
            timerSeconds={timerSeconds}
            timerRunning={timerRunning}
            onTimerToggle={handleTimerToggle}
            onTimerReset={handleTimerReset}
          />
        </Animated.View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={currentStep === 0}
          style={[
            styles.navBtn,
            {backgroundColor: theme.colors.surface},
            currentStep === 0 && {opacity: 0.4},
          ]}>
          <Text style={[styles.navBtnText, {color: theme.colors.text}]}>Previous</Text>
        </TouchableOpacity>

        {isLastStep ? (
          <GradientButton
            label="Complete Guide"
            onPress={handleComplete}
            style={styles.completeBtn}
          />
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navBtn, {backgroundColor: theme.colors.primary}]}>
            <Text style={[styles.navBtnText, {color: '#FFF'}]}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backBtn: {
    paddingVertical: SPACING.sm,
  },
  backText: {
    fontSize: normalize(15),
    fontWeight: '600',
  },
  stepIndicator: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  guideIcon: {
    fontSize: 24,
  },
  guideTitle: {
    ...TYPOGRAPHY.h3,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  navRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  navBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: normalize(15),
    fontWeight: '600',
  },
  completeBtn: {
    flex: 1,
  },
  // Center / empty
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
  },
  // Completion
  completionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  completionTitle: {
    ...TYPOGRAPHY.h1,
    marginBottom: SPACING.sm,
  },
  completionSubtitle: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  benefitsCard: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  benefitsTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  benefitBullet: {
    fontSize: 16,
    marginTop: 2,
  },
  benefitText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  doneBtn: {
    width: '100%',
  },
});

export default GuidePlayerScreen;
