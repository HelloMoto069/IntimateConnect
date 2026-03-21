import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import {ThemeProvider, useTheme} from '@context/ThemeContext';
import {AuthProvider} from '@context/AuthContext';
import {CoupleProvider} from '@context/CoupleContext';
import {ContentProvider} from '@context/ContentContext';
import {TrackerProvider} from '@context/TrackerContext';
import RootNavigator from '@navigation/RootNavigator';
import {toastConfig} from '@components/common/Toast';
import ErrorBoundary from '@components/common/ErrorBoundary';
import SyncStatusBar from '@components/common/SyncStatusBar';

const AppContent = () => {
  const {isDark, theme} = useTheme();

  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.surfaceLight,
      notification: theme.colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <SyncStatusBar />
      <RootNavigator />
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AuthProvider>
          <CoupleProvider>
            <ContentProvider>
              <TrackerProvider>
                <AppContent />
              </TrackerProvider>
            </ContentProvider>
          </CoupleProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
