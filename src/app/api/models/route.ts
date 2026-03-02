import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const MODEL_CATALOG = [
  { id: 'llama-4-maverick',  name: 'Llama 4 Maverick',  provider: 'Together AI', costTier: '¢',   minTier: 4, inputCost: 0.27, outputCost: 0.85 },
  { id: 'deepseek-v3',       name: 'DeepSeek V3',       provider: 'Together AI', costTier: '¢',   minTier: 4, inputCost: 0.20, outputCost: 0.60 },
  { id: 'qwen3-235b',        name: 'Qwen3 235B',        provider: 'Together AI', costTier: '¢',   minTier: 4, inputCost: 0.30, outputCost: 0.90 },
  { id: 'claude-4-haiku',    name: 'Claude 4 Haiku',    provider: 'Anthropic',   costTier: '$',   minTier: 3, inputCost: 0.80, outputCost: 4.00 },
  { id: 'gpt-4.1-mini',      name: 'GPT-4.1 Mini',      provider: 'OpenAI',      costTier: '$',   minTier: 3, inputCost: 0.40, outputCost: 1.60 },
  { id: 'claude-4-sonnet',   name: 'Claude 4 Sonnet',   provider: 'Anthropic',   costTier: '$$',  minTier: 2, inputCost: 3.00, outputCost: 15.00 },
  { id: 'gpt-4.1',           name: 'GPT-4.1',           provider: 'OpenAI',      costTier: '$$',  minTier: 2, inputCost: 2.00, outputCost: 8.00 },
  { id: 'claude-4-opus',     name: 'Claude 4 Opus',     provider: 'Anthropic',   costTier: '$$$', minTier: 1, inputCost: 15.00, outputCost: 75.00 },
  { id: 'gpt-5',             name: 'GPT-5',             provider: 'OpenAI',      costTier: '$$$', minTier: 1, inputCost: 10.00, outputCost: 30.00 },
]

const TIER_LABELS: Record<number, string> = { 1: 'Owner/Executive', 2: 'Department Head', 3: 'Manager', 4: 'Staff' }

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const { data: members } = await db.from('org_members').select('org_id, role, permission_tier').eq('user_id', userId).order('role', { ascending: true })
  const member = members?.find((m: any) => m.role === 'owner') || members?.[0]
  if (!member) return NextResponse.json({ error: 'No membership' }, { status: 403 })

  const userTier = member.role === 'owner' ? 1 : (member.permission_tier <= 4 ? member.permission_tier : 3)

  // Check for org-level model lock
  const { data: org } = await db.from('organizations').select('settings').eq('id', member.org_id).single()
  const modelLock = org?.settings?.usageBudget?.modelLock || null

  let available
  if (modelLock) {
    available = MODEL_CATALOG.filter(m => m.id === modelLock)
  } else {
    available = MODEL_CATALOG.filter(m => userTier <= m.minTier)
  }

  return NextResponse.json({
    tier: userTier,
    tierLabel: TIER_LABELS[userTier] || 'Staff',
    modelLock,
    currentModel: org?.settings?.chat_model || 'llama-4-maverick',
    available: available.map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      costTier: m.costTier,
      inputCost: `$${m.inputCost}/M tokens`,
      outputCost: `$${m.outputCost}/M tokens`,
    })),
    restricted: MODEL_CATALOG.filter(m => userTier > m.minTier).map(m => ({
      id: m.id,
      name: m.name,
      costTier: m.costTier,
      requiredTier: m.minTier,
      requiredTierLabel: TIER_LABELS[m.minTier],
    })),
  })
}
