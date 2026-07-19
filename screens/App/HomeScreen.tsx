import React, { useEffect } from 'react'
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { clearUser } from '../../store/slices/userSlice'
import { setImpulses, setLoading, setError, ImpulseItem } from '../../store/slices/impulseSlice'
import { auth, db } from '../../utils/firebaseConfig'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { HomeStackParamList } from '../../navigation/AppTabs'

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeList'>;

const ImpulseCard: React.FC<{ item: ImpulseItem }> = ({ item }) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const timeLeft = new Date(item.releaseAt).getTime() - new Date().getTime()
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

  const isReady = timeLeft <= 0

  return (
    <TouchableOpacity onPress={() => navigation.navigate('ImpulseDetail', { impulse: item })}>   
      <Text >{item.itemName}</Text>
      <Text>Price: ${item.price.toFixed(2)}</Text>
      <Text>Reason: {item.reason}</Text>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} />}
      {isReady ? (
        <Text >Ready for Review!</Text>
      ) : (
        <Text>Time Left: {days}d {hours}h {minutes}m</Text>
      )}
    </TouchableOpacity>
  );
};



const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {uid} = useSelector((state:RootState) => state.user)
  const {items,status,error} = useSelector((state:RootState)=>state.impulses)

  useEffect(() => {
    if(!uid){
      return;
    }
    dispatch(setLoading())
    const q = query(
      collection(db, 'impulses'),
      where('userId','==',uid),
      where('status','==','pending'),
      orderBy('releaseAt','asc')
    )
    const unsubscribe = onSnapshot(q,(querySnapshot) => {
      const impulses: ImpulseItem[] =  []
      querySnapshot.forEach((doc) => {
        impulses.push({
          id: doc.id,
          ...doc.data()
        } as ImpulseItem)
      })
      dispatch(setImpulses(impulses))
    }, (e)=> {
      dispatch(setError(e.message))
      Alert.alert('Error fetching impulses', e.message)

    }

  )
    return () => unsubscribe()
  },[uid,dispatch])

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
    } catch (e: any) {
      Alert.alert('Logout Error',e.message)
    }
  }




  return (
    <View style={styles.container}>
      <Text>Welcome to ImpulseGuard</Text>

      <Button title="Logout" onPress={handleLogout} />

      <Text>
        Your pending impulses: 

      </Text>
      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : items.length === 0 ? (
        <Text>No pending impulses</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ImpulseCard item={item} />}
        />
      )}
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