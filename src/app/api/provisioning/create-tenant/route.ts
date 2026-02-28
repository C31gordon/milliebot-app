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
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
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

    // Generate unique slug
    let slug = slugify(companyName)
    const { data: existing } = await db
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // 1. Create tenant
    const { data: tenant, error: tenantError } = await db
      .from('tenants')
      .insert({
        name: companyName,
        slug,
        plan: 'free',
        brand_primary: '#559CB5',
        brand_secondary: '#8b5cf6',
      })
      .select()
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: tenantError?.message || 'Failed to create tenant' }, { status: 500 })
    }

    const tenantId = tenant.id

    // 2. Create departments
    const deptInserts = departments.map((name: string, i: number) => ({
      tenant_id: tenantId,
      name,
      slug: slugify(name),
      sort_order: i,
    }))
    const { data: createdDepts, error: deptError } = await db
      .from('departments')
      .insert(deptInserts)
      .select()

    if (deptError) {
      return NextResponse.json({ error: `Departments: ${deptError.message}` }, { status: 500 })
    }

    // 3. Create default roles
    const roles = [
      { name: 'Owner', tier: 'owner' },
      { name: 'Manager', tier: 'manager' },
      { name: 'Specialist', tier: 'specialist' },
      { name: 'Viewer', tier: 'specialist' },
    ]
    const roleInserts = roles.map(r => ({
      tenant_id: tenantId,
      name: r.name,
      tier: r.tier,
    }))
    const { data: createdRoles, error: roleError } = await db
      .from('roles')
      .insert(roleInserts)
      .select()

    if (roleError) {
      return NextResponse.json({ error: `Roles: ${roleError.message}` }, { status: 500 })
    }

    // 4. Create default RKBAC policies
    const ownerRole = createdRoles?.find((r: { name: string }) => r.name === 'Owner')
    if (ownerRole) {
      await db.from('rkbac_policies').insert([
        {
          tenant_id: tenantId,
          role_id: ownerRole.id,
          resource_type: '*',
          action: '*',
          effect: 'allow',
          sensitivity_level: 'restricted',
        },
      ])
    }

    // 5. Assign user as Owner
    const { error: userError } = await db
      .from('users')
      .update({
        tenant_id: tenantId,
        role_id: ownerRole?.id,
        onboarding_completed: true,
      })
      .eq('auth_id', userId)

    if (userError) {
      return NextResponse.json({ error: `User assignment: ${userError.message}` }, { status: 500 })
    }

    // 6. Create first agent if provided
    if (agent?.name && createdDepts?.length) {
      const targetDept = createdDepts.find((d: { name: string }) => d.name === agent.departmentName) || createdDepts[0]
      await db.from('agents').insert({
        tenant_id: tenantId,
        department_id: targetDept.id,
        name: agent.name,
        description: agent.description || null,
        status: 'configuring',
        capabilities: [],
      })
    }

    // 7. Store invite emails (optional)
    if (inviteEmails?.length) {
      console.log(`Invite emails for tenant ${tenantId}:`, inviteEmails)
    }

    return NextResponse.json({
      success: true,
      tenant: { id: tenantId, slug, name: companyName },
      departments: createdDepts?.length || 0,
      roles: createdRoles?.length || 0,
      metadata: { industry, companySize },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
