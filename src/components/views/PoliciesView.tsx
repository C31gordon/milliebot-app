'use client'

import { useState } from 'react'

const departments = ['Operations', 'Marketing', 'HR', 'Finance', 'IT', 'Training', 'Maintenance']

const accessMatrix: Record<string, Record<string, 'allow' | 'deny' | 'owner_only' | 'read_only'>> = {
  Operations: { Operations: 'allow', Marketing: 'read_only', HR: 'deny', Finance: 'deny', IT: 'allow', Training: 'allow', Maintenance: 'allow' },
  Marketing: { Operations: 'deny', Marketing: 'allow', HR: 'deny', Finance: 'deny', IT: 'allow', Training: 'read_only', Maintenance: 'deny' },
  HR: { Operations: 'deny', Marketing: 'deny', HR: 'allow', Finance: 'owner_only', IT: 'allow', Training: 'read_only', Maintenance: 'deny' },
  Finance: { Operations: 'deny', Marketing: 'deny', HR: 'owner_only', Finance: 'allow', IT: 'allow', Training: 'deny', Maintenance: 'deny' },
  IT: { Operations: 'allow', Marketing: 'allow', HR: 'allow', Finance: 'allow', IT: 'allow', Training: 'allow', Maintenance: 'allow' },
  Training: { Operations: 'read_only', Marketing: 'deny', HR: 'deny', Finance: 'deny', IT: 'allow', Training: 'allow', Maintenance: 'read_only' },
  Maintenance: { Operations: 'read_only', Marketing: 'deny', HR: 'deny', Finance: 'deny', IT: 'allow', Training: 'read_only', Maintenance: 'allow' },
}

const cellConfig: Record<string, { label: string; bg: string; color: string }> = {
  allow: { label: '✅', bg: 'rgba(16,185,129,0.15)', color: 'var(--green-light)' },
  deny: { label: '❌', bg: 'rgba(239,68,68,0.1)', color: 'var(--red)' },
  owner_only: { label: '🔒', bg: 'rgba(245,158,11,0.15)', color: 'var(--orange)' },
  read_only: { label: '👁', bg: 'rgba(59,130,246,0.1)', color: 'var(--blue-light)' },
}

const policies = [
  { name: 'HR PII Isolation', desc: 'Employee PII never leaves HR department', type: 'deny', locked: true, active: true },
  { name: 'Finance Restricted', desc: 'Financial records require Owner approval for cross-dept access', type: 'owner_only', locked: true, active: true },
  { name: 'Ops SOPs Readable', desc: 'Operations SOPs readable by all departments', type: 'allow', locked: true, active: true },
  { name: 'Marketing No Ops Access', desc: 'Marketing assets do not flow to Operations', type: 'deny', locked: true, active: true },
]

const exceptions = [
  { policy: 'Marketing No Ops Access', grantedTo: 'Training Agent', reason: 'Needs marketing brand guide for onboarding materials', duration: '30 days', expires: 'Mar 27, 2026', status: 'approved' },
  { policy: 'HR PII Isolation', grantedTo: 'Ops Agent', reason: 'Annual performance review aggregation', duration: 'One-time', expires: 'After use', status: 'pending' },
]

const categories = [
  { name: 'Employee PII', sensitivity: 'restricted', desc: 'SSN, salary, disciplinary records' },
  { name: 'Financial Records', sensitivity: 'restricted', desc: 'NOI, budgets, board reports, investor data' },
  { name: 'Legal Documents', sensitivity: 'restricted', desc: 'Contracts, litigation, compliance' },
  { name: 'Resident Data', sensitivity: 'confidential', desc: 'Lease details, payment history, screening' },
  { name: 'Vendor Information', sensitivity: 'confidential', desc: 'Contracts, pricing, performance scores' },
  { name: 'Operational SOPs', sensitivity: 'internal', desc: 'Standard procedures, checklists, training' },
  { name: 'Marketing Assets', sensitivity: 'internal', desc: 'Brand guidelines, campaigns, collateral' },
  { name: 'Property Data', sensitivity: 'internal', desc: 'Unit mix, amenities, physical attributes' },
]

const sensitivityColors: Record<string, { bg: string; color: string }> = {
  restricted: { bg: 'rgba(239,68,68,0.15)', color: 'var(--red-light)' },
  confidential: { bg: 'rgba(245,158,11,0.15)', color: 'var(--orange-light)' },
  internal: { bg: 'rgba(59,130,246,0.15)', color: 'var(--blue-light)' },
  public: { bg: 'rgba(16,185,129,0.15)', color: 'var(--green-light)' },
}

export default function PoliciesView() {
  const [tab, setTab] = useState<'matrix' | 'policies' | 'exceptions' | 'categories'>('matrix')

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>RKBAC™ Policies</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Roles & Knowledge-Based Access Control — manage boundaries, exceptions, and data categories
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg text-sm font-bold"
          style={{ background: 'var(--blue)', color: '#fff' }}>
          + New Policy
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {([
          { id: 'matrix' as const, label: 'Access Matrix' },
          { id: 'policies' as const, label: 'Policies' },
          { id: 'exceptions' as const, label: 'Exceptions' },
          { id: 'categories' as const, label: 'Data Categories' },
        ]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === t.id ? 'var(--blue)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text3)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Access Matrix */}
      {tab === 'matrix' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Cross-Department Access Matrix</h2>
            <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--text4)' }}>
              <span>✅ Full Access</span>
              <span>👁 Read Only</span>
              <span>🔒 Owner Approval</span>
              <span>❌ Denied</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-[10px] font-bold" style={{ color: 'var(--text4)' }}>From ↓ / To →</th>
                  {departments.map((d) => (
                    <th key={d} className="px-3 py-2 text-[10px] font-bold text-center" style={{ color: 'var(--text4)' }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departments.map((from) => (
                  <tr key={from} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-3 py-2 text-xs font-semibold" style={{ color: 'var(--text2)' }}>{from}</td>
                    {departments.map((to) => {
                      const access = accessMatrix[from]?.[to] || 'deny'
                      const config = cellConfig[access]
                      return (
                        <td key={to} className="px-3 py-2 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm cursor-pointer transition-all hover:scale-110"
                            style={{ background: config.bg }}
                            title={`${from} → ${to}: ${access}`}>
                            {config.label}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Policies */}
      {tab === 'policies' && (
        <div className="space-y-3">
          {policies.map((p, i) => (
            <div key={i} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{p.locked ? '🔒' : '🔓'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{p.name}</span>
                    {p.locked && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--orange)' }}>
                        OWNER-LOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{p.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{
                    background: p.type === 'allow' ? 'rgba(16,185,129,0.15)' : p.type === 'deny' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: p.type === 'allow' ? 'var(--green-light)' : p.type === 'deny' ? 'var(--red-light)' : 'var(--orange-light)',
                  }}>
                  {p.type.toUpperCase()}
                </span>
                <span className={`status-dot ${p.active ? 'active' : ''}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exceptions */}
      {tab === 'exceptions' && (
        <div className="space-y-3">
          {exceptions.map((ex, i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Exception: {ex.policy}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: ex.status === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: ex.status === 'approved' ? 'var(--green-light)' : 'var(--orange-light)',
                      }}>
                      {ex.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Granted to: <strong>{ex.grantedTo}</strong></p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Reason: {ex.reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text2)' }}>{ex.duration}</div>
                  <div className="text-[10px] mt-1" style={{ color: ex.expires === 'After use' ? 'var(--text4)' : 'var(--orange)' }}>
                    Expires: {ex.expires}
                  </div>
                </div>
              </div>
              {ex.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'var(--green)', color: '#000' }}>Approve</button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'var(--red)', color: '#fff' }}>Deny</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Data Categories */}
      {tab === 'categories' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Category', 'Sensitivity', 'Description'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.name} className="transition-colors hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>{cat.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: sensitivityColors[cat.sensitivity].bg, color: sensitivityColors[cat.sensitivity].color }}>
                      {cat.sensitivity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text3)' }}>{cat.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
