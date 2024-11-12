export const paymentConfig = {
  kenya: {
    currency: 'KES',
    methods: ['MPESA', 'CARD', 'BANK'],
    subscriptionFee: 2500, // KES
  },
  international: {
    currency: 'USD',
    methods: ['CARD', 'BANK'],
    subscriptionFee: 25, // USD
  }
} 