import { useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { clearUser } from '../../store/slices/userSlice'
import { setImpulses, setLoading, setError, ImpulseItem } from '../../store/slices/impulseSlice'
import { auth, db } from '../../utils/firebaseConfig'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import Button from '../../components/common/Button'
import theme from '../../components/common/theme'
import ImpulseCard from '../../components/ImpulseCard'

  


const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { uid } = useSelector((state: RootState) => state.user)
  const { items, status, error } = useSelector((state: RootState) => state.impulses)

  useEffect(() => {
    if (!uid) {
      return;
    }
    dispatch(setLoading())
    const q = query(
      collection(db, 'impulses'),
      where('userId', '==', uid),
      where('status', '==', 'pending'),
      orderBy('releaseAt', 'asc')
    )
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const impulses: ImpulseItem[] = []
      querySnapshot.forEach((doc) => {
        impulses.push({
          ...doc.data(),
          id: doc.id,
        } as ImpulseItem)
      })
      dispatch(setImpulses(impulses))
    }, (e) => {
      dispatch(setError(e.message))
      Alert.alert('Error fetching impulses', e.message)
    })

    return () => unsubscribe()
  }, [uid, dispatch])

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
    } catch (e: any) {
      Alert.alert('Logout Error', e.message)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Your Items</Text>
        <Button onPress={handleLogout} 
        buttonWidth={60}
        buttonHeight={30}
        fontSize={12}
>  
          Logout
        </Button>
      </View>

      <Text style={styles.subtitle}>Pending items</Text>

      {status === 'loading' ? (
        <ActivityIndicator size="large" color={theme.brand.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          {/* <Text style={styles.emptyEmoji}>📋</Text> */}
          <Text style={styles.emptyTitle}>No pending items</Text>
          <Text style={styles.emptySubtitle}>Tap "Add" to log your first item</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          renderItem={({ item }) => <ImpulseCard item={item }/>}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.bgBase,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: theme.fontSize.xxlarge,
    fontWeight: '700',
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
  },
  subtitle: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  list: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  // emptyEmoji: {
  //   fontSize: 48,
  //   marginBottom: 12,
  // },
  emptyTitle: {
    fontSize: theme.fontSize.large,
    color: theme.text.textPrimary,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
  },
  errorText: {
    color: theme.semantic.danger,
    fontSize: theme.fontSize.medium,
    textAlign: 'center',
  },
});

export default HomeScreen;