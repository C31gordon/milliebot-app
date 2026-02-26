export type PlanType = 'free' | 'professional' | 'enterprise'

export interface PlanLimits {
  name: string
  price: number
  annualPrice: number
  agents: number
  bots: number
  queriesPerDay: number
  features: string[]
  cta: string
  stripePriceIdMonthly: string | null
  stripePriceIdAnnual: string | null
  highlight: boolean
}

export const PLANS: Record<PlanType, PlanLimits> = {
  free: {
    name: 'Starter',
    price: 0,
    annualPrice: 0,
    agents: 2,
    bots: 1,
    queriesPerDay: 100,
    features: [
      '2 AI Agents',
      '1 Bot',
      '100 AI queries/day',
      'Community support',
      'Basic RKBAC™',
      'Standard dashboards',
    ],
    cta: 'Get Started',
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    highlight: false,
  },
  professional: {
    name: 'Professional',
    price: 49,
    annualPrice: 39,
    agents: 10,
    bots: 5,
    queriesPerDay: 1000,
    features: [
      '10 AI Agents',
      '5 Bots',
      '1,000 AI queries/day',
      'Email support',
      'SSO Integration',
      'Advanced RKBAC™',
      'Custom workflows',
      'Priority processing',
    ],
    cta: 'Subscribe',
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || '',
    highlight: true,
  },
  enterprise: {
    name: 'Enterprise',
    price: 499,
    annualPrice: 399,
    agents: Infinity,
    bots: Infinity,
    queriesPerDay: Infinity,
    features: [
      'Unlimited Agents',
      'Unlimited Bots',
      'Unlimited AI queries',
      'Dedicated support',
      'White-label option',
      'Custom RKBAC™ policies',
      'API access',
      'SLA guarantee',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENT_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENT_ANNUAL || '',
    highlight: false,
  },
}

export function getPlanLimits(plan: string): PlanLimits {
  return PLANS[plan as PlanType] || PLANS.free
}

export function checkPlanLimit(
  plan: string,
  resource: 'agents' | 'bots',
  currentCount: number
): { allowed: boolean; message: string } {
  const limits = getPlanLimits(plan)
  const limit = resource === 'agents' ? limits.agents : limits.bots
  if (currentCount >= limit) {
    const upgrade = plan === 'free' ? 'Professional' : 'Enterprise'
    return {
      allowed: false,
      message: `You've reached the ${resource} limit for your ${limits.name} plan. Upgrade to ${upgrade} to add more ${resource}.`,
    }
  }
  return { allowed: true, message: '' }
}
