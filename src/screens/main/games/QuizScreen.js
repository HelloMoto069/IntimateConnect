import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {QuizCard} from '@components/games';
import GradientButton from '@components/common/GradientButton';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const QuizScreen = () => {
  const {theme} = useTheme();
  const {games} = useContent();
  const navigation = useNavigation();
  const {success, error: errorHaptic, selection} = useHaptic();

  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const progressWidth = useSharedValue(0);

  const currentQuestion = games.quizQuestions[games.quizState.currentIndex];
  const totalQuestions = games.quizQuestions.length;

  const updateProgress = useCallback(
    index => {
      progressWidth.value = withTiming(((index + 1) / totalQuestions) * 100, {
        duration: 300,
      });
    },
    [progressWidth, totalQuestions],
  );

  const handleAnswer = useCallback(
    answerIndex => {
      if (answered) return;
      setSelectedIndex(answerIndex);
      setAnswered(true);

      const result = games.submitQuizAnswer(answerIndex);
      setLastResult(result);

      if (result?.isCorrect) {
        success();
      } else {
        errorHaptic();
      }

      updateProgress(games.quizState.currentIndex);
    },
    [answered, games, success, errorHaptic, updateProgress],
  );

  const handleNext = useCallback(() => {
    selection();
    setAnswered(false);
    setSelectedIndex(null);
    setLastResult(null);
  }, [selection]);

  const handleRestart = useCallback(() => {
    selection();
    games.resetQuiz();
    setAnswered(false);
    setSelectedIndex(null);
    setLastResult(null);
    progressWidth.value = 0;
  }, [games, selection, progressWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Results screen
  if (games.quizState.isComplete && answered) {
    const score = games.quizState.score;
    const percentage = Math.round((score / totalQuestions) * 100);
    let emoji, message;
    if (percentage >= 90) {
      emoji = '🏆';
      message = 'Incredible! You are an intimacy expert!';
    } else if (percentage >= 70) {
      emoji = '🌟';
      message = 'Great job! You know your stuff!';
    } else if (percentage >= 50) {
      emoji = '👍';
      message = 'Good effort! Keep learning together!';
    } else {
      emoji = '📚';
      message = 'Great opportunity to learn something new!';
    }

    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.resultsContent}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.resultsCenter}>
            <Text style={styles.resultsEmoji}>{emoji}</Text>
            <Text style={[styles.resultsTitle, {color: theme.colors.text}]}>
              Quiz Complete!
            </Text>
            <Text
              style={[styles.resultsScore, {color: theme.colors.primary}]}>
              {score}/{totalQuestions}
            </Text>
            <Text
              style={[
                styles.resultsPercentage,
                {color: theme.colors.textSecondary},
              ]}>
              {percentage}% correct
            </Text>
            <Text style={[styles.resultsMessage, {color: theme.colors.text}]}>
              {message}
            </Text>

            {score > games.quizHighScore - games.quizState.score && (
              <Animated.View
                entering={FadeInDown.delay(300)}
                style={[
                  styles.highScoreBadge,
                  {backgroundColor: '#FFD70020'},
                ]}>
                <Text style={styles.highScoreText}>
                  🏅 New High Score!
                </Text>
              </Animated.View>
            )}

            <View style={styles.resultsActions}>
              <GradientButton
                title="Play Again"
                onPress={handleRestart}
                style={styles.resultBtn}
              />
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[
                  styles.backToGamesBtn,
                  {backgroundColor: theme.colors.surfaceLight},
                ]}>
                <Text
                  style={[
                    styles.backToGamesText,
                    {color: theme.colors.text},
                  ]}>
                  Back to Games
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.text}]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.scoreText, {color: theme.colors.primary}]}>
          Score: {games.quizState.score}
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        style={[styles.progressBar, {backgroundColor: theme.colors.surfaceLight}]}>
        <Animated.View
          style={[
            styles.progressFill,
            {backgroundColor: theme.colors.primary},
            progressStyle,
          ]}
        />
      </View>

      {/* Question Counter */}
      <Text
        style={[styles.questionCount, {color: theme.colors.textSecondary}]}>
        Question {games.quizState.currentIndex + 1} of {totalQuestions}
      </Text>

      {/* Quiz Card */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {currentQuestion && (
          <QuizCard
            question={currentQuestion.question}
            options={currentQuestion.options}
            correctIndex={currentQuestion.correctIndex}
            explanation={currentQuestion.explanation}
            onAnswer={handleAnswer}
            answered={answered}
            selectedIndex={selectedIndex}
          />
        )}

        {/* Next Button */}
        {answered && !games.quizState.isComplete && (
          <Animated.View entering={FadeInDown.delay(500).duration(300)}>
            <GradientButton
              title="Next Question"
              onPress={handleNext}
              style={styles.nextBtn}
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: SPACING.lg,
  },
  backBtn: {paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(16), fontWeight: '500'},
  scoreText: {...TYPOGRAPHY.h3},
  progressBar: {height: 4, marginHorizontal: SPACING.lg, borderRadius: 2, overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: 2},
  questionCount: {...TYPOGRAPHY.bodySmall, textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.md},
  scrollContent: {paddingBottom: SPACING.xxl},
  nextBtn: {marginTop: SPACING.lg, alignSelf: 'center', width: '60%', marginHorizontal: SPACING.md},
  resultsContent: {flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg},
  resultsCenter: {alignItems: 'center'},
  resultsEmoji: {fontSize: 64, marginBottom: SPACING.md},
  resultsTitle: {...TYPOGRAPHY.hero, marginBottom: SPACING.sm},
  resultsScore: {fontSize: normalize(48), fontWeight: '800'},
  resultsPercentage: {...TYPOGRAPHY.h3, marginBottom: SPACING.md},
  resultsMessage: {...TYPOGRAPHY.body, textAlign: 'center', marginBottom: SPACING.lg},
  highScoreBadge: {paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, marginBottom: SPACING.lg},
  highScoreText: {fontSize: normalize(14), fontWeight: '600', color: '#FF8C00'},
  resultsActions: {gap: SPACING.md, width: '80%'},
  resultBtn: {width: '100%'},
  backToGamesBtn: {paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center'},
  backToGamesText: {...TYPOGRAPHY.button},
});

export default QuizScreen;
