import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpScreenProps } from '@/types';
import { COLORS, SPACING, RADIUS, OTP_CONFIG } from '@/constants';
import { OtpManager } from '@/services';
import { Button, Typography } from '@/components/common';
import { OtpInput, CountdownTimer } from '@/components/otp';

export default function OtpScreen({ navigation, route }: OtpScreenProps) {
  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(
    OTP_CONFIG.MAX_ATTEMPTS
  );
  const [timerKey, setTimerKey] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleOtpChange = useCallback(
    (value: string) => {
      setOtp(value);
      if (error) {
        setError(undefined);
      }
    },
    [error]
  );

  const handleVerify = useCallback(async (otpValue?: string) => {
    const codeToVerify = otpValue ?? otp;
    
    if (codeToVerify.length !== OTP_CONFIG.LENGTH) {
      setError(`Please enter all ${OTP_CONFIG.LENGTH} digits`);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = OtpManager.validateOtp(email, codeToVerify);

      if (!isMounted.current) return;

      if (result.success) {
        navigation.replace('Session', { email });
      } else {
        setRemainingAttempts(result.remainingAttempts);

        switch (result.error) {
          case 'INVALID_OTP':
            setError(
              `Incorrect code. ${result.remainingAttempts} attempt${result.remainingAttempts !== 1 ? 's' : ''} remaining.`
            );
            setOtp('');
            break;
          case 'EXPIRED_OTP':
            setError('Code expired. Please request a new one.');
            setIsExpired(true);
            break;
          case 'MAX_ATTEMPTS_EXCEEDED':
            setError('Too many attempts. Please request a new code.');
            break;
          case 'NO_OTP_FOUND':
            setError('No code found. Please request a new one.');
            break;
          default:
            setError('Verification failed. Please try again.');
        }
      }
    } catch {
      if (isMounted.current) {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [otp, email, navigation]);

  const handleOtpComplete = useCallback(
    (value: string) => {
      setOtp(value);
      setTimeout(() => {
        if (isMounted.current && value.length === OTP_CONFIG.LENGTH) {
          handleVerify(value);
        }
      }, 100);
    },
    [handleVerify]
  );

  const handleExpire = useCallback(() => {
    if (isMounted.current) {
      setIsExpired(true);
    }
  }, []);

  const handleResend = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      OtpManager.generateOtp(email);

      if (!isMounted.current) return;

      setOtp('');
      setIsExpired(false);
      setRemainingAttempts(OTP_CONFIG.MAX_ATTEMPTS);
      setTimerKey((prev) => prev + 1);

      Alert.alert('Code Sent', 'A new verification code has been sent.');
    } catch {
      if (isMounted.current) {
        setError('Failed to send new code. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [email]);

  const handleBack = useCallback(() => {
    OtpManager.clearOtpRecord(email);
    navigation.goBack();
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
                <Typography variant="display" style={styles.iconText}>✉️</Typography>
              </View>
            </View>

            <View style={styles.header}>
              <Typography variant="heading" align="center" style={styles.title}>
                Enter Verification Code
              </Typography>
              <Typography
                variant="body"
                color="secondary"
                align="center"
                style={styles.subtitle}
              >
                We sent a 6-digit code to
              </Typography>
              <Typography variant="body" color="primary" weight="semiBold" align="center">
                {email}
              </Typography>
            </View>

            <View style={styles.card}>
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                onComplete={handleOtpComplete}
                length={OTP_CONFIG.LENGTH}
                disabled={isLoading}
                error={!!error}
              />

              <View style={styles.timerContainer}>
                <CountdownTimer
                  key={timerKey}
                  duration={OTP_CONFIG.EXPIRY_SECONDS}
                  onExpire={handleExpire}
                  isExpired={isExpired}
                />
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Typography
                    variant="caption"
                    color="error"
                    align="center"
                  >
                    {error}
                  </Typography>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <Button
                title="Verify"
                onPress={() => handleVerify()}
                loading={isLoading}
                disabled={
                  otp.length !== OTP_CONFIG.LENGTH ||
                  isExpired ||
                  remainingAttempts === 0
                }
              />

              <Button
                title="Resend Code"
                variant="text"
                onPress={handleResend}
                disabled={isLoading}
                style={styles.resendButton}
              />

              <Button
                title="← Change Email"
                variant="text"
                onPress={handleBack}
                disabled={isLoading}
              />
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
    marginBottom: SPACING.md,
  },
  subtitle: {
    marginBottom: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
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
  timerContainer: {
    marginTop: SPACING.lg,
  },
  errorContainer: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  actions: {
    alignItems: 'center',
  },
  resendButton: {
    marginTop: SPACING.md,
  },
});
