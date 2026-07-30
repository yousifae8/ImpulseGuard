import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setLoading, setError, setUser } from '../../store/slices/userSlice';
import { auth } from '../../utils/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/common/Button';
import theme from '../../components/common/theme';
import Input from '../../components/common/Input';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.user);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      dispatch(setLoading());
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password,
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
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Input
        placeholder="Email"
        value={formik.values.email}
        onChangeText={formik.handleChange('email')}
        onBlur={formik.handleBlur('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={formik.errors.email}
        touched={formik.touched.email}
      />
      <Input
        placeholder="Password"
        value={formik.values.password}
        onChangeText={formik.handleChange('password')}
        onBlur={formik.handleBlur('password')}
        secureTextEntry
        keyboardType="default"
        error={formik.errors.password}
        touched={formik.touched.password}
      />

      <View style={styles.actionContainer}>
        {status === 'loading' ? (
          <ActivityIndicator size="large" color={theme.brand.primary} />
        ) : (
          <Button onPress={() => formik.handleSubmit()} buttonWidth={'100%'}
            fontSize={theme.fontSize.medium}
          >
            Login
          </Button>
        )}
        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        <View style={styles.row}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <Button
            outline
            onPress={() => navigation.navigate('Signup')}
            buttonWidth={'auto'}
            fontSize={theme.fontSize.medium}
          >
            Signup
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
    gap: 12,
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
    fontWeight: '700',
    marginBottom: 20,
  },
  actionContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
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
    justifyContent: 'center',
    gap: 5,
  },
});

export default LoginScreen;
