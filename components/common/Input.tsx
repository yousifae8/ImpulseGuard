import { StyleSheet, TextInput, View, KeyboardTypeOptions } from 'react-native';
import theme from './theme';

const Input = ({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  multiline,
  autoCapitalize,
  secureTextEntry,
  label,
  numberOfLines,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  label?: string;
  numberOfLines?: number;
}) => {
  return (
    <View style={styles.wrapper}>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor={theme.text.textTertiary}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        numberOfLines={numberOfLines}        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: theme.text.textTertiary,
    borderWidth: 1,
    borderRadius: theme.radius.small,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.text.textPrimary,
    backgroundColor: theme.background.bgInput,
    fontSize: theme.fontSize.medium,
    fontFamily: theme.fonts.body,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});

export default Input;