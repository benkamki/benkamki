"use client"

import { useEffect, useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { paypalConfig } from '@/config/paypal'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

export default function PayPalSubscription({ country, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const config = paypalConfig.subscription[country]

  const initialOptions = {
    "client-id": paypalConfig.clientId,
    currency: paypalConfig.currency[country],
    intent: "subscription"
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Subscribe to Benkamki House Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {config.amount} {paypalConfig.currency[country]}
            </p>
            <p className="text-gray-500">per month</p>
          </div>

          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              createSubscription={(data, actions) => {
                return actions.subscription.create({
                  plan_id: config.planId
                })
              }}
              onApprove={async (data, actions) => {
                setLoading(true)
                try {
                  // Verify the subscription on your server
                  const response = await fetch('/api/verify-subscription', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      subscriptionId: data.subscriptionID,
                      orderId: data.orderID,
                    }),
                  })

                  if (!response.ok) throw new Error('Failed to verify subscription')

                  toast.success('Subscription activated successfully!')
                  onSuccess(data.subscriptionID)
                } catch (error) {
                  console.error('Subscription verification failed:', error)
                  toast.error('Failed to verify subscription')
                } finally {
                  setLoading(false)
                }
              }}
              onError={(err) => {
                console.error('PayPal error:', err)
                toast.error('Payment failed. Please try again.')
              }}
              style={{
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "subscribe"
              }}
            />
          </PayPalScriptProvider>

          {loading && (
            <div className="text-center">
              <p>Processing your subscription...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 