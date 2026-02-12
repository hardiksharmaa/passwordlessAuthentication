import { AnalyticsEvent, AnalyticsEventPayload } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import StorageService from './storage';

const MAX_LOG_SIZE = 100;
const LOG_TO_CONSOLE = __DEV__;

export const AnalyticsService = {
  logEvent(event: AnalyticsEvent, metadata?: Record<string, unknown>): void {
    const payload: AnalyticsEventPayload = {
      event,
      timestamp: Date.now(),
      metadata,
    };

    if (LOG_TO_CONSOLE) {
      console.log(`[Analytics] ${event}`, metadata ?? '');
    }

    this.persistEvent(payload);
  },

  logOtpGenerated(email: string): void {
    this.logEvent(AnalyticsEvent.OTP_GENERATED, {
      email: this.maskEmail(email),
    });
  },

  logOtpSuccess(email: string): void {
    this.logEvent(AnalyticsEvent.OTP_VALIDATION_SUCCESS, {
      email: this.maskEmail(email),
    });
  },

  logOtpFailure(email: string, reason: string, attemptNumber: number): void {
    this.logEvent(AnalyticsEvent.OTP_VALIDATION_FAILURE, {
      email: this.maskEmail(email),
      reason,
      attemptNumber,
    });
  },

  logLogout(email: string, sessionDurationSeconds: number): void {
    this.logEvent(AnalyticsEvent.LOGOUT, {
      email: this.maskEmail(email),
      sessionDurationSeconds,
    });
  },

  logSessionStarted(email: string): void {
    this.logEvent(AnalyticsEvent.SESSION_STARTED, {
      email: this.maskEmail(email),
    });
  },

  logSessionResumed(email: string): void {
    this.logEvent(AnalyticsEvent.SESSION_RESUMED, {
      email: this.maskEmail(email),
    });
  },

  getEventLog(): AnalyticsEventPayload[] {
    return (
      StorageService.get<AnalyticsEventPayload[]>(STORAGE_KEYS.ANALYTICS_LOG) ??
      []
    );
  },

  clearEventLog(): void {
    StorageService.remove(STORAGE_KEYS.ANALYTICS_LOG);
  },

  persistEvent(payload: AnalyticsEventPayload): void {
    const existingLog = this.getEventLog();
    existingLog.push(payload);
    const trimmedLog = existingLog.slice(-MAX_LOG_SIZE);
    StorageService.set(STORAGE_KEYS.ANALYTICS_LOG, trimmedLog);
  },

  maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***@***';

    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }

    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
  },
};

export default AnalyticsService;
