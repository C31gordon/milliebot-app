import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const zynthrOrgId = '69645b48-7bc8-4982-b228-5e7eed93d7a2'

  // Get all agents
  const { data: agents } = await supabase.from('agents')
    .select('id, name, icon, status, model, department_id, capabilities, created_at')
    .eq('org_id', zynthrOrgId)
    .order('created_at')

  // Get departments for mapping
  const { data: depts } = await supabase.from('departments')
    .select('id, name')
    .eq('org_id', zynthrOrgId)

  const deptMap = Object.fromEntries((depts || []).map(d => [d.id, d.name]))

  // Get action counts per agent from audit_log (last 24h)
  const since24h = new Date(Date.now() - 86400000).toISOString()
  const { data: recentLogs } = await supabase.from('audit_log')
    .select('action, created_at')
    .eq('org_id', zynthrOrgId)
    .gte('created_at', since24h)

  // Map agent names to their audit actions
  const agentActionMap: Record<string, string[]> = {
    scout: ['sdr_lead_classified', 'sdr_outreach', 'sdr_sequence_scheduled'],
    sage: ['concierge_onboarding_check'],
    milo: ['chat_query'],
    echo: ['echo_weekly_plan'],
    hunter: ['hunter_research', 'hunter_outreach_queued'],
    closer: ['closer_demo_prep'],
    cashflow: ['cashflow_usage', 'cashflow_churn'],
    sentinel: ['sentinel_smoke_test', 'sentinel_api_test'],
    aegis: ['aegis_compliance_audit', 'aegis_rkbac_audit'],
    forge: ['forge_feature_spec'],
    radar: ['radar_weekly_briefing'],
    oracle: ['oracle_dashboard'],
    pulse: ['pulse_weekly_scan'],
    coach: ['coach_learning_path'],
    bridge: ['bridge_partner_pipeline'],
    architect: ['architect_design'],
  }

  const fleet = (agents || []).map(a => {
    const agentKey = a.name.toLowerCase()
    const relevantActions = agentActionMap[agentKey] || []
    const actionsLast24h = (recentLogs || []).filter(l => relevantActions.includes(l.action)).length

    return {
      id: a.id,
      name: `${a.icon} ${a.name}`,
      department: deptMap[a.department_id] || 'Unknown',
      status: a.status,
      model: a.model,
      capabilities: a.capabilities?.length || 0,
      actionsLast24h,
    }
  })

  return NextResponse.json({
    success: true,
    fleet,
    summary: {
      total: fleet.length,
      active: fleet.filter(a => a.status === 'active').length,
      totalActionsLast24h: fleet.reduce((sum, a) => sum + a.actionsLast24h, 0),
      departments: [...new Set(fleet.map(a => a.department))],
    },
  })
}
