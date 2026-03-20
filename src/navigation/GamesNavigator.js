import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {SCREEN_NAMES} from '@utils/constants';
import GamesScreen from '@screens/main/games/GamesScreen';
import TruthOrDareScreen from '@screens/main/games/TruthOrDareScreen';
import WouldYouRatherScreen from '@screens/main/games/WouldYouRatherScreen';
import QuizScreen from '@screens/main/games/QuizScreen';
import MiniGamesScreen from '@screens/main/games/MiniGamesScreen';

const Stack = createStackNavigator();

const GamesNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="GamesHome" component={GamesScreen} />
      <Stack.Screen
        name={SCREEN_NAMES.GAME_TRUTH_OR_DARE}
        component={TruthOrDareScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.GAME_WOULD_YOU_RATHER}
        component={WouldYouRatherScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.GAME_QUIZ}
        component={QuizScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.GAME_MINI}
        component={MiniGamesScreen}
      />
    </Stack.Navigator>
  );
};

export default GamesNavigator;
