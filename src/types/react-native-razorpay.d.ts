declare module 'react-native-razorpay' {
  interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
    retry?: {
      enabled?: boolean;
    };
    timeout?: number;
  }

  interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayError {
    code: number;
    description: string;
  }

  class RazorpayCheckout {
    static open(options: RazorpayCheckoutOptions): Promise<RazorpayPaymentResponse>;
  }

  export default RazorpayCheckout;
}