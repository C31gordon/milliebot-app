import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const COST_MAP: Record<string, { input: number; output: number }> = {
  'claude-4-haiku':    { input: 0.80, output: 4.00 },
  'claude-4-sonnet':   { input: 3.00, output: 15.00 },
  'gpt-4.1-mini':      { input: 0.40, output: 1.60 },
  'gpt-4.1':           { input: 2.00, output: 8.00 },
  'llama-4-maverick':  { input: 0.27, output: 0.85 },
  'deepseek-v3':       { input: 0.20, output: 0.60 },
  'qwen3-235b':        { input: 0.30, output: 0.90 },
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const { data: zOrg } = await db.from('organizations').select('owner_id').eq('id', '69645b48-7bc8-4982-b228-5e7eed93d7a2').single()
  if (zOrg?.owner_id !== userId) return NextResponse.json({ error: 'Super-admin only' }, { status: 403 })
  const { data: orgs } = await db.from('organizations').select('id, name, plan, industry')
  if (!orgs) return NextResponse.json({ error: 'No orgs' }, { status: 500 })
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: entries } = await db.from('audit_log').select('org_id, details, created_at').eq('action', 'chat_query').gte('created_at', thirtyDaysAgo)
  const chatEntries = entries || []
  const { data: allMembers } = await db.from('org_members').select('org_id')
  const memberCounts: Record<string, number> = {}
  for (const m of allMembers || []) { memberCounts[m.org_id] = (memberCounts[m.org_id] || 0) + 1 }
  const orgUsage: Record<string, { queries: number; cost: number }> = {}
  for (const entry of chatEntries) {
    const oid = entry.org_id
    if (!orgUsage[oid]) orgUsage[oid] = { queries: 0, cost: 0 }
    orgUsage[oid].queries++
    const model = (entry.details?.model || 'llama-4-maverick').toLowerCase().replace(/\s+/g, '-')
    const rates = COST_MAP[model] || COST_MAP['llama-4-maverick']
    const inT = entry.details?.input_tokens || 650
    const outT = entry.details?.output_tokens || 300
    orgUsage[oid].cost += (inT * rates.input + outT * rates.output) / 1_000_000
  }
  const totalCost = Object.values(orgUsage).reduce((s, u) => s + u.cost, 0)
  const totalQueries = Object.values(orgUsage).reduce((s, u) => s + u.queries, 0)
  const orgSummaries = orgs.map(org => ({
    id: org.id, name: org.name, plan: org.plan, industry: org.industry,
    users: memberCounts[org.id] || 0,
    queries: orgUsage[org.id]?.queries || 0,
    cost: Math.round((orgUsage[org.id]?.cost || 0) * 10000) / 10000,
  })).sort((a, b) => b.cost - a.cost)
  return NextResponse.json({
    totalOrgs: orgs.length, totalUsers: Object.values(memberCounts).reduce((s, c) => s + c, 0),
    totalQueries, totalCost: Math.round(totalCost * 10000) / 10000,
    projectedMonthlyCost: Math.round(totalCost * 100) / 100,
    orgs: orgSummaries,
  })
}
