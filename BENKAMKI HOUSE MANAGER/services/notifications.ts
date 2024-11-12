import { supabase } from '@/lib/supabaseClient'
import { Message, User } from '@/types'

export class NotificationService {
  async sendNotification(
    message: Omit<Message, 'id' | 'timestamp' | 'read'>,
    recipients: User[]
  ) {
    try {
      const notifications = recipients.map(recipient => ({
        ...message,
        timestamp: new Date().toISOString(),
        read: false,
        recipientId: recipient.id
      }))

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) throw error

      // Send push notification if mobile
      if (this.isMobileDevice()) {
        await this.sendPushNotification({
          title: 'New Notification',
          body: message.content,
          userIds: recipients.map(r => r.id)
        })
      }

      return data
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  async sendPaymentNotification(payment: any) {
    const { data: owner } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'owner')
      .single()

    if (owner) {
      await this.sendNotification(
        {
          from: payment.client as User,
          to: 'owner',
          content: `New payment of ${payment.amount} ${payment.currency} received for House ${payment.houseId}`,
          attachments: payment.receipt ? [payment.receipt] : undefined
        },
        [owner]
      )
    }
  }

  private isMobileDevice() {
    return typeof window !== 'undefined' && 
           /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
  }

  private async sendPushNotification({
    title,
    body,
    userIds
  }: {
    title: string
    body: string
    userIds: string[]
  }) {
    // Implement push notifications using Firebase Cloud Messaging or similar
    console.log('Sending push notification:', { title, body, userIds })
  }
} 