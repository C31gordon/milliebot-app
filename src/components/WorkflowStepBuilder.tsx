'use client'
import { useState } from 'react'

export interface WorkflowStep {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'notification' | 'delay'
  label: string
  config: string
}

const STEP_TYPES = [
  { type: 'trigger', icon: '⚡', label: 'Trigger', color: '#559CB5', desc: 'What starts this workflow' },
  { type: 'action', icon: '⚙️', label: 'Action', color: '#22c55e', desc: 'Do something (send email, update record, call API)' },
  { type: 'condition', icon: '🔀', label: 'Condition', color: '#f59e0b', desc: 'Branch based on a rule' },
  { type: 'notification', icon: '🔔', label: 'Notify', color: '#8b5cf6', desc: 'Send alert (email, Slack, SMS)' },
  { type: 'delay', icon: '⏱️', label: 'Delay', color: '#6b7280', desc: 'Wait before next step' },
] as const

const TRIGGER_OPTIONS = ['Schedule (cron)', 'New email received', 'Form submitted', 'Webhook called', 'Record created', 'Record updated', 'Manual trigger']
const ACTION_OPTIONS = ['Send email', 'Create record', 'Update record', 'Call external API', 'Generate report', 'Move file', 'Assign task', 'Run AI analysis']
const CONDITION_OPTIONS = ['If field equals', 'If field contains', 'If amount greater than', 'If date is past', 'If status is', 'If department is']
const NOTIFY_OPTIONS = ['Email notification', 'Slack message', 'SMS alert', 'In-app notification', 'Teams message']
const DELAY_OPTIONS = ['Wait 5 minutes', 'Wait 1 hour', 'Wait 24 hours', 'Wait until business hours', 'Wait for approval']

function getOptionsForType(type: string) {
  switch (type) {
    case 'trigger': return TRIGGER_OPTIONS
    case 'action': return ACTION_OPTIONS
    case 'condition': return CONDITION_OPTIONS
    case 'notification': return NOTIFY_OPTIONS
    case 'delay': return DELAY_OPTIONS
    default: return []
  }
}

interface Props {
  steps: WorkflowStep[]
  onChange: (steps: WorkflowStep[]) => void
}

export default function WorkflowStepBuilder({ steps, onChange }: Props) {
  const [addingType, setAddingType] = useState<string | null>(null)

  const addStep = (type: string, label: string, config: string) => {
    const newStep: WorkflowStep = {
      id: 's' + Date.now(),
      type: type as WorkflowStep['type'],
      label,
      config,
    }
    onChange([...steps, newStep])
    setAddingType(null)
  }

  const removeStep = (id: string) => {
    onChange(steps.filter(s => s.id !== id))
  }

  const moveStep = (idx: number, dir: -1 | 1) => {
    const newSteps = [...steps]
    const target = idx + dir
    if (target < 0 || target >= newSteps.length) return
    ;[newSteps[idx], newSteps[target]] = [newSteps[target], newSteps[idx]]
    onChange(newSteps)
  }

  const updateConfig = (id: string, config: string) => {
    onChange(steps.map(s => s.id === id ? { ...s, config } : s))
  }

  const typeInfo = (type: string) => STEP_TYPES.find(t => t.type === type) || STEP_TYPES[1]

  return (
    <div>
      {/* Step list */}
      <div className="space-y-2 mb-3">
        {steps.map((step, idx) => {
          const info = typeInfo(step.type)
          return (
            <div key={step.id} className="flex items-center gap-2">
              {/* Connector line */}
              {idx > 0 && (
                <div style={{ position: 'absolute', marginTop: -16, marginLeft: 17, width: 2, height: 12, background: 'var(--border)' }} />
              )}
              <div className="flex-1 flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <span className="w-8 h-8 flex items-center justify-center rounded-full text-white text-sm"
                  style={{ background: info.color, flexShrink: 0 }}>
                  {info.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: info.color }}>{info.label}</div>
                  <input 
                    value={step.config} 
                    onChange={e => updateConfig(step.id, e.target.value)}
                    className="w-full text-sm bg-transparent border-none outline-none"
                    style={{ color: 'var(--text)' }}
                    placeholder="Configure this step..."
                  />
                </div>
                <div className="flex gap-1" style={{ flexShrink: 0 }}>
                  <button onClick={() => moveStep(idx, -1)} className="text-xs px-1 rounded" style={{ color: 'var(--text4)', background: 'none', border: 'none', cursor: 'pointer' }} title="Move up">↑</button>
                  <button onClick={() => moveStep(idx, 1)} className="text-xs px-1 rounded" style={{ color: 'var(--text4)', background: 'none', border: 'none', cursor: 'pointer' }} title="Move down">↓</button>
                  <button onClick={() => removeStep(step.id)} className="text-xs px-1 rounded" style={{ color: 'var(--red-text, #ff6b7a)', background: 'none', border: 'none', cursor: 'pointer' }} title="Remove">✕</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add step button row */}
      {!addingType ? (
        <div className="flex flex-wrap gap-2">
          {STEP_TYPES.map(t => (
            <button key={t.type} onClick={() => setAddingType(t.type)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all hover:scale-105"
              style={{ background: 'var(--bg3)', color: t.color, border: '1px solid var(--border)', cursor: 'pointer' }}>
              {t.icon} + {t.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-3 rounded-lg" style={{ background: 'var(--bg2)', border: `1px solid ${typeInfo(addingType).color}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: typeInfo(addingType).color }}>
              {typeInfo(addingType).icon} Add {typeInfo(addingType).label}
            </span>
            <button onClick={() => setAddingType(null)} style={{ color: 'var(--text4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {getOptionsForType(addingType).map(opt => (
              <button key={opt} onClick={() => addStep(addingType, typeInfo(addingType).label, opt)}
                className="px-3 py-1.5 rounded text-xs transition-all hover:scale-105"
                style={{ background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                {opt}
              </button>
            ))}
          </div>
          <input 
            placeholder="Or type custom configuration..."
            className="w-full mt-2 px-3 py-1.5 rounded text-xs"
            style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                addStep(addingType, typeInfo(addingType).label, (e.target as HTMLInputElement).value)
              }
            }}
          />
        </div>
      )}

      {steps.length === 0 && !addingType && (
        <p className="text-xs mt-2" style={{ color: 'var(--text4)' }}>
          Start by adding a Trigger, then build your workflow step by step.
        </p>
      )}
    </div>
  )
}
