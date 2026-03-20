import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuth} from '@context/AuthContext';
import SplashScreen from '@screens/auth/SplashScreen';
import AgeVerificationScreen from '@screens/auth/AgeVerificationScreen';
import OnboardingScreen from '@screens/auth/OnboardingScreen';
import SetupPinScreen from '@screens/auth/SetupPinScreen';
import AppLockScreen from '@screens/auth/AppLockScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import {SCREEN_NAMES} from '@utils/constants';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const {
    isLoading,
    isAgeVerified,
    isOnboardingComplete,
    isAuthenticated,
    isPinSet,
    isAppLocked,
  } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyleInterpolator: ({current: {progress}}) => ({
          cardStyle: {opacity: progress},
        }),
      }}>
      {!isAgeVerified ? (
        <Stack.Screen
          name={SCREEN_NAMES.AGE_GATE}
          component={AgeVerificationScreen}
        />
      ) : !isOnboardingComplete ? (
        <Stack.Screen
          name={SCREEN_NAMES.ONBOARDING}
          component={OnboardingScreen}
        />
      ) : !isAuthenticated ? (
        <Stack.Screen name={SCREEN_NAMES.AUTH} component={AuthNavigator} />
      ) : !isPinSet ? (
        <Stack.Screen
          name={SCREEN_NAMES.SETUP_PIN}
          component={SetupPinScreen}
        />
      ) : isAppLocked ? (
        <Stack.Screen
          name={SCREEN_NAMES.APP_LOCK}
          component={AppLockScreen}
        />
      ) : (
        <Stack.Screen
          name={SCREEN_NAMES.MAIN}
          component={MainTabNavigator}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
