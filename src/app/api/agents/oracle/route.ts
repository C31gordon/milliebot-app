import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { action, period } = await req.json()

  if (action === 'dashboard') {
    const { data: orgs } = await supabase.from('organizations').select('id, name, plan, created_at')
    const { data: members } = await supabase.from('org_members').select('id, org_id, role, status')
    const { data: agents } = await supabase.from('agents').select('id, org_id, status')
    const { data: depts } = await supabase.from('departments').select('id, org_id')

    const since30 = new Date(Date.now() - 30 * 86400000).toISOString()
    const { count: actionsThisMonth } = await supabase.from('audit_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since30)

    const totalOrgs = orgs?.length || 0
    const totalUsers = members?.length || 0
    const totalAgents = agents?.length || 0
    const activeAgents = agents?.filter(a => a.status === 'active').length || 0

    // Revenue estimate (placeholder until Stripe connected)
    const paidOrgs = orgs?.filter(o => o.plan === 'pro' || o.plan === 'enterprise').length || 0
    const mrrEstimate = paidOrgs * 99 // placeholder

    return NextResponse.json({
      success: true,
      metrics: {
        totalOrgs,
        totalUsers,
        totalAgents,
        activeAgents,
        totalDepartments: depts?.length || 0,
        actionsThisMonth: actionsThisMonth || 0,
        paidOrgs,
        mrrEstimate: `$${mrrEstimate}`,
        avgAgentsPerOrg: totalOrgs > 0 ? (totalAgents / totalOrgs).toFixed(1) : 0,
      },
      health: {
        platform: 'operational',
        orgsGrowing: totalOrgs > 0,
        agentUtilization: totalAgents > 0 ? `${Math.round((activeAgents / totalAgents) * 100)}%` : '0%',
      },
    })
  }

  return NextResponse.json({ error: 'action required (dashboard)' }, { status: 400 })
}
