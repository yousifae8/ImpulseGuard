import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/AppTabs';
import {
  ImpulseItem,
  updateImpulse,
  setLoading,
  setError,
} from '../../store/slices/impulseSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import Button from '../../components/common/Button';
import theme from '../../components/common/theme';

type ImpulseDetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  'ImpulseDetail'
>;
type ImpulseDetailScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ImpulseDetail'>;

const ImpulseDetailScreen = () => {
  const route = useRoute<ImpulseDetailScreenRouteProp>();
  const navigation = useNavigation<ImpulseDetailScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.impulses);

  const { impulse } = route.params;

  const [timeLeft, setTimeLeft] = useState(0);
  const isReadyForReview = timeLeft <= 0;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const releaseTime = new Date(impulse.releaseAt).getTime();
      setTimeLeft(releaseTime - now);
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [impulse.releaseAt]);

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return 'Ready for review';

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleDecision = async (newStatus: 'purchased' | 'dismissed') => {
    dispatch(setLoading());
    try {
      const impulseRef = doc(db, 'impulses', impulse.id);
      await updateDoc(impulseRef, {
        status: newStatus,
      });

      const updatedItem: ImpulseItem = { ...impulse, status: newStatus };
      dispatch(updateImpulse(updatedItem));
      Alert.alert('Success', `Impulse marked as ${newStatus}.`);
      navigation.goBack();
    } catch (e: any) {
      dispatch(setError(e.message));
      Alert.alert('Error', `Failed to update impulse: ${e.message}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {impulse.imageUrl && (
        <Image
          source={{ uri: impulse.imageUrl.startsWith('data:') ? impulse.imageUrl : `data:image/jpeg;base64,${impulse.imageUrl}` }}
          style={styles.image}
        />
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{impulse.itemName}</Text>
        <Text style={styles.price}>${impulse.price.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Reason</Text>
        <Text style={styles.reason}>{impulse.reason}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Logged At</Text>
        <Text style={styles.value}>{new Date(impulse.loggedAt).toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        {impulse.status === 'pending' ? (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Time remaining</Text>
            <Text style={styles.timer}>{formatTimeLeft(timeLeft)}</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: impulse.status === 'purchased' ? '#4cca7433' : '#5a709033' }]}>
            <Text style={[styles.statusText, { color: impulse.status === 'purchased' ? theme.status.purchased : theme.status.dismissed }]}>
              {impulse.status.charAt(0).toUpperCase() + impulse.status.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {isReadyForReview && impulse.status === 'pending' && (
        <View style={styles.actions}>
          <Text style={styles.actionsLabel}>What would you like to do?</Text>
          {status === 'loading' ? (
            <ActivityIndicator size="large" color={theme.brand.primary} />
          ) : (
            <>
              <Button onPress={() => handleDecision('purchased')} buttonWidth={'100%'}>
                I still want to buy it
              </Button>
              <Button onPress={() => handleDecision('dismissed')} buttonWidth={'100%'} variant="secondary">
                I don't want it anymore
              </Button>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default ImpulseDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.bgBase,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 260,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: '700',
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
    flex: 1,
  },
  price: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: '700',
    color: theme.brand.primary,
    marginLeft: 16,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  label: {
    fontSize: theme.fontSize.small,
    color: theme.text.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    fontWeight: '500',
  },
  reason: {
    fontSize: theme.fontSize.medium,
    color: theme.text.textSecondary,
    lineHeight: 22,
  },
  value: {
    fontSize: theme.fontSize.medium,
    color: theme.text.textPrimary,
  },
  timerContainer: {
    backgroundColor: theme.background.bgSurface,
    padding: 16,
    borderRadius: theme.radius.medium,
  },
  timerLabel: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    marginBottom: 4,
  },
  timer: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: '700',
    color: theme.status.pending,
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: theme.fontSize.medium,
    fontWeight: '600',
  },
  actions: {
    paddingHorizontal: 24,
    marginTop: 32,
    gap: 12,
  },
  actionsLabel: {
    fontSize: theme.fontSize.medium,
    color: theme.text.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
});