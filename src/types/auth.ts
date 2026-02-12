export interface OtpRecord {
  otp: string;
  email: string;
  createdAt: number;
  attempts: number;
  isValid: boolean;
}

export interface OtpValidationResult {
  success: boolean;
  error?: OtpError;
  remainingAttempts: number;
}
export type OtpError =
  | 'INVALID_OTP'
  | 'EXPIRED_OTP'
  | 'MAX_ATTEMPTS_EXCEEDED'
  | 'NO_OTP_FOUND';

export interface SessionData {
  email: string;
  startTime: number;
}
export type AuthState =
  | { status: 'unauthenticated' }
  | { status: 'otp_pending'; email: string }
  | { status: 'authenticated'; session: SessionData };
export enum AnalyticsEvent {
  OTP_GENERATED = 'OTP_GENERATED',
  OTP_VALIDATION_SUCCESS = 'OTP_VALIDATION_SUCCESS',
  OTP_VALIDATION_FAILURE = 'OTP_VALIDATION_FAILURE',
  LOGOUT = 'LOGOUT',
  SESSION_STARTED = 'SESSION_STARTED',
  SESSION_RESUMED = 'SESSION_RESUMED',
}

export interface AnalyticsEventPayload {
  event: AnalyticsEvent;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
