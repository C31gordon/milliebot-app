'use client'

import { useState } from 'react'

const stats = [
  { label: 'Active Pathways', value: '3', sub: 'Leasing Agent, Maintenance, Asst Manager', color: 'var(--blue)', icon: '🛤️' },
  { label: 'Employees In Progress', value: '12', sub: 'Across all pathways', color: 'var(--green)', icon: '👥' },
  { label: 'Completion Rate', value: '78%', sub: 'Last 90 days', color: 'var(--purple)', icon: '📈' },
  { label: 'Avg Time to Competency', value: '18 days', sub: 'Target: 21 days', color: 'var(--gold)', icon: '⏱️' },
]

interface PathwayStep {
  name: string
  timeline: string
  status: 'complete' | 'in-progress' | 'locked' | 'pending'
  requires?: string
  detail?: string
  isGate?: boolean
  gateBlocks?: string[]
  gatePrereqs?: { label: string; met: boolean }[]
}

interface PathwayEmployee {
  name: string
  day: number
  status: 'on-track' | 'behind' | 'blocked'
  note?: string
}

interface Pathway {
  title: string
  steps: PathwayStep[]
  employees: PathwayEmployee[]
  progress: number
}

const pathways: Pathway[] = [
  {
    title: 'New Leasing Agent — 30 Day Onboarding',
    progress: 50,
    steps: [
      { name: 'Company Orientation', timeline: 'Day 1', status: 'complete' },
      { name: 'Fair Housing Certification', timeline: 'Day 1-3', status: 'complete' },
      { name: 'Entrata System Training', timeline: 'Day 2-5', status: 'complete' },
      { name: 'Shadow 3 Live Tours', timeline: 'Day 3-7', status: 'complete', requires: 'Step 2' },
      { name: 'Conduct 3 Observed Tours', timeline: 'Day 7-14', status: 'in-progress', requires: 'Step 4', detail: '1/3 completed' },
      { name: 'Guardian Gate: Lease Execution Clearance', timeline: '', status: 'locked', requires: 'Steps 2, 4, 5 + Manager Sign-off', isGate: true, gateBlocks: ['Independent lease execution', 'Access to lease templates', 'Resident move-in processing'], gatePrereqs: [{ label: 'Fair Housing Certification', met: true }, { label: 'Shadow 3 Live Tours', met: true }, { label: 'Conduct 3 Observed Tours', met: false }, { label: 'Manager Sign-off', met: false }] },
      { name: 'Independent Leasing', timeline: 'Day 14-21', status: 'pending', requires: 'Step 6' },
      { name: '30-Day Competency Review', timeline: 'Day 30', status: 'pending', requires: 'All previous' },
    ],
    employees: [
      { name: 'Sarah Mitchell', day: 12, status: 'on-track' },
      { name: 'James Rodriguez', day: 8, status: 'behind', note: 'Stuck on Step 5' },
      { name: 'Aisha Patel', day: 3, status: 'on-track' },
    ],
  },
  {
    title: 'Maintenance Technician Onboarding',
    progress: 35,
    steps: [
      { name: 'Safety Orientation', timeline: 'Day 1', status: 'complete' },
      { name: 'Tool & Equipment Check', timeline: 'Day 1-2', status: 'complete' },
      { name: 'Work Order System Training', timeline: 'Day 2-5', status: 'in-progress' },
      { name: 'Shadow 5 Work Orders', timeline: 'Day 5-10', status: 'pending', requires: 'Step 3' },
      { name: 'Guardian Gate: Solo Work Order Clearance', timeline: '', status: 'locked', requires: 'Steps 1-4 + Supervisor Sign-off', isGate: true, gateBlocks: ['Solo work order execution', 'After-hours on-call eligibility'], gatePrereqs: [{ label: 'Safety Orientation', met: true }, { label: 'Tool & Equipment Check', met: true }, { label: 'Work Order System Training', met: false }, { label: 'Shadow 5 Work Orders', met: false }, { label: 'Supervisor Sign-off', met: false }] },
      { name: '30-Day Review', timeline: 'Day 30', status: 'pending', requires: 'Step 5' },
    ],
    employees: [
      { name: 'Marcus Thompson', day: 5, status: 'on-track' },
      { name: 'David Chen', day: 2, status: 'on-track' },
    ],
  },
  {
    title: 'Assistant Manager Fast Track',
    progress: 28,
    steps: [
      { name: 'Management Orientation & Systems Access', timeline: 'Day 1-2', status: 'complete' },
      { name: 'Financial Systems Training (Yardi/Entrata)', timeline: 'Day 2-5', status: 'complete' },
      { name: 'Vendor Management & Procurement', timeline: 'Day 5-8', status: 'in-progress' },
      { name: 'Lease Audit Training', timeline: 'Day 8-12', status: 'pending', requires: 'Step 2' },
      { name: 'Resident Escalation Protocols', timeline: 'Day 10-14', status: 'pending', requires: 'Step 3' },
      { name: 'Guardian Gate: Financial Authorization Clearance', timeline: '', status: 'locked', requires: 'Steps 1-5 + Director Sign-off', isGate: true, gateBlocks: ['Invoice approval up to $5,000', 'Vendor payment authorization', 'Budget variance reporting'], gatePrereqs: [{ label: 'Financial Systems Training', met: true }, { label: 'Vendor Management', met: false }, { label: 'Lease Audit Training', met: false }, { label: 'Resident Escalation Protocols', met: false }, { label: 'Director Sign-off', met: false }] },
      { name: '30-Day Competency Review', timeline: 'Day 30', status: 'pending', requires: 'Step 6' },
    ],
    employees: [
      { name: 'Rachel Kim', day: 6, status: 'on-track' },
    ],
  },
]

const allEmployees = [
  { name: 'Sarah Mitchell', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 62, currentStep: 'Conduct 3 Observed Tours', status: 'on-track' as const, daysIn: 12 },
  { name: 'James Rodriguez', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 50, currentStep: 'Conduct 3 Observed Tours', status: 'behind' as const, daysIn: 8 },
  { name: 'Aisha Patel', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 25, currentStep: 'Fair Housing Certification', status: 'on-track' as const, daysIn: 3 },
  { name: 'Marcus Thompson', role: 'Maintenance Tech', pathway: 'Maintenance Tech', progress: 40, currentStep: 'Work Order System Training', status: 'on-track' as const, daysIn: 5 },
  { name: 'David Chen', role: 'Maintenance Tech', pathway: 'Maintenance Tech', progress: 20, currentStep: 'Tool & Equipment Check', status: 'on-track' as const, daysIn: 2 },
  { name: 'Rachel Kim', role: 'Asst Manager', pathway: 'Asst Manager Fast Track', progress: 28, currentStep: 'Vendor Management', status: 'on-track' as const, daysIn: 6 },
  { name: 'Tyler Brooks', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 100, currentStep: 'Complete', status: 'complete' as const, daysIn: 28 },
  { name: 'Maria Santos', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 75, currentStep: 'Independent Leasing', status: 'on-track' as const, daysIn: 18 },
  { name: 'Kevin Wright', role: 'Maintenance Tech', pathway: 'Maintenance Tech', progress: 100, currentStep: 'Complete', status: 'complete' as const, daysIn: 26 },
  { name: 'Lisa Nguyen', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 50, currentStep: 'Guardian Gate', status: 'blocked' as const, daysIn: 15 },
  { name: 'Chris Johnson', role: 'Maintenance Tech', pathway: 'Maintenance Tech', progress: 65, currentStep: 'Shadow 5 Work Orders', status: 'behind' as const, daysIn: 12 },
  { name: 'Amanda Foster', role: 'Leasing Agent', pathway: 'Leasing Agent 30-Day', progress: 38, currentStep: 'Shadow 3 Live Tours', status: 'on-track' as const, daysIn: 5 },
]

const statusIcon = (s: PathwayStep['status']) => {
  switch (s) {
    case 'complete': return '✅'
    case 'in-progress': return '🔵'
    case 'locked': return '🔒'
    case 'pending': return '⏳'
  }
}

const statusBadge = (s: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    'on-track': { bg: 'rgba(34,197,94,0.15)', color: 'var(--green)', label: 'On Track' },
    'behind': { bg: 'rgba(249,115,22,0.15)', color: 'var(--orange)', label: 'Behind' },
    'blocked': { bg: 'rgba(239,68,68,0.15)', color: 'var(--red)', label: 'Blocked' },
    'complete': { bg: 'rgba(59,130,246,0.15)', color: 'var(--blue)', label: 'Complete' },
  }
  const m = map[s] || map['on-track']
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap" style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  )
}

export default function OnboardingView() {
  const [expandedPathway, setExpandedPathway] = useState<number>(0)
  const [expandedGate, setExpandedGate] = useState<string | null>(null)

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🎓 Onboarding & Training</h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text3)' }}>
          Digital adoption pathways — track, enforce, and verify employee competency
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

      {/* Pathway Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Onboarding Pathways</h2>
        {pathways.map((p, pi) => {
          const isExpanded = expandedPathway === pi
          return (
            <div key={pi} className="glass-card-static overflow-hidden">
              {/* Pathway Header */}
              <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setExpandedPathway(isExpanded ? -1 : pi)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.title}</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue)' }}>
                      {p.employees.length} assigned
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: 'var(--blue)' }} />
                    </div>
                    <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: 'var(--text3)' }}>{p.progress}%</span>
                  </div>
                </div>
                <span className="ml-3 text-sm flex-shrink-0" style={{ color: 'var(--text3)' }}>{isExpanded ? '▾' : '▸'}</span>
              </button>

              {isExpanded && (
                <div className="border-t px-4 pb-4" style={{ borderColor: 'var(--border)' }}>
                  {/* Steps */}
                  <div className="mt-4 space-y-2">
                    {p.steps.map((step, si) => (
                      <div key={si}>
                        <div className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ background: step.isGate ? 'rgba(249,115,22,0.08)' : 'transparent' }}>
                          <span className="flex-shrink-0 mt-0.5">{statusIcon(step.status)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium" style={{ color: step.status === 'complete' ? 'var(--text3)' : 'var(--text)' }}>
                                {si + 1}. {step.name}
                              </span>
                              {step.timeline && (
                                <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text4)' }}>({step.timeline})</span>
                              )}
                              {step.isGate && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--orange)' }}>Guardian Gate</span>
                              )}
                            </div>
                            {step.requires && (
                              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text4)' }}>Requires: {step.requires}</div>
                            )}
                            {step.detail && (
                              <div className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--blue)' }}>{step.detail}</div>
                            )}
                          </div>
                          {step.isGate && (
                            <button className="flex-shrink-0 text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'var(--bg3)', color: 'var(--text3)' }} onClick={() => setExpandedGate(expandedGate === `${pi}-${si}` ? null : `${pi}-${si}`)}>
                              {expandedGate === `${pi}-${si}` ? 'Hide' : 'Details'}
                            </button>
                          )}
                        </div>
                        {/* Gate Detail Panel */}
                        {step.isGate && expandedGate === `${pi}-${si}` && (
                          <div className="ml-9 mt-2 p-4 rounded-lg" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">🔒</span>
                              <span className="text-sm font-semibold" style={{ color: 'var(--orange)' }}>Guardian Gate — {step.status === 'locked' ? 'LOCKED' : 'UNLOCKED'}</span>
                            </div>
                            <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text2)' }}>Prerequisites:</div>
                            <div className="space-y-1 mb-3">
                              {step.gatePrereqs?.map((pr, pri) => (
                                <div key={pri} className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text3)' }}>
                                  <span>{pr.met ? '✅' : '❌'}</span>
                                  <span>{pr.label}</span>
                                </div>
                              ))}
                            </div>
                            <div className="text-[11px] mb-1" style={{ color: 'var(--text2)' }}>
                              <span className="font-semibold">This gate blocks:</span>
                            </div>
                            <ul className="list-disc list-inside text-[11px] mb-3 space-y-0.5" style={{ color: 'var(--text3)' }}>
                              {step.gateBlocks?.map((b, bi) => <li key={bi}>{b}</li>)}
                            </ul>
                            <div className="text-[11px] px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}>
                              🛡️ Override requires: Department Head approval
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Assigned Employees */}
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text2)' }}>Assigned Employees</div>
                    <div className="space-y-2">
                      {p.employees.map((emp, ei) => (
                        <div key={ei} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--bg3)' }}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: '#fff' }}>
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{emp.name}</div>
                              <div className="text-[11px]" style={{ color: 'var(--text4)' }}>Day {emp.day}{emp.note ? ` • ${emp.note}` : ''}</div>
                            </div>
                          </div>
                          {statusBadge(emp.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Employee Progress Table */}
      <div className="glass-card-static overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Employee Progress</h2>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text4)' }}>All employees across active onboarding pathways</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Employee', 'Role', 'Pathway', 'Progress', 'Current Step', 'Status', 'Days In', 'Action'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allEmployees.map((emp, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{emp.name}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)' }}>{emp.role}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)' }}>{emp.pathway}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                        <div className="h-full rounded-full" style={{ width: `${emp.progress}%`, background: emp.progress === 100 ? 'var(--green)' : 'var(--blue)' }} />
                      </div>
                      <span className="text-[11px]" style={{ color: 'var(--text4)' }}>{emp.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)' }}>{emp.currentStep}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{statusBadge(emp.status)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--text3)' }}>{emp.daysIn}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue)' }}>View</button>
                      <button className="text-[11px] px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--orange)' }}>Nudge</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
