import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '@screens/auth/LoginScreen';
import SignUpScreen from '@screens/auth/SignUpScreen';
import {SCREEN_NAMES} from '@utils/constants';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({current: {progress}}) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
      }}>
      <Stack.Screen name={SCREEN_NAMES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={SCREEN_NAMES.SIGN_UP} component={SignUpScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
