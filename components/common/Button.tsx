import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import theme from './theme';
import type { DimensionValue } from 'react-native';

const Button = ({
  children,
  onPress,
  disabled,
  loading,
  variant,
  outline,
  icon,
  buttonWidth,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  outline?: boolean;
  icon?: string;
  buttonWidth?: DimensionValue;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        outline && styles.outline,
        buttonWidth ? { width: buttonWidth } : {},
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={theme.brand.primary} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'secondary' && styles.secondaryText,
            outline && styles.outlineText,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.brand.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '30%',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.brand.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: theme.brand.primaryText,
    fontSize: theme.fontSize.medium,
    fontWeight: '600',
    fontFamily: theme.fonts.body,
  },
  secondaryText: {
    color: theme.brand.primary,
  },
  outlineText: {
    color: theme.brand.primary,
  },
});

export default Button;