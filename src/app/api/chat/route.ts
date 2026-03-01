import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// RKBAC tier definitions
const TIER_ACCESS: Record<number, { label: string; canSee: string[]; restricted: string[] }> = {
  1: { label: 'Owner/Executive', canSee: ['all departments', 'all agents', 'all bots', 'financial data', 'audit logs', 'team members', 'integrations', 'billing'], restricted: [] },
  2: { label: 'Department Head', canSee: ['own department agents', 'own department bots', 'department metrics', 'team in department'], restricted: ['other departments', 'billing', 'org-wide financials', 'audit logs', 'integration credentials'] },
  3: { label: 'Manager', canSee: ['assigned agents', 'own tasks', 'department announcements'], restricted: ['other departments', 'financial data', 'billing', 'audit logs', 'integration config', 'team management', 'agent creation'] },
  4: { label: 'Specialist', canSee: ['assigned bot interfaces', 'own tasks'], restricted: ['all agents config', 'all departments', 'financial data', 'billing', 'audit logs', 'integrations', 'team management', 'agent creation', 'bot creation'] },
}

export async function POST(request: NextRequest) {
  try {
    const { userId, message, history } = await request.json()
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

    // Get org context + RKBAC tier
    let orgContext = 'New user — no organization set up yet.'
    let rkbacRules = ''
    let userTier = 1
    let userDepartment = ''

    if (userId) {
      const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
      const { data: member } = await db.from('org_members').select('org_id, role, permission_tier, department_id').eq('user_id', userId).single()
      
      if (member?.org_id) {
        userTier = member.permission_tier || member.role === 'owner' ? 1 : 3

        const [orgRes, deptsRes, agentsRes] = await Promise.all([
          db.from('organizations').select('name, industry, slug').eq('id', member.org_id).single(),
          db.from('departments').select('id, name').eq('org_id', member.org_id),
          db.from('agents').select('name, status, description, department_id').eq('org_id', member.org_id),
        ])

        const org = orgRes.data
        const allDepts = deptsRes.data || []
        const allAgents = agentsRes.data || []

        // Find user's department name
        if (member.department_id) {
          const dept = allDepts.find((d: any) => d.id === member.department_id)
          userDepartment = dept?.name || ''
        }

        const tierAccess = TIER_ACCESS[userTier] || TIER_ACCESS[4]

        // Build context based on tier
        if (userTier <= 1) {
          // Owner/Exec sees everything
          const depts = allDepts.map((d: any) => d.name)
          const agents = allAgents.map((a: any) => {
            const dept = allDepts.find((d: any) => d.id === a.department_id)
            return `${a.name} (${a.status}, ${dept?.name || 'unassigned'})`
          })
          orgContext = `Organization: ${org?.name || 'Unknown'}\nIndustry: ${org?.industry || 'Unknown'}\nDepartments: ${depts.join(', ') || 'None'}\nAgents: ${agents.join(', ') || 'None deployed yet'}\nUser role: Owner/Executive (Tier 1) — full access`
        } else if (userTier === 2) {
          // Dept Head sees own department
          const deptAgents = allAgents.filter((a: any) => a.department_id === member.department_id)
          orgContext = `Organization: ${org?.name || 'Unknown'}\nYour Department: ${userDepartment}\nDepartment Agents: ${deptAgents.map((a: any) => `${a.name} (${a.status})`).join(', ') || 'None'}\nUser role: Department Head (Tier 2)`
        } else {
          // Manager/Specialist sees minimal
          orgContext = `Organization: ${org?.name || 'Unknown'}\nYour Department: ${userDepartment || 'Unassigned'}\nUser role: ${tierAccess.label} (Tier ${userTier})`
        }

        // Build RKBAC rules for the system prompt
        rkbacRules = `\n\nRKBAC ENFORCEMENT (CRITICAL — DO NOT VIOLATE):
This user is Tier ${userTier} (${tierAccess.label}).
They CAN access: ${tierAccess.canSee.join(', ')}
They CANNOT access: ${tierAccess.restricted.join(', ') || 'nothing restricted'}

If they ask about restricted data:
- Do NOT reveal it or make it up
- Say: "That information is restricted to [required tier]. Contact your admin for access."
- Be friendly about it — don't make them feel bad for asking
- If they need elevated access, suggest they talk to their org admin`
      }
    }

    const systemPrompt = `You are Zynthr AI — the built-in assistant for the Zynthr platform. You're smart, helpful, and have personality. You're like a brilliant coworker who actually likes their job.

PERSONALITY:
- Warm but sharp. Think "friendly strategist" not "corporate chatbot"
- Concise — no walls of text. Get to the point, then offer to go deeper
- Light humor when natural — never forced, never corny
- Use emoji sparingly and meaningfully
- If you don't know something, say so with confidence, not apology
- You genuinely care about helping this person succeed

CONTEXT:
${orgContext}
${rkbacRules}

CAPABILITIES (what you can help with):
- Explain platform features and how to use them
- Help plan agent deployments and department setups
- Advise on workflow automation strategies
- Answer questions about integrations and capabilities
- Help think through organizational structure
- General business and industry guidance

RULES:
- Never make up data or stats — if asked for real metrics, explain that integrations need to be connected first
- Keep responses under 150 words unless the user asks for detail
- Use markdown formatting (bold, bullets) for readability
- If someone says "I wish..." treat it as a feature suggestion and acknowledge it warmly
- If someone says "I need..." or reports a problem, create a mental ticket and help troubleshoot
- Reference their actual org/departments/agents when relevant
- ALWAYS enforce RKBAC — never reveal data above the user's tier`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    console.log('ANTHROPIC_KEY exists:', !!anthropicKey, 'length:', anthropicKey?.length || 0)
    if (anthropicKey) {
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
          messages: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const responseText = await res.text()
      console.log('Anthropic status:', res.status, 'body:', responseText.substring(0, 200))
      if (res.ok) {
        const data = JSON.parse(responseText)
        const reply = data.content?.[0]?.text || "Hmm, I drew a blank there. Try asking differently?"
        return NextResponse.json({ reply })
      }
      // If Anthropic fails, return the error for debugging
      return NextResponse.json({ reply: "AI is connecting... (Status: " + res.status + "). Try again in a moment! 🔄" })
    }

    return NextResponse.json({
      reply: "I'm warming up! My AI brain isn't connected yet, but once your admin hooks up the API key, I'll be fully operational. In the meantime, explore the platform — set up agents, configure departments, and I'll be here when you need me. 🚀"
    })
  } catch (error) {
    return NextResponse.json({
      reply: "Something went sideways on my end. Give me a sec and try again? 🤔"
    })
  }
}
