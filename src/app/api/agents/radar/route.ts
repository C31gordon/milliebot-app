import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { action } = await req.json()

  if (action === 'weekly_briefing') {
    const competitors = [
      {
        name: 'Relevance AI',
        category: 'AI agent builder',
        watch: ['pricing changes', 'new features', 'enterprise deals', 'funding'],
        url: 'https://relevanceai.com',
      },
      {
        name: 'CrewAI',
        category: 'Multi-agent framework',
        watch: ['new integrations', 'enterprise adoption', 'pricing model'],
        url: 'https://crewai.com',
      },
      {
        name: 'AutoGen / Microsoft',
        category: 'Agent framework',
        watch: ['Azure integration', 'enterprise features', 'open source updates'],
        url: 'https://github.com/microsoft/autogen',
      },
      {
        name: 'LangGraph / LangChain',
        category: 'Agent orchestration',
        watch: ['LangSmith pricing', 'enterprise deals', 'new agent types'],
        url: 'https://langchain.com',
      },
      {
        name: 'n8n',
        category: 'Workflow automation',
        watch: ['AI agent features', 'pricing', 'self-host vs cloud adoption'],
        url: 'https://n8n.io',
      },
      {
        name: 'Zapier Central',
        category: 'AI automation',
        watch: ['agent capabilities', 'pricing tiers', 'enterprise push'],
        url: 'https://zapier.com',
      },
    ]

    // Log the briefing run
    await supabase.from('audit_log').insert({
      org_id: '69645b48-7bc8-4982-b228-5e7eed93d7a2',
      action: 'radar_weekly_briefing',
      details: { competitors: competitors.map(c => c.name), timestamp: new Date().toISOString() },
    })

    return NextResponse.json({
      success: true,
      competitors,
      differentiators: [
        'RKBAC (no competitor has role-based AI access control)',
        'Multi-tenant from day 1 (most are single-org)',
        'Industry-specific onboarding (property, healthcare, construction)',
        'Open-core model (free walkthrough framework + paid connectors)',
        'Own-your-data philosophy (Supabase, not locked SaaS)',
      ],
      threatLevel: 'moderate',
      message: '6 competitors tracked. Key differentiator: RKBAC + multi-tenant + industry-specific.',
    })
  }

  return NextResponse.json({ error: 'action required (weekly_briefing)' }, { status: 400 })
}
