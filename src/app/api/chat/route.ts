import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const TIER_ACCESS: Record<number, { label: string; canSee: string[]; restricted: string[] }> = {
  1: { label: 'Owner/Executive', canSee: ['all departments', 'all agents', 'all bots', 'financial data', 'audit logs', 'team members', 'integrations', 'billing'], restricted: [] },
  2: { label: 'Department Head', canSee: ['own department agents', 'own department bots', 'department metrics'], restricted: ['other departments', 'billing', 'org-wide financials', 'audit logs', 'integration credentials'] },
  3: { label: 'Manager', canSee: ['assigned agents', 'own tasks'], restricted: ['other departments', 'financial data', 'billing', 'audit logs', 'integration config', 'team management'] },
  4: { label: 'Specialist', canSee: ['assigned bot interfaces', 'own tasks'], restricted: ['all agents config', 'all departments', 'financial data', 'billing', 'audit logs', 'integrations', 'team management'] },
}


// Cost estimates per 1M tokens (input/output)
const COST_PER_M: Record<string, [number, number]> = {
  'claude-4-sonnet': [3.00, 15.00],
  'claude-4-haiku': [0.80, 4.00],
  'gpt-4.1-mini': [0.40, 1.60],
  'gpt-4.1': [2.00, 8.00],
  'gpt-5': [5.00, 20.00],
  'llama-4-maverick': [0.27, 0.85],
  'deepseek-v3': [1.25, 1.25],
  'qwen3-235b': [0.20, 0.60],
}

async function trackUsage(orgId: string, userId: string, modelKey: string, inputChars: number, outputChars: number) {
  try {
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const estInputTokens = Math.ceil(inputChars / 4)
    const estOutputTokens = Math.ceil(outputChars / 4)
    const costs = COST_PER_M[modelKey] || [1.0, 1.0]
    const costEstimate = (estInputTokens * costs[0] + estOutputTokens * costs[1]) / 1_000_000
    await db.from('audit_log').insert({
      org_id: orgId,
      user_id: userId,
      action: 'ai_chat',
      details: { model: modelKey, input_tokens: estInputTokens, output_tokens: estOutputTokens, cost_estimate: costEstimate },
    })
  } catch {}
}

// Model options — org admin selects in settings
const MODEL_MAP: Record<string, { provider: 'anthropic' | 'openai' | 'together'; model: string; label: string; costTier: string }> = {
  // Anthropic
  'claude-4-sonnet': { provider: 'anthropic', model: 'claude-sonnet-4-20250514', label: 'Claude 4 Sonnet', costTier: '$$' },
  'claude-4-haiku': { provider: 'anthropic', model: 'claude-3-5-haiku-latest', label: 'Claude 4 Haiku', costTier: '$' },
  // OpenAI
  'gpt-4.1-mini': { provider: 'openai', model: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', costTier: '$' },
  'gpt-4.1': { provider: 'openai', model: 'gpt-4.1', label: 'GPT-4.1', costTier: '$$' },
  'gpt-5': { provider: 'openai', model: 'gpt-5', label: 'GPT-5', costTier: '$$$' },
  // Together AI (open-source — highest margin)
  'llama-4-maverick': { provider: 'together', model: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', label: 'Llama 4 Maverick', costTier: '$' },
  'deepseek-v3': { provider: 'together', model: 'deepseek-ai/DeepSeek-V3-0324', label: 'DeepSeek V3', costTier: '$' },
  'qwen3-235b': { provider: 'together', model: 'Qwen/Qwen3-235B-A22B-Instruct-2507-FP8', label: 'Qwen3 235B', costTier: '$' },
}
const DEFAULT_MODEL = 'claude-4-sonnet'  // Cost-effective default

export async function POST(request: NextRequest) {
  let orgContext = 'New user — no organization set up yet.'
    let orgId = ''
  let rkbacRules = ''

  try {
    const { userId, message, history } = await request.json()
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

    // Build org context (wrapped safely)
    if (userId) {
      try {
        const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
        const { data: member } = await db.from('org_members').select('org_id, role, permission_tier, department').eq('user_id', userId).single()

        if (member?.org_id) {
          orgId = member.org_id
          const userTier = member.role === 'owner' ? 1 : (member.permission_tier <= 4 ? member.permission_tier : 3)
          const tierAccess = TIER_ACCESS[userTier] || TIER_ACCESS[4]

          const [orgRes, deptsRes, agentsRes] = await Promise.all([
            db.from('organizations').select('name, industry, settings').eq('id', member.org_id).single(),
            db.from('departments').select('id, name').eq('org_id', member.org_id),
            db.from('agents').select('name, status, department_id').eq('org_id', member.org_id),
          ])

          const org = orgRes.data
          const allDepts = deptsRes.data || []
          const allAgents = agentsRes.data || []

          if (userTier <= 1) {
            const depts = allDepts.map((d: any) => d.name)
            const agents = allAgents.map((a: any) => {
              const dept = allDepts.find((d: any) => d.id === a.department_id)
              return `${a.name} (${a.status}, ${dept?.name || 'unassigned'})`
            })
            orgContext = `Organization: ${org?.name}\nIndustry: ${org?.industry}\nDepartments: ${depts.join(', ') || 'None'}\nAgents: ${agents.join(', ') || 'None deployed yet'}\nUser: Owner/Executive (Tier 1) — full access`
          } else if (userTier === 2) {
            const deptAgents = allAgents.filter((a: any) => {
              const dept = allDepts.find((d: any) => d.name === member.department)
              return dept && a.department_id === dept.id
            })
            orgContext = `Organization: ${org?.name}\nYour Department: ${member.department}\nDepartment Agents: ${deptAgents.map((a: any) => `${a.name} (${a.status})`).join(', ') || 'None'}\nUser: Department Head (Tier 2)`
          } else {
            orgContext = `Organization: ${org?.name}\nYour Department: ${member.department || 'Unassigned'}\nUser: ${tierAccess.label} (Tier ${userTier})`
          }

          rkbacRules = `\n\nRKBAC ENFORCEMENT (CRITICAL — DO NOT VIOLATE):
This user is Tier ${userTier} (${tierAccess.label}).
They CAN access: ${tierAccess.canSee.join(', ')}
They CANNOT access: ${tierAccess.restricted.join(', ') || 'nothing restricted'}
If they ask about restricted data, politely say it requires higher access and suggest contacting their admin.`
        }
      } catch (ctxErr) {
        console.error('Org context error:', ctxErr)
      }
    }

    const systemPrompt = `You are Zynthr AI — the built-in assistant for the Zynthr platform.

PERSONALITY:
- Warm but sharp. "Friendly strategist" not "corporate chatbot"
- Concise — get to the point, offer to go deeper
- Light humor when natural — never forced
- Use emoji sparingly and meaningfully
- If you don't know something, own it confidently

CONTEXT:
${orgContext}
${rkbacRules}

CAPABILITIES:
- Explain platform features and usage
- Help plan agent deployments and department setups
- Advise on workflow automation
- Answer questions about integrations
- Help with organizational structure
- General business and industry guidance

RULES:
- Never make up data — if asked for real metrics, explain integrations need connecting first
- Keep responses under 150 words unless asked for detail
- Use markdown (bold, bullets) for readability
- "I wish..." = feature suggestion, acknowledge warmly
- "I need..." or problem reports = help troubleshoot
- Reference their actual org/departments/agents when relevant
- ALWAYS enforce RKBAC — never reveal data above the user's tier`

    const chatMessages = [
      ...(history || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: message },
    ]

    // Determine which model to use
    const orgSettings = (await (async () => {
      try {
        const db2 = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
        const { data: m } = await db2.from('org_members').select('org_id').eq('user_id', userId || '').single()
        if (m?.org_id) {
          const { data: o } = await db2.from('organizations').select('settings').eq('id', m.org_id).single()
          return o?.settings || {}
        }
        return {}
      } catch { return {} }
    })())
    const selectedModel = MODEL_MAP[orgSettings.chat_model || DEFAULT_MODEL] || MODEL_MAP[DEFAULT_MODEL]

    const togetherKey = process.env.TOGETHER_API_KEY
    if (selectedModel.provider === 'together' && togetherKey) {
      try {
        const res = await fetch('https://api.together.xyz/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + togetherKey },
          body: JSON.stringify({
            model: selectedModel.model,
            max_tokens: 500,
            messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const reply = data.choices?.[0]?.message?.content || "Try again?"
          trackUsage(orgId, userId || '', orgSettings.chat_model || DEFAULT_MODEL, message.length, reply.length)
          return NextResponse.json({ reply, model: selectedModel.label })
        }
        const errText = await res.text()
        console.error('Together AI error:', res.status, errText.substring(0, 200))
      } catch (apiErr) { console.error('Together AI error:', apiErr) }
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    if (selectedModel.provider === 'openai' && openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + openaiKey },
          body: JSON.stringify({
            model: selectedModel.model,
            max_tokens: 500,
            messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const reply = data.choices?.[0]?.message?.content || "Try again?"
          trackUsage(orgId, userId || '', orgSettings.chat_model || DEFAULT_MODEL, message.length, reply.length)
          return NextResponse.json({ reply, model: selectedModel.label })
        }
        const errText = await res.text()
        console.error('OpenAI error:', res.status, errText.substring(0, 200))
      } catch (apiErr) { console.error('OpenAI error:', apiErr) }
    }

    if (selectedModel.provider === 'anthropic' && anthropicKey) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: selectedModel.model,
            max_tokens: 500,
            system: systemPrompt,
            messages: chatMessages,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const reply = data.content?.[0]?.text || "Hmm, try asking differently?"
          trackUsage(orgId, userId || '', orgSettings.chat_model || DEFAULT_MODEL, message.length, reply.length)
          return NextResponse.json({ reply, model: selectedModel.label })
        }
        const errText = await res.text()
        console.error('Anthropic error:', res.status, errText.substring(0, 200))
        return NextResponse.json({ reply: `AI connecting... (${res.status}). Try again in a moment! 🔄` })
      } catch (apiErr) {
        console.error('Anthropic fetch error:', apiErr)
        return NextResponse.json({ reply: "Having trouble reaching my brain. Try again? 🤔" })
      }
    }

    return NextResponse.json({
      reply: "I'm warming up! My AI brain isn't connected yet — your admin needs to add the API key. In the meantime, explore the platform and I'll be here when ready. 🚀"
    })
  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json({ reply: "Something went sideways. Try again? 🤔" })
  }
}
