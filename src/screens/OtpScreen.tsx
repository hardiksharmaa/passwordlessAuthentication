import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpScreenProps } from '@/types';
import { COLORS, SPACING, OTP_CONFIG } from '@/constants';
import { OtpManager } from '@/services';
import { Button, Typography } from '@/components/common';
import { OtpInput, CountdownTimer } from '@/components/otp';

export default function OtpScreen({ navigation, route }: OtpScreenProps) {
  const { email } = route.params;

  // OTP state
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(OTP_CONFIG.MAX_ATTEMPTS);
  
  // Timer reset trigger
  const [timerKey, setTimerKey] = useState(0);

  // Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Handle OTP input change
   */
  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);
    // Clear error when user starts typing
    if (error) {
      setError(undefined);
    }
  }, [error]);

  /**
   * Handle OTP validation
   */
  const handleVerify = useCallback(async () => {
    if (otp.length !== OTP_CONFIG.LENGTH) {
      setError(`Please enter all ${OTP_CONFIG.LENGTH} digits`);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = OtpManager.validateOtp(email, otp);

      if (!isMounted.current) return;

      if (result.success) {
        // Navigate to session screen
        navigation.replace('Session', { email });
      } else {
        setRemainingAttempts(result.remainingAttempts);
        
        switch (result.error) {
          case 'INVALID_OTP':
            setError(`Incorrect code. ${result.remainingAttempts} attempt${result.remainingAttempts !== 1 ? 's' : ''} remaining.`);
            setOtp(''); // Clear input for retry
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
    } catch (err) {
      console.error('[OtpScreen] Verification error:', err);
      if (isMounted.current) {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [otp, email, navigation]);

  /**
   * Handle OTP completion (auto-verify when all digits entered)
   */
  const handleOtpComplete = useCallback((value: string) => {
    setOtp(value);
    // Auto-verify after a short delay for better UX
    setTimeout(() => {
      if (isMounted.current && value.length === OTP_CONFIG.LENGTH) {
        handleVerify();
      }
    }, 100);
  }, [handleVerify]);

  /**
   * Handle timer expiry
   */
  const handleExpire = useCallback(() => {
    if (isMounted.current) {
      setIsExpired(true);
    }
  }, []);

  /**
   * Handle resend OTP
   */
  const handleResend = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      OtpManager.generateOtp(email);

      if (!isMounted.current) return;

      // Reset all state
      setOtp('');
      setIsExpired(false);
      setRemainingAttempts(OTP_CONFIG.MAX_ATTEMPTS);
      setTimerKey(prev => prev + 1); // Force timer reset

      Alert.alert('Code Sent', 'A new verification code has been sent.');
    } catch (err) {
      console.error('[OtpScreen] Resend error:', err);
      if (isMounted.current) {
        setError('Failed to send new code. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [email]);

  /**
   * Handle back navigation
   */
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Typography variant="heading" style={styles.title}>
                Enter Verification Code
              </Typography>
              <Typography variant="body" color="secondary" style={styles.subtitle}>
                We sent a 6-digit code to{'\n'}
                <Typography variant="body" color="primary" weight="semiBold">
                  {email}
                </Typography>
              </Typography>
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                onComplete={handleOtpComplete}
                length={OTP_CONFIG.LENGTH}
                disabled={isLoading}
                error={!!error}
              />

              {/* Timer */}
              <View style={styles.timerContainer}>
                <CountdownTimer
                  key={timerKey}
                  duration={OTP_CONFIG.EXPIRY_SECONDS}
                  onExpire={handleExpire}
                  isExpired={isExpired}
                />
              </View>

              {/* Error Message */}
              {error && (
                <Typography variant="caption" color="error" align="center" style={styles.error}>
                  {error}
                </Typography>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Verify"
                onPress={handleVerify}
                loading={isLoading}
                disabled={otp.length !== OTP_CONFIG.LENGTH || isExpired || remainingAttempts === 0}
              />

              <Button
                title="Resend Code"
                variant="text"
                onPress={handleResend}
                disabled={isLoading}
                style={styles.resendButton}
              />

              <Button
                title="Change Email"
                variant="text"
                onPress={handleBack}
                disabled={isLoading}
              />
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
    alignItems: 'center',
  },
  title: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  timerContainer: {
    marginTop: SPACING.lg,
  },
  error: {
    marginTop: SPACING.md,
  },
  actions: {
    alignItems: 'center',
  },
  resendButton: {
    marginTop: SPACING.md,
  },
});
