import React from 'react';
import { View, Text, Button, StyleSheet,Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { clearUser } from '../../store/slices/userSlice';
import { auth } from '../../utils/firebaseConfig';
import { signOut } from 'firebase/auth';


const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
    } catch (e: any) {
      Alert.alert('Logout Error',e.message);
    }
  };
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;