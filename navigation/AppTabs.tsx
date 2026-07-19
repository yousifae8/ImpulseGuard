import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../screens/App/HomeScreen'
import AddImpulseScreen from '../screens/App/AddImpulseScreen'
import HistoryScreen from '../screens/App/HistoryScreen'
import ImpulseDetailScreen from '../screens/App/ImpulseDetailScreen'
import { ImpulseItem } from '../store/slices/impulseSlice'

export type HomeStackParamList = {
  HomeList: undefined;
  ImpulseDetail: { impulse: ImpulseItem };
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeList" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="ImpulseDetail" component={ImpulseDetailScreen} options= {{ title: 'Impulse Detail' }} />
    </HomeStack.Navigator>
  );
}

export type AppTabParamList = {
  Home: undefined;
  AddImpulse: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="AddImpulse" component={AddImpulseScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
};

export default AppTabs;
