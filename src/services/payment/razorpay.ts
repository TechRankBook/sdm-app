import { Platform } from 'react-native';
import { supabase } from '../supabase/client';

// Declare global Razorpay for web platform
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentData {
  amount: number;
  currency: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  paymentMethod?: string;
  paymentAmount?: 'partial' | 'full';
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

export class RazorpayService {
  private static razorpayLoaded = false;

  /**
   * Load Razorpay script for web platform
   */
  static async loadRazorpayScript(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      return true; // Native platforms don't need script loading
    }

    if (this.razorpayLoaded || (typeof window !== 'undefined' && window.Razorpay)) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Initialize payment with Razorpay (Web & Mobile compatible)
   */
  static async initiatePayment(paymentData: PaymentData, bookingData?: any): Promise<PaymentResult> {
    try {
      // Load Razorpay script for web
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        return {
          success: false,
          error: 'Payment system not available. Please refresh and try again.'
        };
      }

      // Create order in Supabase using edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          bookingData: bookingData,
          bookingId: paymentData.bookingId,
          paymentMethod: paymentData.paymentMethod || 'upi',
          paymentAmount: paymentData.amount,
        }
      });

      if (orderError) {
        console.error('Error creating Razorpay order:', orderError);
        return {
          success: false,
          error: 'Failed to create payment order'
        };
      }

      const orderId = orderData.order_id;
      const keyId = orderData.key_id;

      // Razorpay checkout options
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SDM E-Mobility',
        description: paymentData.description,
        order_id: orderId,
        handler: async (response: any) => {
          // This will be handled by the calling component
          return response;
        },
        prefill: {
          name: orderData.user_name || paymentData.customerName,
          email: orderData.user_email || paymentData.customerEmail,
          contact: orderData.user_phone || paymentData.customerPhone,
        },
        notes: {
          booking_id: paymentData.bookingId,
          service_type: bookingData?.serviceType,
        },
        theme: {
          color: '#f59e0b', // Yellow theme color
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
          },
          backdrop_close: false,
          confirm_close: false,
          escape: false,
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Most Used Methods',
                instruments: [
                  { method: 'upi' },
                  { method: 'card' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
      };

      if (Platform.OS === 'web') {
        // Web platform - return a promise that resolves when payment is complete
        return new Promise((resolve) => {
          const rzp = new window.Razorpay({
            ...options,
            handler: async (response: any) => {
              try {
                const verificationResult = await this.verifyPayment({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  bookingId: paymentData.bookingId,
                });

                if (verificationResult.success) {
                  resolve({
                    success: true,
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                  });
                } else {
                  resolve({
                    success: false,
                    error: 'Payment verification failed'
                  });
                }
              } catch (error) {
                resolve({
                  success: false,
                  error: 'Payment verification failed'
                });
              }
            },
            modal: {
              ...options.modal,
              ondismiss: () => {
                resolve({
                  success: false,
                  error: 'Payment cancelled by user'
                });
              },
            },
          });
          
          rzp.open();
        });
      } else {
        // Mobile platform - use react-native-razorpay
        const RazorpayCheckout = require('react-native-razorpay').default;
        const paymentResponse = await RazorpayCheckout.open(options);

        // Verify payment for mobile
        const verificationResult = await this.verifyPayment({
          paymentId: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature,
          bookingId: paymentData.bookingId,
        });

        if (verificationResult.success) {
          return {
            success: true,
            paymentId: paymentResponse.razorpay_payment_id,
            orderId: paymentResponse.razorpay_order_id,
          };
        } else {
          return {
            success: false,
            error: 'Payment verification failed'
          };
        }
      }

    } catch (error: any) {
      console.error('Razorpay payment error:', error);

      // Handle specific Razorpay errors
      if (error.code === 0) {
        return {
          success: false,
          error: 'Payment cancelled'
        };
      } else if (error.code === 1) {
        return {
          success: false,
          error: 'Payment failed'
        };
      } else {
        return {
          success: false,
          error: error.description || error.message || 'Payment failed'
        };
      }
    }
  }

  /**
   * Verify payment with backend
   */
  static async verifyPayment(verificationData: {
    paymentId: string;
    orderId: string;
    signature: string;
    bookingId: string;
  }): Promise<PaymentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          razorpay_payment_id: verificationData.paymentId,
          razorpay_order_id: verificationData.orderId,
          razorpay_signature: verificationData.signature,
          booking_id: verificationData.bookingId,
        }
      });

      if (error) {
        console.error('Payment verification error:', error);
        return {
          success: false,
          error: 'Payment verification failed'
        };
      }

      return {
        success: true,
        paymentId: verificationData.paymentId,
        orderId: verificationData.orderId,
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: 'Payment verification failed'
      };
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('razorpay_payment_id', paymentId)
        .single();

      if (error) {
        console.error('Error fetching payment status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }
  }

  /**
   * Format amount for Razorpay (paise)
   */
  static formatAmount(amount: number): number {
    return Math.round(amount * 100); // Convert to paise
  }

  /**
   * Format amount for display (rupees)
   */
  static formatDisplayAmount(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  /**
   * Get payment method name
   */
  static getPaymentMethodName(method: string): string {
    switch (method.toLowerCase()) {
      case 'card':
        return 'Credit/Debit Card';
      case 'netbanking':
        return 'Net Banking';
      case 'wallet':
        return 'Wallet';
      case 'upi':
        return 'UPI';
      default:
        return method;
    }
  }
}