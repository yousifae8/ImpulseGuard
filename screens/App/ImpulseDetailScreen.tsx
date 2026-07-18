import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  Alert,
  ActivityIndicator,
  ScrollView,
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

    const days = Math.floor((ms / 1000) * 60 * 60 * 24);
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
   <ScrollView>
        <Text>{impulse.itemName}</Text>
        {impulse.imageUrl && <Image source={{uri:  impulse.imageUrl }} />}
<Text>price: ${impulse.price.toFixed(2)}</Text>
<Text>Reason: {impulse.reason}</Text>
<Text>Logged At: {new Date(impulse.loggedAt).toLocaleString()}</Text>

<View>
    <Text>
        Status:
        {   impulse.status === 'pending' ? (<Text>{formatTimeLeft(timeLeft)}</Text>) : (<Text>{impulse.status.toUpperCase()}</Text>)  }
    </Text>
</View>

{isReadyForReview && impulse.status === 'pending' && (
  <View>
    {status === 'loading' ? (
      <ActivityIndicator size={'small'} color={"#0000ff"} />
    ) : (
      <>
        <Button title="I still want to buy it" onPress={() => handleDecision('purchased')} />
        <Button title="I don't want it anymore" onPress={() => handleDecision('dismissed')} />
      </>
    )}
    {impulse.status != 'pending' && (
        <Text>This impulse has already been {impulse.status} </Text>
    )}

  </View>
)}

   </ScrollView>
  );
};

export default ImpulseDetailScreen;
