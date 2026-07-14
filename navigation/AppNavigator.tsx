import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthNavigator from './AuthNavigator';
import AppTabs from './AppTabs';

function AppNavigator () {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;