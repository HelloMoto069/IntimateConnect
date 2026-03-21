import React, {useEffect} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {STORAGE_KEYS, DISGUISE_CONFIG} from '@utils/constants';
import {fastStore} from '@utils/encryptionUtils';

const SplashScreen = () => {
  const {theme} = useTheme();
  const isDisguised = fastStore.getBoolean(STORAGE_KEYS.DISGUISE_MODE);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, {duration: 800});
    translateY.value = withTiming(0, {duration: 800});
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={[styles.title, {color: theme.colors.primary}]}>
          {isDisguised ? DISGUISE_CONFIG.appName : 'IntimateConnect'}
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          {isDisguised ? DISGUISE_CONFIG.subtitle : 'Your private wellness companion'}
        </Text>
      </Animated.View>
      <ActivityIndicator
        size="small"
        color={theme.colors.primary}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  loader: {
    position: 'absolute',
    bottom: 80,
  },
});

export default SplashScreen;
