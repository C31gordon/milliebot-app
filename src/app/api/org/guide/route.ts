import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { data: member } = await supabase.from('org_members').select('organization_id, role').eq('user_id', userId).single()
  if (!member) return NextResponse.json({ error: 'No org found' }, { status: 404 })

  const { data: org } = await supabase.from('organizations').select('*').eq('id', member.organization_id).single()
  const { data: depts } = await supabase.from('departments').select('name').eq('organization_id', member.organization_id)

  const orgName = org?.name || 'Your Organization'
  const industry = org?.industry || 'general'
  const deptNames = (depts || []).map((d: { name: string }) => d.name)

  const industryTips: Record<string, string[]> = {
    healthcare: [
      'Set up a Patient Intake agent to automate form collection and pre-visit workflows',
      'Configure HIPAA-compliant document handling before processing any PHI',
      'Use the Scheduling agent to reduce no-shows with automated reminders',
      'Consider integrating your EHR system (DrChrono, athenahealth, Jane App)',
    ],
    property: [
      'Deploy a Leasing agent to handle prospect inquiries 24/7',
      'Set up automated Work Order routing based on maintenance type',
      'Use the Financial Reporting agent to auto-generate DLRs and WPOs',
      'Integrate your PMS (Entrata, Yardi, RealPage, AppFolio) for real-time data',
    ],
    legal: [
      'Set up a Document Review agent for initial contract analysis',
      'Configure client intake automation to streamline new matter creation',
      'Use the Research agent for case law and regulatory updates',
    ],
    finance: [
      'Deploy an Invoice Processing agent for automated AP workflows',
      'Set up financial reconciliation automation with QuickBooks or Xero',
      'Use the Compliance agent for regulatory monitoring and reporting',
    ],
    construction: [
      'Set up a Project Tracking agent to monitor milestones and deliverables',
      'Deploy automated RFI processing and response routing',
      'Use the Safety Compliance agent for OSHA reporting workflows',
    ],
  }

  const tips = industryTips[industry] || [
    'Start by creating your first agent for the department with the most repetitive tasks',
    'Connect your existing tools (email, calendar, file storage) for immediate value',
    'Use the chat assistant to ask questions about your setup anytime',
    'Invite your team and assign appropriate access tiers using RKBAC',
  ]

  const deptTags = deptNames.map((d: string) => `  <span class="dept-tag">${d}</span>`).join('\n')
  const tipBlocks = tips.map((t: string) => `<div class="tip">\ud83d\udca1 ${t}</div>`).join('\n')
  const year = new Date().getFullYear()
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const capIndustry = industry.charAt(0).toUpperCase() + industry.slice(1)

  const guide = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${orgName} - Zynthr Getting Started Guide</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 28px; margin-bottom: 8px; color: #003146; }
  h2 { font-size: 20px; margin: 32px 0 12px; color: #003146; border-bottom: 2px solid #559CB5; padding-bottom: 6px; }
  h3 { font-size: 16px; margin: 20px 0 8px; color: #559CB5; }
  p { margin-bottom: 12px; }
  .subtitle { color: #666; font-size: 15px; margin-bottom: 32px; }
  .step { background: #f8fafe; border-left: 3px solid #559CB5; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
  .step-num { font-weight: 700; color: #559CB5; margin-right: 8px; }
  .tip { background: #f0fdf4; border-left: 3px solid #22c55e; padding: 12px 16px; margin: 8px 0; border-radius: 0 8px 8px 0; }
  .dept-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
  .dept-tag { background: #e8f4f8; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; color: #003146; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #999; font-size: 13px; text-align: center; }
</style>
</head>
<body>
<h1>\ud83d\ude80 Welcome to Zynthr, ${orgName}!</h1>
<p class="subtitle">Your personalized getting-started guide - Generated ${dateStr}</p>

<h2>Your Setup at a Glance</h2>
<p><strong>Organization:</strong> ${orgName}</p>
<p><strong>Industry:</strong> ${capIndustry}</p>
<p><strong>Departments:</strong></p>
<div class="dept-list">
${deptTags}
</div>

<h2>Quick Start (5 Minutes)</h2>
<div class="step"><span class="step-num">1.</span> <strong>Create your first agent</strong> - Go to Agents and Bots, click Create Agent. Pick a department and choose capabilities.</div>
<div class="step"><span class="step-num">2.</span> <strong>Connect your tools</strong> - Head to Settings, Integrations. Start with email/calendar (M365 or Google Workspace).</div>
<div class="step"><span class="step-num">3.</span> <strong>Invite your team</strong> - Settings, Team. Assign RKBAC tiers to control data access.</div>
<div class="step"><span class="step-num">4.</span> <strong>Chat with your AI assistant</strong> - Click the chat bubble. Ask anything about setup, agents, or workflows.</div>

<h2>Recommended for ${capIndustry}</h2>
${tipBlocks}

<h2>Understanding RKBAC</h2>
<p>Roles and Knowledge-Based Access Control ensures every team member sees only what they need:</p>
<h3>Tier 1 - Owner / Executive</h3>
<p>Full access to all data, agents, settings, and integrations.</p>
<h3>Tier 2 - Department Head</h3>
<p>Full access to their departments agents and data. Can configure integrations.</p>
<h3>Tier 3 - Team Lead</h3>
<p>Can use department agents and view department data. Cannot modify settings.</p>
<h3>Tier 4 - Team Member</h3>
<p>Can interact with assigned agents only. Read-only access to relevant data.</p>

<h2>Need Help?</h2>
<p>Chat assistant available 24/7 in the bottom-right corner</p>
<p>Email: support@zynthr.ai</p>

<div class="footer">${year} Zynthr Inc. - Powered by RKBAC</div>
</body>
</html>`

  return new NextResponse(guide, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="${orgName.replace(/[^a-zA-Z0-9]/g, '-')}-Zynthr-Guide.html"`,
    },
  })
}
