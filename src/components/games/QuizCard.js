import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Animated, {FadeInDown, FadeIn} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const QuizCard = ({
  question,
  options,
  correctIndex,
  explanation,
  onAnswer,
  answered,
  selectedIndex,
}) => {
  const {theme} = useTheme();

  const getOptionStyle = index => {
    if (!answered) {
      return {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.surfaceLight,
      };
    }
    if (index === correctIndex) {
      return {
        backgroundColor: '#4CAF5020',
        borderColor: '#4CAF50',
      };
    }
    if (index === selectedIndex && index !== correctIndex) {
      return {
        backgroundColor: '#F4433620',
        borderColor: '#F44336',
      };
    }
    return {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.surfaceLight,
      opacity: 0.5,
    };
  };

  const getOptionIcon = index => {
    if (!answered) return null;
    if (index === correctIndex) return '✅';
    if (index === selectedIndex && index !== correctIndex) return '❌';
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Question */}
      <View
        style={[
          styles.questionCard,
          {backgroundColor: theme.colors.surfaceLight},
        ]}>
        <Text style={[styles.questionText, {color: theme.colors.text}]}>
          {question}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 100).duration(300)}>
            <TouchableOpacity
              onPress={() => !answered && onAnswer(index)}
              disabled={answered}
              activeOpacity={0.7}
              style={[styles.optionBtn, getOptionStyle(index)]}>
              <Text style={[styles.optionLetter, {color: theme.colors.primary}]}>
                {String.fromCharCode(65 + index)}
              </Text>
              <Text
                style={[
                  styles.optionText,
                  {color: theme.colors.text},
                  answered && index === correctIndex && {fontWeight: '700'},
                ]}>
                {option}
              </Text>
              {getOptionIcon(index) && (
                <Text style={styles.optionIcon}>{getOptionIcon(index)}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Explanation */}
      {answered && explanation && (
        <Animated.View
          entering={FadeIn.delay(400).duration(300)}
          style={[
            styles.explanationCard,
            {backgroundColor: theme.colors.surfaceLight},
          ]}>
          <Text style={styles.explanationLabel}>💡 Did you know?</Text>
          <Text
            style={[styles.explanationText, {color: theme.colors.text}]}>
            {explanation}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
  },
  questionCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  questionText: {
    ...TYPOGRAPHY.h3,
    lineHeight: 28,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: SPACING.sm + 2,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
  },
  optionLetter: {
    fontSize: normalize(16),
    fontWeight: '700',
    width: 28,
  },
  optionText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  optionIcon: {
    fontSize: 18,
    marginLeft: SPACING.sm,
  },
  explanationCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
  },
  explanationLabel: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: SPACING.xs,
  },
  explanationText: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 22,
  },
});

export default QuizCard;
