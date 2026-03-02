import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getDb() { return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } }) }

async function getOrgId(userId: string) {
  const { data } = await getDb().from('org_members').select('org_id, role').eq('user_id', userId).single()
  return data
}

// GET /api/workflows?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const member = await getOrgId(userId)
  if (!member) return NextResponse.json({ error: 'No org' }, { status: 404 })

  const { data: org } = await getDb().from('organizations').select('settings').eq('id', member.org_id).single()
  const workflows = org?.settings?.workflows || []
  return NextResponse.json({ workflows })
}

// POST /api/workflows — create workflow
export async function POST(req: NextRequest) {
  const { userId, workflow } = await req.json()
  if (!userId || !workflow) return NextResponse.json({ error: 'userId and workflow required' }, { status: 400 })
  const member = await getOrgId(userId)
  if (!member) return NextResponse.json({ error: 'No org' }, { status: 404 })

  const { data: org } = await getDb().from('organizations').select('settings').eq('id', member.org_id).single()
  const settings = org?.settings || {}
  const workflows = settings.workflows || []
  
  const newWf = {
    id: 'WF-' + String(workflows.length + 1).padStart(3, '0'),
    ...workflow,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    runsToday: 0,
    successRate: 100,
  }
  
  workflows.push(newWf)
  await getDb().from('organizations').update({ settings: { ...settings, workflows } }).eq('id', member.org_id)

  return NextResponse.json({ success: true, workflow: newWf })
}

// PATCH /api/workflows — update workflow
export async function PATCH(req: NextRequest) {
  const { userId, workflowId, updates } = await req.json()
  if (!userId || !workflowId) return NextResponse.json({ error: 'userId and workflowId required' }, { status: 400 })
  const member = await getOrgId(userId)
  if (!member) return NextResponse.json({ error: 'No org' }, { status: 404 })

  const { data: org } = await getDb().from('organizations').select('settings').eq('id', member.org_id).single()
  const settings = org?.settings || {}
  const workflows = (settings.workflows || []).map((wf: Record<string, unknown>) => 
    wf.id === workflowId ? { ...wf, ...updates, updatedAt: new Date().toISOString() } : wf
  )
  await getDb().from('organizations').update({ settings: { ...settings, workflows } }).eq('id', member.org_id)

  return NextResponse.json({ success: true })
}

// DELETE /api/workflows — delete workflow  
export async function DELETE(req: NextRequest) {
  const { userId, workflowId } = await req.json()
  if (!userId || !workflowId) return NextResponse.json({ error: 'userId and workflowId required' }, { status: 400 })
  const member = await getOrgId(userId)
  if (!member) return NextResponse.json({ error: 'No org' }, { status: 404 })

  const { data: org } = await getDb().from('organizations').select('settings').eq('id', member.org_id).single()
  const settings = org?.settings || {}
  const workflows = (settings.workflows || []).filter((wf: Record<string, unknown>) => wf.id !== workflowId)
  await getDb().from('organizations').update({ settings: { ...settings, workflows } }).eq('id', member.org_id)

  return NextResponse.json({ success: true })
}
