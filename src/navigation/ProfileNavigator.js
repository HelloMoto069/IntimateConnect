import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {SCREEN_NAMES} from '@utils/constants';
import ProfileScreen from '@screens/main/profile/ProfileScreen';
import JournalScreen from '@screens/main/profile/JournalScreen';
import JournalEditScreen from '@screens/main/profile/JournalEditScreen';
import KegelScreen from '@screens/main/profile/KegelScreen';
import KegelTimerScreen from '@screens/main/profile/KegelTimerScreen';
import GoalsScreen from '@screens/main/profile/GoalsScreen';
import BadgesScreen from '@screens/main/profile/BadgesScreen';

const Stack = createStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen
        name={SCREEN_NAMES.TRACKER_JOURNAL}
        component={JournalScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.TRACKER_JOURNAL_EDIT}
        component={JournalEditScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.TRACKER_KEGEL}
        component={KegelScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.TRACKER_KEGEL_TIMER}
        component={KegelTimerScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.TRACKER_GOALS}
        component={GoalsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.TRACKER_BADGES}
        component={BadgesScreen}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
