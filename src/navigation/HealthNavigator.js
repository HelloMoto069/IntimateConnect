import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HealthScreen from '@screens/main/health/HealthScreen';

const Stack = createStackNavigator();

const HealthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HealthHome" component={HealthScreen} />
    </Stack.Navigator>
  );
};

export default HealthNavigator;
