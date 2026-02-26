'use client'

import { useState } from 'react'

type EventType = 'auth' | 'data_access' | 'policy_change' | 'agent_action' | 'security' | 'workflow' | 'exception' | 'system'
type Severity = 'info' | 'warning' | 'critical'

interface AuditEntry {
  id: string
  timestamp: string
  eventType: EventType
  severity: Severity
  actor: string
  actorType: 'user' | 'agent' | 'bot' | 'system'
  department: string
  action: string
  details: string
  resource: string
  ipAddress: string
}

const auditLog: AuditEntry[] = [
  {
    id: 'AUD-001', timestamp: '2026-02-25 11:42 PM', eventType: 'security', severity: 'critical',
    actor: 'jsmith@risere.com', actorType: 'user', department: 'Operations',
    action: 'Prompt injection attempt blocked',
    details: 'User attempted to override agent instructions via chat input. Input sanitized and blocked.',
    resource: 'Ops Agent / Chat', ipAddress: '10.0.1.45',
  },
  {
    id: 'AUD-002', timestamp: '2026-02-25 11:38 PM', eventType: 'agent_action', severity: 'info',
    actor: 'Ops Agent', actorType: 'agent', department: 'Operations',
    action: 'DLR report generated',
    details: 'Daily Leasing Report for Bartram Park (Feb 25) generated and deployed to GitHub Pages.',
    resource: 'DLR / Bartram Park', ipAddress: 'system',
  },
  {
    id: 'AUD-003', timestamp: '2026-02-25 11:15 PM', eventType: 'exception', severity: 'warning',
    actor: 'Courtney Gordon', actorType: 'user', department: 'Executive',
    action: 'Exception waiver approved',
    details: 'Marketing → Financial Data Access (30 days) for Q1 ROI report. Risk: medium.',
    resource: 'POL-001 / EXC-001', ipAddress: '10.0.1.10',
  },
  {
    id: 'AUD-004', timestamp: '2026-02-25 10:55 PM', eventType: 'auth', severity: 'info',
    actor: 'mona.vogele@risere.com', actorType: 'user', department: 'Training',
    action: 'SSO login via Microsoft',
    details: 'Successful authentication. Session started. Role: department_head.',
    resource: 'Auth / SSO', ipAddress: '10.0.2.22',
  },
  {
    id: 'AUD-005', timestamp: '2026-02-25 10:30 PM', eventType: 'data_access', severity: 'info',
    actor: 'Training Bot', actorType: 'bot', department: 'Training',
    action: 'Knowledge base query',
    details: 'Retrieved 3 documents from Training knowledge base for employee onboarding module.',
    resource: 'KB / Training / Onboarding', ipAddress: 'system',
  },
  {
    id: 'AUD-006', timestamp: '2026-02-25 10:12 PM', eventType: 'workflow', severity: 'info',
    actor: 'System', actorType: 'system', department: 'Operations',
    action: 'Workflow "Email Cleanup" completed',
    details: '8 emails processed: 3 filed to DLR folder, 2 junk rescued, 2 marketing archived, 1 Uber receipt forwarded.',
    resource: 'WF-001 / Email Cleanup', ipAddress: 'system',
  },
  {
    id: 'AUD-007', timestamp: '2026-02-25 9:45 PM', eventType: 'policy_change', severity: 'warning',
    actor: 'Courtney Gordon', actorType: 'user', department: 'Executive',
    action: 'Policy rule updated',
    details: 'Added rule to POL-006 (AI Agent Memory Boundaries): "PII must be redacted from agent long-term memory"',
    resource: 'POL-006', ipAddress: '10.0.1.10',
  },
  {
    id: 'AUD-008', timestamp: '2026-02-25 9:30 PM', eventType: 'agent_action', severity: 'info',
    actor: 'Maintenance Bot', actorType: 'bot', department: 'Maintenance',
    action: 'Work order resolved',
    details: 'WO-4421 (HVAC repair, Unit 204, Bartram Park) marked complete. Vendor: ABC HVAC. Cost: $485.',
    resource: 'Work Orders / WO-4421', ipAddress: 'system',
  },
  {
    id: 'AUD-009', timestamp: '2026-02-25 9:15 PM', eventType: 'security', severity: 'warning',
    actor: 'System', actorType: 'system', department: 'IT',
    action: 'Unusual access pattern detected',
    details: 'User jsmith@risere.com accessed 15 different knowledge base categories in 5 minutes. Flagged for review.',
    resource: 'Security / Behavioral', ipAddress: '10.0.1.45',
  },
  {
    id: 'AUD-010', timestamp: '2026-02-25 8:50 PM', eventType: 'auth', severity: 'info',
    actor: 'chris.jackson@risere.com', actorType: 'user', department: 'Maintenance',
    action: 'Password reset completed',
    details: 'Password changed via self-service portal. MFA re-verified.',
    resource: 'Auth / Password', ipAddress: '10.0.3.18',
  },
  {
    id: 'AUD-011', timestamp: '2026-02-25 8:30 PM', eventType: 'data_access', severity: 'warning',
    actor: 'sarah.chen@risere.com', actorType: 'user', department: 'Marketing',
    action: 'Financial data accessed via exception',
    details: 'Accessed Q4 revenue summary under EXC-001 (30-day waiver). Access logged per policy.',
    resource: 'Finance / Q4 Revenue', ipAddress: '10.0.2.55',
  },
  {
    id: 'AUD-012', timestamp: '2026-02-25 8:00 PM', eventType: 'system', severity: 'info',
    actor: 'System', actorType: 'system', department: 'IT',
    action: 'Nightly backup completed',
    details: 'Full database backup to encrypted storage. Size: 2.4 GB. Duration: 3m 22s.',
    resource: 'System / Backup', ipAddress: 'system',
  },
]

const eventTypeColors: Record<EventType, string> = {
  auth: 'var(--blue)',
  data_access: 'var(--teal)',
  policy_change: 'var(--orange)',
  agent_action: 'var(--green)',
  security: 'var(--red)',
  workflow: 'var(--purple)',
  exception: 'var(--orange)',
  system: 'var(--text4)',
}

const eventTypeLabels: Record<EventType, string> = {
  auth: 'Authentication',
  data_access: 'Data Access',
  policy_change: 'Policy Change',
  agent_action: 'Agent Action',
  security: 'Security',
  workflow: 'Workflow',
  exception: 'Exception',
  system: 'System',
}

const eventTypeIcons: Record<EventType, string> = {
  auth: '🔑',
  data_access: '📂',
  policy_change: '📋',
  agent_action: '🤖',
  security: '🛡️',
  workflow: '⚡',
  exception: '⚠️',
  system: '💻',
}

const severityColors: Record<Severity, string> = {
  info: 'var(--blue)',
  warning: 'var(--orange)',
  critical: 'var(--red)',
}

const actorTypeIcons: Record<string, string> = {
  user: '👤',
  agent: '🤖',
  bot: '⚙️',
  system: '💻',
}

export default function AuditView() {
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = auditLog.filter(entry => {
    if (typeFilter !== 'all' && entry.eventType !== typeFilter) return false
    if (severityFilter !== 'all' && entry.severity !== severityFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return entry.action.toLowerCase().includes(q) ||
        entry.actor.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q) ||
        entry.resource.toLowerCase().includes(q)
    }
    return true
  })

  const stats = {
    total: auditLog.length,
    critical: auditLog.filter(e => e.severity === 'critical').length,
    warnings: auditLog.filter(e => e.severity === 'warning').length,
    security: auditLog.filter(e => e.eventType === 'security').length,
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Audit Log</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Complete activity trail — every action, access, and change recorded
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
          📥 Export Log
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: stats.total, icon: '📊', color: 'var(--blue)' },
          { label: 'Critical', value: stats.critical, icon: '🔴', color: 'var(--red)' },
          { label: 'Warnings', value: stats.warnings, icon: '🟡', color: 'var(--orange)' },
          { label: 'Security Events', value: stats.security, icon: '🛡️', color: 'var(--red)' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-xs" style={{ color: 'var(--text3)' }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search audit log..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-sm"
            style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as 'all' | EventType)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Types</option>
          {Object.entries(eventTypeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value as 'all' | Severity)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {filtered.map(entry => (
          <div key={entry.id}
            className="glass-card rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-all"
            style={{
              borderLeft: `3px solid ${severityColors[entry.severity]}`,
            }}
            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          >
            <div className="p-3 flex items-center gap-4">
              {/* Icon */}
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${eventTypeColors[entry.eventType]}15` }}>
                <span className="text-sm">{eventTypeIcons[entry.eventType]}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                    {entry.action}
                  </span>
                  <span className="text-[11px] whitespace-nowrap px-2 py-1 rounded shrink-0"
                    style={{ background: `${eventTypeColors[entry.eventType]}22`, color: eventTypeColors[entry.eventType] }}>
                    {eventTypeLabels[entry.eventType]}
                  </span>
                  {entry.severity !== 'info' && (
                    <span className="text-[11px] whitespace-nowrap px-2 py-1 rounded shrink-0"
                      style={{ background: `${severityColors[entry.severity]}22`, color: severityColors[entry.severity] }}>
                      {entry.severity.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text4)' }}>
                  {actorTypeIcons[entry.actorType]} {entry.actor} • {entry.department} • {entry.resource}
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-xs shrink-0" style={{ color: 'var(--text4)' }}>
                {entry.timestamp}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === entry.id && (
              <div className="px-4 pb-3 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span style={{ color: 'var(--text4)' }}>Details:</span>
                    <p className="mt-1 leading-relaxed" style={{ color: 'var(--text2)' }}>{entry.details}</p>
                  </div>
                  <div className="space-y-1">
                    <div><span style={{ color: 'var(--text4)' }}>Actor:</span> <span style={{ color: 'var(--text2)' }}>{entry.actor} ({entry.actorType})</span></div>
                    <div><span style={{ color: 'var(--text4)' }}>Department:</span> <span style={{ color: 'var(--text2)' }}>{entry.department}</span></div>
                    <div><span style={{ color: 'var(--text4)' }}>Resource:</span> <span style={{ color: 'var(--text2)' }}>{entry.resource}</span></div>
                    <div><span style={{ color: 'var(--text4)' }}>IP Address:</span> <span style={{ color: 'var(--text2)' }}>{entry.ipAddress}</span></div>
                    <div><span style={{ color: 'var(--text4)' }}>Event ID:</span> <span style={{ color: 'var(--text2)' }}>{entry.id}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text4)' }}>
        <span>Showing {filtered.length} of {auditLog.length} entries</span>
        <span>Logs retained for 90 days • Encrypted at rest • Tamper-proof</span>
      </div>
    </div>
  )
}
