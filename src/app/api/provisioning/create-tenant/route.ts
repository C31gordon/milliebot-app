import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface CreateTenantBody {
  companyName: string
  industry: string
  companySize: string
  departments: string[]
  userId: string
  agent?: {
    name: string
    departmentName: string
    description: string
  }
  inviteEmails?: string[]
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTenantBody
    const { companyName, industry, companySize, departments, userId, agent, inviteEmails } = body

    if (!companyName || !userId || !departments?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already has an org
    const { data: existingMember } = await db
      .from('org_members')
      .select('org_id')
      .eq('user_id', userId)
      .single()

    if (existingMember?.org_id) {
      // User already has an org — update it with onboarding data
      await db.from('organizations')
        .update({ name: companyName, industry, settings: { companySize } })
        .eq('id', existingMember.org_id)

      return NextResponse.json({
        success: true,
        tenant: { id: existingMember.org_id, slug: slugify(companyName), name: companyName },
        departments: departments.length,
        roles: 0,
        metadata: { industry, companySize },
      })
    }

    // Create new organization
    const slug = slugify(companyName)
    const { data: org, error: orgError } = await db
      .from('organizations')
      .insert({
        name: companyName,
        slug,
        industry,
        plan: 'free',
        owner_id: userId,
        hipaa_required: industry === 'healthcare',
        settings: { companySize },
      })
      .select()
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: orgError?.message || 'Failed to create organization' }, { status: 500 })
    }

    const orgId = org.id

    // Create membership
    await db.from('org_members').insert({
      org_id: orgId,
      user_id: userId,
      role: 'owner',
      permission_tier: 100,
      status: 'active',
    })

    // Create departments
    for (const name of departments) {
      await db.from('departments').insert({
        org_id: orgId,
        name,
        slug: slugify(name),
        status: 'active',
      }).select()
    }

    // Create first agent if provided
    if (agent?.name) {
      await db.from('agents').insert({
        org_id: orgId,
        name: agent.name,
        description: agent.description || null,
        status: 'configuring',
      }).select()
    }

    if (inviteEmails?.length) {
      console.log(`Invite emails for org ${orgId}:`, inviteEmails)
    }

    return NextResponse.json({
      success: true,
      tenant: { id: orgId, slug, name: companyName },
      departments: departments.length,
      roles: 0,
      metadata: { industry, companySize },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Provisioning error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
