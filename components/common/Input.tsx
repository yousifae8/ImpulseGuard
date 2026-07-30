import { StyleSheet, TextInput, View, Text, KeyboardTypeOptions } from 'react-native';
import theme from './theme';

const Input = ({
  placeholder,
  value,
  onChangeText,
  onBlur,
  keyboardType,
  multiline,
  autoCapitalize,
  secureTextEntry,
  label,
  numberOfLines,
  error,
  touched,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: any) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  label?: string;
  numberOfLines?: number;
  error?: string;
  touched?: boolean;
}) => {
  const showError = Boolean(touched && error);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          showError && styles.inputError,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        multiline={multiline}
        placeholderTextColor={theme.text.textTertiary}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        numberOfLines={numberOfLines}        
      />
      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 8,
  },
  label: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    marginBottom: 4,
    fontFamily: theme.fonts.body,
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
  inputError: {
    borderColor: theme.semantic.danger,
  },
  errorText: {
    color: theme.semantic.danger,
    fontSize: theme.fontSize.small,
    marginTop: 4,
    fontFamily: theme.fonts.body,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});

export default Input;