import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Super-admin user IDs (can see ALL tenants)
const SUPER_ADMINS = new Set<string>([
  // Add Courtney's user ID here once he signs up
])

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // Check if user is super-admin OR owner of Zynthr org
  const { data: zynthrMember } = await db.from('org_members')
    .select('role, org_id')
    .eq('user_id', userId)
    .eq('org_id', '69645b48-7bc8-4982-b228-5e7eed93d7a2') // Zynthr org
    .single()

  const isSuperAdmin = SUPER_ADMINS.has(userId) || (zynthrMember?.role === 'owner')

  if (isSuperAdmin) {
    // Super admin: return ALL orgs with member counts
    const { data: orgs } = await db.from('organizations')
      .select('id, name, industry, plan, slug, created_at')
      .order('created_at')

    const { data: members } = await db.from('org_members')
      .select('org_id')

    const memberCounts: Record<string, number> = {}
    for (const m of members || []) {
      memberCounts[m.org_id] = (memberCounts[m.org_id] || 0) + 1
    }

    const { data: agentCounts } = await db.from('agents')
      .select('org_id')
    
    const agentMap: Record<string, number> = {}
    for (const a of agentCounts || []) {
      agentMap[a.org_id] = (agentMap[a.org_id] || 0) + 1
    }

    return NextResponse.json({
      success: true,
      isSuperAdmin: true,
      orgs: (orgs || []).map(o => ({
        ...o,
        memberCount: memberCounts[o.id] || 0,
        agentCount: agentMap[o.id] || 0,
      })),
    })
  }

  // Regular user: return only their orgs
  const { data: memberships } = await db.from('org_members')
    .select('org_id, role, permission_tier')
    .eq('user_id', userId)

  if (!memberships?.length) {
    return NextResponse.json({ success: true, isSuperAdmin: false, orgs: [] })
  }

  const orgIds = memberships.map(m => m.org_id)
  const { data: orgs } = await db.from('organizations')
    .select('id, name, industry, plan, slug, created_at')
    .in('id', orgIds)
    .order('created_at')

  return NextResponse.json({
    success: true,
    isSuperAdmin: false,
    orgs: (orgs || []).map(o => {
      const mem = memberships.find(m => m.org_id === o.id)
      return { ...o, role: mem?.role, permissionTier: mem?.permission_tier }
    }),
  })
}
