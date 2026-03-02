import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { action, featureRequest, priority } = await req.json()

  if (action === 'spec') {
    await supabase.from('audit_log').insert({
      org_id: '69645b48-7bc8-4982-b228-5e7eed93d7a2',
      action: 'forge_feature_spec',
      details: { featureRequest, priority, timestamp: new Date().toISOString() },
    })

    return NextResponse.json({
      success: true,
      message: `Feature request logged: "${featureRequest}" (${priority || 'medium'} priority)`,
      template: {
        title: featureRequest,
        priority: priority || 'medium',
        sections: ['Problem Statement', 'Proposed Solution', 'Technical Approach', 'Dependencies', 'Estimated Effort', 'Success Metrics'],
      },
    })
  }

  return NextResponse.json({ error: 'action required (spec)' }, { status: 400 })
}
