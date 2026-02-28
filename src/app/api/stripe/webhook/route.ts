import { NextRequest, NextResponse } from 'next/server'
import { getStripe, determinePlanFromPrice } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

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
    const eventType = event.type

    if (eventType === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.orgId || session.metadata?.tenantId
      if (orgId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = subscription.items.data[0]?.price.id
        const plan = determinePlanFromPrice(priceId)
        await db
          .from('organizations')
          .update({ stripe_subscription_id: session.subscription as string, plan })
          .eq('id', orgId)
      }
    } else if (eventType === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const { data: org } = await db
        .from('organizations')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      if (org) {
        const priceId = subscription.items.data[0]?.price.id
        const plan = determinePlanFromPrice(priceId)
        await db
          .from('organizations')
          .update({ plan, stripe_subscription_id: subscription.id })
          .eq('id', org.id)
      }
    } else if (eventType === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      await db
        .from('organizations')
        .update({ plan: 'starter', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
    } else if (eventType === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      console.log(`[Stripe] Payment failed for customer: ${invoice.customer}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook handler error'
    console.error('[Stripe Webhook Error]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
