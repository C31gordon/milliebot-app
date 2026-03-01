'use client'

import { useState } from 'react'
import { type IntegrationWalkthroughData } from '@/lib/integration-walkthroughs'

interface Props {
  walkthrough: IntegrationWalkthroughData
  onClose: () => void
  onComplete: (integrationId: string, credentials: Record<string, string>) => void
}

export default function IntegrationWalkthrough({ walkthrough, onClose, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')

  const step = walkthrough.steps[currentStep]
  const isLastStep = currentStep === walkthrough.steps.length - 1
  const totalSteps = walkthrough.steps.length

  const handleVerify = async () => {
    setVerifying(true)
    setError('')
    try {
      const res = await fetch('/api/integrations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId: walkthrough.id, credentials }),
      })
      const data = await res.json()
      if (data.verified) {
        setVerified(true)
        setTimeout(() => onComplete(walkthrough.id, credentials), 1200)
      } else {
        setError(data.error || 'Verification failed. Please check your credentials.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none', marginTop: 12,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 580, maxHeight: '85vh', overflow: 'auto',
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16,
        padding: 0, color: 'var(--text)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{walkthrough.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{walkthrough.name} Setup</div>
              <div style={{ fontSize: 12, color: 'var(--text4)' }}>{walkthrough.category}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text4)', fontSize: 20, cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 4 }}>
          {walkthrough.steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= currentStep ? '#559CB5' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        <div style={{ padding: '6px 24px 0', fontSize: 12, color: 'var(--text4)' }}>
          Step {currentStep + 1} of {totalSteps}
        </div>

        {/* Step content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{step.title}</h3>

          {/* Screenshot placeholder */}
          <div style={{
            width: '100%', height: 120, background: 'var(--bg)', border: '1px dashed var(--border)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text4)', fontSize: 13, marginBottom: 16,
          }}>
            📷 Screenshot placeholder
          </div>

          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7 }}>{step.description}</p>

          {step.inputField && (
            <input
              style={inputStyle}
              placeholder={step.inputPlaceholder || ''}
              value={credentials[step.inputField] || ''}
              onChange={e => setCredentials(prev => ({ ...prev, [step.inputField!]: e.target.value }))}
            />
          )}

          {/* Verify button on last step */}
          {isLastStep && !verified && (
            <div style={{ marginTop: 20 }}>
              <button onClick={handleVerify} disabled={verifying} style={{
                width: '100%', padding: '12px 20px',
                background: verifying ? 'var(--bg3)' : 'linear-gradient(135deg, #559CB5, #7c3aed)',
                color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14,
                cursor: verifying ? 'not-allowed' : 'pointer',
              }}>
                {verifying ? '⟳ Verifying…' : '✓ Verify Connection'}
              </button>
              {error && <div style={{ color: '#e74c3c', fontSize: 13, marginTop: 8 }}>{error}</div>}
            </div>
          )}

          {verified && (
            <div style={{
              marginTop: 20, padding: 16, background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28 }}>✅</div>
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 14, marginTop: 4 }}>Connection Verified!</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {!verified && (
          <div style={{
            padding: '0 24px 24px', display: 'flex', justifyContent: 'space-between',
          }}>
            <button
              onClick={() => currentStep > 0 ? setCurrentStep(s => s - 1) : onClose()}
              style={{
                padding: '10px 20px', background: 'var(--bg3)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              }}
            >
              {currentStep > 0 ? '← Back' : 'Cancel'}
            </button>
            {!isLastStep && (
              <button
                onClick={() => setCurrentStep(s => s + 1)}
                disabled={!!step.inputField && !credentials[step.inputField]}
                style={{
                  padding: '10px 24px',
                  background: step.inputField && !credentials[step.inputField]
                    ? 'var(--bg3)' : 'linear-gradient(135deg, #559CB5, #3d7a94)',
                  color: step.inputField && !credentials[step.inputField] ? 'var(--text4)' : '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13,
                  cursor: step.inputField && !credentials[step.inputField] ? 'not-allowed' : 'pointer',
                }}
              >
                Next →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
