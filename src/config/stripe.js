// Stripe Configuration
// Replace these with your actual Stripe Price IDs from your Stripe Dashboard

export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,

  // Price IDs for each plan
  prices: {
    free: null, // Free plan doesn't need a price ID
    pro: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
      annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL,
    },
    premium: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY,
      annual: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_ANNUAL,
    },
  },

  // Firebase Function URLs (will be auto-generated when deployed)
  functionsUrl: import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'http://127.0.0.1:5001/wing-it-f2fef/us-central1',
};
