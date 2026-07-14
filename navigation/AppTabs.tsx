import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/App/HomeScreen';
import AddImpulseScreen from '../screens/App/AddImpulseScreen';
import HistoryScreen from '../screens/App/HistoryScreen';

export type AppTabParamList = {
  Home: undefined;
  AddImpulse: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AddImpulse" component={AddImpulseScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
};

export default AppTabs;
