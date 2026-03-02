import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Cost per 1M tokens (2026 pricing)
const COST_MAP: Record<string, { input: number; output: number; provider: string }> = {
  'claude-4-haiku':    { input: 0.80, output: 4.00, provider: 'Anthropic' },
  'claude-4-sonnet':   { input: 3.00, output: 15.00, provider: 'Anthropic' },
  'claude-4-opus':     { input: 15.00, output: 75.00, provider: 'Anthropic' },
  'gpt-4.1-mini':      { input: 0.40, output: 1.60, provider: 'OpenAI' },
  'gpt-4.1':           { input: 2.00, output: 8.00, provider: 'OpenAI' },
  'gpt-5':             { input: 10.00, output: 30.00, provider: 'OpenAI' },
  'llama-4-maverick':  { input: 0.27, output: 0.85, provider: 'Together AI' },
  'deepseek-v3':       { input: 0.20, output: 0.60, provider: 'Together AI' },
  'qwen3-235b':        { input: 0.30, output: 0.90, provider: 'Together AI' },
}

// Estimate tokens from audit_log entries
function estimateTokens(entry: any): { inputTokens: number; outputTokens: number } {
  // If audit_log has explicit token counts, use them
  if (entry.details?.input_tokens && entry.details?.output_tokens) {
    return { inputTokens: entry.details.input_tokens, outputTokens: entry.details.output_tokens }
  }
  // Otherwise estimate: ~650 input, ~300 output per chat exchange
  return { inputTokens: 650, outputTokens: 300 }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  const orgId = request.nextUrl.searchParams.get('orgId')
  const period = request.nextUrl.searchParams.get('period') || '30d' // 7d, 30d, 90d, all
  
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  
  // Get org membership
  const { data: members } = await db.from('org_members').select('org_id, role, permission_tier').eq('user_id', userId).order('role', { ascending: true })
  const member = orgId 
    ? members?.find((m: any) => m.org_id === orgId) || (members?.find((m: any) => m.role === 'owner') ? { org_id: orgId, role: 'owner', permission_tier: 1 } : null)
    : members?.find((m: any) => m.role === 'owner') || members?.[0]
  
  if (!member) return NextResponse.json({ error: 'No membership found' }, { status: 403 })
  
  // Only owners/admins can see cost data
  if (member.permission_tier > 2) return NextResponse.json({ error: 'Insufficient permissions — Tier 1 or 2 required' }, { status: 403 })
  
  const targetOrgId = member.org_id
  
  // Calculate period start
  const now = new Date()
  let periodStart: Date
  if (period === '7d') periodStart = new Date(now.getTime() - 7 * 86400000)
  else if (period === '30d') periodStart = new Date(now.getTime() - 30 * 86400000)
  else if (period === '90d') periodStart = new Date(now.getTime() - 90 * 86400000)
  else periodStart = new Date('2026-01-01')
  
  // Get all chat queries in period
  const { data: entries } = await db
    .from('audit_log')
    .select('*')
    .eq('org_id', targetOrgId)
    .eq('action', 'chat_query')
    .gte('created_at', periodStart.toISOString())
    .order('created_at', { ascending: false })
  
  const chatEntries = entries || []
  
  // Get org settings for budget/limits
  const { data: org } = await db.from('organizations').select('settings, name, plan').eq('id', targetOrgId).single()
  const budget = org?.settings?.usageBudget || null
  
  // Calculate costs
  let totalCost = 0
  let totalInputTokens = 0
  let totalOutputTokens = 0
  const costByModel: Record<string, { queries: number; inputTokens: number; outputTokens: number; cost: number }> = {}
  const costByDay: Record<string, { queries: number; cost: number }> = {}
  const costByUser: Record<string, { queries: number; cost: number }> = {}
  
  for (const entry of chatEntries) {
    const model = entry.details?.model || 'llama-4-maverick'
    const modelKey = model.toLowerCase().replace(/\s+/g, '-')
    const rates = COST_MAP[modelKey] || COST_MAP['llama-4-maverick']
    const { inputTokens, outputTokens } = estimateTokens(entry)
    const cost = (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000
    
    totalCost += cost
    totalInputTokens += inputTokens
    totalOutputTokens += outputTokens
    
    // By model
    if (!costByModel[model]) costByModel[model] = { queries: 0, inputTokens: 0, outputTokens: 0, cost: 0 }
    costByModel[model].queries++
    costByModel[model].inputTokens += inputTokens
    costByModel[model].outputTokens += outputTokens
    costByModel[model].cost += cost
    
    // By day
    const day = new Date(entry.created_at).toISOString().slice(0, 10)
    if (!costByDay[day]) costByDay[day] = { queries: 0, cost: 0 }
    costByDay[day].queries++
    costByDay[day].cost += cost
    
    // By user
    const uid = entry.user_id || 'unknown'
    if (!costByUser[uid]) costByUser[uid] = { queries: 0, cost: 0 }
    costByUser[uid].queries++
    costByUser[uid].cost += cost
  }
  
  // Projections
  const daysInPeriod = Math.max(1, Math.ceil((now.getTime() - periodStart.getTime()) / 86400000))
  const dailyAvg = totalCost / daysInPeriod
  const projectedMonthly = dailyAvg * 30
  
  // Budget status
  let budgetStatus = null
  if (budget) {
    const pctUsed = (totalCost / budget.monthlyLimit) * 100
    budgetStatus = {
      monthlyLimit: budget.monthlyLimit,
      spent: Math.round(totalCost * 100) / 100,
      remaining: Math.round((budget.monthlyLimit - totalCost) * 100) / 100,
      pctUsed: Math.round(pctUsed * 10) / 10,
      autoReload: budget.autoReload || false,
      reloadAmount: budget.reloadAmount || 0,
      reloadThreshold: budget.reloadThreshold || 20,
      status: pctUsed >= 100 ? 'exceeded' : pctUsed >= 80 ? 'warning' : 'ok',
    }
  }
  
  // Get user count
  const { count: userCount } = await db.from('org_members').select('*', { count: 'exact', head: true }).eq('org_id', targetOrgId)
  
  return NextResponse.json({
    org: { id: targetOrgId, name: org?.name, plan: org?.plan },
    period: { start: periodStart.toISOString(), end: now.toISOString(), days: daysInPeriod },
    summary: {
      totalQueries: chatEntries.length,
      totalInputTokens,
      totalOutputTokens,
      totalCost: Math.round(totalCost * 10000) / 10000,
      dailyAvgCost: Math.round(dailyAvg * 10000) / 10000,
      projectedMonthlyCost: Math.round(projectedMonthly * 100) / 100,
      costPerQuery: chatEntries.length > 0 ? Math.round((totalCost / chatEntries.length) * 100000) / 100000 : 0,
      activeUsers: Object.keys(costByUser).length,
      totalUsers: userCount || 0,
    },
    budget: budgetStatus,
    breakdown: {
      byModel: costByModel,
      byDay: Object.entries(costByDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, data]) => ({ date, ...data })),
      byUser: Object.entries(costByUser).map(([userId, data]) => ({ userId, ...data })),
    },
  })
}

// PATCH — update budget settings
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { userId, orgId, monthlyLimit, dailyUserLimit, autoReload, reloadAmount, reloadThreshold, modelLock } = body
  
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  
  // Get org membership — owner only
  const { data: members } = await db.from('org_members').select('org_id, role, permission_tier').eq('user_id', userId).order('role', { ascending: true })
  const member = orgId 
    ? members?.find((m: any) => m.org_id === orgId) 
    : members?.find((m: any) => m.role === 'owner') || members?.[0]
  
  if (!member || member.permission_tier > 1) return NextResponse.json({ error: 'Owner only' }, { status: 403 })
  
  const targetOrgId = member.org_id
  
  // Get current settings
  const { data: org } = await db.from('organizations').select('settings').eq('id', targetOrgId).single()
  const settings = org?.settings || {}
  
  // Merge budget settings
  settings.usageBudget = {
    ...settings.usageBudget,
    ...(monthlyLimit !== undefined && { monthlyLimit }),
    ...(dailyUserLimit !== undefined && { dailyUserLimit }),
    ...(autoReload !== undefined && { autoReload }),
    ...(reloadAmount !== undefined && { reloadAmount }),
    ...(reloadThreshold !== undefined && { reloadThreshold }),
    ...(modelLock !== undefined && { modelLock }),
    updatedAt: new Date().toISOString(),
  }
  
  const { error } = await db.from('organizations').update({ settings }).eq('id', targetOrgId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json({ success: true, budget: settings.usageBudget })
}
