import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';

const slides = [
  {
    key: 'privacy',
    title: 'Private & Secure',
    text: 'Your data is encrypted end-to-end.\nApp lock and disguise mode keep everything private.',
    gradient: ['#533483', '#0F3460'],
    icon: 'lock',
  },
  {
    key: 'connect',
    title: 'Connect With Your Partner',
    text: 'Link accounts to share favorites, play games together,\nand sync your desires privately.',
    gradient: ['#E94560', '#533483'],
    icon: 'heart',
  },
  {
    key: 'explore',
    title: 'Explore Together',
    text: '100+ positions, health guides, couples games,\nand wellness tracking — all completely free.',
    gradient: ['#FF6B6B', '#E94560'],
    icon: 'star',
  },
];

const OnboardingScreen = () => {
  const {completeOnboarding} = useAuth();
  const {theme} = useTheme();
  const {light} = useHaptic();

  const renderItem = ({item}) => (
    <LinearGradient colors={item.gradient} style={styles.slide}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>
          {item.icon === 'lock' ? '🔒' : item.icon === 'heart' ? '💕' : '✨'}
        </Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </LinearGradient>
  );

  const handleDone = () => {
    light();
    completeOnboarding();
  };

  const renderNextButton = () => (
    <View style={styles.buttonContainer}>
      <Text style={styles.buttonText}>Next</Text>
    </View>
  );

  const renderDoneButton = () => (
    <View style={[styles.buttonContainer, styles.doneButton]}>
      <Text style={styles.buttonText}>Get Started</Text>
    </View>
  );

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={handleDone}
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      dotStyle={styles.dot}
      activeDotStyle={[styles.dot, styles.activeDot]}
      showSkipButton={false}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  doneButton: {
    backgroundColor: '#E94560',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
});

export default OnboardingScreen;
