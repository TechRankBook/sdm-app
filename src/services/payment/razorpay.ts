import RazorpayCheckout from 'react-native-razorpay';
import { supabase } from '../supabase/client';
import { RAZORPAY_KEY_ID } from '../../constants';

export interface PaymentData {
  amount: number;
  currency: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

export class RazorpayService {
  /**
   * Initialize payment with Razorpay
   */
  static async initiatePayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Create order in Supabase (this would call the edge function)
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: paymentData.amount,
          currency: paymentData.currency,
          booking_id: paymentData.bookingId,
          customer_id: paymentData.customerId,
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

      // Razorpay checkout options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'SDM Cab Hailing',
        description: paymentData.description,
        order_id: orderId,
        prefill: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          contact: paymentData.customerPhone,
        },
        theme: {
          color: '#3b82f6',
        },
      };

      // Open Razorpay checkout
      const paymentResponse = await RazorpayCheckout.open(options);

      // Verify payment
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

    } catch (error: any) {
      console.error('Razorpay payment error:', error);

      // Handle specific Razorpay errors
      if (error.code === 0) {
        // Payment cancelled by user
        return {
          success: false,
          error: 'Payment cancelled'
        };
      } else if (error.code === 1) {
        // Payment failed
        return {
          success: false,
          error: 'Payment failed'
        };
      } else {
        return {
          success: false,
          error: error.description || 'Payment failed'
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