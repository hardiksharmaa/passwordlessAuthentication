import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, TIMING } from '@/constants';

type ButtonVariant = 'primary' | 'secondary' | 'text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const lastPressTime = useRef(0);
  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastPressTime.current < TIMING.BUTTON_DEBOUNCE) {
      return;
    }
    lastPressTime.current = now;
    onPress();
  }, [onPress]);

  const isDisabled = disabled || loading;

  const getContainerStyle = (pressed: boolean) => [
    styles.container,
    styles[`${variant}Container`],
    isDisabled && styles[`${variant}Disabled`],
    pressed && !isDisabled && styles[`${variant}Pressed`],
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    isDisabled && styles[`${variant}TextDisabled`],
  ];

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => getContainerStyle(pressed)}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? COLORS.textInverse : COLORS.primary}
          />
        </View>
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    width: '100%',
  },
  loadingContainer: {
    height: 20,
    justifyContent: 'center',
  },
  text: {
    fontSize: FONT_SIZE.md,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },

  primaryContainer: {
    backgroundColor: COLORS.primary,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(37, 99, 235, 0.3)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  primaryPressed: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  primaryText: {
    color: COLORS.textInverse,
  },
  primaryDisabled: {
    backgroundColor: COLORS.disabled,
    ...(Platform.OS === 'web'
      ? { boxShadow: 'none' as any }
      : { shadowOpacity: 0, elevation: 0 }),
  },
  primaryTextDisabled: {
    color: COLORS.textTertiary,
  },

  secondaryContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  secondaryPressed: {
    backgroundColor: COLORS.primaryLight + '15',
    transform: [{ scale: 0.98 }],
  },
  secondaryText: {
    color: COLORS.primary,
  },
  secondaryDisabled: {
    borderColor: COLORS.disabled,
  },
  secondaryTextDisabled: {
    color: COLORS.textTertiary,
  },

  textContainer: {
    backgroundColor: 'transparent',
    height: 40,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  textPressed: {
    opacity: 0.7,
  },
  textText: {
    color: COLORS.primary,
  },
  textDisabled: {
    backgroundColor: 'transparent',
  },
  textTextDisabled: {
    color: COLORS.textTertiary,
  },
});

export default Button;
