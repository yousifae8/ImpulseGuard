import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ImpulseItem } from '../../store/slices/impulseSlice';
import { db } from '../../utils/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; import theme from '../../components/common/theme';



type FilterType = 'all' | 'dismissed' | 'purchased';
const HistoryCard: React.FC<{ item: ImpulseItem; onPress: () => void }> = ({ item, onPress }) => {
  const isPurchased = item.status === 'purchased';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {item.imageUrl ? (
        <Image
          source={{
            uri: item.imageUrl.startsWith('http') || item.imageUrl.startsWith('data:')
              ? item.imageUrl
              : `data:image/jpeg;base64,${item.imageUrl}`,
          }}
          style={styles.cardImage}
        />
      ) : null}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.itemName}
          </Text>
          <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
        </View>
        {item.reason ? (
          <Text style={styles.cardReason} numberOfLines={2}>
            {item.reason}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isPurchased ? '#4cca7422' : '#5a709022',
                borderColor: isPurchased ? theme.status.purchased : theme.status.dismissed,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isPurchased ? theme.status.purchased : theme.status.dismissed },
              ]}
            >
              {isPurchased ? 'Purchased' : 'Saved / Avoided'}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.loggedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HistoryScreen = () => {

  const navigation = useNavigation<any>();
  const { uid } = useSelector((state: RootState) => state.user);
  const [historyItems, setHistoryItems] = useState<ImpulseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterType>('all');
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'impulses'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ImpulseItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as ImpulseItem;
          if (data.status === 'purchased' || data.status === 'dismissed') {
            items.push({
              ...data,
              id: doc.id,
            });
          }
        });
        items.sort(
          (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
        );
        setHistoryItems(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching history:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [uid]);
  const stats = useMemo(() => {
    let moneySaved = 0;
    let dismissedCount = 0;
    let purchasedCount = 0;
    let totalPurchasedAmount = 0;
    historyItems.forEach((item) => {
      if (item.status === 'dismissed') {
        moneySaved += item.price;
        dismissedCount++;
      } else if (item.status === 'purchased') {
        purchasedCount++;
        totalPurchasedAmount += item.price;
      }
    });
    return { moneySaved, dismissedCount, purchasedCount, totalPurchasedAmount };
  }, [historyItems]);
  const filteredItems = useMemo(() => {
    if (filter === 'dismissed') return historyItems.filter((i) => i.status === 'dismissed');
    if (filter === 'purchased') return historyItems.filter((i) => i.status === 'purchased');
    return historyItems;
  }, [historyItems, filter]);
  const handleCardPress = (item: ImpulseItem) => {
    navigation.navigate('Home', {
      screen: 'ImpulseDetail',
      params: { impulse: item },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, styles.statBoxSaved]}>
          <Text style={styles.statLabel}>Money Saved</Text>
          <Text style={styles.statValueSaved}>${stats.moneySaved.toFixed(2)}</Text>
          <Text style={styles.statSub}>{stats.dismissedCount} items avoided</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxPurchased]}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statValuePurchased}>${stats.totalPurchasedAmount.toFixed(2)}</Text>
          <Text style={styles.statSub}>{stats.purchasedCount} items bought</Text>
        </View>
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({historyItems.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'dismissed' && styles.filterTabActive]}
          onPress={() => setFilter('dismissed')}
        >
          <Text style={[styles.filterText, filter === 'dismissed' && styles.filterTextActive]}>
            Saved ({stats.dismissedCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'purchased' && styles.filterTabActive]}
          onPress={() => setFilter('purchased')}
        >
          <Text style={[styles.filterText, filter === 'purchased' && styles.filterTextActive]}>
            Purchased ({stats.purchasedCount})
          </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.brand.primary} style={styles.loader} />
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📜</Text>
          <Text style={styles.emptyTitle}>No History Found</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'Decisions you make on your ready items will show up here.'
              : filter === 'dismissed'
                ? 'No items you saved from purchasing.'
                : 'No items you purchased yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryCard item={item} onPress={() => handleCardPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.background.bgSurface,
    borderRadius: theme.radius.medium,
    padding: 14,
    borderWidth: 1,
  },
  statBoxSaved: {
    borderColor: '#4cca7433',
  },
  statBoxPurchased: {
    borderColor: '#3d4f6655',
  },
  statLabel: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValueSaved: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: '700',
    color: theme.semantic.success,
  },
  statValuePurchased: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: '700',
    color: theme.text.textPrimary,
  },
  statSub: {
    fontSize: theme.fontSize.small - 1,
    color: theme.text.textTertiary,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: theme.background.bgSurface,
    borderRadius: theme.radius.small,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.small - 2,
  },
  filterTabActive: {
    backgroundColor: theme.background.bgElevated,
  },
  filterText: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: theme.brand.primary,
    fontWeight: '700',
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: '700',
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.medium,
    color: theme.text.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: theme.background.bgSurface,
    borderRadius: theme.radius.medium,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.background.bgElevated,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardBody: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: theme.fontSize.medium,
    fontWeight: '700',
    color: theme.text.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  cardPrice: {
    fontSize: theme.fontSize.medium,
    fontWeight: '700',
    color: theme.brand.primary,
  },
  cardReason: {
    fontSize: theme.fontSize.small + 1,
    color: theme.text.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: theme.fontSize.small - 1,
    fontWeight: '600',
  },
  dateText: {
    fontSize: theme.fontSize.small - 1,
    color: theme.text.textSecondary,
  },
});

export default HistoryScreen;