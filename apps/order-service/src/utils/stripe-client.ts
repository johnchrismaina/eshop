import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Get or create Stripe instance with the API key from environment variables
 * This ensures dotenv.config() has been called before Stripe is initialized
 */
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-10-29.clover',
    });
  }
  return stripeInstance;
}
