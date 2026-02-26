'use client'

import { useEffect, useState } from 'react'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import DashboardView from '@/components/views/DashboardView'
import AgentsView from '@/components/views/AgentsView'
import ChatView from '@/components/views/ChatView'
import TicketsView from '@/components/views/TicketsView'
import SuggestionsView from '@/components/views/SuggestionsView'
import WorkflowsView from '@/components/views/WorkflowsView'
import PoliciesView from '@/components/views/PoliciesView'
import AuditView from '@/components/views/AuditView'
import SettingsView from '@/components/views/SettingsView'

type ViewType = 'dashboard' | 'agents' | 'chat' | 'tickets' | 'suggestions' | 'workflows' | 'policies' | 'audit' | 'settings'

export default function Home() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (DEMO_MODE) {
      // In demo mode, skip auth — show the full app
      setLoading(false)
      return
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        window.location.href = '/login'
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 pulse-glow"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" fill="white" opacity="0.9"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Loading Milliebot Command Center...</p>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />
      case 'agents': return <AgentsView />
      case 'chat': return <ChatView />
      case 'tickets': return <TicketsView />
      case 'suggestions': return <SuggestionsView />
      case 'workflows': return <WorkflowsView />
      case 'policies': return <PoliciesView />
      case 'audit': return <AuditView />
      case 'settings': return <SettingsView />
      default: return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '64px' : '240px' }}>
        <TopBar user={user} onNavigate={setActiveView} />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
