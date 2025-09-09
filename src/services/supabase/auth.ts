import { supabase } from './client';
import { User, Customer, Driver } from '../../types';
import { useAppStore } from '../../stores/appStore';

export class AuthService {
  // Sign up with email and password
  static async signUp(
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    role: 'customer' | 'driver' = 'customer'
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_no: phone || '',
            role: role,
          },
        },
      });

      if (error) throw error;

      // Create user profile in users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            phone_no: phone || null,
            full_name: fullName,
            role: role,
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile
      if (data.user) {
        const profile = await this.getUserProfile(data.user.id);
        if (profile) {
          useAppStore.getState().setUser(profile);
          useAppStore.getState().setAuthenticated(true);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      useAppStore.getState().logout();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Get current user profile
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data as User;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      useAppStore.getState().setUser(data as User);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'sdmcabhailing://reset-password',
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      return { session: data.session, error: null };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  // Refresh session
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      return { session: data.session, error: null };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { session } = await this.getCurrentSession();
      return !!session;
    } catch {
      return false;
    }
  }

  // Initialize auth state listener
  static initializeAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await this.getUserProfile(session.user.id);
        if (profile) {
          useAppStore.getState().setUser(profile);
          useAppStore.getState().setAuthenticated(true);
        }
      } else if (event === 'SIGNED_OUT') {
        useAppStore.getState().logout();
      }
    });
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone format (Indian phone numbers)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  // Validate password strength
  static isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  // Sign in with phone number (send OTP)
  static async signInWithPhone(phone: string) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      console.log('Sending OTP to:', formattedPhone);

      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;

      console.log('OTP sent successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('signInWithPhone error:', error);
      return { data: null, error: error as Error };
    }
  }

  // Verify phone OTP
  static async verifyPhoneOTP(phone: string, otp: string) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      console.log('Verifying OTP for:', formattedPhone);

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp.trim(),
        type: 'sms'
      });

      if (error) throw error;

      if (data.user) {
        console.log('OTP verified successfully, user signed in');
        // Fetch and set user profile
        const profile = await this.getUserProfile(data.user.id);
        if (profile) {
          useAppStore.getState().setUser(profile);
          useAppStore.getState().setAuthenticated(true);
        }
        return { data, error: null };
      }

      return { data: null, error: new Error('Verification failed') };
    } catch (error) {
      console.error('verifyPhoneOTP error:', error);
      return { data: null, error: error as Error };
    }
  }

  // Sign in with Google
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'sdmcabhailing://auth/callback'
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('signInWithGoogle error:', error);
      return { data: null, error: error as Error };
    }
  }

  // Format phone number (add +91 for India)
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Add country code if not present (assuming India +91)
    if (digits.length === 10) {
      return `+91${digits}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    } else if (digits.length === 13 && digits.startsWith('91')) {
      return `+${digits.substring(1)}`;
    }

    return phone; // Return as-is if format is unclear
  }
}