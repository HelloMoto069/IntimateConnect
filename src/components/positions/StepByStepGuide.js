import React, {useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {BORDER_RADIUS} from '@utils/constants';

const StepItem = ({step, isLast, theme, expanded, onToggle}) => {
  return (
    <View style={styles.stepContainer}>
      {/* Step indicator line */}
      <View style={styles.stepIndicator}>
        <View
          style={[
            styles.stepCircle,
            {backgroundColor: theme.colors.primary},
          ]}>
          <Text style={styles.stepNumber}>{step.step}</Text>
        </View>
        {!isLast && (
          <View
            style={[
              styles.stepLine,
              {backgroundColor: theme.colors.primary + '30'},
            ]}
          />
        )}
      </View>

      {/* Step content */}
      <TouchableOpacity
        style={[styles.stepContent, {borderColor: theme.colors.surfaceLight}]}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Step ${step.step}: ${step.text}`}>
        <Text
          style={[styles.stepText, {color: theme.colors.text}]}
          numberOfLines={expanded ? undefined : 3}>
          {step.text}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const StepByStepGuide = ({steps = [], style}) => {
  const {theme} = useTheme();
  const [expandedStep, setExpandedStep] = useState(null);

  const handleToggle = useCallback(stepNumber => {
    setExpandedStep(prev => (prev === stepNumber ? null : stepNumber));
  }, []);

  if (!steps.length) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, {color: theme.colors.text}]}>How To</Text>
      {steps.map((step, index) => (
        <StepItem
          key={step.step}
          step={step}
          isLast={index === steps.length - 1}
          theme={theme}
          expanded={expandedStep === step.step}
          onToggle={() => handleToggle(step.step)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 60,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 36,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 16,
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  stepText: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default StepByStepGuide;
