import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { TIMING } from '@/constants';

interface SessionTimerResult {
  formattedDuration: string;
  elapsedSeconds: number;
  startTime: number;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function calculateElapsed(startTime: number): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

export function useSessionTimer(startTime: number): SessionTimerResult {
  const startTimeRef = useRef(startTime);

  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    calculateElapsed(startTimeRef.current)
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateElapsed = useCallback(() => {
    setElapsedSeconds(calculateElapsed(startTimeRef.current));
  }, []);

  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    updateElapsed();
    intervalRef.current = setInterval(updateElapsed, TIMING.TIMER_INTERVAL);
  }, [updateElapsed]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        startInterval();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        stopInterval();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    startInterval();

    return () => {
      stopInterval();
      subscription.remove();
    };
  }, [startInterval, stopInterval]);

  return {
    formattedDuration: formatDuration(elapsedSeconds),
    elapsedSeconds,
    startTime: startTimeRef.current,
  };
}

export default useSessionTimer;
