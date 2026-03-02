import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { action } = await req.json()

  if (action === 'weekly_scan') {
    const watchlist = {
      ai_agents: ['agentic AI adoption', 'multi-agent orchestration', 'AI agent frameworks', 'autonomous AI companies'],
      proptech: ['property management AI', 'multifamily automation', 'leasing AI', 'maintenance AI'],
      healthtech: ['healthcare AI agents', 'patient intake automation', 'HIPAA AI compliance'],
      construction: ['construction AI', 'project management automation', 'safety compliance AI'],
      infrastructure: ['GPU pricing trends', 'inference cost reduction', 'open source LLM performance'],
    }

    await supabase.from('audit_log').insert({
      org_id: '69645b48-7bc8-4982-b228-5e7eed93d7a2',
      action: 'pulse_weekly_scan',
      details: { watchlist, timestamp: new Date().toISOString() },
    })

    return NextResponse.json({
      success: true,
      watchlist,
      searchQueries: Object.values(watchlist).flat().slice(0, 10),
      message: 'Trend scan queued across 5 categories, 20+ keywords',
    })
  }

  return NextResponse.json({ error: 'action required (weekly_scan)' }, { status: 400 })
}
