import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// POST /api/org/logo — upload org logo (dark or light variant)
export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const userId = formData.get('userId') as string | null
  const variant = (formData.get('variant') as string) || 'dark' // 'dark' or 'light'

  if (!file || !userId) return NextResponse.json({ error: 'file and userId required' }, { status: 400 })

  // RKBAC: only owner
  const { data: members } = await supabase.from('org_members').select('org_id, role').eq('user_id', userId).order('role', { ascending: true })
  const member = members?.find((m: any) => m.role === 'owner') || members?.[0]
  if (!member) return NextResponse.json({ error: 'No org found' }, { status: 404 })
  if (member.role !== 'owner') return NextResponse.json({ error: 'Only owners can upload logos' }, { status: 403 })

  const ext = file.name.split('.').pop() || 'png'
  const path = `${member.org_id}/logo-${variant}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload (upsert)
  const { error } = await supabase.storage
    .from('org-assets')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabase.storage.from('org-assets').getPublicUrl(path)

  // Save URL to org settings
  const { data: org } = await supabase.from('organizations').select('settings').eq('id', member.org_id).single()
  const settings = org?.settings || {}
  const logoKey = variant === 'light' ? 'logoLight' : 'logoDark'
  const merged = { ...settings, [logoKey]: urlData.publicUrl + '?t=' + Date.now() }
  await supabase.from('organizations').update({ settings: merged }).eq('id', member.org_id)

  return NextResponse.json({ success: true, url: urlData.publicUrl, variant })
}

// DELETE /api/org/logo — remove logo
export async function DELETE(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { userId, variant } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { data: members } = await supabase.from('org_members').select('org_id, role').eq('user_id', userId).order('role', { ascending: true })
  const member = members?.find((m: any) => m.role === 'owner') || members?.[0]
  if (!member) return NextResponse.json({ error: 'No org found' }, { status: 404 })
  if (member.role !== 'owner') return NextResponse.json({ error: 'Only owners can delete logos' }, { status: 403 })

  // Remove from settings
  const { data: org } = await supabase.from('organizations').select('settings').eq('id', member.org_id).single()
  const settings = { ...(org?.settings || {}) }
  const logoKey = variant === 'light' ? 'logoLight' : 'logoDark'
  delete settings[logoKey]
  await supabase.from('organizations').update({ settings }).eq('id', member.org_id)

  // Remove files matching pattern
  const { data: files } = await supabase.storage.from('org-assets').list(member.org_id)
  const logoFiles = (files || []).filter(f => f.name.startsWith(`logo-${variant || 'dark'}`))
  if (logoFiles.length) {
    await supabase.storage.from('org-assets').remove(logoFiles.map(f => `${member.org_id}/${f.name}`))
  }

  return NextResponse.json({ success: true })
}
