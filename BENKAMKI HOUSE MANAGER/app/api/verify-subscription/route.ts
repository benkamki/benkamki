import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { SubscriptionService } from '@/services/subscription'

interface SubscriptionRequest {
  subscriptionId: string;
  orderId: string;
}

export async function POST(request: Request) {
  try {
    const { subscriptionId, orderId }: SubscriptionRequest = await request.json()

    if (!process.env.PAYPAL_ACCESS_TOKEN) {
      throw new Error('PayPal access token not configured');
    }

    // Verify the subscription with PayPal
    const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to verify subscription with PayPal')
    }

    const subscriptionData = await response.json()

    if (subscriptionData.status === 'ACTIVE') {
      const subscriptionService = new SubscriptionService()
      await subscriptionService.activateSubscription(subscriptionId)

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription activated successfully' 
      })
    }

    throw new Error('Subscription not active')
  } catch (error) {
    console.error('Subscription verification failed:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify subscription' },
      { status: 500 }
    )
  }
} 