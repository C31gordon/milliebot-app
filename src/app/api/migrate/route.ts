import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  if (secret !== 'zynthr-migrate-2026') return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createClient(supabaseUrl, serviceKey)

  // Create workflows table using raw SQL via rpc
  // Since we can't run DDL via REST, we'll use a different approach:
  // Store workflows in a 'workflows' table created via Supabase dashboard
  // For now, use the service role to insert into a workaround

  // Try to query workflows table
  const { error } = await supabase.from('workflows').select('id').limit(1)
  
  if (error?.code === 'PGRST205') {
    // Table doesn't exist — we need it created via Supabase dashboard
    return NextResponse.json({ 
      error: 'workflows table not found', 
      sql: `CREATE TABLE workflows (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        org_id uuid REFERENCES organizations(id),
        name text NOT NULL,
        description text,
        department text,
        status text DEFAULT 'draft',
        trigger_type text DEFAULT 'manual',
        trigger_config jsonb DEFAULT '{}',
        steps jsonb DEFAULT '[]',
        created_by uuid,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        last_run_at timestamptz,
        runs_today int DEFAULT 0,
        success_rate numeric(5,2) DEFAULT 100,
        complexity text DEFAULT 'simple'
      );
      CREATE INDEX idx_workflows_org ON workflows(org_id);`,
      instruction: 'Run this SQL in Supabase dashboard → SQL Editor'
    })
  }

  return NextResponse.json({ ok: true, message: 'workflows table exists' })
}
