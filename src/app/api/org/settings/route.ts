import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { data: member } = await supabase.from('org_members').select('org_id').eq('user_id', userId).single()
  if (!member) return NextResponse.json({ error: 'No org found' }, { status: 404 })

  const { data: org } = await supabase.from('organizations').select('settings').eq('id', member.org_id).single()
  return NextResponse.json({ settings: org?.settings || {} })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const body = await req.json()
  const { userId, settings } = body
  if (!userId || !settings) return NextResponse.json({ error: 'userId and settings required' }, { status: 400 })

  const { data: member } = await supabase.from('org_members').select('org_id, role, permission_tier').eq('user_id', userId).single()
  if (!member) return NextResponse.json({ error: 'No org found' }, { status: 404 })
  if (member.role !== 'owner' && (member.permission_tier || 99) > 1) {
    return NextResponse.json({ error: 'Only owners can modify org settings' }, { status: 403 })
  }

  const { data: org } = await supabase.from('organizations').select('settings').eq('id', member.org_id).single()
  const merged = { ...(org?.settings || {}), ...settings }

  const { error } = await supabase.from('organizations').update({ settings: merged }).eq('id', member.org_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, settings: merged })
}
