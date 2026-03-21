import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {SCREEN_NAMES} from '@utils/constants';
import PartnerScreen from '@screens/main/partner/PartnerScreen';
import SharedFavoritesScreen from '@screens/main/partner/SharedFavoritesScreen';
import WantToTryScreen from '@screens/main/partner/WantToTryScreen';
import ActivityScreen from '@screens/main/partner/ActivityScreen';
import PositionDetailScreen from '@screens/main/explore/PositionDetailScreen';

const Stack = createStackNavigator();

const PartnerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="PartnerHome" component={PartnerScreen} />
      <Stack.Screen
        name={SCREEN_NAMES.PARTNER_SHARED_FAVORITES}
        component={SharedFavoritesScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.PARTNER_WANT_TO_TRY}
        component={WantToTryScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.PARTNER_ACTIVITY}
        component={ActivityScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.POSITION_DETAIL}
        component={PositionDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default PartnerNavigator;
