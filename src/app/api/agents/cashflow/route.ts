import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { action, orgId, period } = await req.json()

  if (action === 'usage_report') {
    // Pull usage from audit_log for a specific org
    const since = period === 'weekly' 
      ? new Date(Date.now() - 7 * 86400000).toISOString()
      : new Date(Date.now() - 30 * 86400000).toISOString()

    const { data: logs } = await supabase.from('audit_log')
      .select('action, details, created_at')
      .eq('org_id', orgId)
      .gte('created_at', since)
      .in('action', ['chat_query', 'sdr_outreach', 'concierge_onboarding_check'])
      .order('created_at', { ascending: false })

    const chatQueries = logs?.filter(l => l.action === 'chat_query') || []
    const totalTokens = chatQueries.reduce((sum, l) => sum + (l.details?.est_input_tokens || 0) + (l.details?.est_output_tokens || 0), 0)
    const totalCost = chatQueries.reduce((sum, l) => sum + (l.details?.est_cost || 0), 0)

    return NextResponse.json({
      success: true,
      orgId,
      period,
      usage: {
        chatQueries: chatQueries.length,
        totalTokens,
        estimatedCost: `$${totalCost.toFixed(4)}`,
        agentActions: logs?.length || 0,
      },
    })
  }

  if (action === 'all_orgs_summary') {
    // Summary across all orgs
    const { data: orgs } = await supabase.from('organizations').select('id, name, plan, created_at')
    const since = new Date(Date.now() - 30 * 86400000).toISOString()

    const summaries = []
    for (const org of orgs || []) {
      const { count } = await supabase.from('audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .gte('created_at', since)

      summaries.push({
        orgName: org.name,
        plan: org.plan,
        actionsThisMonth: count || 0,
        status: (count || 0) > 0 ? 'active' : 'inactive',
      })
    }

    return NextResponse.json({ success: true, summaries })
  }

  if (action === 'churn_risk') {
    // Check which orgs have gone quiet
    const { data: orgs } = await supabase.from('organizations').select('id, name, plan, created_at')
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

    const atRisk = []
    for (const org of orgs || []) {
      const { count } = await supabase.from('audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .gte('created_at', weekAgo)

      if ((count || 0) === 0) {
        atRisk.push({ orgName: org.name, plan: org.plan, lastActivity: 'over 7 days ago' })
      }
    }

    return NextResponse.json({
      success: true,
      atRisk,
      message: atRisk.length > 0 ? `⚠️ ${atRisk.length} org(s) at churn risk` : '✅ All orgs active',
    })
  }

  return NextResponse.json({ error: 'action required (usage_report|all_orgs_summary|churn_risk)' }, { status: 400 })
}
