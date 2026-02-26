'use client'

import { useState } from 'react'

const tickets = [
  { id: 'TKT-0012', title: 'Laptop running slow, need RAM upgrade', requester: 'Chris Jackson', dept: 'Maintenance', targetDept: 'IT', status: 'new' as const, priority: 'medium' as const, created: '12 min ago', group: null },
  { id: 'TKT-0011', title: 'VPN disconnects every 30 minutes', requester: 'Mona Vogele', dept: 'Training', targetDept: 'IT', status: 'assigned' as const, priority: 'high' as const, created: '2 hours ago', group: 'vpn-issues' },
  { id: 'TKT-0010', title: 'VPN keeps dropping during training sessions', requester: 'Sarah Kim', dept: 'Training', targetDept: 'IT', status: 'in_progress' as const, priority: 'high' as const, created: '3 hours ago', group: 'vpn-issues' },
  { id: 'TKT-0009', title: 'Need access to Marketing shared drive', requester: 'Jessica Lee', dept: 'Operations', targetDept: 'IT', status: 'waiting_on_requester' as const, priority: 'low' as const, created: '1 day ago', group: null },
  { id: 'TKT-0008', title: 'Update property photos on website', requester: 'David Park', dept: 'Operations', targetDept: 'Marketing', status: 'in_progress' as const, priority: 'medium' as const, created: '2 days ago', group: null },
  { id: 'TKT-0007', title: 'PTO policy clarification', requester: 'Mike Torres', dept: 'Maintenance', targetDept: 'HR', status: 'resolved' as const, priority: 'low' as const, created: '3 days ago', group: null },
  { id: 'TKT-0006', title: 'HVAC vendor contract renewal', requester: 'Chris Jackson', dept: 'Maintenance', targetDept: 'Operations', status: 'in_progress' as const, priority: 'urgent' as const, created: '4 days ago', group: null },
] as const

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'New', bg: 'rgba(59,130,246,0.15)', color: 'var(--blue-light)' },
  assigned: { label: 'Assigned', bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)' },
  in_progress: { label: 'In Progress', bg: 'rgba(245,158,11,0.15)', color: 'var(--orange-light)' },
  waiting_on_requester: { label: 'Waiting', bg: 'rgba(100,116,139,0.15)', color: 'var(--text3)' },
  resolved: { label: 'Resolved', bg: 'rgba(16,185,129,0.15)', color: 'var(--green-light)' },
  closed: { label: 'Closed', bg: 'rgba(100,116,139,0.15)', color: 'var(--text4)' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'var(--text4)' },
  medium: { label: 'Medium', color: 'var(--blue)' },
  high: { label: 'High', color: 'var(--orange)' },
  urgent: { label: 'Urgent', color: 'var(--red)' },
}

export default function TicketsView() {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)
  const grouped = tickets.filter((t) => t.group === 'vpn-issues')

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Tickets</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            {tickets.length} total • {tickets.filter((t) => (t.status as string) !== 'resolved' && (t.status as string) !== 'closed').length} open
          </p>
        </div>
      </div>

      {/* Bubbled group alert */}
      {grouped.length >= 2 && (
        <div className="glass-card p-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.05)' }}>
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--orange-light)' }}>
                Pattern Detected: {grouped.length} VPN-related tickets in 24 hours
              </div>
              <div className="text-xs" style={{ color: 'var(--text3)' }}>
                Multiple users reporting VPN issues. This may be a systemic problem.
              </div>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'var(--orange)', color: '#000' }}>
            Escalate to IT Lead
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        {['all', 'new', 'assigned', 'in_progress', 'waiting_on_requester', 'resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: filter === f ? 'var(--blue)' : 'var(--bg2)',
              color: filter === f ? '#fff' : 'var(--text3)',
              border: filter === f ? 'none' : '1px solid var(--border)',
            }}>
            {f === 'all' ? 'All' : statusConfig[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Ticket', 'Title', 'Requester', 'Department', 'Priority', 'Status', 'Created'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="transition-colors hover:bg-white/5 cursor-pointer"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-4 py-3 text-xs font-mono font-bold" style={{ color: 'var(--blue-light)' }}>{ticket.id}</td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {ticket.title}
                  {ticket.group && (
                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--orange)' }}>GROUPED</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text3)' }}>{ticket.requester}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text3)' }}>{ticket.targetDept}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold" style={{ color: priorityConfig[ticket.priority].color }}>
                    {ticket.priority === 'urgent' ? '🔴 ' : ''}{priorityConfig[ticket.priority].label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{ background: statusConfig[ticket.status].bg, color: statusConfig[ticket.status].color }}>
                    {statusConfig[ticket.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text4)' }}>{ticket.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
