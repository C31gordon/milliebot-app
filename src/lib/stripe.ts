import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
    })
  }
  return stripeInstance
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

// ============================================================
// Pricing Plans
// ============================================================

export type BillingCycle = 'monthly' | 'annual'

export interface StripePlan {
  id: string
  name: string
  monthlyPrice: number
  annualPrice: number
  priceIdMonthly: string
  priceIdAnnual: string
  features: string[]
  isCustom?: boolean
}

export const STRIPE_PLANS: Record<string, StripePlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 49,
    annualPrice: 39,
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual',
    features: [
      '2 AI Agents',
      '1 Bot',
      '100 AI queries/day',
      'Community support',
      'Basic RKBAC™',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 149,
    annualPrice: 119,
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_MONTHLY || 'price_growth_monthly',
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_ANNUAL || 'price_growth_annual',
    features: [
      '10 AI Agents',
      '5 Bots',
      '1,000 AI queries/day',
      'Email support',
      'SSO Integration',
      'Advanced RKBAC™',
      'Custom workflows',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 499,
    annualPrice: 399,
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_enterprise_annual',
    features: [
      'Unlimited Agents',
      'Unlimited Bots',
      'Unlimited AI queries',
      'Dedicated support',
      'White-label option',
      'Custom RKBAC™ policies',
      'API access',
      'SLA guarantee',
    ],
  },
  white_label: {
    id: 'white_label',
    name: 'White Label',
    monthlyPrice: 0,
    annualPrice: 0,
    priceIdMonthly: '',
    priceIdAnnual: '',
    features: [
      'Full white-label branding',
      'Custom domain',
      'Dedicated infrastructure',
      'Custom SLA',
      'Priority engineering support',
    ],
    isCustom: true,
  },
}

// ============================================================
// Helper Functions (placeholders until Stripe keys are wired)
// ============================================================

export async function createCheckoutSession(
  orgId: string,
  planId: string,
  billingCycle: BillingCycle
): Promise<{ url: string | null }> {
  const stripe = getStripe()
  const plan = STRIPE_PLANS[planId]
  if (!stripe || !plan) {
    console.log(`[Stripe] Checkout intent: org=${orgId} plan=${planId} cycle=${billingCycle}`)
    return { url: null }
  }

  const priceId = billingCycle === 'annual' ? plan.priceIdAnnual : plan.priceIdMonthly
  // Actual checkout is handled by /api/stripe/create-checkout route
  console.log(`[Stripe] Creating checkout: org=${orgId} price=${priceId}`)
  return { url: null }
}

export async function createPortalSession(
  orgId: string
): Promise<{ url: string | null }> {
  const stripe = getStripe()
  if (!stripe) {
    console.log(`[Stripe] Portal intent: org=${orgId}`)
    return { url: null }
  }
  // Actual portal is handled by /api/stripe/create-portal route
  console.log(`[Stripe] Creating portal session: org=${orgId}`)
  return { url: null }
}

export function determinePlanFromPrice(priceId: string): string {
  for (const [key, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.priceIdMonthly === priceId || plan.priceIdAnnual === priceId) {
      return key
    }
  }
  return 'starter'
}

export async function handleWebhook(event: Stripe.Event): Promise<void> {
  console.log(`[Stripe] Webhook received: ${event.type}`)
  // Actual handling is in /api/stripe/webhook/route.ts
}
