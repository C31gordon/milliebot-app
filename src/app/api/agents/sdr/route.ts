import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// POST /api/agents/sdr — triggered on new signup
export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { userId, email, orgName, industry, size, firstName } = await req.json()

  // Classify lead
  const isEnterprise = size === '200+' || size === '51-200'
  const isHighValue = ['healthcare', 'property', 'construction'].includes(industry)
  const tier = isEnterprise && isHighValue ? 'hot' : isEnterprise || isHighValue ? 'warm' : 'nurture'

  // Build personalized welcome
  const industryHooks: Record<string, string> = {
    healthcare: 'Most healthcare teams start by automating patient intake and appointment scheduling — agents handle the repetitive stuff so your clinical staff can focus on care.',
    property: 'Property management teams usually see the fastest ROI automating leasing inquiries and work order routing — your agents can handle those 24/7.',
    construction: 'Construction firms love automating RFI tracking and daily field reports — your agents keep projects moving without the paperwork pile-up.',
    technology: 'Tech teams typically start with automated support triage and onboarding — your agents scale customer success without scaling headcount.',
    finance: 'Finance teams get the most value from automated invoice processing and reconciliation — your agents eliminate manual data entry.',
    legal: 'Legal teams start with document review automation and client intake — your agents handle the repetitive work so attorneys focus on strategy.',
  }

  const hook = industryHooks[industry] || 'Most teams start by automating their most repetitive workflows — you\'ll be surprised how much time your agents save in the first week.'

  const welcomeEmail = {
    to: email,
    subject: `Welcome to Zynthr${orgName ? ', ' + orgName : ''} 🚀`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <div style="background:linear-gradient(135deg,#003146,#559CB5);padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">Welcome to Zynthr</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Your AI-powered command center is ready</p>
        </div>
        <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
          <p style="color:#1a1a2e;font-size:15px">Hi ${firstName || 'there'},</p>
          <p style="color:#1a1a2e;font-size:15px">${hook}</p>
          <p style="color:#1a1a2e;font-size:15px"><strong>Your next 3 steps:</strong></p>
          <ol style="color:#1a1a2e;font-size:14px;padding-left:20px">
            <li style="margin-bottom:8px">Create your first agent (2 min)</li>
            <li style="margin-bottom:8px">Connect your email or calendar (3 min)</li>
            <li style="margin-bottom:8px">Run your first workflow (1 min)</li>
          </ol>
          <div style="text-align:center;margin:24px 0">
            <a href="https://app.zynthr.ai" style="background:linear-gradient(135deg,#003146,#559CB5);color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Open Your Dashboard →</a>
          </div>
          <p style="color:#666;font-size:13px;margin-top:24px">Questions? Just reply to this email or chat with me inside the app.</p>
          <p style="color:#666;font-size:13px">— Scout, Zynthr AI Sales Assistant</p>
        </div>
      </div>
    `,
  }

  // Log the lead
  await supabase.from('audit_log').insert({
    org_id: null,
    user_id: userId || null,
    action: 'sdr_lead_classified',
    details: { email, orgName, industry, size, tier, firstName },
  })

  // Schedule follow-ups based on tier
  const followUps = []
  if (tier === 'hot' || tier === 'warm') {
    followUps.push({ day: 1, action: 'activity_check' })
    followUps.push({ day: 3, action: 'tips_email' })
    followUps.push({ day: 7, action: 'case_study' })
  }
  if (tier === 'hot') {
    followUps.push({ day: 14, action: 'demo_offer' })
  }
  followUps.push({ day: 30, action: 'monthly_nurture' })

  await supabase.from('audit_log').insert({
    org_id: null,
    user_id: userId || null,
    action: 'sdr_sequence_scheduled',
    details: { email, tier, followUps },
  })

  // TODO: Actually send email when SendGrid is wired
  // For now, log the intent
  console.log(`[Scout] Welcome email queued for ${email} (${tier} lead)`)

  return NextResponse.json({ 
    success: true, 
    tier, 
    message: `Lead classified as ${tier}. Welcome email queued.`,
    followUps: followUps.length,
  })
}
