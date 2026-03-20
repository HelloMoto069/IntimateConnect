import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import GamesScreen from '@screens/main/games/GamesScreen';

const Stack = createStackNavigator();

const GamesNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="GamesHome" component={GamesScreen} />
    </Stack.Navigator>
  );
};

export default GamesNavigator;
