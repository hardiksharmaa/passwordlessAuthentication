
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/common';
import { COLORS, SPACING, TIMING } from '@/constants';

interface CountdownTimerProps {
  duration: number;
  onExpire?: () => void;
  isExpired?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function CountdownTimer({
  duration,
  onExpire,
  isExpired = false,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasExpiredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {

    setRemaining(duration);
    hasExpiredRef.current = false;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearTimer();
          

          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onExpire?.();
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, TIMING.TIMER_INTERVAL);

    return () => {
      clearTimer();
    };
  }, [duration, onExpire, clearTimer]);

  useEffect(() => {
    if (isExpired) {
      setRemaining(0);
      clearTimer();
    }
  }, [isExpired, clearTimer]);

  const isWarning = remaining > 0 && remaining <= 10;
  const isTimerExpired = remaining === 0;

  return (
    <View style={styles.container}>
      {isTimerExpired ? (
        <Typography variant="body" color="error">
          Code expired
        </Typography>
      ) : (
        <View style={styles.timerRow}>
          <Typography variant="caption" color="secondary">
            Code expires in{' '}
          </Typography>
          <Typography
            variant="caption"
            weight="semiBold"
            color={isWarning ? 'error' : 'primary'}
            style={isWarning ? styles.warning : undefined}
          >
            {formatTime(remaining)}
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warning: {
  },
});

export default CountdownTimer;
