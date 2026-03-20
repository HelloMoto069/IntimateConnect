import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ProfileScreen from '@screens/main/profile/ProfileScreen';

const Stack = createStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
