import { View, Text, StyleSheet } from 'react-native';
import theme from '../../components/common/theme';

const HistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📜</Text>
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Your completed impulses will appear here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.bgBase,
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: '700',
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: theme.fontSize.medium,
    color: theme.text.textSecondary,
    textAlign: 'center',
  },
});

export default HistoryScreen;