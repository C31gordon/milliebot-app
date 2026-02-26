'use client'

const suggestions = [
  { id: 'SUG-0015', title: 'Add competitor rent comps next to our own', submitter: 'Chris Jackson', dept: 'Maintenance', votes: 4, status: 'under_review' as const, created: '2 hours ago' },
  { id: 'SUG-0014', title: 'Auto-generate move-in checklists from unit type', submitter: 'Sarah Kim', dept: 'Training', votes: 7, status: 'planned' as const, created: '1 day ago' },
  { id: 'SUG-0013', title: 'Push notifications for urgent work orders', submitter: 'Chris Jackson', dept: 'Maintenance', votes: 12, status: 'building' as const, created: '3 days ago' },
  { id: 'SUG-0012', title: 'Weekly summary email of all bot activity', submitter: 'Mona Vogele', dept: 'Training', votes: 3, status: 'new' as const, created: '4 days ago' },
  { id: 'SUG-0011', title: 'Dark mode toggle for the dashboard', submitter: 'David Park', dept: 'Operations', votes: 1, status: 'declined' as const, created: '5 days ago' },
  { id: 'SUG-0010', title: 'Voice input for chat interface', submitter: 'Chris Jackson', dept: 'Maintenance', votes: 9, status: 'shipped' as const, created: '1 week ago' },
]

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'New', bg: 'rgba(59,130,246,0.15)', color: 'var(--blue-light)' },
  under_review: { label: 'Under Review', bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)' },
  planned: { label: 'Planned', bg: 'rgba(245,158,11,0.15)', color: 'var(--orange-light)' },
  building: { label: 'Building', bg: 'rgba(59,130,246,0.15)', color: 'var(--blue-light)' },
  shipped: { label: '✅ Shipped', bg: 'rgba(16,185,129,0.15)', color: 'var(--green-light)' },
  declined: { label: 'Declined', bg: 'rgba(100,116,139,0.15)', color: 'var(--text4)' },
}

export default function SuggestionsView() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Suggestions</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            User-submitted ideas, sorted by votes. Say &quot;I wish...&quot; in chat to submit.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.sort((a, b) => b.votes - a.votes).map((s) => (
          <div key={s.id} className="glass-card p-4 flex items-center gap-4 cursor-pointer">
            {/* Vote count */}
            <div className="flex flex-col items-center gap-1 px-3 min-w-[60px]">
              <button className="text-xs" style={{ color: 'var(--text4)' }}>▲</button>
              <span className="text-lg font-extrabold" style={{ color: s.votes >= 5 ? 'var(--blue)' : 'var(--text3)' }}>
                {s.votes}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text4)' }}>votes</span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--text4)' }}>{s.id}</span>
                <span className="text-[11px] font-semibold whitespace-nowrap px-2.5 py-1 rounded-full"
                  style={{ background: statusConfig[s.status].bg, color: statusConfig[s.status].color }}>
                  {statusConfig[s.status].label}
                </span>
              </div>
              <h3 className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text)' }}>{s.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs" style={{ color: 'var(--text4)' }}>{s.submitter} • {s.dept}</span>
                <span className="text-xs" style={{ color: 'var(--text4)' }}>{s.created}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
