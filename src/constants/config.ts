
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_SECONDS: 60,
  MAX_ATTEMPTS: 3,
} as const;

export const STORAGE_KEYS = {
  SESSION: 'auth_session',

  ANALYTICS_LOG: 'analytics_log',
  OTP_PREFIX: 'otp_',
} as const;

export const TIMING = {

  BUTTON_DEBOUNCE: 300,
  TIMER_INTERVAL: 1000,
} as const;
