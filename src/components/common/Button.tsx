
import React, { useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, TIMING, SHADOWS } from '@/constants';

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
  const containerStyle = [
    styles.container,
    styles[`${variant}Container`],
    isDisabled && styles[`${variant}Disabled`],
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    isDisabled && styles[`${variant}TextDisabled`],
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={containerStyle}
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
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
    ...SHADOWS.sm,
  },
  primaryText: {
    color: COLORS.textInverse,
  },
  primaryDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryTextDisabled: {
    color: COLORS.textTertiary,
  },

  secondaryContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
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
