'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PLANS, type PlanType } from '@/lib/plans'

const STRIPE_CONFIGURED = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  const planKeys: PlanType[] = ['free', 'professional', 'enterprise']

  const handleSubscribe = async (planKey: PlanType) => {
    if (planKey === 'free') {
      window.location.href = '/signup'
      return
    }
    if (planKey === 'enterprise') {
      window.location.href = 'mailto:sales@milliebot.com?subject=Enterprise%20Plan%20Inquiry'
      return
    }
    if (!STRIPE_CONFIGURED) return

    // In production, this would call /api/stripe/create-checkout
    // For now, redirect to signup if not authenticated
    window.location.href = '/signup'
  }

  return (
    <div className="min-h-screen p-4 pb-20" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--blue) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, var(--purple) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 pt-16">
        {/* Header */}
        <div className="text-center mb-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:underline" style={{ color: 'var(--blue)' }}>
            ← Back to Milliebot
          </Link>
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>
            Simple, transparent pricing
          </h1>
          <p className="text-lg" style={{ color: 'var(--text3)' }}>
            Start free. Scale as you grow. No surprises.
          </p>
        </div>

        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="text-sm font-medium" style={{ color: annual ? 'var(--text4)' : 'var(--text)' }}>Monthly</span>
          <button onClick={() => setAnnual(!annual)}
            className="relative w-14 h-7 rounded-full transition-all"
            style={{ background: annual ? 'var(--blue)' : 'var(--bg3)' }}>
            <div className="absolute top-1 w-5 h-5 rounded-full transition-all"
              style={{ background: '#fff', left: annual ? '30px' : '4px' }} />
          </button>
          <span className="text-sm font-medium" style={{ color: annual ? 'var(--text)' : 'var(--text4)' }}>
            Annual <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--green)' }}>Save 20%</span>
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {planKeys.map(key => {
            const plan = PLANS[key]
            const price = annual ? plan.annualPrice : plan.price
            const isHighlight = plan.highlight

            return (
              <div key={key}
                className="glass-card p-6 flex flex-col relative"
                style={{
                  border: isHighlight ? '2px solid var(--blue)' : undefined,
                  boxShadow: isHighlight ? 'var(--shadow-glow-blue)' : undefined,
                }}>
                {isHighlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'var(--blue)', color: '#fff' }}>
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>{plan.name}</h3>
                <div className="mb-4">
                  {price === 0 ? (
                    <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>${price}</span>
                      <span className="text-sm" style={{ color: 'var(--text4)' }}>/mo</span>
                      {annual && <div className="text-xs mt-1" style={{ color: 'var(--green)' }}>Billed annually</div>}
                    </>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text3)' }}>
                      <span style={{ color: 'var(--green)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button onClick={() => handleSubscribe(key)}
                  disabled={key !== 'free' && key !== 'enterprise' && !STRIPE_CONFIGURED}
                  className="w-full py-3 rounded-lg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isHighlight
                      ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))'
                      : key === 'free'
                        ? 'linear-gradient(135deg, var(--green), var(--teal))'
                        : 'var(--bg3)',
                    color: key === 'enterprise' && !isHighlight ? 'var(--text)' : '#fff',
                    boxShadow: isHighlight ? 'var(--shadow-glow-blue)' : 'none',
                  }}>
                  {key !== 'free' && key !== 'enterprise' && !STRIPE_CONFIGURED
                    ? '🔒 Coming Soon'
                    : plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        {/* Feature Comparison */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-3 pr-4" style={{ color: 'var(--text3)' }}>Feature</th>
                  {planKeys.map(k => (
                    <th key={k} className="text-center py-3 px-4" style={{ color: 'var(--text)' }}>{PLANS[k].name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI Agents', '2', '10', 'Unlimited'],
                  ['Bots', '1', '5', 'Unlimited'],
                  ['AI Queries/Day', '100', '1,000', 'Unlimited'],
                  ['SSO', '—', '✓', '✓'],
                  ['White-label', '—', '—', '✓'],
                  ['Custom RKBAC™', '—', '—', '✓'],
                  ['API Access', '—', '✓', '✓'],
                  ['Support', 'Community', 'Email', 'Dedicated'],
                  ['SLA', '—', '—', '99.9%'],
                ].map(([feature, ...values]) => (
                  <tr key={feature} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 pr-4" style={{ color: 'var(--text3)' }}>{feature}</td>
                    {values.map((v, i) => (
                      <td key={i} className="text-center py-3 px-4"
                        style={{ color: v === '✓' ? 'var(--green)' : v === '—' ? 'var(--text4)' : 'var(--text)' }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-xs" style={{ color: 'var(--text4)' }}>© 2026 Milliebot Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
