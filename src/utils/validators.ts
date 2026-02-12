const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an email address
 * @param email - The email string to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length < 5) {
    return {
      isValid: false,
      error: 'Email is too short',
    };
  }

  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'Email is too long',
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
}

/**
 * Validates an OTP input
 * @param otp - The OTP string to validate
 * @param requiredLength - Expected OTP length (default: 6)
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateOtp(otp: string, requiredLength: number = 6): ValidationResult {
  // Check for empty input
  if (!otp || otp.length === 0) {
    return {
      isValid: false,
      error: 'OTP is required',
    };
  }

  // Check if only digits
  if (!/^\d+$/.test(otp)) {
    return {
      isValid: false,
      error: 'OTP must contain only digits',
    };
  }

  // Check length
  if (otp.length !== requiredLength) {
    return {
      isValid: false,
      error: `OTP must be ${requiredLength} digits`,
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes email input (trims and lowercases)
 * @param email - The email to sanitize
 * @returns Sanitized email string
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
