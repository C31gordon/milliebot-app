'use client'

import { useState } from 'react'

type WorkflowStatus = 'active' | 'paused' | 'draft' | 'error'
type TriggerType = 'schedule' | 'event' | 'manual' | 'webhook'

interface WorkflowStep {
  id: string
  type: 'trigger' | 'condition' | 'action' | 'notification'
  label: string
  config: string
}

interface Workflow {
  id: string
  name: string
  description: string
  department: string
  status: WorkflowStatus
  trigger: TriggerType
  triggerDetail: string
  steps: WorkflowStep[]
  lastRun: string
  nextRun: string
  runsToday: number
  successRate: number
  createdBy: string
  complexity: 'simple' | 'complex'
}

const workflows: Workflow[] = [
  {
    id: 'WF-001',
    name: 'Email Inbox Cleanup',
    description: 'Automatically sort, file, and respond to incoming emails based on rules',
    department: 'Operations',
    status: 'active',
    trigger: 'schedule',
    triggerDetail: 'Every 2 hours (7 AM – 7 PM)',
    steps: [
      { id: 's1', type: 'trigger', label: 'Schedule Timer', config: 'Every 2 hours' },
      { id: 's2', type: 'action', label: 'Scan Inbox', config: 'assistant@yourdomain.com' },
      { id: 's3', type: 'condition', label: 'Classify Email', config: 'Junk / DLR / Uber / Marketing' },
      { id: 's4', type: 'action', label: 'Move & Tag', config: 'Auto-file to folders' },
      { id: 's5', type: 'notification', label: 'Report', config: 'Telegram summary' },
    ],
    lastRun: '25 min ago',
    nextRun: 'In 1h 35m',
    runsToday: 6,
    successRate: 98.5,
    createdBy: 'Millie',
    complexity: 'simple',
  },
  {
    id: 'WF-002',
    name: 'DLR Auto-Generation',
    description: 'Pull system reports, build daily summaries, deploy to dashboard',
    department: 'Operations',
    status: 'active',
    trigger: 'schedule',
    triggerDetail: 'Daily at 8:00 AM',
    steps: [
      { id: 's1', type: 'trigger', label: 'Daily Timer', config: '8:00 AM ET' },
      { id: 's2', type: 'action', label: 'Pull System Data', config: 'Automated data pull' },
      { id: 's3', type: 'action', label: 'Build Reports', config: 'Property A + Property B' },
      { id: 's4', type: 'action', label: 'Deploy', config: 'GitHub Pages' },
      { id: 's5', type: 'notification', label: 'Email Links', config: 'Property managers + regionals' },
    ],
    lastRun: '16 hours ago',
    nextRun: 'Tomorrow 8:00 AM',
    runsToday: 1,
    successRate: 92.0,
    createdBy: 'Millie',
    complexity: 'complex',
  },
  {
    id: 'WF-003',
    name: 'Work Order Escalation',
    description: 'Escalate overdue work orders to maintenance supervisor after SLA breach',
    department: 'Maintenance',
    status: 'active',
    trigger: 'event',
    triggerDetail: 'When work order exceeds SLA',
    steps: [
      { id: 's1', type: 'trigger', label: 'SLA Monitor', config: 'Work order age > threshold' },
      { id: 's2', type: 'condition', label: 'Priority Check', config: 'Emergency / Urgent / Standard' },
      { id: 's3', type: 'action', label: 'Notify Supervisor', config: 'Email + dashboard alert' },
      { id: 's4', type: 'action', label: 'Update Ticket', config: 'Mark as escalated' },
    ],
    lastRun: '3 hours ago',
    nextRun: 'On trigger',
    runsToday: 4,
    successRate: 100,
    createdBy: 'Chris Jackson',
    complexity: 'simple',
  },
  {
    id: 'WF-004',
    name: 'New Hire Onboarding',
    description: 'Create accounts, assign training, notify manager when new employee is added',
    department: 'HR',
    status: 'draft',
    trigger: 'event',
    triggerDetail: 'When new employee record is created',
    steps: [
      { id: 's1', type: 'trigger', label: 'New Employee Event', config: 'HR system webhook' },
      { id: 's2', type: 'action', label: 'Create Accounts', config: 'M365, CRM, Service Desk' },
      { id: 's3', type: 'action', label: 'Assign Training', config: 'Role-based curriculum' },
      { id: 's4', type: 'notification', label: 'Notify Manager', config: 'Welcome packet + checklist' },
    ],
    lastRun: 'Never',
    nextRun: 'Not scheduled',
    runsToday: 0,
    successRate: 0,
    createdBy: 'Brett Johnson',
    complexity: 'complex',
  },
  {
    id: 'WF-005',
    name: 'Training Completion Tracker',
    description: 'Monitor training progress and send reminders for overdue assignments',
    department: 'Training',
    status: 'paused',
    trigger: 'schedule',
    triggerDetail: 'Daily at 9:00 AM',
    steps: [
      { id: 's1', type: 'trigger', label: 'Daily Check', config: '9:00 AM ET' },
      { id: 's2', type: 'action', label: 'Scan Assignments', config: 'All active employees' },
      { id: 's3', type: 'condition', label: 'Overdue?', config: '> 7 days past deadline' },
      { id: 's4', type: 'notification', label: 'Send Reminder', config: 'Email to employee + manager' },
    ],
    lastRun: '2 days ago',
    nextRun: 'Paused',
    runsToday: 0,
    successRate: 95.0,
    createdBy: 'Mona Vogele',
    complexity: 'simple',
  },
  {
    id: 'WF-006',
    name: 'Invoice Processing',
    description: 'Extract invoice data, match to POs, route for approval',
    department: 'Finance',
    status: 'draft',
    trigger: 'webhook',
    triggerDetail: 'When invoice email received',
    steps: [
      { id: 's1', type: 'trigger', label: 'Email Received', config: 'invoices@yourdomain.com' },
      { id: 's2', type: 'action', label: 'Extract Data', config: 'AI document parsing' },
      { id: 's3', type: 'condition', label: 'Match PO', config: 'Auto-match or flag for review' },
      { id: 's4', type: 'action', label: 'Route Approval', config: 'Based on amount threshold' },
      { id: 's5', type: 'notification', label: 'Notify Approver', config: 'Email + dashboard' },
    ],
    lastRun: 'Never',
    nextRun: 'Not scheduled',
    runsToday: 0,
    successRate: 0,
    createdBy: 'Courtney Gordon',
    complexity: 'complex',
  },
]

const statusColors: Record<WorkflowStatus, string> = {
  active: 'var(--green)',
  paused: 'var(--orange)',
  draft: 'var(--text4)',
  error: 'var(--red)',
}

const statusLabels: Record<WorkflowStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  draft: 'Draft',
  error: 'Error',
}

const triggerIcons: Record<TriggerType, string> = {
  schedule: '⏰',
  event: '⚡',
  manual: '👆',
  webhook: '🔗',
}

const stepTypeColors: Record<string, string> = {
  trigger: 'var(--blue)',
  condition: 'var(--orange)',
  action: 'var(--green)',
  notification: 'var(--purple)',
}

export default function WorkflowsView() {
  const [filter, setFilter] = useState<'all' | WorkflowStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered = filter === 'all' ? workflows : workflows.filter(w => w.status === filter)

  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    runsToday: workflows.reduce((sum, w) => sum + w.runsToday, 0),
    avgSuccess: Math.round(workflows.filter(w => w.successRate > 0).reduce((sum, w) => sum + w.successRate, 0) / workflows.filter(w => w.successRate > 0).length * 10) / 10,
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Workflows</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Automate repetitive tasks with trigger-action chains
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--blue)', color: 'white' }}
        >
          + New Workflow
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Workflows', value: stats.total, icon: '⚙️' },
          { label: 'Active', value: stats.active, icon: '✅' },
          { label: 'Runs Today', value: stats.runsToday, icon: '🔄' },
          { label: 'Avg Success Rate', value: `${stats.avgSuccess}%`, icon: '📊' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-xs" style={{ color: 'var(--text3)' }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active', 'paused', 'draft', 'error'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: filter === f ? 'var(--blue)' : 'var(--bg3)',
              color: filter === f ? 'white' : 'var(--text3)',
            }}
          >
            {f === 'all' ? 'All' : statusLabels[f]}
            {f !== 'all' && ` (${workflows.filter(w => w.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="glass-card p-6 rounded-xl border" style={{ borderColor: 'var(--blue)', borderWidth: '1px' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Create New Workflow</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Workflow Name</label>
              <input
                type="text"
                placeholder="e.g., Monthly Rent Roll Report"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Department</label>
              <select
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              >
                <option>Operations</option>
                <option>HR</option>
                <option>Finance</option>
                <option>Maintenance</option>
                <option>Training</option>
                <option>Marketing</option>
                <option>IT</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Description</label>
            <textarea
              placeholder="What should this workflow do?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Trigger Type</label>
            <div className="flex gap-2">
              {(['schedule', 'event', 'webhook', 'manual'] as TriggerType[]).map(t => (
                <button key={t} className="px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                  style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                  {triggerIcons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--bg)', border: '1px dashed var(--border)' }}>
            <p className="text-sm text-center" style={{ color: 'var(--text4)' }}>
              ⚠️ Complex workflows (multiple conditions, external APIs) will be handed off to n8n with an auto-generated node diagram sent to IT for review.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Cancel</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--blue)', color: 'white' }}>Create Workflow</button>
          </div>
        </div>
      )}

      {/* Workflow Cards */}
      <div className="space-y-4">
        {filtered.map(wf => (
          <div key={wf.id} className="glass-card rounded-xl overflow-hidden">
            {/* Card Header */}
            <div
              className="p-4 cursor-pointer hover:opacity-90 transition-all"
              onClick={() => setExpandedId(expandedId === wf.id ? null : wf.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{triggerIcons[wf.trigger]}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: 'var(--text)' }}>{wf.name}</span>
                      <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full font-medium"
                        style={{ background: `${statusColors[wf.status]}22`, color: statusColors[wf.status] }}>
                        {statusLabels[wf.status]}
                      </span>
                      {wf.complexity === 'complex' && (
                        <span className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--orange)22', color: 'var(--orange)' }}>
                          Complex → n8n
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{wf.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text3)' }}>
                  <div className="text-right">
                    <div>Last: {wf.lastRun}</div>
                    <div>Next: {wf.nextRun}</div>
                  </div>
                  <div className="text-right">
                    <div>{wf.runsToday} runs today</div>
                    {wf.successRate > 0 && <div style={{ color: wf.successRate >= 95 ? 'var(--green)' : 'var(--orange)' }}>{wf.successRate}% success</div>}
                  </div>
                  <span style={{ color: 'var(--text4)', transform: expandedId === wf.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Steps */}
            {expandedId === wf.id && (
              <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-xs font-medium" style={{ color: 'var(--text3)' }}>WORKFLOW STEPS</span>
                  <span className="text-xs" style={{ color: 'var(--text4)' }}>• {wf.department} • Created by {wf.createdBy}</span>
                </div>

                {/* Step Chain */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {wf.steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <div className="px-3 py-2 rounded-lg text-xs min-w-[120px]" style={{
                        background: `${stepTypeColors[step.type]}15`,
                        border: `1px solid ${stepTypeColors[step.type]}40`,
                      }}>
                        <div className="font-medium" style={{ color: stepTypeColors[step.type] }}>{step.label}</div>
                        <div style={{ color: 'var(--text4)' }}>{step.config}</div>
                      </div>
                      {i < wf.steps.length - 1 && (
                        <span style={{ color: 'var(--text4)' }}>→</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {wf.status === 'active' && (
                    <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--orange)22', color: 'var(--orange)' }}>
                      ⏸ Pause
                    </button>
                  )}
                  {wf.status === 'paused' && (
                    <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--green)22', color: 'var(--green)' }}>
                      ▶ Resume
                    </button>
                  )}
                  {wf.status === 'draft' && (
                    <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--green)22', color: 'var(--green)' }}>
                      ▶ Activate
                    </button>
                  )}
                  <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                    ✏️ Edit
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                    📋 Duplicate
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                    📜 Run History
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--red)15', color: 'var(--red)' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
