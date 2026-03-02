import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// POST /api/agents/closer — demo prep + talking points
export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { prospectCompany, prospectName, prospectTitle, industry, companySize, demoTime } = await req.json()

  const industryPainPoints: Record<string, string[]> = {
    property: [
      'Leasing teams drowning in repetitive inquiries (50+ calls/day)',
      'Work orders falling through cracks — residents complain',
      'DLR/reporting takes hours of manual spreadsheet work',
      'Turnover in onsite staff means constant retraining',
      'Integration between PMS, accounting, and marketing is painful',
    ],
    healthcare: [
      'Patient intake is still paper forms → data entry',
      'Scheduling changes create cascading phone tag',
      'HIPAA compliance is expensive and error-prone',
      'Staff burnout from administrative burden',
      'Patient follow-up falls through the cracks',
    ],
    construction: [
      'RFIs sit in email for days, delaying projects',
      'Daily field reports are inconsistent or missing',
      'Change order tracking is spreadsheet chaos',
      'Safety compliance documentation is reactive',
      'Subcontractor coordination is a full-time job',
    ],
  }

  const painPoints = industryPainPoints[industry] || industryPainPoints.property
  const sizeMultiplier = parseInt(companySize) > 100 ? 'enterprise' : parseInt(companySize) > 20 ? 'mid-market' : 'smb'

  const talkingPoints = {
    opener: `"${prospectName}, thanks for taking the time. I did some research on ${prospectCompany} — you're in an interesting spot. Let me show you exactly how Zynthr could help."`,
    discovery: [
      `"What's the most time-consuming manual process your team deals with daily?"`,
      `"How are you handling [${painPoints[0].toLowerCase()}] right now?"`,
      `"If you could automate one thing tomorrow, what would it be?"`,
    ],
    demo_flow: [
      '1. Show dashboard — "This is your command center"',
      '2. Create an agent live — "Watch, 60 seconds"',
      `3. Show industry workflow — "${painPoints[0].split('—')[0].trim()}"`,
      '4. RKBAC — "Your data stays in your control"',
      '5. Integration walkthrough — "Connects to what you already use"',
    ],
    objection_handling: {
      'too expensive': `"At ${sizeMultiplier} scale, our customers typically see ROI in 2-3 weeks. One automated workflow replaces 10-20 hours of manual work per week."`,
      'already have tools': `"We integrate with your existing tools — this isn't replace, it's amplify. Your ${industry} stack stays, agents fill the gaps."`,
      'security concerns': `"RKBAC means role-based access at every layer. ${industry === 'healthcare' ? 'We\'re HIPAA-ready with signed BAAs.' : 'SOC 2 Type II in progress.'} Your data never leaves your org boundary."`,
      'need to think': `"Totally fair. Let me send you a custom ROI analysis for ${prospectCompany} — takes 5 min to review. Can I follow up Thursday?"`,
    },
    close: `"Based on what you've shown me, I'd recommend starting with [X agent] — it'll save your team [Y hours/week]. Want me to set up a pilot?"`,
  }

  await supabase.from('audit_log').insert({
    org_id: '69645b48-7bc8-4982-b228-5e7eed93d7a2',
    action: 'closer_demo_prep',
    details: { prospectCompany, prospectName, industry, sizeMultiplier, demoTime },
  })

  return NextResponse.json({
    success: true,
    prep: {
      prospect: { company: prospectCompany, name: prospectName, title: prospectTitle, industry, size: sizeMultiplier },
      painPoints,
      talkingPoints,
      estimatedDemoTime: '15-25 min',
    },
    message: `Demo prep ready for ${prospectCompany}. ${painPoints.length} pain points, full objection handling loaded.`,
  })
}
