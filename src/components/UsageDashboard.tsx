'use client'
import { useState, useEffect, useCallback } from 'react'

interface UsageData {
  org: { id: string; name: string; plan: string }
  period: { start: string; end: string; days: number }
  summary: {
    totalQueries: number; totalInputTokens: number; totalOutputTokens: number
    totalCost: number; dailyAvgCost: number; projectedMonthlyCost: number
    costPerQuery: number; activeUsers: number; totalUsers: number
  }
  budget: {
    monthlyLimit: number; spent: number; remaining: number; pctUsed: number
    autoReload: boolean; reloadAmount: number; reloadThreshold: number; status: string
  } | null
  breakdown: {
    byModel: Record<string, { queries: number; inputTokens: number; outputTokens: number; cost: number }>
    byDay: { date: string; queries: number; cost: number }[]
    byUser: { userId: string; queries: number; cost: number }[]
  }
}

export default function UsageDashboard({ userId, orgId }: { userId: string; orgId?: string }) {
  const [data, setData] = useState<UsageData | null>(null)
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [budgetForm, setBudgetForm] = useState({ monthlyLimit: 50, dailyUserLimit: 100, autoReload: false, reloadAmount: 50, reloadThreshold: 20, modelLock: '' })
  const [saving, setSaving] = useState(false)

  const fetchUsage = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ userId, period })
      if (orgId) params.set('orgId', orgId)
      const res = await fetch(`/api/org/usage?${params}`)
      if (res.ok) {
        const d = await res.json()
        setData(d)
        if (d.budget) {
          setBudgetForm({
            monthlyLimit: d.budget.monthlyLimit || 50,
            dailyUserLimit: d.budget.dailyUserLimit || 100,
            autoReload: d.budget.autoReload || false,
            reloadAmount: d.budget.reloadAmount || 50,
            reloadThreshold: d.budget.reloadThreshold || 20,
            modelLock: d.budget.modelLock || '',
          })
        }
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [userId, orgId, period])

  useEffect(() => { fetchUsage() }, [fetchUsage])

  async function saveBudget() {
    setSaving(true)
    try {
      await fetch('/api/org/usage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orgId, ...budgetForm }),
      })
      await fetchUsage()
      setShowBudgetForm(false)
    } catch { /* silent */ }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-8"><div className="text-2xl animate-pulse">📊</div><p className="text-sm mt-2" style={{ color: 'var(--text3)' }}>Loading usage data...</p></div>

  if (!data) return <div className="text-center py-8 text-sm" style={{ color: 'var(--text3)' }}>No usage data available</div>

  const s = data.summary
  const b = data.budget
  const models = Object.entries(data.breakdown.byModel)
  const maxDayCost = Math.max(...data.breakdown.byDay.map(d => d.cost), 0.001)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text1)' }}>💰 Usage & Costs</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text3)' }}>{data.org.name} — {data.org.plan} plan</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7d', '30d', '90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: period === p ? 'linear-gradient(135deg, #559CB5, #7c3aed)' : 'var(--bg3)',
              color: period === p ? '#fff' : 'var(--text2)',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Spend', value: `$${s.totalCost.toFixed(4)}`, icon: '💵' },
          { label: 'Projected Monthly', value: `$${s.projectedMonthlyCost.toFixed(2)}`, icon: '📈' },
          { label: 'Total Queries', value: s.totalQueries.toLocaleString(), icon: '💬' },
          { label: 'Cost / Query', value: `$${s.costPerQuery.toFixed(5)}`, icon: '🎯' },
          { label: 'Active Users', value: `${s.activeUsers} / ${s.totalUsers}`, icon: '👥' },
          { label: 'Daily Avg', value: `$${s.dailyAvgCost.toFixed(4)}`, icon: '📊' },
        ].map((card, i) => (
          <div key={i} style={{ background: 'var(--bg2)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{card.icon}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text1)', marginTop: 4 }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Budget Status */}
      {b && (
        <div style={{ background: b.status === 'exceeded' ? '#dc262615' : b.status === 'warning' ? '#f59e0b15' : '#22c55e15', borderRadius: 12, padding: 16, border: `1px solid ${b.status === 'exceeded' ? '#dc2626' : b.status === 'warning' ? '#f59e0b' : '#22c55e'}40` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text1)' }}>
              {b.status === 'exceeded' ? '🔴 Budget Exceeded' : b.status === 'warning' ? '🟡 Budget Warning' : '🟢 Budget On Track'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>${b.spent.toFixed(2)} / ${b.monthlyLimit.toFixed(2)}</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(b.pctUsed, 100)}%`, borderRadius: 4, background: b.status === 'exceeded' ? '#dc2626' : b.status === 'warning' ? '#f59e0b' : '#22c55e', transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text3)' }}>
            <span>{b.pctUsed.toFixed(1)}% used</span>
            <span>{b.autoReload ? `Auto-reload $${b.reloadAmount} at ${b.reloadThreshold}% remaining` : 'No auto-reload'}</span>
          </div>
        </div>
      )}

      {/* Budget Controls */}
      <div>
        <button onClick={() => setShowBudgetForm(!showBudgetForm)} style={{
          padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #559CB5, #7c3aed)', color: '#fff',
        }}>⚙️ {b ? 'Edit' : 'Set'} Budget & Limits</button>
        
        {showBudgetForm && (
          <div style={{ marginTop: 12, background: 'var(--bg2)', borderRadius: 12, padding: 20, border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Monthly Budget ($)</label>
              <input type="number" value={budgetForm.monthlyLimit} onChange={e => setBudgetForm({ ...budgetForm, monthlyLimit: +e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg1)', color: 'var(--text1)', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Daily Limit Per User (messages)</label>
              <input type="number" value={budgetForm.dailyUserLimit} onChange={e => setBudgetForm({ ...budgetForm, dailyUserLimit: +e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg1)', color: 'var(--text1)', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Model Lock (empty = user choice)</label>
              <select value={budgetForm.modelLock} onChange={e => setBudgetForm({ ...budgetForm, modelLock: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg1)', color: 'var(--text1)', fontSize: 14 }}>
                <option value="">No lock — users choose</option>
                <option value="llama-4-maverick">🟢 Llama 4 Maverick (¢ cheapest)</option>
                <option value="deepseek-v3">🟢 DeepSeek V3 (¢)</option>
                <option value="gpt-4.1-mini">🟡 GPT-4.1 Mini ($)</option>
                <option value="claude-4-haiku">🟡 Claude 4 Haiku ($)</option>
                <option value="gpt-4.1">🟠 GPT-4.1 ($$)</option>
                <option value="claude-4-sonnet">🔴 Claude 4 Sonnet ($$$)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Auto-Reload</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={budgetForm.autoReload} onChange={e => setBudgetForm({ ...budgetForm, autoReload: e.target.checked })} />
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>Enable auto-reload when {budgetForm.reloadThreshold}% remaining</span>
              </label>
              {budgetForm.autoReload && (
                <input type="number" value={budgetForm.reloadAmount} onChange={e => setBudgetForm({ ...budgetForm, reloadAmount: +e.target.value })}
                  placeholder="Reload amount ($)" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg1)', color: 'var(--text1)', fontSize: 14 }} />
              )}
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
              <button onClick={saveBudget} disabled={saving} style={{
                padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', opacity: saving ? 0.6 : 1,
              }}>{saving ? 'Saving...' : '✅ Save Budget Settings'}</button>
              <button onClick={() => setShowBudgetForm(false)} style={{
                padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: 'var(--bg3)', color: 'var(--text2)',
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Cost by Model */}
      {models.length > 0 && (
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', marginBottom: 8 }}>Cost by Model</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {models.sort(([,a], [,b]) => b.cost - a.cost).map(([model, info]) => (
              <div key={model} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', minWidth: 160 }}>{model}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{info.queries} queries</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{(info.inputTokens / 1000).toFixed(1)}K in / {(info.outputTokens / 1000).toFixed(1)}K out</span>
                <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: info.cost > 1 ? '#dc2626' : info.cost > 0.1 ? '#f59e0b' : '#22c55e' }}>${info.cost.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Cost Chart (simple bar chart) */}
      {data.breakdown.byDay.length > 0 && (
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', marginBottom: 8 }}>Daily Usage</h4>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120, padding: '0 4px' }}>
            {data.breakdown.byDay.slice(-30).map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div title={`${day.date}: ${day.queries} queries, $${day.cost.toFixed(4)}`} style={{
                  width: '100%', maxWidth: 24, borderRadius: '4px 4px 0 0',
                  height: `${Math.max(4, (day.cost / maxDayCost) * 100)}%`,
                  background: 'linear-gradient(to top, #559CB5, #7c3aed)',
                  cursor: 'pointer',
                }} />
                {data.breakdown.byDay.length <= 14 && (
                  <span style={{ fontSize: 9, color: 'var(--text3)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{day.date.slice(5)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {s.totalQueries === 0 && (
        <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text1)' }}>No usage yet</p>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>Chat queries will show up here as your team starts using Zynthr</p>
        </div>
      )}
    </div>
  )
}
