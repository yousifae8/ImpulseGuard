import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setLoading, setError, setUser } from '../../store/slices/userSlice';
import { auth } from '../../utils/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Button from '../../components/common/Button';
import theme from '../../components/common/theme';
import Input from '../../components/common/Input';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.user);

  const handlelogin = async () => {
    dispatch(setLoading());
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      dispatch(
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
        }),
      );
    } catch (e: any) {
      dispatch(setError(e.message));
      Alert.alert('Login Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        keyboardType="default"
      />

      <View style={styles.actionContainer}>
        {status === 'loading' ? (
          <ActivityIndicator size="large" color={theme.brand.primary} />
        ) : (
          <Button onPress={handlelogin} buttonWidth={'100%'}>
            Login
          </Button>
        )}
        {error && (
          <Text style={{ color: theme.semantic.danger, margin: 10 }}>
            {error}
          </Text>
        )}
        <Button
          outline
          onPress={() => navigation.navigate('Signup')}
          buttonWidth={'100%'}
        >
          Don't have an account? Signup
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.bgBase,
    paddingHorizontal: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: theme.radius.small,
    padding: 10,
    marginBottom: 10,
    color: theme.text.textPrimary,
  },
  error: {
    color: theme.semantic.danger,
    marginBottom: 10,
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
    fontWeight: '700',
    marginBottom: 20,
  },
  actionContainer: {
    marginTop: 50,
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  errorText: { color: theme.semantic.danger, margin: 10 },
});

export default LoginScreen;
