'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  confidence?: number
  confidenceReason?: string
  sources?: { label: string; url: string }[]
  dataFreshness?: 'verified' | 'stale' | 'partial' | 'unknown'
  isFinancial?: boolean
  isMock?: boolean
  isSuggestion?: boolean
  isTicket?: boolean
}

const welcomeMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hey Courtney. I'm your Operations Agent — ready to help you run RISE more efficiently.\n\nI can pull reports, draft documents, answer questions about your properties, create tickets, or build workflows.\n\nWhat do you need?",
    timestamp: new Date(),
    dataFreshness: 'verified',
  },
]

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>(welcomeMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isPlanningMode, setIsPlanningMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Detect suggestions
    const suggestionTriggers = ['i wish', 'it would be nice', 'we should have', 'feature request', 'this would be better']
    const isSuggestion = suggestionTriggers.some((t) => input.toLowerCase().includes(t))

    // Detect tickets
    const ticketTriggers = ['i need', 'can someone', 'is broken', 'submit a ticket', 'request for', 'can it help', 'can hr help', 'can marketing help']
    const isTicket = ticketTriggers.some((t) => input.toLowerCase().includes(t))

    // Simulate response
    setTimeout(() => {
      let response: Message

      if (isSuggestion) {
        response = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "That's a great idea. I can't do that today, but I'd like to log this as a suggestion so it gets tracked and taken seriously. Should I send it?\n\n**Suggestion:** " + input + "\n\n[ ✅ Yes, Submit ] [ ❌ No, Cancel ]",
          timestamp: new Date(),
          isSuggestion: true,
        }
      } else if (isTicket) {
        response = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sounds like a service request. I'll create a ticket for you.\n\n**Ticket Preview:**\n📋 **Title:** " + input.slice(0, 60) + "...\n🏢 **Routing to:** IT Department\n🔴 **Priority:** Medium\n\nShould I submit this, or would you like to adjust anything?\n\n[ ✅ Submit Ticket ] [ ✏️ Edit ] [ ❌ Cancel ]",
          timestamp: new Date(),
          isTicket: true,
        }
      } else if (input.toLowerCase().includes('build') || input.toLowerCase().includes('create') || input.toLowerCase().includes('generate')) {
        setIsPlanningMode(true)
        response = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Before I build this, let me make sure I get it right. I have a few questions:\n\n**1.** What's the output? (Report, dashboard, document, workflow)\n**2.** Who's the audience?\n**3.** What data sources should I pull from?\n**4.** Any format preference? (If you have something similar you like, share it)\n**5.** How often will this need to refresh?\n\nTake your time — getting this right up front saves us both rounds of revisions.",
          timestamp: new Date(),
        }
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Your occupancy at Bartram Park is **90.6%** (269 / 297 units) with 19 on notice and 12 signed leases pending move-in.\n\nExposure is at **12.1%** (36 units) — up from 11.1% last week. The increase is driven by 3 new notices filed this week.\n\n📎 *Source: Entrata Box Score, pulled 2/25/2026 6:00 AM*",
          timestamp: new Date(),
          confidence: 96,
          confidenceReason: 'Data pulled directly from Entrata, less than 24 hours old.',
          sources: [
            { label: 'Entrata Box Score 2/25/2026', url: '#' },
            { label: 'Bartram DLR 2/25', url: '#' },
          ],
          dataFreshness: 'verified',
          isFinancial: false,
        }
      }

      setMessages((prev) => [...prev, response])
      setIsTyping(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const freshnessColors: Record<string, { bg: string; text: string; label: string }> = {
    verified: { bg: 'rgba(16,185,129,0.1)', text: 'var(--green-light)', label: '✅ Verified' },
    stale: { bg: 'rgba(245,158,11,0.1)', text: 'var(--orange-light)', label: '🟡 Stale' },
    partial: { bg: 'rgba(245,158,11,0.1)', text: 'var(--orange-light)', label: '🟡 Partial' },
    unknown: { bg: 'rgba(239,68,68,0.1)', text: 'var(--red-light)', label: '🔴 Unknown' },
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Planning mode banner */}
      {isPlanningMode && (
        <div className="flex items-center justify-between px-4 py-2 rounded-xl mb-3"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--purple)' }}>
            📐 Planning Mode — Building your spec before building the thing
          </span>
          <button onClick={() => setIsPlanningMode(false)}
            className="text-xs font-medium px-2 py-1 rounded"
            style={{ color: 'var(--text3)' }}>
            Exit Planning
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? '' : ''}`}>
              {/* Avatar + Name */}
              <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px]"
                    style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}>
                    🔷
                  </div>
                )}
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text4)' }}>
                  {msg.role === 'user' ? 'You' : 'Ops Agent'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text4)' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message bubble */}
              <div className="px-4 py-3 rounded-xl text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? 'var(--blue)' : 'var(--bg2)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text2)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  borderTopRightRadius: msg.role === 'user' ? '4px' : undefined,
                  borderTopLeftRadius: msg.role === 'assistant' ? '4px' : undefined,
                  whiteSpace: 'pre-wrap',
                }}>
                {/* Mock data banner */}
                {msg.isMock && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 -mx-1 -mt-1"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px dashed rgba(245,158,11,0.4)' }}>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--orange)' }}>⚠️ PROJECTED DATA</span>
                  </div>
                )}

                {/* Financial data notice */}
                {msg.isFinancial && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 -mx-1 -mt-1"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--blue-light)' }}>
                      💰 Financial data — please verify before making decisions
                    </span>
                  </div>
                )}

                <span dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>')
                    .replace(/\[ (.*?) \]/g, '<button style="display:inline-block;margin:4px 4px 0 0;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(59,130,246,0.2);color:#60a5fa;border:1px solid rgba(59,130,246,0.3);cursor:pointer">$1</button>')
                }} />
              </div>

              {/* Confidence + Sources */}
              {msg.role === 'assistant' && (msg.confidence || msg.sources?.length || msg.dataFreshness) && (
                <div className="mt-2 space-y-1">
                  {msg.dataFreshness && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded"
                      style={{
                        background: freshnessColors[msg.dataFreshness].bg,
                        color: freshnessColors[msg.dataFreshness].text,
                      }}>
                      {freshnessColors[msg.dataFreshness].label}
                    </span>
                  )}
                  {msg.confidence && (
                    <div className="text-[10px]" style={{ color: 'var(--text4)' }}>
                      <strong>Confidence: {msg.confidence}%</strong>
                      {msg.confidenceReason && <span> — {msg.confidenceReason}</span>}
                    </div>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((s, i) => (
                        <a key={i} href={s.url} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded transition-colors hover:bg-white/10"
                          style={{ background: 'var(--bg3)', color: 'var(--blue-light)' }}>
                          📎 {s.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text4)', animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text4)', animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text4)', animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pb-2">
        <form onSubmit={handleSend} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPlanningMode ? "Answer the planning questions above..." : "Ask anything, create a ticket, or make a suggestion..."}
            rows={1}
            className="w-full pl-4 pr-24 py-3.5 rounded-xl text-sm resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/30"
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              minHeight: '48px',
              maxHeight: '120px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'var(--text4)' }} title="Attach file">
              📎
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: input.trim() ? 'var(--blue)' : 'transparent', color: input.trim() ? '#fff' : 'var(--text4)' }}
            >
              ↑
            </button>
          </div>
        </form>
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px]" style={{ color: 'var(--text4)' }}>
              💡 Try: &quot;I wish...&quot; for suggestions • &quot;I need...&quot; for tickets • &quot;Build me...&quot; for planning mode
            </span>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text4)' }}>
            Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  )
}
