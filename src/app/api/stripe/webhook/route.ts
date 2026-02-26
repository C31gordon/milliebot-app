import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const tenantId = session.metadata?.tenantId
        if (tenantId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = subscription.items.data[0]?.price.id
          // Determine plan from price ID
          const plan = determinePlanFromPrice(priceId)
          await supabaseAdmin
            .from('tenants')
            .update({
              stripe_subscription_id: session.subscription as string,
              plan,
            })
            .eq('id', tenantId)
        }
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const { data: tenant } = await supabaseAdmin
          .from('tenants')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        if (tenant) {
          const priceId = subscription.items.data[0]?.price.id
          const plan = determinePlanFromPrice(priceId)
          await supabaseAdmin
            .from('tenants')
            .update({ plan, stripe_subscription_id: subscription.id })
            .eq('id', tenant.id)
        }
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        await supabaseAdmin
          .from('tenants')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('stripe_customer_id', customerId)
        break
      }
      case 'invoice.payment_failed': {
        // Could add notification logic here
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function determinePlanFromPrice(priceId: string): string {
  const proPrices = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL,
  ]
  const entPrices = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ENT_MONTHLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ENT_ANNUAL,
  ]
  if (proPrices.includes(priceId)) return 'professional'
  if (entPrices.includes(priceId)) return 'enterprise'
  return 'free'
}
