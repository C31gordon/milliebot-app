'use client'

import { useState } from 'react'

const stats = [
  { label: 'Training Modules', value: '24', sub: 'Active in library', color: 'var(--blue)', icon: '📖' },
  { label: 'Completions This Month', value: '47', sub: '+12 from last month', color: 'var(--green)', icon: '✅' },
  { label: 'Avg Score', value: '86%', sub: 'Across all assessments', color: 'var(--purple)', icon: '🎯' },
  { label: 'Certs Expiring (30d)', value: '3', sub: 'Fair Housing (2), Safety (1)', color: 'var(--orange)', icon: '⚠️' },
]

const trainingModules = [
  { title: 'Fair Housing Fundamentals', type: 'Required' as const, duration: '45 min', completion: 94 },
  { title: 'Entrata Lease Execution', type: 'Required' as const, duration: '60 min', completion: 78 },
  { title: "Miya's Law Documentation", type: 'Required' as const, duration: '30 min', completion: 100 },
  { title: 'Work Order Triage & Priority', type: 'Required' as const, duration: '40 min', completion: 85 },
  { title: 'Resident Communication Best Practices', type: 'Recommended' as const, duration: '25 min', completion: 67 },
  { title: 'Emergency Maintenance Protocols', type: 'Required' as const, duration: '35 min', completion: 91 },
]

const competencyChecks = [
  {
    title: 'Lease Execution Accuracy',
    description: 'AI reviews first 5 leases for errors, flags discrepancies against template standards.',
    howItWorks: 'Automated comparison of executed leases against approved templates. Flags missing clauses, incorrect rates, and signature gaps.',
    employees: 3,
    employeeLabel: '3 employees pending review',
    lastRun: 'Feb 24, 2026',
    passRate: 82,
    icon: '📝',
  },
  {
    title: 'Tour Conversion Assessment',
    description: 'AI analyzes tour-to-application conversion rate vs property benchmark.',
    howItWorks: 'Tracks conversion funnel from scheduled tour → completed tour → application submitted. Compares against 30% benchmark.',
    employees: 5,
    employeeLabel: 'Active monitoring',
    lastRun: 'Feb 25, 2026',
    passRate: 74,
    icon: '🏠',
  },
  {
    title: 'Work Order Triage Accuracy',
    description: 'AI checks priority assignments against SLA rules for proper categorization.',
    howItWorks: 'Compares technician priority assignments against rule-based SLA matrix. Flags mismatches that could cause SLA violations.',
    employees: 4,
    employeeLabel: '2 flags this week',
    lastRun: 'Feb 25, 2026',
    passRate: 91,
    icon: '🔧',
  },
  {
    title: 'Fair Housing Scenario Response',
    description: 'AI-powered scenario quiz testing real-world Fair Housing compliance.',
    howItWorks: 'Presents realistic prospect scenarios (e.g., "A prospect asks about the demographic makeup of the neighborhood. How do you respond?") and evaluates responses.',
    employees: 8,
    employeeLabel: '8 employees due for recertification',
    lastRun: 'Feb 20, 2026',
    passRate: 88,
    icon: '⚖️',
  },
]

const typeBadge = (type: 'Required' | 'Recommended' | 'Optional') => {
  const map = {
    Required: { bg: 'rgba(239,68,68,0.15)', color: 'var(--red)' },
    Recommended: { bg: 'rgba(59,130,246,0.15)', color: 'var(--blue)' },
    Optional: { bg: 'rgba(107,114,128,0.15)', color: 'var(--text3)' },
  }
  const m = map[type]
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap" style={{ background: m.bg, color: m.color }}>
      {type}
    </span>
  )
}

export default function TrainingView() {
  const [activeTab, setActiveTab] = useState<'library' | 'competency'>('library')

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📚 Training & Competency</h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text3)' }}>
          Verify skills, not just completion — AI-powered competency assessment
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card-static p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: `color-mix(in srgb, ${s.color} 15%, transparent)`, color: s.color }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text4)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg3)' }}>
        {([['library', 'Training Library'], ['competency', 'Competency Checks']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{ background: activeTab === id ? 'var(--bg2)' : 'transparent', color: activeTab === id ? 'var(--text)' : 'var(--text3)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'library' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainingModules.map((mod) => (
            <div key={mod.title} className="glass-card-static p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold min-w-0" style={{ color: 'var(--text)' }}>{mod.title}</h3>
                {typeBadge(mod.type)}
              </div>
              <div className="flex items-center gap-3 text-[11px] mb-3" style={{ color: 'var(--text4)' }}>
                <span>⏱️ {mod.duration}</span>
                <span>📊 {mod.completion}% completion</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                  <div className="h-full rounded-full" style={{ width: `${mod.completion}%`, background: mod.completion === 100 ? 'var(--green)' : 'var(--blue)' }} />
                </div>
              </div>
              <button className="mt-auto text-[11px] px-3 py-1.5 rounded-md font-medium self-start" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue)' }}>
                Assign
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competencyChecks.map((check) => (
            <div key={check.title} className="glass-card-static p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl flex-shrink-0">{check.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{check.title}</h3>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text3)' }}>{check.description}</p>
                </div>
              </div>
              <div className="text-[11px] leading-relaxed p-3 rounded-lg mb-3" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                <span className="font-semibold" style={{ color: 'var(--text3)' }}>How it works:</span> {check.howItWorks}
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text4)' }}>
                  <span>👥 {check.employeeLabel}</span>
                  <span>📅 {check.lastRun}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium" style={{ color: check.passRate >= 85 ? 'var(--green)' : 'var(--orange)' }}>
                    {check.passRate}% pass rate
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
