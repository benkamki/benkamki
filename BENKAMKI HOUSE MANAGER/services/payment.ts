import { supabase } from '@/lib/supabaseClient'
import { Payment } from '@/types'
import { NotificationService } from './notifications'

export class PaymentService {
  private notificationService: NotificationService

  constructor() {
    this.notificationService = new NotificationService()
  }

  async processPayment(payment: Omit<Payment, 'id' | 'status' | 'timestamp'>) {
    try {
      // Process payment based on method
      const processedPayment = await this.handlePaymentMethod(payment)

      // Save payment record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...processedPayment,
          status: 'pending',
          timestamp: new Date().toISOString()
        })
        .single()

      if (error) throw error

      // Notify owner
      await this.notificationService.sendNotification({
        from: { id: payment.clientId } as any,
        to: 'owner',
        content: `New payment of ${payment.amount} ${payment.currency} received`,
        read: false
      })

      return data
    } catch (error) {
      console.error('Payment processing failed:', error)
      throw error
    }
  }

  private async handlePaymentMethod(payment: Omit<Payment, 'id' | 'status' | 'timestamp'>) {
    switch (payment.method) {
      case 'MPESA':
        return this.processMpesa(payment)
      case 'CARD':
        return this.processCard(payment)
      case 'BANK':
        return this.processBank(payment)
      default:
        throw new Error('Unsupported payment method')
    }
  }

  private async processMpesa(payment: any) {
    // Implement M-PESA payment logic
    return payment
  }

  private async processCard(payment: any) {
    // Implement card payment logic
    return payment
  }

  private async processBank(payment: any) {
    // Implement bank transfer logic
    return payment
  }
} 