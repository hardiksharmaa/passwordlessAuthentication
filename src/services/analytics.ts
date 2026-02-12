import { AnalyticsEvent, AnalyticsEventPayload } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import StorageService from './storage';

/** Maximum number of events to keep in log */
const MAX_LOG_SIZE = 100;

/** Whether to log to console in development */
const LOG_TO_CONSOLE = __DEV__;

/**
 * Analytics service for event logging
 */
export const AnalyticsService = {
  /**
   * Log an analytics event
   * @param event - The event type
   * @param metadata - Optional event metadata
   */
  logEvent(event: AnalyticsEvent, metadata?: Record<string, unknown>): void {
    const payload: AnalyticsEventPayload = {
      event,
      timestamp: Date.now(),
      metadata,
    };

    // Log to console in development
    if (LOG_TO_CONSOLE) {
      console.log(`[Analytics] ${event}`, metadata ?? '');
    }

    // Persist to storage
    this.persistEvent(payload);
  },

  /**
   * Log OTP generated event
   * @param email - Email the OTP was generated for
   */
  logOtpGenerated(email: string): void {
    this.logEvent(AnalyticsEvent.OTP_GENERATED, {
      email: this.maskEmail(email),
    });
  },

  /**
   * Log OTP validation success
   * @param email - Email that successfully validated
   */
  logOtpSuccess(email: string): void {
    this.logEvent(AnalyticsEvent.OTP_VALIDATION_SUCCESS, {
      email: this.maskEmail(email),
    });
  },

  /**
   * Log OTP validation failure
   * @param email - Email that failed validation
   * @param reason - Reason for failure
   * @param attemptNumber - Which attempt this was
   */
  logOtpFailure(
    email: string,
    reason: string,
    attemptNumber: number
  ): void {
    this.logEvent(AnalyticsEvent.OTP_VALIDATION_FAILURE, {
      email: this.maskEmail(email),
      reason,
      attemptNumber,
    });
  },

  /**
   * Log user logout
   * @param email - Email of user logging out
   * @param sessionDurationSeconds - How long the session lasted
   */
  logLogout(email: string, sessionDurationSeconds: number): void {
    this.logEvent(AnalyticsEvent.LOGOUT, {
      email: this.maskEmail(email),
      sessionDurationSeconds,
    });
  },

  /**
   * Log session started
   * @param email - Email of user starting session
   */
  logSessionStarted(email: string): void {
    this.logEvent(AnalyticsEvent.SESSION_STARTED, {
      email: this.maskEmail(email),
    });
  },

  /**
   * Log session resumed (app reopened with existing session)
   * @param email - Email of user resuming session
   */
  logSessionResumed(email: string): void {
    this.logEvent(AnalyticsEvent.SESSION_RESUMED, {
      email: this.maskEmail(email),
    });
  },

  /**
   * Get all logged events
   * @returns Array of logged events
   */
  getEventLog(): AnalyticsEventPayload[] {
    return StorageService.get<AnalyticsEventPayload[]>(STORAGE_KEYS.ANALYTICS_LOG) ?? [];
  },

  /**
   * Clear the event log
   */
  clearEventLog(): void {
    StorageService.remove(STORAGE_KEYS.ANALYTICS_LOG);
  },

  /**
   * Persist event to storage log
   */
  persistEvent(payload: AnalyticsEventPayload): void {
    const existingLog = this.getEventLog();
    
    // Add new event
    existingLog.push(payload);
    
    // Trim to max size (keep most recent)
    const trimmedLog = existingLog.slice(-MAX_LOG_SIZE);
    
    StorageService.set(STORAGE_KEYS.ANALYTICS_LOG, trimmedLog);
  },

  /**
   * Mask email for privacy in logs
   * john.doe@example.com -> j***e@example.com
   */
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
