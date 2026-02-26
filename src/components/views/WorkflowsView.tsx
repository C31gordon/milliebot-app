'use client'

const workflows = [
  { id: '1', name: 'Email Inbox Cleanup', department: 'Operations', status: 'active', trigger: 'Every 2 hours (7am-7pm)', lastRun: '1 hour ago', runs: 847, errors: 0 },
  { id: '2', name: 'DLR Auto-Generation', department: 'Operations', status: 'active', trigger: 'Daily at 6:30 AM', lastRun: '14 hours ago', runs: 42, errors: 1 },
  { id: '3', name: 'New Hire Onboarding Checklist', department: 'Training', status: 'active', trigger: 'When new employee added to Paycor', lastRun: '3 days ago', runs: 8, errors: 0 },
  { id: '4', name: 'Work Order SLA Alert', department: 'Maintenance', status: 'active', trigger: 'When WO exceeds 24hr SLA', lastRun: '6 hours ago', runs: 156, errors: 2 },
  { id: '5', name: 'Lease Expiration Reminders', department: 'Operations', status: 'draft', trigger: '60 days before expiration', lastRun: 'Never', runs: 0, errors: 0 },
]

export default function WorkflowsView() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Workflows</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Automated trigger → action chains. For complex workflows, request an N8N build.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg text-sm font-bold"
            style={{ background: 'var(--blue)', color: '#fff' }}>
            + New Workflow
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid var(--border)', color: 'var(--text3)' }}>
            Request N8N Build
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {workflows.map((wf) => (
          <div key={wf.id} className="glass-card p-5 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: wf.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)' }}>
                ⚡
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{wf.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text4)' }}>
                  {wf.department} • {wf.trigger}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs font-medium" style={{ color: 'var(--text3)' }}>Last run</div>
                <div className="text-xs" style={{ color: 'var(--text4)' }}>{wf.lastRun}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium" style={{ color: 'var(--text3)' }}>{wf.runs} runs</div>
                <div className="text-xs" style={{ color: wf.errors > 0 ? 'var(--red)' : 'var(--green)' }}>
                  {wf.errors > 0 ? `${wf.errors} errors` : 'No errors'}
                </div>
              </div>
              <span className={`status-dot ${wf.status === 'active' ? 'active' : 'configuring'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* N8N Handoff Info */}
      <div className="glass-card p-5" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)' }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🔗</span>
          <div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--purple)' }}>Need something more complex?</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>
              If your workflow needs conditional loops, API calls, or multi-system orchestration, click &quot;Request N8N Build.&quot;
              IT will receive a ticket with your workflow description, trigger, steps, and an auto-generated node diagram — everything they need to build it in N8N.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
