import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setLoading, setError, setUser } from '../../store/slices/userSlice';
import { auth } from '../../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import theme from '../../components/common/theme';

type SignupScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Signup'
>;

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const SignupScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<SignupScreenNavigationProp>();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      dispatch(setLoading());
      try {
        const userCredential = await createUserWithEmailAndPassword(
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
        Alert.alert('Signup Error', e.message);
      }
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
        error={formik.errors.password}
        touched={formik.touched.password}
      />
      <Input
        placeholder="Confirm Password"
        value={formik.values.confirmPassword}
        onChangeText={formik.handleChange('confirmPassword')}
        onBlur={formik.handleBlur('confirmPassword')}
        secureTextEntry
        error={formik.errors.confirmPassword}
        touched={formik.touched.confirmPassword}
      />
      <View style={styles.actionContainer}>
        {status === 'loading' ? (
          <ActivityIndicator size="large" color={theme.brand.primary} />
        ) : (
          <Button onPress={() => formik.handleSubmit()} buttonWidth={'100%'}
            fontSize={theme.fontSize.medium}
          >
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
            fontSize={theme.fontSize.medium}
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
    gap: 12,
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
    fontWeight: '700',
    marginBottom: 20,
  },
  actionContainer: { marginTop: 30, width: '100%', alignItems: 'center', gap: 20 },
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

export default SignupScreen;
