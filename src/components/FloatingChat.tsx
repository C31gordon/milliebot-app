'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function FloatingChat() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: "Hey! 👋 I'm your Zynthr AI assistant. I know your org, your departments, your agents — ask me anything.\n\nNeed help setting something up? Curious what I can do? Or just want to talk strategy? Fire away.", timestamp: new Date() },
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
    const currentInput = input.trim()
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          message: currentInput,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: data.reply || "Hmm, I blanked on that one. Try again?",
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: "Oops — something went wrong on my end. Mind trying that again? 🤔",
        timestamp: new Date(),
      }])
    }
    setIsTyping(false)
    if (!open) setUnread(prev => prev + 1)
  }

  const quickActions = ['What can you do?', 'Help me set up an agent', 'Explain RKBAC', 'What integrations are available?']

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
                <span className="text-base">⚡</span>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Zynthr AI</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
                  <span className="text-[10px]" style={{ color: '#4ade80' }}>Online</span>
                  <span className="text-[10px]" style={{ color: 'var(--text4)' }}>· Knows your org · Always learning</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(!expanded)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" style={{ color: 'var(--text3)' }}>
                {expanded ? '⊖' : '⊕'}
              </button>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" style={{ color: 'var(--text3)' }}>✕</button>
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
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span style={{ fontSize: 10, color: 'var(--text4)' }}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
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
                <button key={i} onClick={() => { setInput(a); setTimeout(() => inputRef.current?.focus(), 50) }}
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
                placeholder="Ask me anything..." disabled={isTyping}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-[13px] disabled:opacity-50"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} />
              <button onClick={handleSend} disabled={!input.trim() || isTyping}
                className="px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-30 shrink-0"
                style={{ background: 'linear-gradient(135deg, #559CB5, #7c3aed)', color: '#fff' }}>Send</button>
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
          <span style={{ fontSize: 24 }}>⚡</span>
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
