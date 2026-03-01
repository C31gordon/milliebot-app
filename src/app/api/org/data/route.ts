import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ 
      error: 'Missing env vars',
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceKey,
      keyPrefix: serviceKey.substring(0, 10),
    }, { status: 500 })
  }

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  try {
    // Get org membership
    const { data: member, error: memberErr } = await db
      .from('org_members')
      .select('org_id, role, permission_tier')
      .eq('user_id', userId)
      .single()

    if (memberErr) {
      return NextResponse.json({ 
        error: 'Member query failed', 
        detail: memberErr.message,
        org: null, departments: [], agents: [], audit: [] 
      })
    }

    if (!member?.org_id) {
      return NextResponse.json({ org: null, departments: [], agents: [], audit: [] })
    }

    const orgId = member.org_id

    const [orgRes, deptsRes, botsRes] = await Promise.all([
      db.from('organizations').select('*').eq('id', orgId).single(),
      db.from('departments').select('*').eq('org_id', orgId),
      db.from('bots').select('*, agent:agents(id, name)').eq('org_id', orgId),
    ])

    // Agents and audit may not exist, so catch errors
    let agents: unknown[] = []
    let audit: unknown[] = []
    try {
      const agentsRes = await db.from('agents').select('*, department:departments(id, name)').eq('org_id', orgId)
      agents = agentsRes.data || []
    } catch { /* table may not exist */ }
    try {
      const auditRes = await db.from('audit_log').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(10)
      audit = auditRes.data || []
    } catch { /* table may not exist */ }

    return NextResponse.json({
      org: orgRes.data,
      membership: member,
      departments: deptsRes.data || [],
      agents,
      bots: botsRes?.data || [],
      audit,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
