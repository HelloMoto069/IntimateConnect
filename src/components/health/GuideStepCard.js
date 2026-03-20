import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const GuideStepCard = ({
  step,
  totalSteps,
  isActive,
  timerSeconds,
  timerRunning,
  onTimerToggle,
  onTimerReset,
}) => {
  const {theme} = useTheme();

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.surface},
        isActive && {borderColor: theme.colors.primary, borderWidth: 2},
      ]}>
      {/* Step Number */}
      <View style={styles.stepHeader}>
        <View
          style={[
            styles.stepBadge,
            {backgroundColor: theme.colors.primary + '20'},
          ]}>
          <Text style={[styles.stepNumber, {color: theme.colors.primary}]}>
            {step.step}/{totalSteps}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, {color: theme.colors.text}]}>
        {step.title}
      </Text>

      {/* Description */}
      <Text style={[styles.description, {color: theme.colors.textSecondary}]}>
        {step.description}
      </Text>

      {/* Tip */}
      {step.tip && (
        <View
          style={[
            styles.tipContainer,
            {backgroundColor: theme.colors.surfaceLight},
          ]}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={[styles.tipText, {color: theme.colors.text}]}>
            {step.tip}
          </Text>
        </View>
      )}

      {/* Timer */}
      {step.durationSeconds && isActive && timerSeconds != null && (
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, {color: theme.colors.primary}]}>
            {formatTime(timerSeconds)}
          </Text>
          <View style={styles.timerControls}>
            <TouchableOpacity
              onPress={onTimerToggle}
              style={[
                styles.timerBtn,
                {backgroundColor: theme.colors.primary + '20'},
              ]}>
              <Text style={[styles.timerBtnText, {color: theme.colors.primary}]}>
                {timerRunning ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onTimerReset}
              style={[
                styles.timerBtn,
                {backgroundColor: theme.colors.surfaceLight},
              ]}>
              <Text
                style={[
                  styles.timerBtnText,
                  {color: theme.colors.textSecondary},
                ]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepBadge: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  stepNumber: {
    fontSize: normalize(12),
    fontWeight: '700',
  },
  title: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.md,
  },
  tipContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  tipText: {
    ...TYPOGRAPHY.bodySmall,
    flex: 1,
    fontStyle: 'italic',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  timerText: {
    fontSize: normalize(36),
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  timerControls: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timerBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  timerBtnText: {
    fontSize: normalize(14),
    fontWeight: '600',
  },
});

export default GuideStepCard;
