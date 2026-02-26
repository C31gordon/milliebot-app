export type PlanType = 'free' | 'professional' | 'enterprise'

export interface PlanLimits {
  name: string
  price: number
  annualPrice: number
  agents: number
  bots: number
  queriesPerDay: number
  trainingSeatsIncluded: number
  features: string[]
  cta: string
  stripePriceIdMonthly: string | null
  stripePriceIdAnnual: string | null
  highlight: boolean
}

export interface TrainingAddon {
  name: string
  description: string
  pricePerSeat: number
  annualPricePerSeat: number
  volumePricePerSeat: number
  volumeAnnualPricePerSeat: number
  volumeThreshold: number
  minSeats: number
  features: string[]
  stripePriceIdMonthly: string
  stripePriceIdAnnual: string
  stripePriceIdVolMonthly: string
  stripePriceIdVolAnnual: string
}

export const PLANS: Record<PlanType, PlanLimits> = {
  free: {
    name: 'Starter',
    price: 0,
    annualPrice: 0,
    agents: 2,
    bots: 1,
    queriesPerDay: 100,
    trainingSeatsIncluded: 0,
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
    trainingSeatsIncluded: 3,
    features: [
      '10 AI Agents',
      '5 Bots',
      '1,000 AI queries/day',
      'Email support',
      'SSO Integration',
      'Advanced RKBAC™',
      'Custom workflows',
      'Priority processing',
      '3 Training seats included',
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
    trainingSeatsIncluded: 25,
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
      '25 Training seats included',
    ],
    cta: 'Contact Sales',
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENT_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENT_ANNUAL || '',
    highlight: false,
  },
}

export const TRAINING_ADDON: TrainingAddon = {
  name: 'Training & Digital Adoption',
  description: 'AI-powered onboarding pathways, Guardian Gates, and competency verification for your entire team.',
  pricePerSeat: 12,
  annualPricePerSeat: 10,
  volumePricePerSeat: 10,
  volumeAnnualPricePerSeat: 8,
  volumeThreshold: 250,
  minSeats: 10,
  features: [
    'AI-Powered Onboarding Pathways',
    'Guardian Gates (prerequisite enforcement)',
    'Competency Verification & Assessments',
    'Role-based learning tracks',
    'Progress dashboards & analytics',
    'Completion certificates',
    'Custom training content builder',
    'Compliance tracking & audit trail',
  ],
  stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TRAINING_MONTHLY || '',
  stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_TRAINING_ANNUAL || '',
  stripePriceIdVolMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TRAINING_VOL_MONTHLY || '',
  stripePriceIdVolAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_TRAINING_VOL_ANNUAL || '',
}

export function getTrainingCost(seats: number, plan: PlanType, annual: boolean): number {
  const included = PLANS[plan].trainingSeatsIncluded
  const billableSeats = Math.max(0, seats - included)
  if (billableSeats === 0) return 0

  const isVolume = seats >= TRAINING_ADDON.volumeThreshold
  if (annual) {
    return billableSeats * (isVolume ? TRAINING_ADDON.volumeAnnualPricePerSeat : TRAINING_ADDON.annualPricePerSeat)
  }
  return billableSeats * (isVolume ? TRAINING_ADDON.volumePricePerSeat : TRAINING_ADDON.pricePerSeat)
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
