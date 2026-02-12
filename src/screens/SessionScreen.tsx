import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionScreenProps } from '@/types';
import { COLORS, SPACING, STORAGE_KEYS } from '@/constants';
import { StorageService, AnalyticsService, OtpManager } from '@/services';
import { Button, Typography } from '@/components/common';
import { useSessionTimer } from '@/hooks';

export default function SessionScreen({ navigation, route }: SessionScreenProps) {
  const { email } = route.params;
  
  // Get or create session start time
  const sessionStartTime = useRef<number>(getOrCreateSessionStart(email)).current;
  
  // Session timer hook
  const { formattedDuration, elapsedSeconds } = useSessionTimer(sessionStartTime);

  /**
   * Prevent hardware back button from going to previous screens
   */
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleLogout();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Log analytics event
            AnalyticsService.logLogout(email, elapsedSeconds);

            // Clear session data
            StorageService.remove(STORAGE_KEYS.SESSION);
            OtpManager.clearOtpRecord(email);

            // Navigate back to login
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  }, [email, elapsedSeconds, navigation]);

  /**
   * Format session start time for display
   */
  const formattedStartTime = formatStartTime(sessionStartTime);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="display" style={styles.greeting}>
            Hello!
          </Typography>
          <Typography variant="body" color="secondary">
            You're logged in as
          </Typography>
          <Typography variant="subheading" color="primary" weight="semiBold">
            {email}
          </Typography>
        </View>

        {/* Session Info Card */}
        <View style={styles.card}>
          <Typography variant="caption" color="tertiary" style={styles.cardLabel}>
            SESSION STARTED
          </Typography>
          <Typography variant="body" weight="medium" style={styles.cardValue}>
            {formattedStartTime}
          </Typography>

          <View style={styles.divider} />

          <Typography variant="caption" color="tertiary" style={styles.cardLabel}>
            SESSION DURATION
          </Typography>
          <Typography variant="display" color="primary" style={styles.duration}>
            {formattedDuration}
          </Typography>
        </View>

        {/* Logout Button */}
        <View style={styles.footer}>
          <Button
            title="Logout"
            variant="secondary"
            onPress={handleLogout}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * Get existing session start time or create new one
 */
function getOrCreateSessionStart(email: string): number {
  const existingSession = StorageService.get<{ email: string; startTime: number }>(
    STORAGE_KEYS.SESSION
  );

  // If session exists for this email, use it
  if (existingSession && existingSession.email === email) {
    AnalyticsService.logSessionResumed(email);
    return existingSession.startTime;
  }

  // Create new session
  const startTime = Date.now();
  StorageService.set(STORAGE_KEYS.SESSION, { email, startTime });
  AnalyticsService.logSessionStarted(email);
  return startTime;
}

/**
 * Format timestamp for display
 */
function formatStartTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  header: {
    marginBottom: SPACING.xxxl,
  },
  greeting: {
    marginBottom: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLabel: {
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  cardValue: {
    marginBottom: SPACING.lg,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  duration: {
    fontSize: 48,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: SPACING.xl,
    right: SPACING.xl,
  },
});
