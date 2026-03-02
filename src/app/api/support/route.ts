import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { userId, subject, description, category, priority } = await req.json()
  if (!userId || !subject) return NextResponse.json({ error: 'userId and subject required' }, { status: 400 })

  const { data: members } = await supabase.from('org_members').select('org_id, role').eq('user_id', userId).order('role', { ascending: true })
  const member = members?.find((m: any) => m.role === 'owner') || members?.[0]

  // Log to audit_log as a support ticket
  const { error } = await supabase.from('audit_log').insert({
    org_id: member?.org_id || null,
    user_id: userId,
    action: 'support_ticket',
    details: { subject, description, category: category || 'general', priority: priority || 'normal', status: 'open', created: new Date().toISOString() },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // TODO: Send notification email when SendGrid is wired
  return NextResponse.json({ success: true, message: 'Support ticket submitted. We\'ll get back to you within 24 hours.' })
}
