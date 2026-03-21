import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useTrackerContext} from '@context/TrackerContext';
import {useHaptic} from '@hooks/useHaptic';
import {KEGEL_INTENSITIES, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import GradientButton from '@components/common/GradientButton';
import FilterChips from '@components/common/FilterChips';
import {KegelTimerRing} from '@components/tracker';
import Animated, {FadeInDown} from 'react-native-reanimated';

const PHASES = {SETUP: 'setup', HOLD: 'hold', REST: 'rest', COMPLETE: 'complete'};

const REP_OPTIONS = [5, 10, 15, 20, 25];

const KegelTimerScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const tracker = useTrackerContext();
  const {selection, success} = useHaptic();

  const [intensity, setIntensity] = useState('medium');
  const [targetReps, setTargetReps] = useState(10);
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [currentRep, setCurrentRep] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const timerRef = useRef(null);

  const config = KEGEL_INTENSITIES.find(k => k.id === intensity) || KEGEL_INTENSITIES[1];
  const intensityOptions = KEGEL_INTENSITIES.map(k => ({value: k.id, label: k.label}));

  // Cleanup timer
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Timer tick
  useEffect(() => {
    if (phase === PHASES.HOLD || phase === PHASES.REST) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Transition
            if (phase === PHASES.HOLD) {
              if (currentRep + 1 >= targetReps) {
                setPhase(PHASES.COMPLETE);
                success();
                return 0;
              }
              setPhase(PHASES.REST);
              selection();
              return config.restSeconds;
            } else {
              // REST → next HOLD
              setCurrentRep(r => r + 1);
              setPhase(PHASES.HOLD);
              selection();
              return config.holdSeconds;
            }
          }
          return prev - 1;
        });
        setTotalElapsed(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, currentRep, targetReps, config, selection, success]);

  const handleStart = useCallback(() => {
    selection();
    setCurrentRep(0);
    setTotalElapsed(0);
    setSecondsLeft(config.holdSeconds);
    setPhase(PHASES.HOLD);
  }, [config, selection]);

  const handleSave = useCallback(async () => {
    success();
    await tracker.addKegelSession(totalElapsed, targetReps, intensity);
    navigation.goBack();
  }, [totalElapsed, targetReps, intensity, tracker, success, navigation]);

  // ─── Setup Phase ──────────────────────────────────────
  if (phase === PHASES.SETUP) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, {color: theme.colors.text}]}>Kegel Session</Text>
        </View>

        <View style={styles.setupContent}>
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <Text style={[styles.setupLabel, {color: theme.colors.textSecondary}]}>Intensity</Text>
            <FilterChips
              options={intensityOptions}
              selected={intensity}
              onSelect={val => setIntensity(val || 'medium')}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.repsSection}>
            <Text style={[styles.setupLabel, {color: theme.colors.textSecondary}]}>Repetitions</Text>
            <View style={styles.repsRow}>
              {REP_OPTIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => { selection(); setTargetReps(r); }}
                  style={[
                    styles.repBtn,
                    {
                      backgroundColor: targetReps === r ? theme.colors.primary : theme.colors.surface,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.repText,
                      {color: targetReps === r ? '#FFF' : theme.colors.text},
                    ]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.configSummary}>
            <Text style={[styles.summaryText, {color: theme.colors.textSecondary}]}>
              Hold {config.holdSeconds}s • Rest {config.restSeconds}s • {targetReps} reps
            </Text>
            <Text style={[styles.summaryText, {color: theme.colors.textSecondary}]}>
              ~{Math.ceil((config.holdSeconds + config.restSeconds) * targetReps / 60)} min total
            </Text>
          </Animated.View>

          <GradientButton
            label="Start"
            onPress={handleStart}
            style={styles.startBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Complete Phase ───────────────────────────────────
  if (phase === PHASES.COMPLETE) {
    const mins = Math.round(totalElapsed / 60);
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.centerContent}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.completeContainer}>
            <Text style={styles.completeEmoji}>🎉</Text>
            <Text style={[styles.completeTitle, {color: theme.colors.text}]}>Session Complete!</Text>
            <Text style={[styles.completeMeta, {color: theme.colors.textSecondary}]}>
              {targetReps} reps • {mins > 0 ? `${mins} min` : `${totalElapsed}s`} • {config.label}
            </Text>
            <GradientButton label="Save Session" onPress={handleSave} style={styles.saveBtn} />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.skipBtn}>
              <Text style={[styles.skipText, {color: theme.colors.textSecondary}]}>Discard</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Timer Phase (HOLD / REST) ────────────────────────
  const isHold = phase === PHASES.HOLD;
  const maxSeconds = isHold ? config.holdSeconds : config.restSeconds;
  const progress = 1 - secondsLeft / maxSeconds;
  const ringColor = isHold ? config.color : theme.colors.textSecondary;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.timerHeader}>
        <Text style={[styles.timerPhaseText, {color: ringColor}]}>
          {isHold ? 'HOLD' : 'REST'}
        </Text>
        <Text style={[styles.repCounter, {color: theme.colors.textSecondary}]}>
          Rep {currentRep + 1} of {targetReps}
        </Text>
      </View>

      <View style={styles.timerCenter}>
        <KegelTimerRing
          progress={progress}
          size={220}
          color={ringColor}
          label={`${secondsLeft}`}
          sublabel={isHold ? 'Hold' : 'Rest'}
        />
      </View>

      <View style={styles.timerFooter}>
        <TouchableOpacity
          onPress={() => {
            clearInterval(timerRef.current);
            setPhase(PHASES.COMPLETE);
          }}
          style={[styles.stopBtn, {borderColor: theme.colors.error}]}>
          <Text style={[styles.stopText, {color: theme.colors.error}]}>Stop Early</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm},
  backBtn: {paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(15), fontWeight: '600'},
  title: {...TYPOGRAPHY.h1, marginTop: SPACING.sm},
  // Setup
  setupContent: {paddingHorizontal: SPACING.md, paddingTop: SPACING.lg},
  setupLabel: {...TYPOGRAPHY.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm, paddingHorizontal: SPACING.sm},
  repsSection: {marginTop: SPACING.xl},
  repsRow: {flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.sm},
  repBtn: {flex: 1, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center'},
  repText: {fontSize: normalize(16), fontWeight: '700'},
  configSummary: {alignItems: 'center', marginTop: SPACING.xl, gap: SPACING.xs},
  summaryText: {...TYPOGRAPHY.bodySmall},
  startBtn: {marginTop: SPACING.xl, marginHorizontal: SPACING.sm},
  // Timer
  timerHeader: {alignItems: 'center', paddingTop: SPACING.xl},
  timerPhaseText: {fontSize: normalize(28), fontWeight: '800', letterSpacing: 4},
  repCounter: {...TYPOGRAPHY.body, marginTop: SPACING.sm},
  timerCenter: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  timerFooter: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl},
  stopBtn: {borderWidth: 1.5, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center'},
  stopText: {fontSize: normalize(15), fontWeight: '600'},
  // Complete
  centerContent: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg},
  completeContainer: {alignItems: 'center', width: '100%'},
  completeEmoji: {fontSize: 64, marginBottom: SPACING.md},
  completeTitle: {...TYPOGRAPHY.h1, marginBottom: SPACING.sm},
  completeMeta: {...TYPOGRAPHY.body, textAlign: 'center', marginBottom: SPACING.xl},
  saveBtn: {width: '100%'},
  skipBtn: {paddingVertical: SPACING.md, marginTop: SPACING.md},
  skipText: {fontSize: normalize(14), fontWeight: '500'},
});

export default KegelTimerScreen;
