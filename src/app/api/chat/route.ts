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

export async function POST(request: NextRequest) {
  let orgContext = 'New user — no organization set up yet.'
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
          const userTier = member.permission_tier || (member.role === 'owner' ? 1 : 3)
          const tierAccess = TIER_ACCESS[userTier] || TIER_ACCESS[4]

          const [orgRes, deptsRes, agentsRes] = await Promise.all([
            db.from('organizations').select('name, industry').eq('id', member.org_id).single(),
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

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (anthropicKey) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            system: systemPrompt,
            messages: chatMessages,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          return NextResponse.json({ reply: data.content?.[0]?.text || "Hmm, try asking differently?" })
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
