import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { action } = await req.json()

  if (action === 'weekly_plan') {
    const now = new Date()
    const weekOf = now.toISOString().split('T')[0]

    const contentPlan = {
      weekOf,
      linkedin: [
        { day: 'Tuesday', topic: 'AI agent ROI', hook: 'Your competitors are automating. Here\'s what they know that you don\'t.', pillar: 'roi' },
        { day: 'Thursday', topic: 'RKBAC security', hook: 'Most AI platforms give everyone access to everything. That\'s not security, that\'s liability.', pillar: 'security' },
        { day: 'Saturday', topic: 'Building in public', hook: 'We built 16 AI agents to run our own company. Here\'s what happened in week 1.', pillar: 'transparency' },
      ],
      blog: {
        title: 'How AI Agents Are Replacing $150K Roles (And Why That\'s Good)',
        outline: ['The cost of manual operations', 'What AI agents actually do', '3 real examples', 'ROI calculation', 'Getting started'],
        targetWords: 1200,
        seoKeywords: ['AI agents for business', 'AI automation ROI', 'AI agent platform'],
      },
      newsletter: {
        subject: 'Your agents worked 168 hours this week. Did your team?',
        sections: ['Feature spotlight: Workflow Builder', 'Industry use case', 'Quick tip: agent capabilities'],
      },
    }

    await supabase.from('audit_log').insert({
      org_id: '69645b48-7bc8-4982-b228-5e7eed93d7a2',
      action: 'echo_weekly_plan',
      details: contentPlan,
    })

    return NextResponse.json({ success: true, contentPlan })
  }

  if (action === 'generate_post') {
    const { topic, pillar, platform } = await req.json()

    // This would call an AI model to generate content
    // For now, return the brief for the AI to work with
    const brief = {
      platform: platform || 'linkedin',
      topic,
      pillar,
      voice: 'Direct, confident, no fluff. Numbers > adjectives. Short paragraphs.',
      format: platform === 'blog' 
        ? '800-1500 words, H2 subheadings, data points, CTA at bottom'
        : 'Hook line, 3-5 short paragraphs, specific numbers, end with question, 3-5 hashtags',
      avoid: ['Hype', 'Buzzwords without substance', 'Generic advice', '"AI will change everything"'],
    }

    return NextResponse.json({ success: true, brief })
  }

  return NextResponse.json({ error: 'action required (weekly_plan|generate_post)' }, { status: 400 })
}
