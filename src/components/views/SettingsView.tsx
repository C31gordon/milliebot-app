'use client'

import { useState } from 'react'

const sourceSystems = [
  { name: 'Microsoft 365', icon: '📧', status: 'connected', desc: 'Email, Calendar, SharePoint, Teams', lastSync: '5 min ago' },
  { name: 'Entrata', icon: '🏢', status: 'connected', desc: 'Property management, leasing, rent roll', lastSync: '6 hours ago' },
  { name: 'Egnyte', icon: '📁', status: 'connected', desc: 'File storage, documents, SOPs', lastSync: '1 hour ago' },
  { name: 'Paycor', icon: '💳', status: 'connected', desc: 'HR, payroll, benefits', lastSync: '12 hours ago' },
  { name: 'MoonRISE Service Desk', icon: '🎫', status: 'connected', desc: 'IT tickets, service requests', lastSync: '30 min ago' },
  { name: 'Stripe', icon: '💰', status: 'not_connected', desc: 'Billing & payments', lastSync: null },
  { name: 'HubSpot', icon: '📊', status: 'not_connected', desc: 'CRM, marketing automation', lastSync: null },
]

export default function SettingsView() {
  const [tab, setTab] = useState<'general' | 'systems' | 'billing' | 'notifications' | 'help'>('general')

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {([
          { id: 'general' as const, label: '⚙️ General' },
          { id: 'systems' as const, label: '🔗 Source Systems' },
          { id: 'billing' as const, label: '💳 Billing & Usage' },
          { id: 'notifications' as const, label: '🔔 Notifications' },
          { id: 'help' as const, label: '❓ Help & Feedback' },
        ]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: tab === t.id ? 'var(--blue)' : 'transparent', color: tab === t.id ? '#fff' : 'var(--text3)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === 'general' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Tenant Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>Company Name</label>
                <input type="text" defaultValue="RISE Real Estate" className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>Domain</label>
                <input type="text" defaultValue="risere.com" className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>Brand Primary Color</label>
                <div className="flex gap-2">
                  <input type="color" defaultValue="#2E86AB" className="w-10 h-10 rounded cursor-pointer" style={{ border: '1px solid var(--border)' }} />
                  <input type="text" defaultValue="#2E86AB" className="flex-1 px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>Logo</label>
                <div className="px-3 py-6 rounded-lg text-center cursor-pointer transition-colors hover:border-blue-500"
                  style={{ border: '2px dashed var(--border)', color: 'var(--text4)' }}>
                  <span className="text-xs">Drop logo here or click to upload</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>White-Label Domain (Custom URL)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="app.risere.com" className="flex-1 px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <button className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: 'var(--blue)', color: '#fff' }}>Configure DNS</button>
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text4)' }}>Available after day 15. Point your CNAME to milliebot.vercel.app</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold" style={{ background: 'var(--blue)', color: '#fff' }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Source Systems */}
      {tab === 'systems' && (
        <div className="space-y-3">
          {sourceSystems.map((sys) => (
            <div key={sys.name} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{sys.icon}</span>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{sys.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{sys.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {sys.lastSync && (
                  <span className="text-[10px]" style={{ color: 'var(--text4)' }}>Last sync: {sys.lastSync}</span>
                )}
                <span className={`status-dot ${sys.status === 'connected' ? 'active' : ''}`} />
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: sys.status === 'connected' ? 'transparent' : 'var(--blue)',
                    color: sys.status === 'connected' ? 'var(--text3)' : '#fff',
                    border: sys.status === 'connected' ? '1px solid var(--border)' : 'none',
                  }}>
                  {sys.status === 'connected' ? 'Configure' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Billing */}
      {tab === 'billing' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Current Plan</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-extrabold" style={{ color: 'var(--gold)' }}>Enterprise</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,166,35,0.2)', color: 'var(--gold)' }}>ACTIVE</span>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text3)' }}>
                Manage Plan
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              {[
                { label: 'Departments', value: '7', max: 'Unlimited' },
                { label: 'Agents', value: '3', max: 'Unlimited' },
                { label: 'Bots', value: '10', max: 'Unlimited' },
                { label: 'Users', value: '12', max: '50' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{stat.label}</div>
                  <div className="text-xl font-bold mt-1" style={{ color: 'var(--text)' }}>{stat.value}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text4)' }}>of {stat.max}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Usage This Month</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'API Calls', value: '12,847', trend: '+18% from last month' },
                { label: 'Storage', value: '4.3 GB', trend: '+0.2 GB this week' },
                { label: 'Bot Runs', value: '1,024', trend: '~34/day average' },
              ].map((u) => (
                <div key={u.label} className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{u.label}</div>
                  <div className="text-xl font-bold mt-1" style={{ color: 'var(--blue)' }}>{u.value}</div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--text4)' }}>{u.trend}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Payment Method</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>Manage your billing through Stripe</p>
            <button className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--purple)', color: '#fff' }}>
              Open Stripe Portal
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Notification Preferences</h2>
          {[
            { label: 'Security alerts (prompt injection, access violations)', default: true, required: true },
            { label: 'Exception requests requiring your approval', default: true, required: true },
            { label: 'Ticket escalations', default: true, required: false },
            { label: 'New suggestions from users', default: true, required: false },
            { label: 'Bot errors and failures', default: true, required: false },
            { label: 'Weekly usage summary', default: true, required: false },
            { label: 'Workflow completion notifications', default: false, required: false },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text2)' }}>{pref.label}</span>
                {pref.required && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--orange)' }}>REQUIRED</span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={pref.default} disabled={pref.required} className="sr-only peer" />
                <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-4 after:w-4 after:transition-all"
                  style={{
                    background: pref.default ? 'var(--blue)' : 'var(--bg4)',
                    opacity: pref.required ? 0.6 : 1,
                  }}>
                  <div className="absolute top-[2px] left-[2px] w-4 h-4 rounded-full transition-transform"
                    style={{ background: '#fff', transform: pref.default ? 'translateX(16px)' : 'none' }} />
                </div>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Help & Feedback */}
      {tab === 'help' && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>💬 Send Feedback</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
              Tell us what&apos;s working, what&apos;s not, or what you wish existed. Your feedback goes directly to the product team.
            </p>
            <textarea rows={4} placeholder="What's on your mind?"
              className="w-full px-3 py-2.5 rounded-lg text-sm mb-3"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <button className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--blue)', color: '#fff' }}>
              Send Feedback
            </button>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>📖 Help & Training</h2>
            <div className="space-y-2">
              {[
                { label: 'Getting Started Guide', desc: 'Learn the basics in 2 minutes' },
                { label: 'Setting Up Your Dashboard', desc: 'Customize widgets, tabs, and layouts' },
                { label: 'Creating Agents & Bots', desc: 'Build your department AI team' },
                { label: 'RKBAC Policies Explained', desc: 'Understand access control in plain language' },
                { label: 'Workflow Builder', desc: 'Automate trigger → action chains' },
                { label: 'Tips & Tricks', desc: 'Power user shortcuts and hidden features' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                  style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{item.label}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text4)' }}>{item.desc}</div>
                  </div>
                  <span style={{ color: 'var(--text4)' }}>→</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>🏷️ Version</h2>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              Milliebot Command Center v1.0.0 • Powered by RKBAC™ • © 2026 Ardexa
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
