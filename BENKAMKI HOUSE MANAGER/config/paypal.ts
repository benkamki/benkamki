declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: string;
      PAYPAL_ACCESS_TOKEN: string;
    }
  }
}

export const paypalConfig = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  currency: {
    kenya: 'KES',
    international: 'USD'
  } as const,
  subscription: {
    kenya: {
      planId: 'P-XXXXX_KES',
      amount: 2500
    },
    international: {
      planId: 'P-XXXXX_USD',
      amount: 25
    }
  }
}

export type CountryType = keyof typeof paypalConfig.currency; 