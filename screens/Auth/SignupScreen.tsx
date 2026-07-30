import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setLoading, setError, setUser } from '../../store/slices/userSlice';
import { auth } from '../../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import theme from '../../components/common/theme';

type SignupScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Signup'
>;

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<SignupScreenNavigationProp>();

  const handleSignup = async () => {
    dispatch(setLoading());
    try {
      const userCredential = await createUserWithEmailAndPassword(
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
      Alert.alert('Signup Error', e.message);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
      />
      <View style={styles.actionContainer}>
        {status === 'loading' ? (
          <ActivityIndicator size="large" color={theme.brand.primary} />
        ) : (
          <Button onPress={handleSignup} buttonWidth={'100%'}>
            Sign Up
          </Button>
        )}
        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}
        <View style={styles.row}>
<Text style={styles.signupText}>Already have an account?</Text>
        <Button
          outline
          onPress={() => navigation.navigate('Login')}
          buttonWidth={'auto'}
        >
        Login
        </Button>
        </View>
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
    gap: 20,
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
    fontWeight: '700',
    marginBottom: 20,
  },
  actionContainer: { marginTop: 50, width: '100%', alignItems: 'center', gap: 20 },
  errorText: { color: theme.semantic.danger, margin: 10 },
  signupText: {
    fontSize: theme.fontSize.medium,
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",

  },
});

export default SignupScreen;
