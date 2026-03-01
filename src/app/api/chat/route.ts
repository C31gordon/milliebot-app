import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { userId, message, history } = await request.json()
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

    // Get org context
    let orgContext = 'New user — no organization set up yet.'
    if (userId) {
      const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
      const { data: member } = await db.from('org_members').select('org_id, role').eq('user_id', userId).single()
      if (member?.org_id) {
        const [orgRes, deptsRes, agentsRes] = await Promise.all([
          db.from('organizations').select('name, industry, slug').eq('id', member.org_id).single(),
          db.from('departments').select('name').eq('org_id', member.org_id),
          db.from('agents').select('name, status, description').eq('org_id', member.org_id),
        ])
        const org = orgRes.data
        const depts = (deptsRes.data || []).map((d: any) => d.name)
        const agents = (agentsRes.data || []).map((a: any) => `${a.name} (${a.status})`)
        orgContext = `Organization: ${org?.name || 'Unknown'}\nIndustry: ${org?.industry || 'Unknown'}\nDepartments: ${depts.join(', ') || 'None'}\nAgents: ${agents.join(', ') || 'None deployed yet'}`
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
- Reference their actual org/departments/agents when relevant`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    // Try Anthropic first, fall back to a smart local response
    const anthropicKey = process.env.ANTHROPIC_API_KEY
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
      if (res.ok) {
        const data = await res.json()
        const reply = data.content?.[0]?.text || "Hmm, I drew a blank there. Try asking differently?"
        return NextResponse.json({ reply })
      }
    }

    // Fallback if no API key or API fails
    return NextResponse.json({
      reply: "I'm warming up! My AI brain isn't connected yet, but once your admin hooks up the API key, I'll be fully operational. In the meantime, explore the platform — set up agents, configure departments, and I'll be here when you need me. 🚀"
    })
  } catch (error) {
    return NextResponse.json({
      reply: "Something went sideways on my end. Give me a sec and try again? 🤔"
    })
  }
}
