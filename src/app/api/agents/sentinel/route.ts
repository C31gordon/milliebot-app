import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, serviceKey)
  const { action } = await req.json()

  if (action === 'smoke_test') {
    const endpoints = [
      { name: 'Homepage', url: 'https://app.zynthr.ai', expect: 200 },
      { name: 'Login', url: 'https://app.zynthr.ai/login', expect: 200 },
      { name: 'API Health', url: 'https://app.zynthr.ai/api/org/data', expect: 200 },
      { name: 'Chat API', url: 'https://app.zynthr.ai/api/chat', expect: 405 }, // GET not allowed = healthy
      { name: 'SDR Webhook', url: 'https://app.zynthr.ai/api/agents/sdr', expect: 405 },
      { name: 'Concierge', url: 'https://app.zynthr.ai/api/agents/concierge', expect: 405 },
      { name: 'Workflows', url: 'https://app.zynthr.ai/api/workflows', expect: 200 },
      { name: 'Support', url: 'https://app.zynthr.ai/api/support', expect: 405 },
    ]

    const results = []
    for (const ep of endpoints) {
      try {
        const start = Date.now()
        const res = await fetch(ep.url, { method: 'GET', cache: 'no-store' })
        const latency = Date.now() - start
        const passed = res.status === ep.expect || res.status === 200
        results.push({ name: ep.name, status: res.status, latency: `${latency}ms`, passed })
      } catch (e: any) {
        results.push({ name: ep.name, status: 'ERROR', latency: '-', passed: false, error: e.message })
      }
    }

    const allPassed = results.every(r => r.passed)
    
    await supabase.from('audit_log').insert({
      org_id: '69645b48-7bc8-4982-b228-5e7eed93d7a2',
      action: 'sentinel_smoke_test',
      details: { results, allPassed, timestamp: new Date().toISOString() },
    })

    return NextResponse.json({
      success: true,
      allPassed,
      passRate: `${results.filter(r => r.passed).length}/${results.length}`,
      results,
      message: allPassed ? '✅ All endpoints healthy' : '🚨 Failures detected',
    })
  }

  if (action === 'api_test') {
    // Full API integration tests
    const tests = []

    // Test SDR
    try {
      const res = await fetch('https://app.zynthr.ai/api/agents/sdr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'sentinel-test', email: 'test@sentinel.ai', orgName: 'Sentinel QA', industry: 'technology', size: '1-10', firstName: 'QA' }),
      })
      const data = await res.json()
      tests.push({ name: 'SDR Webhook', passed: data.success === true, tier: data.tier })
    } catch (e: any) {
      tests.push({ name: 'SDR Webhook', passed: false, error: e.message })
    }

    // Test Concierge
    try {
      const res = await fetch('https://app.zynthr.ai/api/agents/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'ba44e196-bcdd-40aa-a667-899383258da5', orgId: '64832777-6654-4861-aaea-ca70435dc80b' }),
      })
      const data = await res.json()
      tests.push({ name: 'Concierge', passed: data.success === true, health: data.healthScore })
    } catch (e: any) {
      tests.push({ name: 'Concierge', passed: false, error: e.message })
    }

    // Test Cashflow
    try {
      const res = await fetch('https://app.zynthr.ai/api/agents/cashflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'all_orgs_summary' }),
      })
      const data = await res.json()
      tests.push({ name: 'Cashflow', passed: data.success === true, orgs: data.summaries?.length })
    } catch (e: any) {
      tests.push({ name: 'Cashflow', passed: false, error: e.message })
    }

    const allPassed = tests.every(t => t.passed)
    
    await supabase.from('audit_log').insert({
      org_id: '69645b48-7bc8-4982-b228-5e7eed93d7a2',
      action: 'sentinel_api_test',
      details: { tests, allPassed },
    })

    return NextResponse.json({ success: true, allPassed, tests })
  }

  return NextResponse.json({ error: 'action required (smoke_test|api_test)' }, { status: 400 })
}
