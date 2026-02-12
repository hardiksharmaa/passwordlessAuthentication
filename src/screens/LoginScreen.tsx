import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginScreenProps } from '@/types';
import { COLORS, SPACING, FONT_SIZE } from '@/constants';
import { validateEmail, sanitizeEmail } from '@/utils';
import { OtpManager } from '@/services';
import { Button, Input, Typography } from '@/components/common';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle email input change
   */
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError(undefined);
    }
  }, [emailError]);

  /**
   * Handle Send OTP button press
   */
  const handleSendOtp = useCallback(async () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Validate email
    const sanitizedEmail = sanitizeEmail(email);
    const validation = validateEmail(sanitizedEmail);

    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate OTP
      OtpManager.generateOtp(sanitizedEmail);

      // Navigate to OTP screen
      navigation.navigate('Otp', { email: sanitizedEmail });
    } catch (error) {
      console.error('[LoginScreen] Error generating OTP:', error);
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Typography variant="display" style={styles.title}>
                Welcome
              </Typography>
              <Typography variant="body" color="secondary" style={styles.subtitle}>
                Enter your email to receive a one-time password
              </Typography>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={handleEmailChange}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
                editable={!isLoading}
              />

              <Button
                title="Send OTP"
                onPress={handleSendOtp}
                loading={isLoading}
                disabled={!email.trim()}
                style={styles.button}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Typography variant="caption" color="tertiary" align="center">
                We'll send you a 6-digit code to verify your identity.
                {'\n'}No password needed.
              </Typography>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xxxl,
  },
  title: {
    marginBottom: SPACING.sm,
  },
  subtitle: {
    lineHeight: 24,
  },
  form: {
    marginBottom: SPACING.xxxl,
  },
  button: {
    marginTop: SPACING.lg,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: SPACING.xl,
    right: SPACING.xl,
  },
});
