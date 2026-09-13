import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES } from './routes';
import { CustomTabBar } from '../components/navigation/CustomTabBar';

// Tab screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { DeliveriesScreen } from '../screens/deliveries/DeliveriesScreen';
import { EarningsScreen } from '../screens/earnings/EarningsScreen';
import { RankingScreen } from '../screens/ranking/RankingScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Tab.Screen name={ROUTES.DELIVERIES} component={DeliveriesScreen} />
      <Tab.Screen name={ROUTES.EARNINGS} component={EarningsScreen} />
      <Tab.Screen name={ROUTES.RANKING} component={RankingScreen} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
};
