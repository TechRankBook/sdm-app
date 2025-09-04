import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../constants';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types (matching our schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          full_name: string;
          role: 'customer' | 'driver' | 'admin' | 'vendor';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone?: string | null;
          full_name: string;
          role: 'customer' | 'driver' | 'admin' | 'vendor';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          full_name?: string;
          role?: 'customer' | 'driver' | 'admin' | 'vendor';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          driver_id: string | null;
          service_type: 'city' | 'airport' | 'outstation' | 'hourly';
          pickup_location: any; // JSON
          drop_location: any | null; // JSON
          scheduled_time: string | null;
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          vehicle_type: 'sedan' | 'suv' | 'premium' | 'hatchback';
          estimated_fare: number;
          actual_fare: number | null;
          distance_km: number | null;
          duration_minutes: number | null;
          passenger_count: number;
          special_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          driver_id?: string | null;
          service_type: 'city' | 'airport' | 'outstation' | 'hourly';
          pickup_location: any;
          drop_location?: any | null;
          scheduled_time?: string | null;
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          vehicle_type: 'sedan' | 'suv' | 'premium' | 'hatchback';
          estimated_fare: number;
          actual_fare?: number | null;
          distance_km?: number | null;
          duration_minutes?: number | null;
          passenger_count: number;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          driver_id?: string | null;
          service_type?: 'city' | 'airport' | 'outstation' | 'hourly';
          pickup_location?: any;
          drop_location?: any | null;
          scheduled_time?: string | null;
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          vehicle_type?: 'sedan' | 'suv' | 'premium' | 'hatchback';
          estimated_fare?: number;
          actual_fare?: number | null;
          distance_km?: number | null;
          duration_minutes?: number | null;
          passenger_count?: number;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string;
          transaction_id: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          amount: number;
          currency: string;
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string;
          transaction_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string;
          transaction_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          driver_id: string;
          type: 'sedan' | 'suv' | 'premium' | 'hatchback';
          model: string;
          license_plate: string;
          color: string;
          year: number;
          capacity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          type: 'sedan' | 'suv' | 'premium' | 'hatchback';
          model: string;
          license_plate: string;
          color: string;
          year: number;
          capacity: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          type?: 'sedan' | 'suv' | 'premium' | 'hatchback';
          model?: string;
          license_plate?: string;
          color?: string;
          year?: number;
          capacity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'booking' | 'payment' | 'system' | 'promotion';
          is_read: boolean;
          data: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'booking' | 'payment' | 'system' | 'promotion';
          is_read?: boolean;
          data?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'booking' | 'payment' | 'system' | 'promotion';
          is_read?: boolean;
          data?: any | null;
          created_at?: string;
        };
      };
    };
  };
};