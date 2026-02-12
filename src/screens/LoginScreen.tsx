import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginScreenProps } from '@/types';
import { COLORS, SPACING, RADIUS } from '@/constants';
import { validateEmail, sanitizeEmail } from '@/utils';
import { OtpManager } from '@/services';
import { Button, Input, Typography } from '@/components/common';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      if (emailError) {
        setEmailError(undefined);
      }
    },
    [emailError]
  );

  const handleSendOtp = useCallback(async () => {
    Keyboard.dismiss();

    const sanitizedEmail = sanitizeEmail(email);
    const validation = validateEmail(sanitizedEmail);

    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      OtpManager.generateOtp(sanitizedEmail);
      navigation.navigate('Otp', { email: sanitizedEmail });
    } catch {
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Typography variant="display" style={styles.iconText}>🔐</Typography>
              </View>
            </View>

            <View style={styles.header}>
              <Typography variant="display" align="center" style={styles.title}>
                Welcome
              </Typography>
              <Typography
                variant="body"
                color="secondary"
                align="center"
                style={styles.subtitle}
              >
                Enter your email to receive a one-time password
              </Typography>
            </View>

            <View style={styles.card}>
              <Input
                ref={inputRef}
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

            <View style={styles.footer}>
              <Typography variant="caption" color="tertiary" align="center">
                We'll send you a 6-digit code to verify your identity.
                {'\n'}No password needed.
              </Typography>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 36,
  },
  header: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  title: {
    marginBottom: SPACING.sm,
  },
  subtitle: {
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  button: {
    marginTop: SPACING.lg,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
  },
});
