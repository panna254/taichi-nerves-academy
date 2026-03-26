// Payment service for handling different payment methods

export interface PaymentRequest {
  phone?: string;
  amount: number;
  userId: string;
  plan: string;
  currency?: string;
}

export interface MpesaResponse {
  success: boolean;
  transactionId: string;
  message?: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  message?: string;
}

export interface PaymentConfirmation {
  userId: string;
  plan: string;
  paymentMethod: 'mpesa' | 'paypal' | 'card';
  transactionId: string;
  amount: number;
}

class PaymentService {
  // M-Pesa STK Push
  async initiateMpesaPayment(request: PaymentRequest): Promise<MpesaResponse> {
    try {
      const response = await fetch('/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Failed to initiate M-Pesa payment');
      }

      return await response.json();
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      throw error;
    }
  }

  // Check M-Pesa payment status
  async checkMpesaStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`/api/payments/mpesa/status/${transactionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('M-Pesa status check error:', error);
      throw error;
    }
  }

  // Confirm payment and update membership
  async confirmPayment(confirmation: PaymentConfirmation): Promise<void> {
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmation)
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }
  }

  // Generate transaction reference
  generateTransactionRef(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `TN${timestamp}${random}`.toUpperCase();
  }

  // Format phone number for M-Pesa
  formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Remove leading + if present
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // Add Kenya country code if not present
    if (!cleaned.startsWith('254')) {
      if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
      } else {
        cleaned = '254' + cleaned;
      }
    }
    
    return cleaned;
  }

  // Validate phone number
  validatePhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    // Kenya phone numbers should be 12 digits starting with 254
    return /^254[17]\d{8}$/.test(formatted);
  }
}

export const paymentService = new PaymentService();
