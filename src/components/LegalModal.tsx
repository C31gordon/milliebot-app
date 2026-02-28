'use client'

interface LegalModalProps {
  title: string
  content: string
  isOpen: boolean
  onClose: () => void
}

export default function LegalModal({ title, content, isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: 640, width: '100%', maxHeight: '85vh',
          borderRadius: 20, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
        </div>
        <div style={{
          flex: 1, overflow: 'auto', padding: '20px 24px',
          color: 'var(--text3)', fontSize: 13, lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
        }}>
          {content}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 32px', borderRadius: 10,
              background: 'var(--bg3)', color: 'var(--text3)',
              border: '1px solid var(--border)', fontSize: 14,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
