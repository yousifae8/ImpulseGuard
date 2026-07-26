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



import theme from '../components/common/theme';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.brand.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.bgBase,
  },
});

export default AppNavigator;