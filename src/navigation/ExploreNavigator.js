import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ExploreScreen from '@screens/main/explore/ExploreScreen';
import PositionDetailScreen from '@screens/main/explore/PositionDetailScreen';
import PositionOfTheDayScreen from '@screens/main/explore/PositionOfTheDayScreen';
import CategoryBrowseScreen from '@screens/main/explore/CategoryBrowseScreen';
import SearchScreen from '@screens/main/explore/SearchScreen';
import FavoritesScreen from '@screens/main/explore/FavoritesScreen';
import {SCREEN_NAMES} from '@utils/constants';

const Stack = createStackNavigator();

const ExploreNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ExploreHome" component={ExploreScreen} />
      <Stack.Screen
        name={SCREEN_NAMES.POSITION_DETAIL}
        component={PositionDetailScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.POSITION_OF_THE_DAY}
        component={PositionOfTheDayScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.CATEGORY_BROWSE}
        component={CategoryBrowseScreen}
      />
      <Stack.Screen name={SCREEN_NAMES.SEARCH} component={SearchScreen} />
      <Stack.Screen name={SCREEN_NAMES.FAVORITES} component={FavoritesScreen} />
    </Stack.Navigator>
  );
};

export default ExploreNavigator;
