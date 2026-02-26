'use client'

import { useState } from 'react'

const statusCards = [
  { label: 'Active Agents', value: '3', sub: 'Ops • Training • Maintenance', color: 'var(--blue)', icon: '🤖', trend: '+2 this week' },
  { label: 'Support Bots', value: '12', sub: '10 active, 2 configuring', color: 'var(--green)', icon: '⚙️', trend: '3 new today' },
  { label: 'Open Tickets', value: '7', sub: '2 urgent, 3 high, 2 medium', color: 'var(--orange)', icon: '🎫', trend: '↓ 12% from last week' },
  { label: 'Suggestions', value: '15', sub: '4 under review, 2 planned', color: 'var(--purple)', icon: '💡', trend: '3 new this week' },
]

const recentActivity = [
  { icon: '🤖', text: 'Ops Agent completed DLR generation for Bartram Park', time: '5 min ago', type: 'agent' },
  { icon: '🎫', text: 'Ticket #TKT-0012 created: "Laptop running slow" → IT', time: '12 min ago', type: 'ticket' },
  { icon: '🔒', text: 'Access exception approved: Marketing → Ops SOPs (30 days)', time: '45 min ago', type: 'security' },
  { icon: '💡', text: 'Suggestion #SUG-0015: "Add competitor rent comps" — 4 votes', time: '2 hours ago', type: 'suggestion' },
  { icon: '⚡', text: 'Workflow "Email Cleanup" ran successfully — 8 items processed', time: '3 hours ago', type: 'workflow' },
  { icon: '🛡️', text: 'Prompt injection attempt blocked — user: jsmith@risere.com', time: '4 hours ago', type: 'security' },
  { icon: '✅', text: 'Maintenance Bot resolved work order #WO-4421 (HVAC repair)', time: '5 hours ago', type: 'agent' },
]

const departmentHealth = [
  { name: 'Operations', agents: 1, bots: 4, status: 'active', memory: '2.4 GB', tickets: 2 },
  { name: 'Training', agents: 1, bots: 3, status: 'active', memory: '1.1 GB', tickets: 1 },
  { name: 'Maintenance', agents: 1, bots: 3, status: 'active', memory: '0.8 GB', tickets: 3 },
  { name: 'HR', agents: 0, bots: 0, status: 'pending', memory: '—', tickets: 0 },
  { name: 'Marketing', agents: 0, bots: 0, status: 'pending', memory: '—', tickets: 1 },
  { name: 'Finance', agents: 0, bots: 0, status: 'pending', memory: '—', tickets: 0 },
  { name: 'IT', agents: 0, bots: 0, status: 'pending', memory: '—', tickets: 0 },
]

const securityAlerts = [
  { level: 'warning', text: 'Access exception for Marketing → Ops expires in 7 days', action: 'Review' },
  { level: 'critical', text: '3 prompt injection attempts from jsmith@risere.com in 24 hours', action: 'Investigate' },
  { level: 'info', text: 'Weekly security audit completed — no issues found', action: 'View' },
]

export default function DashboardView() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Good evening, Courtney
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            RISE Real Estate — Owner Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: selectedPeriod === p ? 'var(--blue)' : 'var(--bg2)',
                color: selectedPeriod === p ? '#fff' : 'var(--text3)',
                border: selectedPeriod === p ? 'none' : '1px solid var(--border)',
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statusCards.map((card) => (
          <div key={card.label} className="glass-card p-5 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="status-dot active"></span>
            </div>
            <div className="text-3xl font-extrabold mb-1" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
              {card.label}
            </div>
            <div className="text-xs" style={{ color: 'var(--text4)' }}>
              {card.sub}
            </div>
            <div className="text-[10px] mt-2 font-medium" style={{ color: 'var(--text3)' }}>
              {card.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Activity — 2 cols */}
        <div className="col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Recent Activity</h2>
            <button className="text-xs font-medium" style={{ color: 'var(--blue)' }}>View all</button>
          </div>
          <div className="space-y-1">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-white/5 cursor-pointer">
                <span className="text-sm mt-0.5 flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text2)' }}>
                    {item.text}
                  </p>
                </div>
                <span className="text-[10px] flex-shrink-0 whitespace-nowrap" style={{ color: 'var(--text4)' }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Alerts — 1 col */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>🛡️ Security Alerts</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--red-light)' }}>
              1 critical
            </span>
          </div>
          <div className="space-y-2">
            {securityAlerts.map((alert, i) => (
              <div key={i} className="p-3 rounded-lg" style={{
                background: alert.level === 'critical' ? 'rgba(239,68,68,0.08)' :
                  alert.level === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.08)',
                border: `1px solid ${alert.level === 'critical' ? 'rgba(239,68,68,0.2)' :
                  alert.level === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`,
              }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text2)' }}>{alert.text}</p>
                <button className="text-[10px] font-bold px-2 py-1 rounded"
                  style={{
                    background: alert.level === 'critical' ? 'var(--red)' :
                      alert.level === 'warning' ? 'var(--orange)' : 'var(--blue)',
                    color: '#fff',
                  }}>
                  {alert.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Health */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Department Health</h2>
          <span className="text-xs" style={{ color: 'var(--text4)' }}>7 departments • 3 active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Department', 'Status', 'Agents', 'Bots', 'Memory', 'Open Tickets'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departmentHealth.map((dept) => (
                <tr key={dept.name} className="transition-colors hover:bg-white/5 cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-3 py-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>{dept.name}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: dept.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                        color: dept.status === 'active' ? 'var(--green-light)' : 'var(--text4)',
                      }}>
                      <span className={`status-dot ${dept.status === 'active' ? 'active' : ''}`}
                        style={{ width: '6px', height: '6px' }} />
                      {dept.status === 'active' ? 'Active' : 'Not Started'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm" style={{ color: dept.agents > 0 ? 'var(--text2)' : 'var(--text4)' }}>
                    {dept.agents}
                  </td>
                  <td className="px-3 py-3 text-sm" style={{ color: dept.bots > 0 ? 'var(--text2)' : 'var(--text4)' }}>
                    {dept.bots}
                  </td>
                  <td className="px-3 py-3 text-sm" style={{ color: 'var(--text3)' }}>{dept.memory}</td>
                  <td className="px-3 py-3 text-sm" style={{ color: dept.tickets > 0 ? 'var(--orange)' : 'var(--text4)' }}>
                    {dept.tickets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RKBAC Status Bar */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold" style={{ color: 'var(--text3)' }}>RKBAC™ Status</span>
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span className="status-dot active" />
            <span style={{ color: 'var(--green-light)' }}>All policies enforced</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: 'var(--text4)' }}>4 active policies</span>
          <span className="text-xs" style={{ color: 'var(--text4)' }}>1 active exception</span>
          <span className="text-xs" style={{ color: 'var(--text4)' }}>0 pending approvals</span>
        </div>
      </div>
    </div>
  )
}
