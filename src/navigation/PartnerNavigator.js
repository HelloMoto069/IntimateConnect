import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import PartnerScreen from '@screens/main/partner/PartnerScreen';

const Stack = createStackNavigator();

const PartnerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="PartnerHome" component={PartnerScreen} />
    </Stack.Navigator>
  );
};

export default PartnerNavigator;
