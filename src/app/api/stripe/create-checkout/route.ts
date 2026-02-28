import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }

    const { priceId, tenantId, userId, email } = await request.json() as {
      priceId: string
      tenantId: string
      userId: string
      email: string
    }

    if (!priceId || !tenantId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: tenant } = await db
      .from('tenants')
      .select('stripe_customer_id')
      .eq('id', tenantId)
      .single()

    let customerId = tenant?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { tenantId, userId },
      })
      customerId = customer.id
      await db
        .from('tenants')
        .update({ stripe_customer_id: customerId })
        .eq('id', tenantId)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/settings?billing=success`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
      metadata: { tenantId, userId },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
