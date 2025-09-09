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
          role: 'customer' | 'driver' | 'admin' | 'vendor';
          created_at: string;
          updated_at: string;
          status: 'active' | 'blocked' | 'suspended';
          blocked_at: string | null;
          blocked_by: string | null;
          block_reason: string | null;
          deleted_at: string | null;
          last_login_at: string | null;
          full_name: string | null;
          email: string | null;
          phone_no: string | null;
          profile_picture_url: string | null;
          whatsapp_phone: string | null;
          phone_verified: boolean;
          phone_verification_completed_at: string | null;
        };
        Insert: {
          id: string;
          role: 'customer' | 'driver' | 'admin' | 'vendor';
          created_at?: string;
          updated_at?: string;
          status?: 'active' | 'blocked' | 'suspended';
          blocked_at?: string | null;
          blocked_by?: string | null;
          block_reason?: string | null;
          deleted_at?: string | null;
          last_login_at?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone_no?: string | null;
          profile_picture_url?: string | null;
          whatsapp_phone?: string | null;
          phone_verified?: boolean;
          phone_verification_completed_at?: string | null;
        };
        Update: {
          id?: string;
          role?: 'customer' | 'driver' | 'admin' | 'vendor';
          created_at?: string;
          updated_at?: string;
          status?: 'active' | 'blocked' | 'suspended';
          blocked_at?: string | null;
          blocked_by?: string | null;
          block_reason?: string | null;
          deleted_at?: string | null;
          last_login_at?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone_no?: string | null;
          profile_picture_url?: string | null;
          whatsapp_phone?: string | null;
          phone_verified?: boolean;
          phone_verification_completed_at?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          driver_id: string | null;
          vehicle_id: string | null;
          pickup_latitude: number | null;
          pickup_longitude: number | null;
          dropoff_latitude: number | null;
          dropoff_longitude: number | null;
          pickup_address: string;
          dropoff_address: string | null;
          fare_amount: number | null;
          distance_km: number | null;
          ride_type: string | null;
          start_time: string | null;
          end_time: string | null;
          status: string;
          payment_status: string;
          payment_method: string | null;
          created_at: string;
          updated_at: string;
          service_type_id: string | null;
          rental_package_id: string | null;
          zone_pricing_id: string | null;
          scheduled_time: string | null;
          is_scheduled: boolean;
          is_shared: boolean;
          sharing_group_id: string | null;
          total_stops: number;
          package_hours: number | null;
          included_km: number | null;
          extra_km_used: number;
          extra_hours_used: number;
          waiting_time_minutes: number;
          cancellation_reason: string | null;
          no_show_reason: string | null;
          upgrade_charges: number;
          pickup_location_id: string | null;
          dropoff_location_id: string | null;
          is_round_trip: boolean;
          return_scheduled_time: string | null;
          trip_type: string | null;
          vehicle_type: string | null;
          special_instructions: string | null;
          advance_amount: number | null;
          remaining_amount: number | null;
          passengers: number;
          service_type: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          driver_id?: string | null;
          vehicle_id?: string | null;
          pickup_latitude?: number | null;
          pickup_longitude?: number | null;
          dropoff_latitude?: number | null;
          dropoff_longitude?: number | null;
          pickup_address: string;
          dropoff_address?: string | null;
          fare_amount?: number | null;
          distance_km?: number | null;
          ride_type?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          status?: string;
          payment_status?: string;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
          service_type_id?: string | null;
          rental_package_id?: string | null;
          zone_pricing_id?: string | null;
          scheduled_time?: string | null;
          is_scheduled?: boolean;
          is_shared?: boolean;
          sharing_group_id?: string | null;
          total_stops?: number;
          package_hours?: number | null;
          included_km?: number | null;
          extra_km_used?: number;
          extra_hours_used?: number;
          waiting_time_minutes?: number;
          cancellation_reason?: string | null;
          no_show_reason?: string | null;
          upgrade_charges?: number;
          pickup_location_id?: string | null;
          dropoff_location_id?: string | null;
          is_round_trip?: boolean;
          return_scheduled_time?: string | null;
          trip_type?: string | null;
          vehicle_type?: string | null;
          special_instructions?: string | null;
          advance_amount?: number | null;
          remaining_amount?: number | null;
          passengers?: number;
          service_type?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          driver_id?: string | null;
          vehicle_id?: string | null;
          pickup_latitude?: number | null;
          pickup_longitude?: number | null;
          dropoff_latitude?: number | null;
          dropoff_longitude?: number | null;
          pickup_address?: string;
          dropoff_address?: string | null;
          fare_amount?: number | null;
          distance_km?: number | null;
          ride_type?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          status?: string;
          payment_status?: string;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
          service_type_id?: string | null;
          rental_package_id?: string | null;
          zone_pricing_id?: string | null;
          scheduled_time?: string | null;
          is_scheduled?: boolean;
          is_shared?: boolean;
          sharing_group_id?: string | null;
          total_stops?: number;
          package_hours?: number | null;
          included_km?: number | null;
          extra_km_used?: number;
          extra_hours_used?: number;
          waiting_time_minutes?: number;
          cancellation_reason?: string | null;
          no_show_reason?: string | null;
          upgrade_charges?: number;
          pickup_location_id?: string | null;
          dropoff_location_id?: string | null;
          is_round_trip?: boolean;
          return_scheduled_time?: string | null;
          trip_type?: string | null;
          vehicle_type?: string | null;
          special_instructions?: string | null;
          advance_amount?: number | null;
          remaining_amount?: number | null;
          passengers?: number;
          service_type?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          user_id: string | null;
          amount: number;
          currency: string;
          transaction_id: string | null;
          gateway_response: any | null;
          status: string;
          created_at: string;
          updated_at: string;
          razorpay_payment_id: string | null;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          user_id?: string | null;
          amount: number;
          currency?: string;
          transaction_id?: string | null;
          gateway_response?: any | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          razorpay_payment_id?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          user_id?: string | null;
          amount?: number;
          currency?: string;
          transaction_id?: string | null;
          gateway_response?: any | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          razorpay_payment_id?: string | null;
        };
      };
      vehicles: {
        Row: {
          id: string;
          make: string | null;
          model: string | null;
          year: number | null;
          license_plate: string | null;
          color: string | null;
          capacity: number | null;
          status: string;
          image_url: string | null;
          vendor_id: string | null;
          created_at: string;
          updated_at: string;
          assigned_driver_id: string | null;
          insurance_document_url: string | null;
          registration_document_url: string | null;
          pollution_certificate_url: string | null;
          last_service_date: string | null;
          next_service_due_date: string | null;
          current_odometer: number;
          average_fuel_economy: number | null;
          monthly_distance: number | null;
          vehicle_type_id: string | null;
          type: string | null;
        };
        Insert: {
          id?: string;
          make?: string | null;
          model?: string | null;
          year?: number | null;
          license_plate?: string | null;
          color?: string | null;
          capacity?: number | null;
          status?: string;
          image_url?: string | null;
          vendor_id?: string | null;
          created_at?: string;
          updated_at?: string;
          assigned_driver_id?: string | null;
          insurance_document_url?: string | null;
          registration_document_url?: string | null;
          pollution_certificate_url?: string | null;
          last_service_date?: string | null;
          next_service_due_date?: string | null;
          current_odometer?: number;
          average_fuel_economy?: number | null;
          monthly_distance?: number | null;
          vehicle_type_id?: string | null;
          type?: string | null;
        };
        Update: {
          id?: string;
          make?: string | null;
          model?: string | null;
          year?: number | null;
          license_plate?: string | null;
          color?: string | null;
          capacity?: number | null;
          status?: string;
          image_url?: string | null;
          vendor_id?: string | null;
          created_at?: string;
          updated_at?: string;
          assigned_driver_id?: string | null;
          insurance_document_url?: string | null;
          registration_document_url?: string | null;
          pollution_certificate_url?: string | null;
          last_service_date?: string | null;
          next_service_due_date?: string | null;
          current_odometer?: number;
          average_fuel_economy?: number | null;
          monthly_distance?: number | null;
          vehicle_type_id?: string | null;
          type?: string | null;
        };
      };
      admins: {
        Row: {
          id: string;
          assigned_region: string | null;
          can_approve_bookings: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          assigned_region?: string | null;
          can_approve_bookings?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assigned_region?: string | null;
          can_approve_bookings?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          dob: string | null;
          preferred_payment_method: string | null;
          referral_code: string | null;
          loyalty_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          dob?: string | null;
          preferred_payment_method?: string | null;
          referral_code?: string | null;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dob?: string | null;
          preferred_payment_method?: string | null;
          referral_code?: string | null;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          license_number: string;
          joined_on: string | null;
          current_latitude: number | null;
          current_longitude: number | null;
          rating: number;
          total_rides: number;
          status: string;
          created_at: string;
          updated_at: string;
          kyc_status: string;
          license_document_url: string | null;
          id_proof_document_url: string | null;
          rejection_reason: string | null;
        };
        Insert: {
          id: string;
          license_number: string;
          joined_on?: string | null;
          current_latitude?: number | null;
          current_longitude?: number | null;
          rating?: number;
          total_rides?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          kyc_status?: string;
          license_document_url?: string | null;
          id_proof_document_url?: string | null;
          rejection_reason?: string | null;
        };
        Update: {
          id?: string;
          license_number?: string;
          joined_on?: string | null;
          current_latitude?: number | null;
          current_longitude?: number | null;
          rating?: number;
          total_rides?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          kyc_status?: string;
          license_document_url?: string | null;
          id_proof_document_url?: string | null;
          rejection_reason?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          channel: string | null;
          title: string | null;
          message: string | null;
          sent_at: string;
          read: boolean;
          created_at: string;
          template_id: string | null;
          campaign_id: string | null;
          delivery_status: string;
          delivery_attempts: number;
          delivered_at: string | null;
          failed_reason: string | null;
          external_id: string | null;
          metadata: any;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          channel?: string | null;
          title?: string | null;
          message?: string | null;
          sent_at?: string;
          read?: boolean;
          created_at?: string;
          template_id?: string | null;
          campaign_id?: string | null;
          delivery_status?: string;
          delivery_attempts?: number;
          delivered_at?: string | null;
          failed_reason?: string | null;
          external_id?: string | null;
          metadata?: any;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          channel?: string | null;
          title?: string | null;
          message?: string | null;
          sent_at?: string;
          read?: boolean;
          created_at?: string;
          template_id?: string | null;
          campaign_id?: string | null;
          delivery_status?: string;
          delivery_attempts?: number;
          delivered_at?: string | null;
          failed_reason?: string | null;
          external_id?: string | null;
          metadata?: any;
        };
      };
      service_types: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicle_types: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          capacity: number;
          description: string | null;
          base_fare: number;
          per_km_rate: number;
          per_minute_rate: number | null;
          icon_emoji: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          capacity: number;
          description?: string | null;
          base_fare?: number;
          per_km_rate?: number;
          per_minute_rate?: number | null;
          icon_emoji?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          capacity?: number;
          description?: string | null;
          base_fare?: number;
          per_km_rate?: number;
          per_minute_rate?: number | null;
          icon_emoji?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        notification_templates: {
          Row: {
            id: string;
            name: string;
            description: string | null;
            channel: string;
            template_type: string;
            subject: string | null;
            content: string;
            variables: any;
            is_active: boolean;
            created_by: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            name: string;
            description?: string | null;
            channel: string;
            template_type?: string;
            subject?: string | null;
            content: string;
            variables?: any;
            is_active?: boolean;
            created_by?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            name?: string;
            description?: string | null;
            channel?: string;
            template_type?: string;
            subject?: string | null;
            content?: string;
            variables?: any;
            is_active?: boolean;
            created_by?: string | null;
            created_at?: string;
            updated_at?: string;
          };
        };
        notification_campaigns: {
          Row: {
            id: string;
            name: string;
            description: string | null;
            template_id: string | null;
            target_criteria: any;
            scheduled_at: string | null;
            status: string;
            total_recipients: number;
            sent_count: number;
            delivered_count: number;
            failed_count: number;
            created_by: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            name: string;
            description?: string | null;
            template_id?: string | null;
            target_criteria: any;
            scheduled_at?: string | null;
            status?: string;
            total_recipients?: number;
            sent_count?: number;
            delivered_count?: number;
            failed_count?: number;
            created_by?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            name?: string;
            description?: string | null;
            template_id?: string | null;
            target_criteria?: any;
            scheduled_at?: string | null;
            status?: string;
            total_recipients?: number;
            sent_count?: number;
            delivered_count?: number;
            failed_count?: number;
            created_by?: string | null;
            created_at?: string;
            updated_at?: string;
          };
        };
        pricing_rules: {
          Row: {
            id: string;
            service_type_id: string;
            base_fare: number;
            per_km_rate: number;
            per_minute_rate: number | null;
            minimum_fare: number;
            surge_multiplier: number;
            cancellation_fee: number;
            no_show_fee: number;
            waiting_charges_per_minute: number;
            free_waiting_time_minutes: number;
            is_active: boolean;
            effective_from: string | null;
            effective_until: string | null;
            created_at: string;
            updated_at: string;
            vehicle_type_id: string | null;
            vehicle_type: string | null;
            zone: string | null;
          };
          Insert: {
            id?: string;
            service_type_id: string;
            base_fare?: number;
            per_km_rate?: number;
            per_minute_rate?: number | null;
            minimum_fare?: number;
            surge_multiplier?: number;
            cancellation_fee?: number;
            no_show_fee?: number;
            waiting_charges_per_minute?: number;
            free_waiting_time_minutes?: number;
            is_active?: boolean;
            effective_from?: string | null;
            effective_until?: string | null;
            created_at?: string;
            updated_at?: string;
            vehicle_type_id?: string | null;
            vehicle_type?: string | null;
            zone?: string | null;
          };
          Update: {
            id?: string;
            service_type_id?: string;
            base_fare?: number;
            per_km_rate?: number;
            per_minute_rate?: number | null;
            minimum_fare?: number;
            surge_multiplier?: number;
            cancellation_fee?: number;
            no_show_fee?: number;
            waiting_charges_per_minute?: number;
            free_waiting_time_minutes?: number;
            is_active?: boolean;
            effective_from?: string | null;
            effective_until?: string | null;
            created_at?: string;
            updated_at?: string;
            vehicle_type_id?: string | null;
            vehicle_type?: string | null;
            zone?: string | null;
          };
        };
        zone_pricing: {
          Row: {
            id: string;
            service_type_id: string;
            zone_name: string;
            from_location: string;
            to_location: string;
            vehicle_type: string;
            fixed_price: number | null;
            base_price: number | null;
            per_km_rate: number | null;
            estimated_distance_km: number | null;
            estimated_duration_minutes: number | null;
            is_active: boolean;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            service_type_id: string;
            zone_name: string;
            from_location: string;
            to_location: string;
            vehicle_type: string;
            fixed_price?: number | null;
            base_price?: number | null;
            per_km_rate?: number | null;
            estimated_distance_km?: number | null;
            estimated_duration_minutes?: number | null;
            is_active?: boolean;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            service_type_id?: string;
            zone_name?: string;
            from_location?: string;
            to_location?: string;
            vehicle_type?: string;
            fixed_price?: number | null;
            base_price?: number | null;
            per_km_rate?: number | null;
            estimated_distance_km?: number | null;
            estimated_duration_minutes?: number | null;
            is_active?: boolean;
            created_at?: string;
            updated_at?: string;
          };
        };
        locations: {
          Row: {
            id: string;
            name: string;
            latitude: number;
            longitude: number;
            created_at: string;
          };
          Insert: {
            id?: string;
            name: string;
            latitude: number;
            longitude: number;
            created_at?: string;
          };
          Update: {
            id?: string;
            name?: string;
            latitude?: number;
            longitude?: number;
            created_at?: string;
          };
        };
        saved_locations: {
          Row: {
            id: string;
            user_id: string;
            title: string | null;
            address: string;
            latitude: number;
            longitude: number;
            is_default: boolean;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            title?: string | null;
            address: string;
            latitude: number;
            longitude: number;
            is_default?: boolean;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            user_id?: string;
            title?: string | null;
            address?: string;
            latitude?: number;
            longitude?: number;
            is_default?: boolean;
            created_at?: string;
            updated_at?: string;
          };
          communication_threads: {
            Row: {
              id: string;
              thread_type: string;
              status: string;
              priority: string;
              subject: string | null;
              booking_id: string | null;
              customer_id: string | null;
              driver_id: string | null;
              assigned_admin_id: string | null;
              created_by: string;
              created_at: string;
              updated_at: string;
              resolved_at: string | null;
              last_message_at: string | null;
            };
            Insert: {
              id?: string;
              thread_type: string;
              status?: string;
              priority?: string;
              subject?: string | null;
              booking_id?: string | null;
              customer_id?: string | null;
              driver_id?: string | null;
              assigned_admin_id?: string | null;
              created_by: string;
              created_at?: string;
              updated_at?: string;
              resolved_at?: string | null;
              last_message_at?: string | null;
            };
            Update: {
              id?: string;
              thread_type?: string;
              status?: string;
              priority?: string;
              subject?: string | null;
              booking_id?: string | null;
              customer_id?: string | null;
              driver_id?: string | null;
              assigned_admin_id?: string | null;
              created_by?: string;
              created_at?: string;
              updated_at?: string;
              resolved_at?: string | null;
              last_message_at?: string | null;
            };
          };
          messages: {
            Row: {
              id: string;
              thread_id: string;
              sender_id: string;
              sender_type: string;
              content: string;
              message_type: string;
              read_by: any;
              is_internal: boolean;
              created_at: string;
              updated_at: string;
            };
            Insert: {
              id?: string;
              thread_id: string;
              sender_id: string;
              sender_type: string;
              content: string;
              message_type?: string;
              read_by?: any;
              is_internal?: boolean;
              created_at?: string;
              updated_at?: string;
            };
            Update: {
              id?: string;
              thread_id?: string;
              sender_id?: string;
              sender_type?: string;
              content?: string;
              message_type?: string;
              read_by?: any;
              is_internal?: boolean;
              created_at?: string;
              updated_at?: string;
            };
          };
          support_tickets: {
            Row: {
              id: string;
              thread_id: string;
              ticket_number: string;
              category: string;
              urgency: string;
              sla_due_date: string | null;
              resolution_notes: string | null;
              tags: string[] | null;
              created_at: string;
              updated_at: string;
            };
            Insert: {
              id?: string;
              thread_id: string;
              ticket_number: string;
              category: string;
              urgency?: string;
              sla_due_date?: string | null;
              resolution_notes?: string | null;
              tags?: string[] | null;
              created_at?: string;
              updated_at?: string;
            };
            Update: {
              id?: string;
              thread_id?: string;
              ticket_number?: string;
              category?: string;
              urgency?: string;
              sla_due_date?: string | null;
              resolution_notes?: string | null;
              tags?: string[] | null;
              created_at?: string;
              updated_at?: string;
            };
          };
          reviews: {
            Row: {
              id: string;
              booking_id: string | null;
              reviewer_id: string;
              reviewed_id: string;
              rating: number;
              comment: string | null;
              created_at: string;
              updated_at: string;
              status: string;
              moderated_by: string | null;
              moderated_at: string | null;
              moderation_notes: string | null;
            };
            Insert: {
              id?: string;
              booking_id?: string | null;
              reviewer_id: string;
              reviewed_id: string;
              rating: number;
              comment?: string | null;
              created_at?: string;
              updated_at?: string;
              status?: string;
              moderated_by?: string | null;
              moderated_at?: string | null;
              moderation_notes?: string | null;
            };
            Update: {
              id?: string;
              booking_id?: string | null;
              reviewer_id?: string;
              reviewed_id?: string;
              rating?: number;
              comment?: string | null;
              created_at?: string;
              updated_at?: string;
              status?: string;
              moderated_by?: string | null;
              moderated_at?: string | null;
              moderation_notes?: string | null;
            };
          };
          wallets: {
            Row: {
              id: string;
              user_id: string;
              balance: number;
              currency: string;
              updated_at: string;
            };
            Insert: {
              id?: string;
              user_id: string;
              balance?: number;
              currency?: string;
              updated_at?: string;
            };
            Update: {
              id?: string;
              user_id?: string;
              balance?: number;
              currency?: string;
              updated_at?: string;
            };
          };
          wallet_transactions: {
            Row: {
              id: string;
              wallet_id: string | null;
              amount: number;
              type: string;
              description: string | null;
              status: string;
              transaction_date: string;
            };
            Insert: {
              id?: string;
              wallet_id?: string | null;
              amount: number;
              type: string;
              description?: string | null;
              status?: string;
              transaction_date?: string;
            };
            Update: {
              id?: string;
              wallet_id?: string | null;
              amount?: number;
              type?: string;
              description?: string | null;
              status?: string;
              transaction_date?: string;
            };
            vendors: {
              Row: {
                id: string;
                company_name: string;
                gst_number: string | null;
                address: string | null;
                contact_person: string | null;
                created_at: string;
                updated_at: string;
              };
              Insert: {
                id: string;
                company_name: string;
                gst_number?: string | null;
                address?: string | null;
                contact_person?: string | null;
                created_at?: string;
                updated_at?: string;
              };
              Update: {
                id?: string;
                company_name?: string;
                gst_number?: string | null;
                address?: string | null;
                contact_person?: string | null;
                created_at?: string;
                updated_at?: string;
              };
            };
            promo_codes: {
              Row: {
                id: string;
                code: string | null;
                discount_type: string | null;
                discount_value: number | null;
                expiry_date: string | null;
                usage_limit: number | null;
                created_at: string;
              };
              Insert: {
                id?: string;
                code?: string | null;
                discount_type?: string | null;
                discount_value?: number | null;
                expiry_date?: string | null;
                usage_limit?: number | null;
                created_at?: string;
              };
              Update: {
                id?: string;
                code?: string | null;
                discount_type?: string | null;
                discount_value?: number | null;
                expiry_date?: string | null;
                usage_limit?: number | null;
                created_at?: string;
              };
            };
            rental_packages: {
              Row: {
                id: string;
                name: string;
                vehicle_type: string;
                duration_hours: number;
                included_kilometers: number;
                base_price: number;
                extra_km_rate: number;
                extra_hour_rate: number;
                cancellation_fee: number;
                no_show_fee: number;
                waiting_limit_minutes: number;
                is_active: boolean;
                created_at: string;
                updated_at: string;
                vehicle_type_id: string | null;
                zone: string | null;
              };
              Insert: {
                id?: string;
                name: string;
                vehicle_type: string;
                duration_hours: number;
                included_kilometers: number;
                base_price: number;
                extra_km_rate: number;
                extra_hour_rate: number;
                cancellation_fee?: number;
                no_show_fee?: number;
                waiting_limit_minutes?: number;
                is_active?: boolean;
                created_at?: string;
                updated_at?: string;
                vehicle_type_id?: string | null;
                zone?: string | null;
              };
              Update: {
                id?: string;
                name?: string;
                vehicle_type?: string;
                duration_hours?: number;
                included_kilometers?: number;
                base_price?: number;
                extra_km_rate?: number;
                extra_hour_rate?: number;
                cancellation_fee?: number;
                no_show_fee?: number;
                waiting_limit_minutes?: number;
                is_active?: boolean;
                created_at?: string;
                updated_at?: string;
                vehicle_type_id?: string | null;
                zone?: string | null;
              };
            };
            user_preferences: {
              Row: {
                user_id: string;
                dark_mode: boolean;
                notification_enabled: boolean;
                email_notifications: boolean;
                created_at: string;
                updated_at: string;
              };
              Insert: {
                user_id: string;
                dark_mode?: boolean;
                notification_enabled?: boolean;
                email_notifications?: boolean;
                created_at?: string;
                updated_at?: string;
              };
              Update: {
                user_id?: string;
                dark_mode?: boolean;
                notification_enabled?: boolean;
                email_notifications?: boolean;
                created_at?: string;
                updated_at?: string;
              };
            };
            user_settings: {
              Row: {
                user_id: string;
                dark_mode_enabled: boolean;
                notifications_enabled: boolean;
                created_at: string;
                updated_at: string;
              };
              Insert: {
                user_id: string;
                dark_mode_enabled?: boolean;
                notifications_enabled?: boolean;
                created_at?: string;
                updated_at?: string;
              };
              Update: {
                user_id?: string;
                dark_mode_enabled?: boolean;
                notifications_enabled?: boolean;
                created_at?: string;
                updated_at?: string;
              };
            };
          };
        };
      };
    };
  };
};