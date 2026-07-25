import { ImpulseItem } from "../store/slices/impulseSlice";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppTabs";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import theme from "./common/theme";

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
          source={{ uri: item.imageUrl.startsWith('http') || item.imageUrl.startsWith('data:') ? item.imageUrl : `data:image/jpeg;base64,${item.imageUrl}` }}
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

const styles = StyleSheet.create({
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
});


export default ImpulseCard;