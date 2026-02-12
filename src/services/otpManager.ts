import { OtpRecord, OtpValidationResult } from '@/types';
import { OTP_CONFIG } from '@/constants';
import AnalyticsService from './analytics';

const otpStore = new Map<string, OtpRecord>();

function generateOtpCode(): string {
  const min = Math.pow(10, OTP_CONFIG.LENGTH - 1);
  const max = Math.pow(10, OTP_CONFIG.LENGTH) - 1;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp.toString();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const OtpManager = {
  generateOtp(email: string): OtpRecord {
    const normalizedEmail = normalizeEmail(email);

    const otpRecord: OtpRecord = {
      otp: generateOtpCode(),
      email: normalizedEmail,
      createdAt: Date.now(),
      attempts: 0,
      isValid: true,
    };

    otpStore.set(normalizedEmail, otpRecord);
    AnalyticsService.logOtpGenerated(normalizedEmail);

    if (__DEV__) {
      console.log(`[OTP] Generated for ${normalizedEmail}: ${otpRecord.otp}`);
    }

    return otpRecord;
  },

  validateOtp(email: string, inputOtp: string): OtpValidationResult {
    const normalizedEmail = normalizeEmail(email);
    const otpRecord = otpStore.get(normalizedEmail);

    if (!otpRecord) {
      return {
        success: false,
        error: 'NO_OTP_FOUND',
        remainingAttempts: 0,
      };
    }

    if (!otpRecord.isValid) {
      return {
        success: false,
        error: 'NO_OTP_FOUND',
        remainingAttempts: 0,
      };
    }

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

    otpRecord.attempts += 1;

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

    otpRecord.isValid = false;
    AnalyticsService.logOtpSuccess(normalizedEmail);

    return {
      success: true,
      remainingAttempts: OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts,
    };
  },

  isOtpExpired(otpRecord: OtpRecord): boolean {
    const now = Date.now();
    const expiryTime = otpRecord.createdAt + OTP_CONFIG.EXPIRY_SECONDS * 1000;
    return now > expiryTime;
  },

  getOtpRecord(email: string): OtpRecord | null {
    const normalizedEmail = normalizeEmail(email);
    return otpStore.get(normalizedEmail) ?? null;
  },

  getRemainingSeconds(email: string): number {
    const record = this.getOtpRecord(email);
    if (!record || !record.isValid) return 0;

    const expiryTime = record.createdAt + OTP_CONFIG.EXPIRY_SECONDS * 1000;
    const remaining = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
    return remaining;
  },

  getRemainingAttempts(email: string): number {
    const record = this.getOtpRecord(email);
    if (!record) return 0;
    return Math.max(0, OTP_CONFIG.MAX_ATTEMPTS - record.attempts);
  },

  clearOtpRecord(email: string): void {
    const normalizedEmail = normalizeEmail(email);
    otpStore.delete(normalizedEmail);
  },

  clearAll(): void {
    otpStore.clear();
  },
};

export default OtpManager;
