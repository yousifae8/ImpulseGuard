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
  buttonHeight,
  fontSize,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  outline?: boolean;
  icon?: string;
  buttonWidth?: DimensionValue;
  buttonHeight?: DimensionValue;
  fontSize?: number;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        outline && styles.outline,
        buttonWidth ? { width: buttonWidth } : {},
        buttonHeight ? { height: buttonHeight } : {height: 45},
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
            fontSize ? { fontSize: fontSize } : {}, 
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
    borderRadius: theme.radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
   
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: theme.brand.primaryText,
    fontWeight: '600',
    fontFamily: theme.fonts.body,
  },
  secondaryText: {
    color: theme.brand.primary,
  },
  outlineText: {
    color: theme.brand.primary,
    textDecorationLine: 'underline',
  },
});

export default Button;