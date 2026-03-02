import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { action, orgId } = await req.json()

  if (action === 'learning_path') {
    if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 })

    const { data: org } = await supabase.from('organizations').select('*').eq('id', orgId).single()
    const { data: agents } = await supabase.from('agents').select('name, status, capabilities').eq('org_id', orgId)
    const { data: depts } = await supabase.from('departments').select('name').eq('org_id', orgId)

    const industry = org?.industry || 'general'
    const hasAgents = (agents?.length || 0) > 0

    const modules = [
      { id: 1, title: 'Platform Basics', duration: '10 min', topics: ['Dashboard navigation', 'RKBAC overview', 'Settings configuration'], required: true },
      { id: 2, title: 'Creating Your First Agent', duration: '15 min', topics: ['Agent types', 'Capability assignment', 'Department linking', 'Testing'], required: true },
      { id: 3, title: 'Workflow Builder', duration: '20 min', topics: ['Trigger types', 'Step builder', 'Conditions', 'Testing workflows'], required: true },
      { id: 4, title: 'Integrations', duration: '15 min', topics: ['Connecting systems', 'OAuth setup', 'API keys', 'Testing connections'], required: false },
      { id: 5, title: 'Team Management', duration: '10 min', topics: ['Inviting members', 'RKBAC tiers', 'Department assignment', 'Permissions'], required: false },
      { id: 6, title: 'Advanced Workflows', duration: '25 min', topics: ['Multi-step workflows', 'Conditional logic', 'Notifications', 'n8n handoff'], required: false },
    ]

    // Add industry-specific module
    const industryModules: Record<string, object> = {
      property: { id: 7, title: 'Property Management AI', duration: '20 min', topics: ['Leasing automation', 'Work order routing', 'DLR generation', 'PMS integration'] },
      healthcare: { id: 7, title: 'Healthcare AI Compliance', duration: '20 min', topics: ['HIPAA basics', 'BAA requirements', 'Patient data handling', 'Audit logging'] },
      construction: { id: 7, title: 'Construction AI Workflows', duration: '20 min', topics: ['RFI tracking', 'Daily reports', 'Safety compliance', 'Change orders'] },
    }
    if (industryModules[industry]) modules.push(industryModules[industry] as any)

    return NextResponse.json({
      success: true,
      orgName: org?.name,
      industry,
      learningPath: {
        totalModules: modules.length,
        estimatedTime: modules.reduce((sum, m) => sum + parseInt(m.duration), 0) + ' min',
        modules,
      },
    })
  }

  return NextResponse.json({ error: 'action required (learning_path)' }, { status: 400 })
}
