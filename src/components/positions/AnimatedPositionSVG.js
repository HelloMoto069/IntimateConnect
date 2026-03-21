/**
 * AnimatedPositionSVG.js
 * Animated wrapper for PositionSVG that transitions between howTo steps.
 * Uses react-native-reanimated to interpolate joint angles smoothly.
 */

import React, {memo, useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Svg, {Defs, RadialGradient, Stop, Rect} from 'react-native-svg';
import {useTheme} from '@context/ThemeContext';
import {getPoseForPosition, getStepPoses} from '@data/positionPoses';
import {interpolatePose} from '@data/posePrimitives';
import HumanFigure from './HumanFigure';
import {BORDER_RADIUS} from '@utils/constants';

const SIZES = {
  small: {width: 80, height: 80},
  medium: {width: 160, height: 160},
  large: {width: 280, height: 220},
};

const TRANSITION_DURATION = 600; // ms
const FRAME_INTERVAL = 16; // ~60fps

const AnimatedPositionSVG = ({
  positionId,
  stepCount = 3,
  size = 'large',
  activeStep = null,
  autoPlay = false,
  autoPlayInterval = 2000,
  colorA,
  colorB,
  style,
}) => {
  const {theme} = useTheme();
  const dimensions = SIZES[size] || SIZES.large;
  const isDark = theme.dark !== false;
  const personAColor = colorA || (isDark ? '#E94560' : '#D63031');
  const personBColor = colorB || (isDark ? '#7C5CFC' : '#6C5CE7');

  const finalPose = useMemo(() => getPoseForPosition(positionId), [positionId]);
  const stepPoses = useMemo(
    () => getStepPoses(positionId, stepCount),
    [positionId, stepCount],
  );

  // Current interpolated poses
  const [currentPoseA, setCurrentPoseA] = useState(stepPoses[0]?.personA || finalPose.personA);
  const [currentPoseB, setCurrentPoseB] = useState(stepPoses[0]?.personB || finalPose.personB);
  const [currentStep, setCurrentStep] = useState(0);

  const prevPoseA = useRef(currentPoseA);
  const prevPoseB = useRef(currentPoseB);
  const animFrameRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Animate to target pose
  const animateTo = useCallback((targetA, targetB) => {
    const startA = {...prevPoseA.current};
    const startB = {...prevPoseB.current};
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const interpA = interpolatePose(startA, targetA, eased);
      const interpB = interpolatePose(startB, targetB, eased);

      setCurrentPoseA(interpA);
      setCurrentPoseB(interpB);

      if (progress < 1) {
        animFrameRef.current = setTimeout(tick, FRAME_INTERVAL);
      } else {
        prevPoseA.current = targetA;
        prevPoseB.current = targetB;
      }
    };

    if (animFrameRef.current) clearTimeout(animFrameRef.current);
    tick();
  }, []);

  // Respond to activeStep changes (from StepByStepGuide interaction)
  useEffect(() => {
    if (activeStep === null || activeStep === undefined) return;
    const stepIdx = Math.min(activeStep, stepPoses.length - 1);
    const target = stepPoses[stepIdx];
    if (target) {
      setCurrentStep(stepIdx);
      animateTo(target.personA, target.personB);
    }
  }, [activeStep, stepPoses, animateTo]);

  // Auto-play: cycle through steps
  useEffect(() => {
    if (!autoPlay) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = (prev + 1) % stepPoses.length;
        const target = stepPoses[next];
        if (target) {
          animateTo(target.personA, target.personB);
        }
        return next;
      });
    }, autoPlayInterval + TRANSITION_DURATION);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, autoPlayInterval, stepPoses, animateTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) clearTimeout(animFrameRef.current);
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  // Step dot indicator
  const handleDotPress = useCallback(
    idx => {
      setCurrentStep(idx);
      const target = stepPoses[idx];
      if (target) {
        animateTo(target.personA, target.personB);
      }
    },
    [stepPoses, animateTo],
  );

  return (
    <View style={[styles.container, {width: dimensions.width, height: dimensions.height + 24}, style]}>
      <Svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 200">
        <Defs>
          <RadialGradient id="animBgGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={personAColor} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={personAColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="200" height="200" fill="url(#animBgGlow)" />
        <HumanFigure pose={currentPoseA} color={personAColor} opacity={0.8} />
        <HumanFigure pose={currentPoseB} color={personBColor} opacity={0.9} />
      </Svg>

      {/* Step dots */}
      {stepPoses.length > 1 && (
        <View style={styles.dotsRow}>
          {stepPoses.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleDotPress(idx)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityLabel={`Step ${idx + 1}`}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      idx === currentStep
                        ? personAColor
                        : theme.colors.textSecondary + '40',
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default memo(AnimatedPositionSVG, (prev, next) => {
  return (
    prev.positionId === next.positionId &&
    prev.activeStep === next.activeStep &&
    prev.size === next.size &&
    prev.autoPlay === next.autoPlay
  );
});
