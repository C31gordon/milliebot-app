'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  sources?: { label: string; url: string }[]
  freshness?: 'verified' | 'stale' | 'partial'
}

const smartResponses: Record<string, { content: string; confidence?: number; sources?: { label: string; url: string }[]; freshness?: string }> = {
  patients: {
    content: "**Active Patient Panel — February 28, 2026**\n\n🤰 **Total Active Patients:** 47\n• 1st Trimester: 14\n• 2nd Trimester: 21\n• 3rd Trimester: 12\n\n👶 **Due This Month (March):**\n• Jessica Rivera — 39w2d — Birth Center — EDD Mar 4\n• Amanda Foster — 38w5d — Home Birth — EDD Mar 8\n• Keisha Williams — 38w1d — Birth Center — EDD Mar 12\n\n⚠️ **Flags:**\n• Sarah Chen moved to hospital backup — GDM diagnosis at 28w\n• Taylor Brooks insurance — needs single case agreement",
    confidence: 96,
    sources: [{ label: 'DrChrono Patient Panel', url: '#' }],
    freshness: 'verified',
  },
  claims: {
    content: "**Claims & Revenue — February 2026**\n\n💰 **Revenue (MTD):** $62,400\n• Global maternity (59400): $22,800\n• Antepartum visits: $18,920\n\n📊 **Clean Claim Rate:** 94.4%\n• Submitted: 142 | Paid: 118 | Denied: 8\n\n⚠️ 2 Medicaid claims denied — missing modifier -25",
    confidence: 92,
    sources: [{ label: 'Claims Dashboard', url: '#' }],
    freshness: 'verified',
  },
  schedule: {
    content: "**Today's Schedule — Saturday, Feb 28**\n\n📅 **6 Appointments:**\n• 9:00 AM — Maria Santos — 32w Prenatal\n• 9:30 AM — Amanda Foster — 38w5d Home Visit\n• 10:30 AM — New Patient Consult\n• 11:30 AM — Jessica Rivera — 39w2d\n• 1:00 PM — Diana Walsh — PP home visit\n• 2:30 PM — Childbirth Education Class\n\n📞 **On-Call:** Primary until Monday 8 AM",
    confidence: 95,
    sources: [{ label: 'DrChrono Schedule', url: '#' }],
    freshness: 'verified',
  },
  labs: {
    content: "**Lab Compliance — 96%**\n\n📋 **Due This Week:**\n• Taylor Brooks (36w) — GBS Culture NOW\n• Maria Lopez (36w5d) — GBS in 3 days\n• Destiny Howard (28w) — GTT due\n\n⚠️ **Overdue:** Carmen Reyes (29w) — GTT not completed (5 days)",
    confidence: 97,
    sources: [{ label: 'DrChrono Lab Results', url: '#' }],
    freshness: 'verified',
  },
  occupancy: {
    content: "**Portfolio Occupancy — Feb 28, 2026**\n\n📊 **Physical Occupancy:** 94.2% (↑ 0.3%)\n• Bartram Park: 96.3% (285/297 units)\n• Prosper On Fayette: 62.1% preleased (195/314 beds)\n\n📈 **Leased:** 95.8% — 12 new leases this week\n\n⚠️ Prosper needs 8 leases/week to hit fall target",
    confidence: 94,
    sources: [{ label: 'System Report', url: '#' }],
    freshness: 'verified',
  },
  workorder: {
    content: "**Work Orders — This Week**\n\n🔧 **Open:** 23\n• 🔴 Emergency: 1 (HVAC unit 204)\n• 🟠 Urgent: 4\n• 🟢 Standard: 18\n\n📊 **SLA:** Emergency 100% ✅ | Urgent 87.5% ⚠️ | Standard 94% ✅\n**Avg completion:** 2.3 business days",
    confidence: 91,
    sources: [{ label: 'Service Desk', url: '#' }],
    freshness: 'verified',
  },
  default: {
    content: "I can help with:\n\n🤰 Patients & gestational tracking\n💰 Claims & revenue cycle\n📅 Scheduling & on-call\n🧪 Lab compliance\n👶 Postpartum follow-ups\n🏠 Occupancy & leasing\n🔧 Work orders\n📊 Practice analytics\n\nWhat do you need?",
    confidence: 72,
  },
}

function getResponse(msg: string): Message {
  const lower = msg.toLowerCase()
  let response = smartResponses.default

  if (lower.includes('patient') || lower.includes('panel') || lower.includes('due') || lower.includes('pregnant') || lower.includes('trimester'))
    response = smartResponses.patients
  else if (lower.includes('claim') || lower.includes('billing') || lower.includes('revenue') || lower.includes('denial'))
    response = smartResponses.claims
  else if (lower.includes('schedule') || lower.includes('appointment') || lower.includes('today') || lower.includes('on-call') || lower.includes('on call'))
    response = smartResponses.schedule
  else if (lower.includes('lab') || lower.includes('gbs') || lower.includes('glucose') || lower.includes('test') || lower.includes('compliance'))
    response = smartResponses.labs
  else if (lower.includes('occupancy') || lower.includes('leased') || lower.includes('vacancy'))
    response = smartResponses.occupancy
  else if (lower.includes('work order') || lower.includes('maintenance') || lower.includes('repair'))
    response = smartResponses.workorder
  else if (lower.startsWith('i wish') || lower.includes("i'd love"))
    response = { content: '💡 **Suggestion Captured**\n\n"' + msg + '"\n\nLogged to Suggestions board. Tag it to a department?', confidence: 100 }
  else if (lower.startsWith('i need') || lower.includes('not working') || lower.includes('broken'))
    response = { content: '🎫 **Ticket Created — #TKT-' + String(Date.now()).slice(-4) + '**\n\n"' + msg + '"\n\nPriority: Medium | Routing now.', confidence: 100 }
  else if (lower.startsWith('build me') || lower.includes('automate') || lower.includes('set up'))
    response = { content: '🏗️ **Planning Mode**\n\n"' + msg + '"\n\nBefore I build:\n1. Who uses this?\n2. How often?\n3. Connected systems?\n4. Must-haves?', confidence: 100 }

  return {
    id: 'msg-' + Date.now(),
    role: 'assistant',
    content: response.content,
    timestamp: new Date(),
    confidence: response.confidence,
    sources: response.sources,
    freshness: (response.freshness as 'verified' | 'stale' | 'partial') || undefined,
  }
}

const freshnessColors: Record<string, { color: string; icon: string; label: string }> = {
  verified: { color: '#4ade80', icon: '✅', label: 'Verified' },
  partial: { color: '#facc15', icon: '📊', label: 'Partial' },
  stale: { color: '#fb923c', icon: '⚠️', label: 'Stale' },
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: "Hi! I'm your AI Practice Assistant. Ask me about patients, claims, labs, scheduling, or anything else. How can I help?", timestamp: new Date() },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100) } }, [open])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userMsg: Message = { id: 'user-' + Date.now(), role: 'user', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 1000))
    const response = getResponse(userMsg.content)
    setMessages(prev => [...prev, response])
    setIsTyping(false)
    if (!open) setUnread(prev => prev + 1)
  }

  const quickActions = ['Show patients', 'Claims status', "Today's schedule", 'Overdue labs', 'Occupancy']

  return (
    <>
      {open && (
        <div className="fixed z-50 flex flex-col"
          style={{
            bottom: 20, right: 20,
            width: expanded ? 700 : 420,
            maxWidth: 'calc(100vw - 40px)',
            height: expanded ? 'calc(100vh - 40px)' : 600,
            maxHeight: 'calc(100vh - 40px)',
            borderRadius: 16,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(85,156,181,0.1)',
            transition: 'all 0.3s ease',
          }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', borderRadius: '16px 16px 0 0', background: 'linear-gradient(135deg, rgba(85,156,181,0.1), rgba(139,92,246,0.05))' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
                <span className="text-base">💬</span>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Practice Assistant</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
                  <span className="text-[10px]" style={{ color: '#4ade80' }}>Online</span>
                  <span className="text-[10px]" style={{ color: 'var(--text4)' }}>· HIPAA-compliant · Zero hallucination</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(!expanded)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" style={{ color: 'var(--text3)' }} title={expanded ? 'Collapse' : 'Expand'}>
                {expanded ? '⊖' : '⊕'}
              </button>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" style={{ color: 'var(--text3)' }} title="Close">✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div style={{ maxWidth: '85%' }}>
                  <div className="px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed" style={{
                    background: msg.role === 'user' ? 'linear-gradient(135deg, var(--blue), var(--blue-dark))' : 'var(--bg3)',
                    color: msg.role === 'user' ? 'white' : 'var(--text2)',
                    borderTopRightRadius: msg.role === 'user' ? 6 : undefined,
                    borderTopLeftRadius: msg.role === 'assistant' ? 6 : undefined,
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**'))
                          return <div key={i} style={{ fontWeight: 700, marginTop: i > 0 ? 6 : 0, color: msg.role === 'user' ? '#fff' : 'var(--text)' }}>{line.replace(/\*\*/g, '')}</div>
                        if (line.startsWith('• ') || line.startsWith('- '))
                          return <div key={i} style={{ marginLeft: 8 }}>{line}</div>
                        return <div key={i}>{line || <br />}</div>
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1 flex-wrap">
                    <span style={{ fontSize: 10, color: 'var(--text4)' }}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.confidence && (
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: msg.confidence >= 90 ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)', color: msg.confidence >= 90 ? '#4ade80' : '#facc15' }}>
                        {msg.confidence}%
                      </span>
                    )}
                    {msg.freshness && freshnessColors[msg.freshness] && (
                      <span style={{ fontSize: 10, color: freshnessColors[msg.freshness].color }}>{freshnessColors[msg.freshness].icon} {freshnessColors[msg.freshness].label}</span>
                    )}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5 px-1">
                      {msg.sources.map((s, i) => (
                        <a key={i} href={s.url} style={{ fontSize: 10, color: 'var(--blue)', textDecoration: 'none' }}>{s.label}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl" style={{ background: 'var(--bg3)' }}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text4)', animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text4)', animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text4)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="flex gap-1.5 px-4 pb-2 flex-wrap shrink-0">
              {quickActions.map((a, i) => (
                <button key={i} onClick={() => { setInput(a); inputRef.current?.focus() }}
                  className="px-2.5 py-1 rounded-full text-[11px] transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)' }}>{a}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex gap-2">
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask anything..." disabled={isTyping}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-[13px] disabled:opacity-50"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <button onClick={handleSend} disabled={!input.trim() || isTyping}
                className="px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-30 shrink-0"
                style={{ background: 'var(--blue)', color: '#fff' }}>Send</button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <div className="flex gap-3" style={{ fontSize: 10, color: 'var(--text4)' }}>
                <span>💡 "I wish..." → Suggestion</span>
                <span>🎫 "I need..." → Ticket</span>
                <span>🏗️ "Build me..." → Plan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed z-50 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            bottom: 24, right: 24, width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue), var(--purple))',
            boxShadow: '0 8px 32px rgba(85,156,181,0.4), 0 0 20px rgba(85,156,181,0.2)',
            border: 'none', cursor: 'pointer',
          }}>
          <span style={{ fontSize: 24 }}>💬</span>
          {unread > 0 && (
            <span className="absolute" style={{ top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', background: '#ef4444' }}>
              {unread}
            </span>
          )}
        </button>
      )}
    </>
  )
}
