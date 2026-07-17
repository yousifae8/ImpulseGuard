import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setLoading, setError, setUser } from '../../store/slices/userSlice';
import { auth } from '../../utils/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;



const LoginScreen = () => {

const [email,setEmail] = useState('')
const [password,setPassword] = useState('')
const navigation = useNavigation<LoginScreenNavigationProp>()
const dispatch = useDispatch<AppDispatch>()
const {status,error} = useSelector((state:RootState)=>state.user)

const handlelogin = async () => {
  dispatch(setLoading())
  try{
    const userCredential = await signInWithEmailAndPassword(auth,email,password)
    dispatch(setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
    }))
  }catch(e:any){
    dispatch(setError(e.message))
    Alert.alert('Login Error',e.message)
  }
} 

  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <TextInput 
      placeholder='Email'
      value={email}
      onChangeText={setEmail}
      keyboardType='email-address'
      autoCapitalize='none'
      
      />
      <TextInput 
      placeholder='Password'
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      
      />
      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#0000ff"   />
      ) : (
        <Button title="Login" onPress={handlelogin} />
      )}
      {error && <Text>{error}</Text>}
      <Button title="Don't have an account? Signup" onPress={()=>navigation.navigate('Signup')}
      />
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

export default LoginScreen;