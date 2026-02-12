import { OtpRecord, OtpValidationResult, OtpError } from '@/types';
import { OTP_CONFIG } from '@/constants';
import AnalyticsService from './analytics';


const otpStore = new Map<string, OtpRecord>();

/**
 * Generate a random 6-digit OTP
 * @returns 6-digit string OTP
 */
function generateOtpCode(): string {

  const min = Math.pow(10, OTP_CONFIG.LENGTH - 1);
  const max = Math.pow(10, OTP_CONFIG.LENGTH) - 1;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp.toString();
}

/**
 * Normalize email for consistent storage key
 * @param email - Raw email input
 * @returns Normalized (lowercase, trimmed) email
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * OTP Manager Service
 */
export const OtpManager = {
  /**
   * Generate a new OTP for an email
   * - Invalidates any existing OTP for this email
   * - Resets attempt count
   * 
   * @param email - Email to generate OTP for
   * @returns The generated OTP record
   */
  generateOtp(email: string): OtpRecord {
    const normalizedEmail = normalizeEmail(email);
    
    // Create new OTP record
    const otpRecord: OtpRecord = {
      otp: generateOtpCode(),
      email: normalizedEmail,
      createdAt: Date.now(),
      attempts: 0,
      isValid: true,
    };

    // Store (automatically replaces any existing OTP for this email)
    otpStore.set(normalizedEmail, otpRecord);

    // Log analytics event
    AnalyticsService.logOtpGenerated(normalizedEmail);

    // In development, log the OTP for testing
    if (__DEV__) {
      console.log(`[OTP] Generated for ${normalizedEmail}: ${otpRecord.otp}`);
    }

    return otpRecord;
  },

  /**
   * Validate an OTP attempt
   * 
   * @param email - Email to validate OTP for
   * @param inputOtp - OTP entered by user
   * @returns Validation result with success status and error details
   */
  validateOtp(email: string, inputOtp: string): OtpValidationResult {
    const normalizedEmail = normalizeEmail(email);
    const otpRecord = otpStore.get(normalizedEmail);

    // Check if OTP exists
    if (!otpRecord) {
      return {
        success: false,
        error: 'NO_OTP_FOUND',
        remainingAttempts: 0,
      };
    }

    // Check if OTP is still valid (not invalidated)
    if (!otpRecord.isValid) {
      return {
        success: false,
        error: 'NO_OTP_FOUND',
        remainingAttempts: 0,
      };
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      AnalyticsService.logOtpFailure(
        normalizedEmail,
        'MAX_ATTEMPTS_EXCEEDED',
        otpRecord.attempts + 1
      );
      return {
        success: false,
        error: 'MAX_ATTEMPTS_EXCEEDED',
        remainingAttempts: 0,
      };
    }

    // Check if OTP is expired
    if (this.isOtpExpired(otpRecord)) {
      AnalyticsService.logOtpFailure(
        normalizedEmail,
        'EXPIRED_OTP',
        otpRecord.attempts + 1
      );
      return {
        success: false,
        error: 'EXPIRED_OTP',
        remainingAttempts: OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts - 1,
      };
    }

    // Increment attempt count
    otpRecord.attempts += 1;

    // Check if OTP matches
    if (inputOtp !== otpRecord.otp) {
      const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts;
      
      AnalyticsService.logOtpFailure(
        normalizedEmail,
        'INVALID_OTP',
        otpRecord.attempts
      );

      return {
        success: false,
        error: 'INVALID_OTP',
        remainingAttempts,
      };
    }

    // OTP is valid - invalidate it (one-time use)
    otpRecord.isValid = false;
    
    AnalyticsService.logOtpSuccess(normalizedEmail);

    return {
      success: true,
      remainingAttempts: OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts,
    };
  },

  /**
   * Check if an OTP record is expired
   * 
   * @param otpRecord - OTP record to check
   * @returns Whether the OTP has expired
   */
  isOtpExpired(otpRecord: OtpRecord): boolean {
    const now = Date.now();
    const expiryTime = otpRecord.createdAt + (OTP_CONFIG.EXPIRY_SECONDS * 1000);
    return now > expiryTime;
  },

  /**
   * Get OTP record for an email (if exists)
   * 
   * @param email - Email to look up
   * @returns OTP record or null
   */
  getOtpRecord(email: string): OtpRecord | null {
    const normalizedEmail = normalizeEmail(email);
    return otpStore.get(normalizedEmail) ?? null;
  },

  /**
   * Get remaining seconds until OTP expires
   * 
   * @param email - Email to check
   * @returns Seconds remaining, or 0 if expired/not found
   */
  getRemainingSeconds(email: string): number {
    const record = this.getOtpRecord(email);
    if (!record || !record.isValid) return 0;

    const expiryTime = record.createdAt + (OTP_CONFIG.EXPIRY_SECONDS * 1000);
    const remaining = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
    return remaining;
  },

  /**
   * Get remaining validation attempts for an email
   * 
   * @param email - Email to check
   * @returns Remaining attempts, or 0 if not found
   */
  getRemainingAttempts(email: string): number {
    const record = this.getOtpRecord(email);
    if (!record) return 0;
    return Math.max(0, OTP_CONFIG.MAX_ATTEMPTS - record.attempts);
  },

  /**
   * Clear OTP record for an email
   * 
   * @param email - Email to clear
   */
  clearOtpRecord(email: string): void {
    const normalizedEmail = normalizeEmail(email);
    otpStore.delete(normalizedEmail);
  },

  /**
   * Clear all OTP records
   * Useful for testing or logout
   */
  clearAll(): void {
    otpStore.clear();
  },
};

export default OtpManager;
