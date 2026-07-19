import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import AuthNavigator from './AuthNavigator';
import React, { useEffect } from 'react';
import AppTabs from './AppTabs';
import { auth } from '../utils/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, clearUser, setLoading } from '../store/slices/userSlice';
import { ActivityIndicator, View, StyleSheet } from 'react-native';



function AppNavigator () {
  const dispatch = useDispatch<AppDispatch>();
  
  const {isLoggedIn, status} = useSelector((state: RootState) => state.user);

  useEffect(()=> {
    dispatch(setLoading());
    const unsubscribe = onAuthStateChanged(auth,(user)=>{
      if(user){
        dispatch(setUser({
          uid: user.uid,
          email: user.email || '',
        }))
      }else{
        dispatch(clearUser());
      }
    })
    return unsubscribe;
  },[dispatch]);

  if(status === 'loading'){
    return (
      <View >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;