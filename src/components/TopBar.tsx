'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type ViewType = 'dashboard' | 'agents' | 'chat' | 'tickets' | 'suggestions' | 'workflows' | 'policies' | 'audit' | 'settings'

interface TopBarProps {
  user: User | null
  onNavigate: (view: ViewType) => void
}

export default function TopBar({ user, onNavigate }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Route to chat with the search as a message
      onNavigate('chat')
    }
  }

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 no-print"
      style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      
      {/* Search / Ask Millie */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text4)' }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask Millie anything... or search across your workspace"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/30"
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>
            ⌘K
          </span>
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5 relative"
            style={{ color: 'var(--text3)' }}
          >
            🔔
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: 'var(--red)', boxShadow: '0 0 4px rgba(239,68,68,0.6)' }} />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-xl overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Notifications</span>
                <button className="text-xs font-medium" style={{ color: 'var(--blue)' }}>Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="px-4 py-3 border-b transition-colors hover:bg-white/5 cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">🎫</span>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                        New ticket #TKT-0012 assigned to IT
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text4)' }}>2 minutes ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 border-b transition-colors hover:bg-white/5 cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">🔒</span>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                        Access exception expiring in 7 days
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text4)' }}>1 hour ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 transition-colors hover:bg-white/5 cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">💡</span>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                        Suggestion #SUG-0008 shipped!
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text4)' }}>3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 text-center border-t cursor-pointer transition-colors hover:bg-white/5"
                style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--blue)' }}>View all notifications</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:ring-2 hover:ring-blue-500/30"
            style={{ background: 'linear-gradient(135deg, var(--green), var(--teal))', color: '#000' }}
          >
            CG
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-56 rounded-xl overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Courtney Gordon</div>
                <div className="text-xs" style={{ color: 'var(--text4)' }}>{user?.email}</div>
                <div className="mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,166,35,0.2)', color: 'var(--gold)' }}>
                    OWNER
                  </span>
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { onNavigate('settings'); setShowProfile(false) }}
                  className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text3)' }}
                >
                  ⚙️ Settings
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text3)' }}
                >
                  📖 Help & Training
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5"
                  style={{ color: 'var(--red)' }}
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
