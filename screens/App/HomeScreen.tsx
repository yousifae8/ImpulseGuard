import { useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native'
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
import Button from '../../components/common/Button'
import theme from '../../components/common/theme'

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeList'>;

const ImpulseCard: React.FC<{ item: ImpulseItem }> = ({ item }) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const timeLeft = new Date(item.releaseAt).getTime() - new Date().getTime()
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

  const isReady = timeLeft <= 0

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ImpulseDetail', { impulse: item })}
      style={styles.card}
      activeOpacity={0.7}
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl.startsWith('data:') ? item.imageUrl : `data:image/jpeg;base64,${item.imageUrl}` }}
          style={styles.cardImage}
        />
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.itemName}</Text>
          <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.cardReason} numberOfLines={2}>{item.reason}</Text>
        <View style={styles.cardFooter}>
          {isReady ? (
            <View style={styles.readyBadge}>
              <Text style={styles.readyBadgeText}>Ready for Review</Text>
            </View>
          ) : (
            <View style={styles.timerBadge}>
              <Text style={styles.timerBadgeText}>{days}d {hours}h {minutes}m</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
          id: doc.id,
          ...doc.data()
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
        <Text style={styles.greeting}>Your Impulses</Text>
        <Button onPress={handleLogout} buttonWidth={80}>
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
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No pending impulses</Text>
          <Text style={styles.emptySubtitle}>Tap "AddImpulse" to log your first impulse</Text>
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
  card: {
    backgroundColor: theme.background.bgElevated,
    borderRadius: theme.radius.medium,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardBody: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: '600',
    color: theme.text.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.body,
  },
  cardPrice: {
    fontSize: theme.fontSize.large,
    fontWeight: '700',
    color: theme.brand.primary,
    marginLeft: 10,
  },
  cardReason: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBadge: {
    backgroundColor: theme.background.bgSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  timerBadgeText: {
    fontSize: theme.fontSize.small,
    color: theme.status.pending,
    fontWeight: '500',
  },
  readyBadge: {
    backgroundColor: '#f0b42933',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  readyBadgeText: {
    fontSize: theme.fontSize.small,
    color: theme.status.ready,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
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