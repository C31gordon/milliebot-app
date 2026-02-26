'use client'

import { useState } from 'react'

type PolicyTier = 'owner' | 'department_head' | 'manager' | 'specialist'
type PolicyStatus = 'active' | 'draft' | 'disabled'
type ExceptionStatus = 'active' | 'pending' | 'expired' | 'denied'
type ExceptionDuration = 'one-time' | '30-days' | '60-days' | '90-days' | 'custom' | 'permanent'

interface Policy {
  id: string
  name: string
  description: string
  tier: PolicyTier
  layer: 'immutable' | 'sandboxed'
  status: PolicyStatus
  department: string | 'All'
  rules: string[]
  createdBy: string
  lastModified: string
  exceptions: number
}

interface ExceptionWaiver {
  id: string
  policyId: string
  policyName: string
  requestedBy: string
  department: string
  reason: string
  duration: ExceptionDuration
  expiresAt: string
  status: ExceptionStatus
  approvedBy: string | null
  requestedAt: string
  riskLevel: 'low' | 'medium' | 'high'
}

const policies: Policy[] = [
  {
    id: 'POL-001',
    name: 'Financial Data Access',
    description: 'Controls who can view and export financial reports, budgets, and revenue data',
    tier: 'owner',
    layer: 'immutable',
    status: 'active',
    department: 'All',
    rules: [
      'Only Owner and Finance department heads can access full financial data',
      'Property managers see only their property financial summaries',
      'No bulk export without Owner approval',
      'AI agents must double-verify all financial figures before presenting',
    ],
    createdBy: 'Courtney Gordon',
    lastModified: '2 days ago',
    exceptions: 1,
  },
  {
    id: 'POL-002',
    name: 'Employee Records Privacy',
    description: 'Protects access to personal employee information, compensation, and performance data',
    tier: 'owner',
    layer: 'immutable',
    status: 'active',
    department: 'All',
    rules: [
      'HR department head + Owner only for compensation data',
      'Managers see direct reports performance summaries only',
      'No cross-department employee data access',
      'SSN and banking info: Owner-only with MFA verification',
    ],
    createdBy: 'Courtney Gordon',
    lastModified: '1 week ago',
    exceptions: 0,
  },
  {
    id: 'POL-003',
    name: 'Operations SOP Sharing',
    description: 'Controls visibility of standard operating procedures across departments',
    tier: 'department_head',
    layer: 'sandboxed',
    status: 'active',
    department: 'Operations',
    rules: [
      'All Ops staff can view SOPs within their department',
      'Cross-department access requires exception waiver',
      'External sharing requires Owner approval',
      'SOPs tagged "confidential" are department-head-only',
    ],
    createdBy: 'Courtney Gordon',
    lastModified: '3 days ago',
    exceptions: 2,
  },
  {
    id: 'POL-004',
    name: 'Training Content Distribution',
    description: 'Rules for who can create, edit, and distribute training materials',
    tier: 'department_head',
    layer: 'sandboxed',
    status: 'active',
    department: 'Training',
    rules: [
      'Training department creates and manages all content',
      'Department heads can request custom training modules',
      'Managers can assign training to their teams',
      'Completion data visible to direct manager + HR',
    ],
    createdBy: 'Mona Vogele',
    lastModified: '5 days ago',
    exceptions: 0,
  },
  {
    id: 'POL-005',
    name: 'Maintenance Work Order Visibility',
    description: 'Controls access to work orders, vendor info, and maintenance budgets',
    tier: 'manager',
    layer: 'sandboxed',
    status: 'active',
    department: 'Maintenance',
    rules: [
      'Maintenance staff see work orders for assigned properties',
      'Supervisors see all work orders in their region',
      'Vendor contract details: department head + Finance only',
      'Emergency work orders visible to all on-call staff',
    ],
    createdBy: 'Chris Jackson',
    lastModified: '1 day ago',
    exceptions: 1,
  },
  {
    id: 'POL-006',
    name: 'AI Agent Memory Boundaries',
    description: 'Defines what information AI agents can store, recall, and share across departments',
    tier: 'owner',
    layer: 'immutable',
    status: 'active',
    department: 'All',
    rules: [
      'Agent memory flows UP freely (subordinate → manager → owner)',
      'Memory flows DOWN only with explicit permission grant',
      'No cross-department memory sharing without policy exception',
      'PII must be redacted from agent long-term memory',
      'Owner can audit any agent memory at any time',
    ],
    createdBy: 'Courtney Gordon',
    lastModified: '2 days ago',
    exceptions: 0,
  },
]

const exceptions: ExceptionWaiver[] = [
  {
    id: 'EXC-001',
    policyId: 'POL-001',
    policyName: 'Financial Data Access',
    requestedBy: 'Sarah Chen',
    department: 'Marketing',
    reason: 'Need revenue data for Q1 marketing ROI report to present at leadership meeting',
    duration: '30-days',
    expiresAt: 'Mar 25, 2026',
    status: 'active',
    approvedBy: 'Courtney Gordon',
    requestedAt: 'Feb 23, 2026',
    riskLevel: 'medium',
  },
  {
    id: 'EXC-002',
    policyId: 'POL-003',
    policyName: 'Operations SOP Sharing',
    requestedBy: 'Mona Vogele',
    department: 'Training',
    reason: 'Building new-hire training module that references move-in/move-out SOPs',
    duration: '60-days',
    expiresAt: 'Apr 24, 2026',
    status: 'active',
    approvedBy: 'Courtney Gordon',
    requestedAt: 'Feb 22, 2026',
    riskLevel: 'low',
  },
  {
    id: 'EXC-003',
    policyId: 'POL-003',
    policyName: 'Operations SOP Sharing',
    requestedBy: 'Brett Johnson',
    department: 'HR',
    reason: 'Need lease renewal process docs for HR compliance audit',
    duration: 'one-time',
    expiresAt: 'One-time access',
    status: 'pending',
    approvedBy: null,
    requestedAt: 'Feb 25, 2026',
    riskLevel: 'low',
  },
  {
    id: 'EXC-004',
    policyId: 'POL-005',
    policyName: 'Maintenance Work Order Visibility',
    requestedBy: 'David Park',
    department: 'Finance',
    reason: 'Vendor invoice reconciliation requires access to completed work orders',
    duration: '90-days',
    expiresAt: 'May 24, 2026',
    status: 'active',
    approvedBy: 'Courtney Gordon',
    requestedAt: 'Feb 20, 2026',
    riskLevel: 'medium',
  },
]

const tierColors: Record<PolicyTier, string> = {
  owner: 'var(--red)',
  department_head: 'var(--orange)',
  manager: 'var(--blue)',
  specialist: 'var(--text4)',
}

const tierLabels: Record<PolicyTier, string> = {
  owner: 'Owner',
  department_head: 'Department Head',
  manager: 'Manager',
  specialist: 'Specialist',
}

const riskColors: Record<string, string> = {
  low: 'var(--green)',
  medium: 'var(--orange)',
  high: 'var(--red)',
}

export default function PoliciesView() {
  const [tab, setTab] = useState<'policies' | 'exceptions'>('policies')
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const pendingExceptions = exceptions.filter(e => e.status === 'pending').length

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Access Policies</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Manage who can see what — roles, knowledge boundaries, and exception waivers
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--blue)', color: 'white' }}
        >
          + New Policy
        </button>
      </div>

      {/* RKBAC Overview Bar */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>
            RKBAC™ Permission Hierarchy
          </span>
          <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full" style={{ background: 'var(--green)22', color: 'var(--green)' }}>
            All Systems Normal
          </span>
        </div>
        <div className="flex items-center gap-2">
          {(['owner', 'department_head', 'manager', 'specialist'] as PolicyTier[]).map((tier, i) => (
            <div key={tier} className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-lg text-center" style={{
                background: `${tierColors[tier]}15`,
                border: `1px solid ${tierColors[tier]}40`,
                minWidth: '170px',
              }}>
                <div className="text-xs font-medium" style={{ color: tierColors[tier] }}>
                  {tierLabels[tier]}
                </div>
                <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text4)' }}>
                  {tier === 'owner' ? 'Full access • Immutable rules' :
                   tier === 'department_head' ? 'Department scope • Sandboxed' :
                   tier === 'manager' ? 'Team scope • Restricted' :
                   'Task scope • Read-only default'}
                </div>
              </div>
              {i < 3 && <span style={{ color: 'var(--text4)' }}>→</span>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[11px]" style={{ color: 'var(--text4)' }}>
          <span>🔒 Immutable: Only Owner can create/modify</span>
          <span>📦 Sandboxed: Department heads can customize within Owner boundaries</span>
          <span>↕️ Memory flows UP freely, DOWN with permission</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg2)' }}>
        <button
          onClick={() => setTab('policies')}
          className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all"
          style={{
            background: tab === 'policies' ? 'var(--bg3)' : 'transparent',
            color: tab === 'policies' ? 'var(--text)' : 'var(--text4)',
          }}
        >
          Policies ({policies.length})
        </button>
        <button
          onClick={() => setTab('exceptions')}
          className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all relative"
          style={{
            background: tab === 'exceptions' ? 'var(--bg3)' : 'transparent',
            color: tab === 'exceptions' ? 'var(--text)' : 'var(--text4)',
          }}
        >
          Exception Waivers ({exceptions.length})
          {pendingExceptions > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: 'var(--orange)', color: 'white' }}>
              {pendingExceptions}
            </span>
          )}
        </button>
      </div>

      {/* Policies Tab */}
      {tab === 'policies' && (
        <div className="space-y-3">
          {policies.map(policy => (
            <div key={policy.id} className="glass-card rounded-xl overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:opacity-90 transition-all"
                onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${tierColors[policy.tier]}15` }}>
                      <span style={{ color: tierColors[policy.tier] }}>
                        {policy.layer === 'immutable' ? '🔒' : '📦'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: 'var(--text)' }}>{policy.name}</span>
                        <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full"
                          style={{ background: `${tierColors[policy.tier]}22`, color: tierColors[policy.tier] }}>
                          {tierLabels[policy.tier]}
                        </span>
                        <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
                          {policy.layer === 'immutable' ? '🔒 Immutable' : '📦 Sandboxed'}
                        </span>
                        {policy.department !== 'All' && (
                          <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full"
                            style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                            {policy.department}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{policy.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {policy.exceptions > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full"
                        style={{ background: 'var(--orange)15', color: 'var(--orange)' }}>
                        {policy.exceptions} exception{policy.exceptions > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text4)' }}>
                      Modified {policy.lastModified}
                    </span>
                    <span style={{ color: 'var(--text4)', transform: expandedPolicy === policy.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {expandedPolicy === policy.id && (
                <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="pt-3 space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text3)' }}>Rules</span>
                    {policy.rules.map((rule, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5 px-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                        <span className="text-xs mt-0.5" style={{ color: tierColors[policy.tier] }}>•</span>
                        <span className="text-sm" style={{ color: 'var(--text2)' }}>{rule}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {policy.layer !== 'immutable' && (
                      <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--blue)22', color: 'var(--blue)' }}>
                        ✏️ Edit Rules
                      </button>
                    )}
                    <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                      📜 View History
                    </button>
                    {policy.layer === 'immutable' && (
                      <span className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text4)' }}>
                        🔒 Only the Owner can modify immutable policies
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Exceptions Tab */}
      {tab === 'exceptions' && (
        <div className="space-y-3">
          {exceptions.map(exc => (
            <div key={exc.id} className="glass-card p-4 rounded-xl" style={{
              borderLeft: `3px solid ${exc.status === 'pending' ? 'var(--orange)' : exc.status === 'active' ? 'var(--green)' : 'var(--text4)'}`,
            }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                      {exc.requestedBy}
                    </span>
                    <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                      {exc.department}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text4)' }}>→</span>
                    <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                      {exc.policyName}
                    </span>
                  </div>
                  <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--text2)' }}>{exc.reason}</p>
                  <div className="flex items-center gap-2 flex-wrap text-[11px]" style={{ color: 'var(--text4)' }}>
                    <span>📅 Requested: {exc.requestedAt}</span>
                    <span>⏱ Duration: {exc.duration}</span>
                    <span>📆 Expires: {exc.expiresAt}</span>
                    <span style={{ color: riskColors[exc.riskLevel] }}>
                      ● Risk: {exc.riskLevel.charAt(0).toUpperCase() + exc.riskLevel.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {exc.status === 'pending' ? (
                    <>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'var(--green)22', color: 'var(--green)' }}>
                        ✅ Approve
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'var(--red)15', color: 'var(--red)' }}>
                        ❌ Deny
                      </button>
                    </>
                  ) : (
                    <span className="text-xs px-3 py-1.5 rounded-full"
                      style={{
                        background: exc.status === 'active' ? 'var(--green)22' : 'var(--text4)22',
                        color: exc.status === 'active' ? 'var(--green)' : 'var(--text4)',
                      }}>
                      {exc.status === 'active' ? '✅ Approved' : exc.status === 'expired' ? '⏰ Expired' : '❌ Denied'}
                    </span>
                  )}
                </div>
              </div>
              {exc.approvedBy && (
                <div className="text-[11px] mt-2" style={{ color: 'var(--text4)' }}>
                  Approved by {exc.approvedBy}
                </div>
              )}
            </div>
          ))}

          {/* Permanent Exception Warning */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--orange)08', border: '1px dashed var(--orange)40' }}>
            <div className="flex items-start gap-2">
              <span>⚠️</span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--orange)' }}>About Permanent Exceptions</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  Permanent (&quot;never expire&quot;) exceptions require Owner approval and trigger a confirmation warning.
                  All other exceptions have mandatory expiration dates. Expired exceptions automatically revoke access.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
