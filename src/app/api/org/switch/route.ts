import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const { userId, targetOrgId } = await req.json()
  if (!userId || !targetOrgId) return NextResponse.json({ error: 'userId and targetOrgId required' }, { status: 400 })

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // Verify user has access (either member of target org, or Zynthr owner = super-admin)
  const { data: directMember } = await db.from('org_members')
    .select('role, permission_tier')
    .eq('user_id', userId)
    .eq('org_id', targetOrgId)
    .single()

  const { data: zynthrMember } = await db.from('org_members')
    .select('role')
    .eq('user_id', userId)
    .eq('org_id', '69645b48-7bc8-4982-b228-5e7eed93d7a2')
    .single()

  const isSuperAdmin = zynthrMember?.role === 'owner'
  
  if (!directMember && !isSuperAdmin) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Load target org data (same shape as /api/org/data)
  const [orgRes, deptsRes, botsRes] = await Promise.all([
    db.from('organizations').select('*').eq('id', targetOrgId).single(),
    db.from('departments').select('*').eq('org_id', targetOrgId),
    db.from('bots').select('*, agent:agents(id, name)').eq('org_id', targetOrgId),
  ])

  let agents: unknown[] = []
  let audit: unknown[] = []
  try {
    const agentsRes = await db.from('agents').select('*, department:departments(id, name)').eq('org_id', targetOrgId)
    agents = agentsRes.data || []
  } catch {}
  try {
    const auditRes = await db.from('audit_log').select('*').eq('org_id', targetOrgId).order('created_at', { ascending: false }).limit(10)
    audit = auditRes.data || []
  } catch {}

  return NextResponse.json({
    success: true,
    isSuperAdmin,
    role: directMember?.role || (isSuperAdmin ? 'super_admin' : null),
    permissionTier: directMember?.permission_tier || (isSuperAdmin ? 1 : null),
    org: orgRes.data,
    departments: deptsRes.data || [],
    agents,
    bots: botsRes?.data || [],
    audit,
  })
}
