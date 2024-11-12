"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "next-themes"
import { companyConfig } from "@/config/company"
import { NotificationService } from "@/services/notifications"
import { PaymentService } from "@/services/payment"
import { SyncService } from "@/services/sync"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { Sun, Moon, Settings, Bell } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'
import PayPalSubscription from '@/components/PayPalSubscription'

export default function BenkamkiHouseManager() {
  const { user, loading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [syncStatus, setSyncStatus] = useState('idle')
  const [payments, setPayments] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [messages, setMessages] = useState([])
  const [country, setCountry] = useState('kenya')
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    if (user) {
      const syncService = SyncService.getInstance()
      const cleanup = syncService.startSync(user.id)
      loadUserData()
      detectUserCountry()
      loadSubscription()
      return cleanup
    }
  }, [user])

  const detectUserCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      setCountry(data.country_code === 'KE' ? 'kenya' : 'international')
    } catch (error) {
      console.error('Failed to detect country:', error)
    }
  }

  const loadUserData = async () => {
    if (!user) return

    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .order('timestamp', { ascending: false })

      const { data: maintenance } = await supabase
        .from('maintenance')
        .select('*')
        .order('timestamp', { ascending: false })

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: false })

      setPayments(payments || [])
      setMaintenance(maintenance || [])
      setMessages(messages || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    }
  }

  const loadSubscription = async () => {
    try {
      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setSubscription(sub)
    } catch (error) {
      console.error('Failed to load subscription:', error)
    }
  }

  const handlePayment = async (amount, method, currency) => {
    try {
      const paymentService = new PaymentService()
      const result = await paymentService.processPayment({
        amount,
        method,
        currency: country === 'kenya' ? 'KES' : 'USD',
        clientId: user?.id,
        houseId: '1' // Replace with actual house ID
      })

      toast.success('Payment processed successfully')
      loadUserData()
    } catch (error) {
      console.error('Payment failed:', error)
      toast.error('Payment failed')
    }
  }

  const handleMaintenanceRequest = async (request) => {
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .insert([{ ...request, clientId: user?.id }])

      if (error) throw error
      toast.success('Maintenance request submitted')
      loadUserData()
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error('Failed to submit request')
    }
  }

  const handleSendMessage = async (message) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          ...message,
          from: user?.id,
          timestamp: new Date().toISOString()
        }])

      if (error) throw error
      toast.success('Message sent')
      loadUserData()
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleSubscriptionSuccess = async (subscriptionId) => {
    await loadSubscription()
    loadUserData()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!subscription?.status === 'active') {
    return (
      <div className="container mx-auto p-4">
        <PayPalSubscription 
          country={country} 
          onSuccess={handleSubscriptionSuccess} 
        />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src={companyConfig.logo}
                alt={companyConfig.name}
                width={150}
                height={50}
                className="object-contain"
              />
              <div className="text-sm">
                <p>{companyConfig.address.street}</p>
                <p>{companyConfig.address.city}, {companyConfig.address.country}</p>
                <p>{companyConfig.contacts.phone[country]}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          {/* Payment Sections */}
          {user?.role === 'owner' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Payment Overview</h2>
              <PaymentDashboard payments={payments} currency={country === 'kenya' ? 'KES' : 'USD'} />
            </Card>
          )}

          {user?.role === 'frontdesk' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Payment Confirmations</h2>
              <PaymentConfirmation 
                payments={payments.filter(p => p.status === 'pending')} 
                onConfirm={handlePayment} 
              />
            </Card>
          )}

          {user?.role === 'client' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Make Payment</h2>
              <PaymentForm 
                onSubmit={handlePayment}
                currency={country === 'kenya' ? 'KES' : 'USD'}
                methods={country === 'kenya' ? ['MPESA', 'CARD', 'BANK'] : ['CARD', 'BANK']}
              />
            </Card>
          )}

          {/* Maintenance Requests */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Maintenance</h2>
            <MaintenanceCenter
              requests={maintenance}
              onNewRequest={handleMaintenanceRequest}
              userRole={user?.role}
            />
          </Card>

          {/* Messages */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Messages</h2>
            <MessageCenter
              messages={messages}
              onSendMessage={handleSendMessage}
              userRole={user?.role}
            />
          </Card>
        </main>
      </div>
    </div>
  )
} 