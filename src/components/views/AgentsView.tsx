'use client'

import { useState } from 'react'

const agents = [
  {
    id: '1', name: 'Operations Agent', department: 'Operations', status: 'active' as const,
    description: 'Strategic ops agent — DLRs, reports, property analytics, vendor management',
    owner: 'Courtney Gordon', model: 'claude-opus-4-6', memory: '2.4 GB',
    bots: [
      { name: 'Leasing Agent', status: 'active', type: 'leasing', icon: '🏠', lastRun: '5 min ago' },
      { name: 'DLR Generator', status: 'active', type: 'reporting', icon: '📊', lastRun: '6 hours ago' },
      { name: 'Maintenance Coordinator', status: 'active', type: 'maintenance', icon: '🔧', lastRun: '2 hours ago' },
      { name: 'Compliance Monitor', status: 'configuring', type: 'compliance', icon: '✅', lastRun: 'Never' },
    ],
  },
  {
    id: '2', name: 'Training Agent', department: 'Training', status: 'active' as const,
    description: 'Content creation, SOP management, training module builder, course scheduling',
    owner: 'Mona Vogele', model: 'claude-opus-4-6', memory: '1.1 GB',
    bots: [
      { name: 'SOP Writer', status: 'active', type: 'content', icon: '📝', lastRun: '1 hour ago' },
      { name: 'Course Builder', status: 'active', type: 'training', icon: '📚', lastRun: '3 hours ago' },
      { name: 'Quiz Generator', status: 'configuring', type: 'assessment', icon: '❓', lastRun: 'Never' },
    ],
  },
  {
    id: '3', name: 'Maintenance Agent', department: 'Maintenance', status: 'active' as const,
    description: 'Work order management, vendor coordination, inspections, preventive maintenance',
    owner: 'Chris Jackson', model: 'claude-opus-4-6', memory: '0.8 GB',
    bots: [
      { name: 'Work Order Bot', status: 'active', type: 'work_orders', icon: '📋', lastRun: '30 min ago' },
      { name: 'Vendor Coordinator', status: 'active', type: 'vendors', icon: '🤝', lastRun: '4 hours ago' },
      { name: 'Inspection Scheduler', status: 'active', type: 'inspections', icon: '🔍', lastRun: '1 day ago' },
    ],
  },
]

export default function AgentsView() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const selected = agents.find((a) => a.id === selectedAgent)

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Agents & Bots</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            {agents.length} department agents • {agents.reduce((acc, a) => acc + a.bots.length, 0)} support bots
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))', color: '#fff', boxShadow: 'var(--shadow-glow-blue)' }}
        >
          + New Agent
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
            className="glass-card p-5 cursor-pointer transition-all"
            style={{
              borderColor: selectedAgent === agent.id ? 'var(--blue)' : undefined,
              boxShadow: selectedAgent === agent.id ? 'var(--shadow-glow-blue)' : undefined,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
                  🤖
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{agent.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{agent.department}</div>
                </div>
              </div>
              <span className={`status-dot ${agent.status}`} />
            </div>

            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text3)' }}>{agent.description}</p>

            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text4)' }}>
                Support Bots ({agent.bots.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {agent.bots.map((bot) => (
                <div key={bot.name} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{bot.icon}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>{bot.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: 'var(--text4)' }}>{bot.lastRun}</span>
                    <span className={`status-dot ${bot.status}`} style={{ width: '6px', height: '6px' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-[10px]" style={{ color: 'var(--text4)' }}>Owner: {agent.owner}</span>
              <span className="text-[10px]" style={{ color: 'var(--text4)' }}>Memory: {agent.memory}</span>
            </div>
          </div>
        ))}

        {/* Add Department Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="glass-card p-5 cursor-pointer flex flex-col items-center justify-center min-h-[300px] transition-all hover:border-blue-500/50"
          style={{ borderStyle: 'dashed' }}
        >
          <div className="text-4xl mb-3" style={{ color: 'var(--text4)' }}>+</div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text3)' }}>Add Department Agent</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text4)' }}>HR, Marketing, Finance, IT</div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-[480px] max-w-[90vw] rounded-xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Create Department Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>Department</label>
                <select className="w-full px-3 py-2.5 rounded-lg text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option>Select department...</option>
                  <option>Human Resources</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                  <option>IT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>Agent Name</label>
                <input type="text" placeholder="e.g., HR Agent" className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>Department Head (Owner)</label>
                <input type="text" placeholder="e.g., Brett Johnson" className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>Description</label>
                <textarea placeholder="What will this agent do?" rows={3} className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ color: 'var(--text3)', border: '1px solid var(--border)' }}>Cancel</button>
              <button className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                style={{ background: 'var(--blue)' }}>Create Agent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
