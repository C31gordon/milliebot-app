import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, description, capabilities, agentId } = body

    if (!userId || !name || !agentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const { data: member } = await db
      .from('org_members')
      .select('org_id')
      .eq('user_id', userId)
      .single()

    if (!member?.org_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const { data: bot, error } = await db
      .from('bots')
      .insert({
        org_id: member.org_id,
        agent_id: agentId,
        name,
        description: description || null,
        capabilities: capabilities || [],
        status: 'active',
      })
      .select('*, agent:agents(id, name)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, bot })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
