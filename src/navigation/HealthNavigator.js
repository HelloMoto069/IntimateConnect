import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {SCREEN_NAMES} from '@utils/constants';
import HealthScreen from '@screens/main/health/HealthScreen';
import ArticleDetailScreen from '@screens/main/health/ArticleDetailScreen';
import GuidesScreen from '@screens/main/health/GuidesScreen';
import GuidePlayerScreen from '@screens/main/health/GuidePlayerScreen';
import GlossaryScreen from '@screens/main/health/GlossaryScreen';
import WellnessCheckInScreen from '@screens/main/health/WellnessCheckInScreen';

const Stack = createStackNavigator();

const HealthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HealthHome" component={HealthScreen} />
      <Stack.Screen
        name={SCREEN_NAMES.HEALTH_ARTICLE_DETAIL}
        component={ArticleDetailScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.HEALTH_GUIDES}
        component={GuidesScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.HEALTH_GUIDE_PLAYER}
        component={GuidePlayerScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.HEALTH_GLOSSARY}
        component={GlossaryScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.HEALTH_CHECKIN}
        component={WellnessCheckInScreen}
      />
    </Stack.Navigator>
  );
};

export default HealthNavigator;
