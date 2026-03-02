'use client'

import { useState, useRef, useEffect } from 'react'
import { DEMO_MODE, DEMO_USER } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { User } from '@supabase/supabase-js'

type ViewType = 'dashboard' | 'agents' | 'chat' | 'tickets' | 'suggestions' | 'workflows' | 'policies' | 'audit' | 'settings'

interface LocalUser {
  name: string
  email: string
  orgName: string
  createdAt: string
}

interface TopBarProps {
  user: User | null
  localUser?: LocalUser | null
  isAuthenticated?: boolean
  onNavigate: (view: ViewType) => void
  isMobile?: boolean
  onMenuToggle?: () => void
  onTourStart?: () => void
}

export default function TopBar({ user, localUser, isAuthenticated, onNavigate, isMobile, onMenuToggle, onTourStart }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') setIsDark(false)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const orgRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) setShowOrgSwitcher(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 80) + 'px'
    }
  }, [searchQuery])

  const { signOut, availableOrgs, switchOrg, isSuperAdmin, organization } = useAuth()
  const handleLogout = () => {
    signOut()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) onNavigate('chat')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (searchQuery.trim()) onNavigate('chat')
    }
  }

  // Determine display name and email
  const displayName = localUser?.name || (DEMO_MODE ? DEMO_USER.full_name : user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User')
  const displayEmail = localUser?.email || (DEMO_MODE ? DEMO_USER.email : user?.email)
  const displayOrg = localUser?.orgName || (DEMO_MODE ? DEMO_USER.tenant : '')
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const displayRole = DEMO_MODE && !isAuthenticated ? DEMO_USER.role : (localUser ? 'Member' : '')

  const [notifications, setNotifications] = useState<{icon: string; text: string; time: string; unread: boolean}[]>([])

  useEffect(() => {
    async function fetchNotifications() {
      try {
        // Get userId from auth context user or Supabase session
        const uid = user?.id
        if (!uid) return
        const res = await fetch(`/api/org/data?userId=${uid}`)
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        // audit_log comes back as data.audit from our API
        const auditEntries = data.audit || data.auditLog || []
        if (Array.isArray(auditEntries) && auditEntries.length > 0) {
          const iconMap: Record<string, string> = {
            sdr_lead_classified: '🎯', sdr_outreach: '🎯', sdr_sequence_scheduled: '🎯',
            concierge_onboarding_check: '🧭', chat_query: '🛟',
            echo_weekly_plan: '📣', hunter_research: '🏹', hunter_outreach_queued: '🏹',
            closer_demo_prep: '💎', sentinel_smoke_test: '🔬', sentinel_api_test: '🔬',
            aegis_compliance_audit: '🛡️', aegis_rkbac_audit: '🛡️',
            forge_feature_spec: '🧪', radar_weekly_briefing: '🔭',
            oracle_dashboard: '📊', pulse_weekly_scan: '🌐',
            coach_learning_path: '🎓', bridge_partner_pipeline: '🤝',
            architect_design: '🏗️', cashflow_usage: '💰',
            agent_action: '🤖', login: '🔑', setting_change: '⚙️',
            policy_update: '🔒', ticket_created: '🎫', workflow_run: '⚡',
          }
          setNotifications(auditEntries.slice(0, 8).map((entry: any) => {
            const mins = Math.round((Date.now() - new Date(entry.created_at).getTime()) / 60000)
            const time = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.round(mins / 60)} hours ago` : `${Math.round(mins / 1440)}d ago`
            const action = entry.action || 'system'
            const detail = entry.details
            let text = action.replace(/_/g, ' ')
            // Make notifications human-readable
            if (action === 'sdr_lead_classified') text = `New lead classified: ${detail?.tier || 'unknown'} tier`
            else if (action === 'concierge_onboarding_check') text = `Onboarding check: ${detail?.orgName || 'org'} — ${detail?.completionPct || 0}% complete`
            else if (action === 'sentinel_smoke_test') text = `Smoke test: ${detail?.allPassed ? '✅ all passed' : '⚠️ failures detected'}`
            else if (action === 'closer_demo_prep') text = `Demo prep ready for ${detail?.prospectCompany || 'prospect'}`
            else if (action === 'echo_weekly_plan') text = 'Weekly content plan generated'
            else if (action === 'radar_weekly_briefing') text = 'Competitor briefing ready'
            else if (action === 'forge_feature_spec') text = `Feature request: ${detail?.featureRequest || ''}`
            else if (action === 'hunter_research') text = `Prospect research: ${detail?.industry || ''}`
            else if (action === 'aegis_compliance_audit') text = 'Compliance audit completed'
            else if (action === 'architect_design') text = `Solution design: ${detail?.industry || ''}`
            return { icon: iconMap[action] || '📋', text, time, unread: mins < 60 }
          }))
        } else {
          // No audit entries yet — show empty state
          setNotifications([{ icon: '✨', text: 'No recent activity — your agents are standing by', time: 'now', unread: false }])
        }
      } catch {
        // Network error — show empty gracefully, NOT fake demo data
        setNotifications([{ icon: '📡', text: 'Unable to load notifications', time: 'now', unread: false }])
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [user])

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-between no-print gap-4"
      style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '10px 24px', minHeight: '56px' }}>

      {isMobile && (
        <button onClick={onMenuToggle}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/5"
          style={{ color: 'var(--text)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      <form onSubmit={handleSearch} className="flex-1 min-w-0" style={{ maxWidth: '640px' }}>
        <div className="relative">
          <span className="absolute left-4 top-3 text-sm pointer-events-none" style={{ color: 'var(--text4)' }}>🔍</span>
          <textarea ref={textareaRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask Millie anything... or search across your workspace" rows={1}
            className="w-full rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500/30 resize-none"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', lineHeight: '1.5', padding: '10px 52px 10px 44px', minHeight: '40px', maxHeight: '80px', overflow: 'hidden' }} />
          <span className="absolute right-4 top-3 text-[10px] px-1.5 py-0.5 rounded pointer-events-none"
            style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>⌘K</span>
        </div>
      </form>

      <div className="flex items-center gap-3 flex-shrink-0">

        {/* Tenant Switcher — only show if user has access to multiple orgs */}
        {availableOrgs.length > 1 && (
          <div className="relative" ref={orgRef}>
            <button
              onClick={() => { setShowOrgSwitcher(!showOrgSwitcher); setShowNotifications(false); setShowProfile(false) }}
              className="h-9 px-3 rounded-lg flex items-center gap-2 transition-all hover:bg-white/5 text-xs font-medium"
              style={{ border: '1px solid var(--border)', color: 'var(--text3)', background: 'var(--bg2)', maxWidth: '200px' }}
              title="Switch organization"
            >
              <span style={{ fontSize: '14px' }}>🏢</span>
              <span className="truncate">{displayOrg || 'Select Org'}</span>
              <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
              {isSuperAdmin && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>ADMIN</span>
              )}
            </button>
            {showOrgSwitcher && (
              <div className="absolute left-0 top-12 rounded-xl overflow-hidden z-[100]"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: '280px' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                    {isSuperAdmin ? '🔑 All Organizations' : 'Your Organizations'}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {availableOrgs.map((org) => {
                    const isActive = organization?.id === org.id
                    return (
                      <button
                        key={org.id}
                        onClick={() => { if (!isActive) switchOrg(org.id); setShowOrgSwitcher(false) }}
                        className="w-full text-left px-4 py-3 border-b transition-colors hover:bg-white/5"
                        style={{ borderColor: 'var(--border)', background: isActive ? 'rgba(85,156,181,0.1)' : 'transparent' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate" style={{ color: isActive ? 'var(--blue)' : 'var(--text)' }}>
                              {isActive && '✓ '}{org.name}
                            </div>
                            <div className="text-[11px] mt-0.5 flex items-center gap-2" style={{ color: 'var(--text4)' }}>
                              <span>{org.industry}</span>
                              <span>·</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{ background: org.plan === 'enterprise' ? 'rgba(124,58,237,0.15)' : org.plan === 'pro' ? 'rgba(85,156,181,0.15)' : 'rgba(255,255,255,0.05)', color: org.plan === 'enterprise' ? '#a78bfa' : org.plan === 'pro' ? 'var(--blue)' : 'var(--text4)' }}>
                                {(org.plan || 'free').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {isSuperAdmin && (org as any).agentCount !== undefined && (
                            <div className="text-[10px] text-right flex-shrink-0" style={{ color: 'var(--text4)' }}>
                              <div>{(org as any).memberCount || 0} users</div>
                              <div>{(org as any).agentCount || 0} agents</div>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Take a Tour */}
        <button
          onClick={onTourStart}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ color: "var(--text3)", fontSize: "16px" }}
          data-tour="help" title="Take a Tour"
        >
          ❓
        </button>
        <button data-tour="theme-toggle" onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ color: 'var(--text3)', fontSize: '18px' }} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? '☀️' : '🌙'}
        </button>

        {DEMO_MODE && !isAuthenticated && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: 'rgba(245,158,11,0.13)', color: 'var(--orange)', border: '1px solid rgba(245,158,11,0.25)' }}>
            DEMO MODE
          </span>
        )}

        <div className="relative" ref={notifRef}>
          <button data-tour="notifications" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5 relative"
            style={{ color: 'var(--text3)' }}>
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: 'var(--red)', color: 'white', boxShadow: '0 0 4px rgba(174,19,42,0.6)', width: '18px', height: '18px' }}>
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-14 rounded-xl overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', maxWidth: '320px', width: '90vw' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Notifications</span>
                <button className="text-xs font-medium" style={{ color: 'var(--blue)' }}>Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className="px-4 py-3 border-b transition-colors hover:bg-white/5 cursor-pointer"
                    style={{ borderColor: 'var(--border)', background: n.unread ? 'rgba(85,156,181,0.05)' : 'transparent' }}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm mt-0.5 flex-shrink-0">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text)' }}>{n.text}</p>
                        <p className="text-[11px] mt-1" style={{ color: 'var(--text4)' }}>{n.time}</p>
                      </div>
                      {n.unread && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--blue)' }} />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center border-t cursor-pointer transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--blue)' }}>View all notifications</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:ring-2 hover:ring-blue-500/30 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--green), var(--teal))', color: '#000' }}>
            {initials}
          </button>
          {showProfile && (
            <div className="absolute right-0 top-14 rounded-xl overflow-hidden"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: '260px' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{displayName}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text4)' }}>{displayEmail}</div>
                {displayOrg && <div className="text-xs mt-0.5" style={{ color: 'var(--text4)' }}>{displayOrg}</div>}
                {displayRole && (
                  <div className="mt-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(245,166,35,0.2)', color: 'var(--gold)' }}>{displayRole.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="py-2">
                <button onClick={() => { onNavigate('settings'); setShowProfile(false) }}
                  className="w-full text-left px-5 py-2.5 text-[13px] transition-colors hover:bg-white/5" style={{ color: 'var(--text3)' }}>
                  ⚙️ Settings
                </button>
                <button className="w-full text-left px-5 py-2.5 text-[13px] transition-colors hover:bg-white/5" style={{ color: 'var(--text3)' }}>
                  📖 Help &amp; Training
                </button>
                <button onClick={handleLogout}
                  className="w-full text-left px-5 py-2.5 text-[13px] transition-colors hover:bg-white/5" style={{ color: 'var(--red)' }}>
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
