
import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;

  length?: number;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  error = false,
}: OtpInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);


  const handleChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/[^0-9]/g, '').slice(-1);

      const newDigits = [...digits];
      newDigits[index] = digit;
      const newValue = newDigits.join('').slice(0, length);

      onChange(newValue);
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      if (newValue.length === length && onComplete) {
        Keyboard.dismiss();
        onComplete(newValue);
      }
    },
    [digits, length, onChange, onComplete]
  );

  const handleKeyPress = useCallback(
    (e: { nativeEvent: { key: string } }, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {

        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    },
    [digits, onChange]
  );
  const handleBoxPress = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);
  useEffect(() => {
    const firstEmptyIndex = digits.findIndex(d => !d);
    const targetIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
    
    const timer = setTimeout(() => {
      inputRefs.current[targetIndex]?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = !!digits[index];
        const isCurrentEmpty = !digits[index] && !digits[index - 1]?.length;

        return (
          <Pressable
            key={index}
            onPress={() => handleBoxPress(index)}
            style={[
              styles.box,
              isFilled && styles.boxFilled,
              error && styles.boxError,
              disabled && styles.boxDisabled,
            ]}
          >
            <TextInput
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.input,
                isFilled && styles.inputFilled,
                error && styles.inputError,
              ]}
              value={digits[index]}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus={true}
              editable={!disabled}
              caretHidden={true}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const BOX_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE + 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  boxError: {
    borderColor: COLORS.error,
  },
  boxDisabled: {
    backgroundColor: COLORS.surfaceAlt,
  },
  input: {
    fontSize: FONT_SIZE.xxl,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  inputFilled: {
    color: COLORS.primary,
  },
  inputError: {
    color: COLORS.error,
  },
});

export default OtpInput;
