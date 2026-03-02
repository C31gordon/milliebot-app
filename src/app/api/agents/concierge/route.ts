import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// POST /api/agents/concierge — triggered post-onboarding
export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { userId, orgId } = await req.json()
  if (!userId || !orgId) return NextResponse.json({ error: 'userId and orgId required' }, { status: 400 })

  // Get org data
  const { data: org } = await supabase.from('organizations').select('*').eq('id', orgId).single()
  const { data: depts } = await supabase.from('departments').select('name').eq('org_id', orgId)
  const { data: agents } = await supabase.from('agents').select('name, status').eq('org_id', orgId)
  const { data: member } = await supabase.from('org_members').select('*').eq('user_id', userId).single()

  const orgName = org?.name || 'Your Organization'
  const industry = org?.industry || 'general'
  const deptCount = depts?.length || 0
  const agentCount = agents?.length || 0

  // Calculate onboarding milestones
  const milestones = {
    accountCreated: true,
    orgSetup: deptCount > 0,
    integrationConnected: false, // TODO: check integrations
    firstAgent: agentCount > 0,
    firstBot: false, // TODO: check bots
    firstWorkflow: false, // TODO: check workflows
    teamInvited: false, // TODO: check org_members count
  }
  const completedCount = Object.values(milestones).filter(Boolean).length
  const totalMilestones = Object.keys(milestones).length
  const completionPct = Math.round((completedCount / totalMilestones) * 100)

  // Health score
  const healthScore = completionPct >= 70 ? 'healthy' : completionPct >= 30 ? 'at_risk' : 'churning'

  // Generate Getting Started Guide
  const guideRes = await fetch(`${supabaseUrl.replace('.supabase.co', '')}/api/org/guide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }).catch(() => null)

  // Log onboarding status
  await supabase.from('audit_log').insert({
    org_id: orgId,
    user_id: userId,
    action: 'concierge_onboarding_check',
    details: {
      orgName,
      industry,
      milestones,
      completionPct,
      healthScore,
      deptCount,
      agentCount,
    },
  })

  // Determine next action
  let nextAction = 'none'
  if (!milestones.firstAgent) nextAction = 'nudge_create_agent'
  else if (!milestones.integrationConnected) nextAction = 'nudge_integration'
  else if (!milestones.teamInvited) nextAction = 'nudge_invite_team'

  return NextResponse.json({
    success: true,
    orgName,
    completionPct,
    healthScore,
    milestones,
    nextAction,
    message: `${orgName}: ${completionPct}% onboarded (${healthScore}). Next: ${nextAction}`,
  })
}
