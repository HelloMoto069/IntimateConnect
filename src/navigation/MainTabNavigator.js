import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import ExploreNavigator from './ExploreNavigator';
import GamesNavigator from './GamesNavigator';
import HealthNavigator from './HealthNavigator';
import PartnerNavigator from './PartnerNavigator';
import ProfileNavigator from './ProfileNavigator';
import {SCREEN_NAMES} from '@utils/constants';

const Tab = createBottomTabNavigator();

const TabIcon = ({label, focused, color}) => {
  const icons = {
    Explore: focused ? '🔥' : '🔥',
    Games: focused ? '🎮' : '🎮',
    Health: focused ? '💊' : '💊',
    Partner: focused ? '💕' : '💕',
    Profile: focused ? '👤' : '👤',
  };
  return <Text style={{fontSize: 22, opacity: focused ? 1 : 0.5}}>{icons[label] || '•'}</Text>;
};

const MainTabNavigator = () => {
  const {theme} = useTheme();
  const {selection} = useHaptic();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceLight,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
      screenListeners={{
        tabPress: () => selection(),
      }}>
      <Tab.Screen
        name={SCREEN_NAMES.EXPLORE}
        component={ExploreNavigator}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({focused, color}) => (
            <TabIcon label="Explore" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.GAMES}
        component={GamesNavigator}
        options={{
          tabBarLabel: 'Games',
          tabBarIcon: ({focused, color}) => (
            <TabIcon label="Games" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.HEALTH}
        component={HealthNavigator}
        options={{
          tabBarLabel: 'Health',
          tabBarIcon: ({focused, color}) => (
            <TabIcon label="Health" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.PARTNER}
        component={PartnerNavigator}
        options={{
          tabBarLabel: 'Partner',
          tabBarIcon: ({focused, color}) => (
            <TabIcon label="Partner" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.PROFILE}
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Me',
          tabBarIcon: ({focused, color}) => (
            <TabIcon label="Profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
