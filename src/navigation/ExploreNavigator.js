import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ExploreScreen from '@screens/main/explore/ExploreScreen';

const Stack = createStackNavigator();

const ExploreNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ExploreHome" component={ExploreScreen} />
    </Stack.Navigator>
  );
};

export default ExploreNavigator;
