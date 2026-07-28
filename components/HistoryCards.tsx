import { ImpulseItem } from '../store/slices/impulseSlice';
import theme from './common/theme';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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


const styles = StyleSheet.create({
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

export default HistoryCard;