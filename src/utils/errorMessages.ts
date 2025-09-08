/**
 * Maps Supabase error messages to user-friendly messages
 * Hides internal error details and provides appropriate user feedback
 */

export interface AuthError {
  message: string;
  code?: string;
}

export class ErrorMessageMapper {
  /**
   * Maps authentication-related errors to user-friendly messages
   */
  static mapAuthError(error: AuthError | Error | string): string {
    const errorMessage = typeof error === 'string' ? error : error.message || '';

    // Network and connectivity errors
    if (errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('fetch')) {
      return 'Unable to connect. Please check your internet connection and try again.';
    }

    // Phone number validation errors
    if (errorMessage.includes('Invalid phone number') ||
        errorMessage.includes('phone number') ||
        errorMessage.includes('Phone number')) {
      return 'Please enter a valid 10-digit phone number.';
    }

    // OTP related errors
    if (errorMessage.includes('Invalid verification code') ||
        errorMessage.includes('verification code') ||
        errorMessage.includes('token') ||
        errorMessage.includes('otp')) {
      return 'Invalid verification code. Please check and try again.';
    }

    if (errorMessage.includes('expired') ||
        errorMessage.includes('Expired')) {
      return 'Verification code has expired. Please request a new one.';
    }

    if (errorMessage.includes('too many requests') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('Too many')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    // User already exists
    if (errorMessage.includes('User already registered') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('already registered')) {
      return 'This phone number is already registered. Please try signing in instead.';
    }

    // User not found
    if (errorMessage.includes('User not found') ||
        errorMessage.includes('user not found') ||
        errorMessage.includes('Invalid login credentials')) {
      return 'Account not found. Please check your phone number or sign up first.';
    }

    // Email related errors (if applicable)
    if (errorMessage.includes('Invalid email') ||
        errorMessage.includes('email')) {
      return 'Please enter a valid email address.';
    }

    // Password related errors
    if (errorMessage.includes('Password') ||
        errorMessage.includes('password')) {
      return 'Password must be at least 8 characters long.';
    }

    // Generic Supabase auth errors
    if (errorMessage.includes('Invalid API key') ||
        errorMessage.includes('API key')) {
      return 'Service temporarily unavailable. Please try again later.';
    }

    if (errorMessage.includes('Database error') ||
        errorMessage.includes('Postgres')) {
      return 'Service temporarily unavailable. Please try again later.';
    }

    // SMS sending errors
    if (errorMessage.includes('SMS') ||
        errorMessage.includes('message') ||
        errorMessage.includes('send')) {
      return 'Unable to send verification code. Please try again.';
    }

    // Default fallback for unknown errors
    console.warn('Unhandled error:', errorMessage);
    return 'Something went wrong. Please try again.';
  }

  /**
   * Maps general errors to user-friendly messages
   */
  static mapGeneralError(error: Error | string): string {
    const errorMessage = typeof error === 'string' ? error : error.message || '';

    if (errorMessage.includes('Network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('connection')) {
      return 'Connection error. Please check your internet and try again.';
    }

    if (errorMessage.includes('timeout') ||
        errorMessage.includes('Timeout')) {
      return 'Request timed out. Please try again.';
    }

    console.warn('Unhandled general error:', errorMessage);
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Creates a user-friendly alert configuration
   */
  static createAlertConfig(title: string, error: AuthError | Error | string) {
    return {
      title,
      message: this.mapAuthError(error),
      buttons: [{ text: 'OK' }]
    };
  }
}

/**
 * Helper function for quick error mapping
 */
export const getUserFriendlyError = (error: AuthError | Error | string): string => {
  return ErrorMessageMapper.mapAuthError(error);
};

/**
 * Helper function for creating alert configs
 */
export const createErrorAlert = (title: string, error: AuthError | Error | string) => {
  return ErrorMessageMapper.createAlertConfig(title, error);
};