import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { supabase } from '@/lib/supabaseClient';
import { paypalConfig, CountryType } from '@/config/paypal';
import { NotificationService } from './notifications';

interface Subscription {
  id: string;
  user_id: string;
  plan: CountryType;
  status: 'pending' | 'active' | 'cancelled';
  created_at: string;
  activated_at?: string;
}

interface NotificationMessage {
  type: string;
  message: string;
  userId: string;
}

export class SubscriptionService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async createSubscription(userId: string, country: CountryType): Promise<Subscription> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: userId,
          plan: country,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .single();

      if (error) throw error;
      return data as Subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  async activateSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'active',
          activated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .single();

      if (error) throw error;

      const subscription = data as Subscription;

      // Notify admin with proper arguments
      await this.notificationService.sendNotification(
        {
          type: 'SUBSCRIPTION_ACTIVATED',
          message: `New subscription activated: ${subscription.id}`,
          userId: subscription.user_id
        },
        ['admin'] // Add recipient list as second argument
      );

      return subscription;
    } catch (error) {
      console.error('Failed to activate subscription:', error);
      throw error;
    }
  }
} 