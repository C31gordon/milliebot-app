import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// POST /api/agents/hunter — outbound prospect research + outreach
export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { action, industry, targetSize, maxResults } = await req.json()

  if (action === 'research') {
    // Define ICP (Ideal Customer Profile) by industry
    const icpProfiles: Record<string, { title: string[], keywords: string[], signals: string[] }> = {
      property: {
        title: ['Property Manager', 'Regional Manager', 'VP Operations', 'COO', 'Director of Operations'],
        keywords: ['multifamily', 'property management', 'apartment', 'leasing', 'real estate operations'],
        signals: ['hiring for ops roles', 'using legacy PMS', 'rapid portfolio growth'],
      },
      healthcare: {
        title: ['Practice Manager', 'Office Manager', 'COO', 'Director of Operations', 'Administrator'],
        keywords: ['medical practice', 'clinic', 'healthcare operations', 'patient intake', 'EHR'],
        signals: ['HIPAA compliance concerns', 'staff shortages', 'manual scheduling'],
      },
      construction: {
        title: ['Project Manager', 'Operations Manager', 'COO', 'Superintendent', 'VP Operations'],
        keywords: ['general contractor', 'construction management', 'subcontractor coordination', 'RFI', 'change orders'],
        signals: ['using spreadsheets for tracking', 'compliance issues', 'project delays'],
      },
    }

    const icp = icpProfiles[industry] || icpProfiles.property
    const limit = maxResults || 10

    // Log research intent
    await supabase.from('audit_log').insert({
      org_id: '69645b48-7bc8-4982-b228-5e7eed93d7a2',
      action: 'hunter_research',
      details: { industry, targetSize, icp, limit },
    })

    return NextResponse.json({
      success: true,
      icp,
      message: `Research profile generated for ${industry}. Target titles: ${icp.title.join(', ')}`,
      searchQueries: [
        `${icp.keywords[0]} ${targetSize || '50-200'} employees AI automation`,
        `"${icp.title[0]}" "${icp.keywords[0]}" looking for automation`,
        `${industry} companies ${icp.signals[0]}`,
      ],
    })
  }

  if (action === 'outreach') {
    const { prospectName, prospectEmail, prospectCompany, prospectTitle, prospectIndustry } = await req.json()

    const outreachTemplates: Record<string, string> = {
      property: `I noticed ${prospectCompany} manages a growing portfolio — most property management teams we work with were spending 20+ hours/week on leasing inquiries and work orders before automating with AI agents. Would a 15-min look at how that works be worth your time?`,
      healthcare: `${prospectCompany} caught my attention — healthcare practices like yours are automating patient intake and scheduling with AI agents, cutting admin time by 60%. Worth a quick look?`,
      construction: `I saw ${prospectCompany} is scaling — construction firms using AI agents for RFI tracking and daily reports are saving 15+ hours/week per PM. Quick demo worth your time?`,
    }

    const template = outreachTemplates[prospectIndustry || 'property']

    await supabase.from('audit_log').insert({
      org_id: '69645b48-7bc8-4982-b228-5e7eed93d7a2',
      action: 'hunter_outreach_queued',
      details: { prospectName, prospectEmail, prospectCompany, prospectIndustry },
    })

    return NextResponse.json({
      success: true,
      email: {
        to: prospectEmail,
        subject: `Quick question for ${prospectName}`,
        body: `Hi ${prospectName},\n\n${template}\n\n— Hunter, Zynthr AI`,
      },
      message: 'Outreach email queued',
    })
  }

  return NextResponse.json({ error: 'action required (research|outreach)' }, { status: 400 })
}
