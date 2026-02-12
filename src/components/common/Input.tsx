import React, { useState, useCallback, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
  Pressable,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    containerStyle,
    onFocus,
    onBlur,
    editable = true,
    ...rest
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<TextInput>(null);
  const resolvedRef = (ref as React.RefObject<TextInput>) || inputRef;

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

  const handleContainerPress = useCallback(() => {
    resolvedRef.current?.focus();
  }, [resolvedRef]);

  const getBorderColor = () => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.borderFocus;
    return COLORS.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        onPress={handleContainerPress}
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          isFocused && styles.inputFocused,
          !editable && styles.inputDisabled,
        ]}
      >
        <TextInput
          ref={resolvedRef}
          style={[
            styles.input,
            !editable && styles.inputTextDisabled,
          ]}
          placeholderTextColor={COLORS.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          {...rest}
        />
      </Pressable>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontFamily: 'Inter_500Medium',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  inputFocused: {
    backgroundColor: COLORS.surface,
    ...Platform.select({
      web: {
        boxShadow: `0 0 0 3px ${COLORS.primary}20`,
      },
      default: {},
    }),
  },
  inputDisabled: {
    backgroundColor: COLORS.surfaceAlt,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textPrimary,
    padding: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  inputTextDisabled: {
    color: COLORS.textTertiary,
  },
  error: {
    fontSize: FONT_SIZE.sm,
    fontFamily: 'Inter_400Regular',
    color: COLORS.error,
    marginTop: SPACING.sm,
  },
});

export default Input;
