'use client'

import { useState, useEffect } from 'react'

type SettingsTab = 'general' | 'departments' | 'users' | 'security' | 'sso' | 'notifications' | 'branding' | 'billing' | 'danger'

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: 'var(--green)', color: '#fff', padding: '12px 20px',
      borderRadius: 12, fontSize: 14, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      animation: 'fadeInUp .3s ease',
    }}>
      ✓ {message}
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

function ConfirmDialog({ title, message, onConfirm, onCancel }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onCancel}>
      <div className="glass-card" style={{ padding: 24, borderRadius: 16, maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text3)' }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--red)', color: '#fff' }}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5 rounded-xl mb-4">
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
      {description && <p className="text-xs mb-4" style={{ color: 'var(--text4)' }}>{description}</p>}
      {children}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type = 'text', disabled = false }: {
  label: string; value: string; onChange?: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-lg text-sm disabled:opacity-50"
        style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
        readOnly={!onChange}
      />
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm" style={{ color: 'var(--text)' }}>{label}</div>
        {description && <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>{description}</div>}
      </div>
      <button onClick={() => onChange(!checked)} className="w-10 h-5 rounded-full transition-all relative shrink-0"
        style={{ background: checked ? 'var(--blue)' : 'var(--bg4)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: checked ? '22px' : '2px' }} />
      </button>
    </div>
  )
}

function StaticToggle({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return <Toggle label={label} description={description} checked={checked} onChange={setChecked} />
}

interface Department {
  id: string; name: string; icon: string; description: string; tier: number; active: boolean
  agentCount: number; botCount: number
  agents: { name: string; status: string }[]
  bots: { name: string; status: string }[]
  policies: { name: string; scope: string }[]
  members: { name: string; role: string }[]
}

interface AppUser {
  id: string; name: string; email: string; department: string; tier: number
  status: 'Active' | 'Invited' | 'Deactivated'; lastActive: string
}

const DEPT_EMOJIS = ['🏢','📋','🔑','🔧','📊','💼','📣','💰','⚖️','💻','🏗️','📈','🎯','🛠️','📦','🔍','🤝','📝','🎓','🌐']

const INITIAL_DEPARTMENTS: Department[] = [
  { id:'1',name:'Operations',icon:'📋',description:'Day-to-day property operations and management',tier:2,active:true,agentCount:3,botCount:2,
    agents:[{name:'Ops Coordinator',status:'Active'},{name:'Scheduling Agent',status:'Active'},{name:'Compliance Checker',status:'Idle'}],
    bots:[{name:'Daily Report Bot',status:'Active'},{name:'Shift Reminder',status:'Active'}],
    policies:[{name:'ops-full-access',scope:'Work orders, schedules, vendor contacts'},{name:'ops-read-financials',scope:'Read-only budget data'}],
    members:[{name:'Marcus Rivera',role:'Director'},{name:'Aisha Patel',role:'Coordinator'},{name:'Devon Brooks',role:'Analyst'}]},
  { id:'2',name:'Leasing',icon:'🔑',description:'Tenant acquisition, renewals, and lease administration',tier:2,active:true,agentCount:2,botCount:1,
    agents:[{name:'Lease Reviewer',status:'Active'},{name:'Renewal Tracker',status:'Active'}],
    bots:[{name:'Lead Follow-up Bot',status:'Active'}],
    policies:[{name:'leasing-tenant-data',scope:'Tenant PII, lease terms'},{name:'leasing-pricing',scope:'Unit pricing, concessions'}],
    members:[{name:'Sarah Chen',role:'Leasing Manager'},{name:'Jaylen Thomas',role:'Leasing Agent'}]},
  { id:'3',name:'Maintenance',icon:'🔧',description:'Facility upkeep, work orders, and vendor management',tier:3,active:true,agentCount:2,botCount:2,
    agents:[{name:'Work Order Triage',status:'Active'},{name:'Vendor Matcher',status:'Idle'}],
    bots:[{name:'Emergency Alert Bot',status:'Active'},{name:'PM Schedule Bot',status:'Active'}],
    policies:[{name:'maint-work-orders',scope:'Create/update work orders'}],
    members:[{name:'Carlos Mendez',role:'Maintenance Director'},{name:'Tyler Washington',role:'Technician Lead'}]},
  { id:'4',name:'Training',icon:'🎓',description:'Employee onboarding, development, and certification tracking',tier:3,active:true,agentCount:1,botCount:1,
    agents:[{name:'Training Content Agent',status:'Active'}],bots:[{name:'Onboarding Checklist Bot',status:'Active'}],
    policies:[{name:'training-content',scope:'Training materials, completion records'}],members:[{name:'Nicole Foster',role:'Training Manager'}]},
  { id:'5',name:'HR',icon:'🤝',description:'People operations, benefits, and employee relations',tier:1,active:true,agentCount:1,botCount:1,
    agents:[{name:'HR Policy Agent',status:'Active'}],bots:[{name:'PTO Tracker Bot',status:'Active'}],
    policies:[{name:'hr-employee-data',scope:'Full employee records, compensation'},{name:'hr-compliance',scope:'Labor law compliance docs'}],
    members:[{name:'Rachel Kim',role:'HR Director'},{name:'David Okafor',role:'HR Specialist'}]},
  { id:'6',name:'Marketing',icon:'📣',description:'Brand management, campaigns, and resident communications',tier:3,active:true,agentCount:1,botCount:1,
    agents:[{name:'Content Writer',status:'Active'}],bots:[{name:'Social Scheduler Bot',status:'Idle'}],
    policies:[{name:'marketing-content',scope:'Marketing assets, campaign data'}],members:[{name:'Lauren Hayes',role:'Marketing Manager'}]},
  { id:'7',name:'Finance',icon:'💰',description:'Budgeting, accounting, and financial reporting',tier:1,active:true,agentCount:2,botCount:1,
    agents:[{name:'Budget Analyzer',status:'Active'},{name:'Invoice Processor',status:'Active'}],bots:[{name:'Expense Alert Bot',status:'Active'}],
    policies:[{name:'finance-full',scope:'All financial data, GL, AP/AR'}],members:[{name:'James Mitchell',role:'Controller'},{name:'Priya Sharma',role:'Staff Accountant'}]},
  { id:'8',name:'Compliance',icon:'⚖️',description:'Regulatory compliance, audits, and risk management',tier:1,active:true,agentCount:1,botCount:1,
    agents:[{name:'Audit Trail Agent',status:'Active'}],bots:[{name:'Compliance Reminder Bot',status:'Active'}],
    policies:[{name:'compliance-all',scope:'Audit logs, regulatory filings, risk assessments'}],members:[{name:'Angela Torres',role:'Compliance Officer'}]},
  { id:'9',name:'IT',icon:'💻',description:'Technology infrastructure, security, and platform support',tier:1,active:true,agentCount:2,botCount:2,
    agents:[{name:'System Monitor',status:'Active'},{name:'Access Manager',status:'Active'}],bots:[{name:'Uptime Monitor Bot',status:'Active'},{name:'Password Reset Bot',status:'Active'}],
    policies:[{name:'it-admin',scope:'Full system admin, user provisioning'}],members:[{name:'Kevin Nguyen',role:'IT Director'},{name:'Zara Ahmed',role:'Systems Engineer'}]},
]

const INITIAL_USERS: AppUser[] = [
  {id:'1',name:'Admin User',email:'admin@example.com',department:'Operations',tier:1,status:'Active',lastActive:'2 min ago'},
  {id:'2',name:'Marcus Rivera',email:'mrivera@example.com',department:'Operations',tier:2,status:'Active',lastActive:'15 min ago'},
  {id:'3',name:'Sarah Chen',email:'schen@example.com',department:'Operations',tier:2,status:'Active',lastActive:'1 hour ago'},
  {id:'4',name:'Rachel Kim',email:'rkim@example.com',department:'HR',tier:1,status:'Active',lastActive:'3 hours ago'},
  {id:'5',name:'James Mitchell',email:'jmitchell@example.com',department:'Finance',tier:1,status:'Active',lastActive:'30 min ago'},
  {id:'6',name:'Kevin Nguyen',email:'knguyen@example.com',department:'IT',tier:1,status:'Active',lastActive:'5 min ago'},
  {id:'7',name:'Lauren Hayes',email:'lhayes@example.com',department:'Operations',tier:3,status:'Invited',lastActive:'—'},
  {id:'8',name:'Carlos Mendez',email:'cmendez@example.com',department:'Operations',tier:2,status:'Deactivated',lastActive:'Jan 15, 2026'},
]

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [toast, setToast] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS)
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS)

  const showToast = (msg: string) => setToast(msg)

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'general', label: 'General', icon: '⚙️' },
    { key: 'departments', label: 'Departments', icon: '🏢' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'security', label: 'Security', icon: '🛡️' },
    { key: 'sso', label: 'Single Sign-On', icon: '🔑' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'branding', label: 'Branding', icon: '🎨' },
    { key: 'billing', label: 'Billing', icon: '💳' },
    { key: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ]

  return (
    <div className="w-full mx-auto space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Configure your organization, authentication, and platform preferences</p>
      </div>
      <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
        <div className="w-48 shrink-0 space-y-1" style={{ minWidth: 180 }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all"
              style={{ background: activeTab === tab.key ? 'var(--bg3)' : 'transparent', color: activeTab === tab.key ? 'var(--text)' : 'var(--text3)' }}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          {activeTab === 'general' && <GeneralSettings showToast={showToast} />}
          {activeTab === 'departments' && <DepartmentsSettings departments={departments} setDepartments={setDepartments} showToast={showToast} />}
          {activeTab === 'users' && <UsersSettings users={users} setUsers={setUsers} departments={departments} showToast={showToast} />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'sso' && <SSOSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'branding' && <BrandingSettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'danger' && <DangerZone />}
        </div>
      </div>
    </div>
  )
}

function GeneralSettings({ showToast }: { showToast: (m: string) => void }) {
  const [orgName, setOrgName] = useState(() => { if (typeof window !== 'undefined') { const u = localStorage.getItem('zynthr_user'); if (u) { try { return JSON.parse(u).orgName || 'Zynthr' } catch { return 'Zynthr' } } } return 'Zynthr' })
  const [industry, setIndustry] = useState('Multifamily Real Estate')
  const [size, setSize] = useState('~30,000 units')
  const [contact, setContact] = useState('cgordon@example.com')

  const integrations = [
    { name: 'Microsoft 365', icon: '🟦', status: 'Connected' as const },
    { name: 'Google Workspace', icon: '🟩', status: 'Connected' as const },
    { name: 'Slack', icon: '💬', status: 'Not Connected' as const },
    { name: 'Yardi Voyager', icon: '🏠', status: 'Connected' as const },
    { name: 'DocuSign', icon: '✍️', status: 'Not Connected' as const },
    { name: 'Stripe', icon: '💳', status: 'Connected' as const },
  ]

  return (
    <>
      <SectionCard title="Organization" description="Your company information">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Organization Name" value={orgName} onChange={setOrgName} />
          <InputField label="Tenant ID" value="a0000000-0000-0000-0000-000000000001" disabled />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Industry" value={industry} onChange={setIndustry} />
          <InputField label="Size" value={size} onChange={setSize} />
        </div>
        <InputField label="Primary Contact" value={contact} onChange={setContact} />
      </SectionCard>

      <SectionCard title="Integrations" description="Connected systems and services">
        <div className="space-y-2">
          {integrations.map((int, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{int.icon}</span>
                <span className="text-sm" style={{ color: 'var(--text)' }}>{int.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  background: int.status === 'Connected' ? 'rgba(107,164,138,0.15)' : 'var(--bg3)',
                  color: int.status === 'Connected' ? 'var(--green)' : 'var(--text4)',
                }}>{int.status}</span>
                <button className="text-xs px-3 py-1 rounded-lg" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Manage</button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Platform Preferences">
        <StaticToggle label="Planning Mode Required" description="Require blueprint phase before building new agents or workflows" defaultChecked />
        <StaticToggle label="Source Citations" description="Show source links on all AI-generated answers" defaultChecked />
        <StaticToggle label="Confidence Scores" description="Display confidence percentages on complex answers" defaultChecked />
        <StaticToggle label="Mock Data Labels" description="Visually distinguish projected or estimated data with banners" defaultChecked />
        <StaticToggle label="Zero Hallucination Mode" description="Block responses when no verified source is available" defaultChecked />
      </SectionCard>


      <SectionCard title="Chat AI Model">
        <p className="text-xs mb-3" style={{ color: 'var(--text4)' }}>Choose which AI model powers your organization&apos;s chat assistant. Lower-cost models work great for most tasks.</p>
        <div className="grid gap-2">
          {[
            { key: 'claude-4-haiku', label: 'Claude 4 Haiku', cost: '$', speed: 'Ultra-fast', desc: 'Best value — fast and capable for everyday questions', rec: true },
            { key: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', cost: '$', speed: 'Very fast', desc: 'Lightweight OpenAI model, great at scale' },
            { key: 'claude-4-sonnet', label: 'Claude 4 Sonnet', cost: '$$', speed: 'Fast', desc: 'Premium quality for complex reasoning' },
            { key: 'gpt-4.1', label: 'GPT-4.1', cost: '$$', speed: 'Fast', desc: 'Strong general-purpose model' },
            { key: 'gpt-5', label: 'GPT-5', cost: '$$$', speed: 'Moderate', desc: 'Maximum capability for advanced tasks' },
          ].map(m => (
            <label key={m.key} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style={{ border: '1px solid var(--border)', background: m.key === 'claude-4-haiku' ? 'rgba(85,156,181,0.08)' : 'var(--bg)' }}>
              <input type="radio" name="chatModel" defaultChecked={m.key === 'claude-4-haiku'} style={{ accentColor: '#559CB5' }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{m.cost}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>{m.speed}</span>
                  {m.rec && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(85,156,181,0.15)', color: '#559CB5' }}>Recommended</span>}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text4)' }}>{m.desc}</div>
              </div>
            </label>
          ))}
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'var(--text4)' }}>💡 Haiku handles 90% of questions at ~10x lower cost than premium models. Upgrade only if you need deep analysis.</p>
      </SectionCard>
      <SectionCard title="Data Retention">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Audit Log Retention</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <option>90 days</option><option>180 days</option><option>1 year</option><option>Indefinite</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Chat History Retention</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <option>30 days</option><option>90 days</option><option>1 year</option><option>Indefinite</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={() => showToast('Organization settings saved')} className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--blue)', color: 'white' }}>Save Changes</button>
      </div>
    </>
  )
}

function DepartmentsSettings({ departments, setDepartments, showToast }: {
  departments: Department[]; setDepartments: (d: Department[]) => void; showToast: (m: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formIcon, setFormIcon] = useState('🏢')
  const [formDesc, setFormDesc] = useState('')
  const [formTier, setFormTier] = useState(3)
  const [formActive, setFormActive] = useState(true)

  const openCreate = () => {
    setEditId(null); setFormName(''); setFormIcon('🏢'); setFormDesc(''); setFormTier(3); setFormActive(true); setShowForm(true)
  }
  const openEdit = (d: Department) => {
    setEditId(d.id); setFormName(d.name); setFormIcon(d.icon); setFormDesc(d.description); setFormTier(d.tier); setFormActive(d.active); setShowForm(true)
  }
  const saveForm = () => {
    if (!formName.trim()) return
    if (editId) {
      setDepartments(departments.map(d => d.id === editId ? { ...d, name: formName, icon: formIcon, description: formDesc, tier: formTier, active: formActive } : d))
      showToast(formName + ' updated')
    } else {
      const newDept: Department = {
        id: Date.now().toString(), name: formName, icon: formIcon, description: formDesc, tier: formTier, active: formActive,
        agentCount: 0, botCount: 0, agents: [], bots: [], policies: [], members: [],
      }
      setDepartments([...departments, newDept])
      showToast(formName + ' created')
    }
    setShowForm(false)
  }
  const deleteDept = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id)); setConfirmDelete(null); showToast('Department deleted')
  }
  const toggleActive = (id: string) => {
    setDepartments(departments.map(d => d.id === id ? { ...d, active: !d.active } : d))
  }

  return (
    <>
      {confirmDelete && <ConfirmDialog title="Delete Department" message="This will remove the department and unassign all members. Continue?"
        onConfirm={() => deleteDept(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowForm(false)}>
          <div className="glass-card" style={{ padding: 24, borderRadius: 16, maxWidth: 480, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>{editId ? 'Edit Department' : 'Create Department'}</h3>
            <InputField label="Department Name *" value={formName} onChange={setFormName} placeholder="e.g. Operations" />
            <div className="mb-3">
              <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {DEPT_EMOJIS.map(e => (
                  <button key={e} onClick={() => setFormIcon(e)}
                    className="w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all"
                    style={{ background: formIcon === e ? 'var(--blue)' : 'var(--bg)', border: formIcon === e ? '2px solid var(--blue)' : '1px solid var(--border)' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Description</label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm" placeholder="What does this department do?"
                style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', resize: 'vertical' }} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Default Permission Tier</label>
                <select value={formTier} onChange={e => setFormTier(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                  <option value={1}>Tier 1 — Full Access</option><option value={2}>Tier 2 — Standard</option>
                  <option value={3}>Tier 3 — Limited</option><option value={4}>Tier 4 — Read Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Status</label>
                <div className="pt-1"><Toggle label="Active" description="" checked={formActive} onChange={setFormActive} /></div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Cancel</button>
              <button onClick={saveForm} className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--blue)', color: '#fff', opacity: formName.trim() ? 1 : 0.5 }}>{editId ? 'Save Changes' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Departments</h2>
          <p className="text-xs" style={{ color: 'var(--text4)' }}>{departments.length} departments · {departments.filter(d => d.active).length} active</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--blue)', color: '#fff' }}>+ Create Department</button>
      </div>

      <div className="space-y-3">
        {departments.map(dept => (
          <div key={dept.id} className="glass-card rounded-xl overflow-hidden" style={{ padding: 0 }}>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => setExpandedId(expandedId === dept.id ? null : dept.id)}>
                  <span className="text-2xl shrink-0">{dept.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                      <span className="truncate">{dept.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-normal shrink-0" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>Tier {dept.tier}</span>
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--text4)' }}>{dept.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-xs text-right hidden sm:block" style={{ color: 'var(--text4)' }}>{dept.agentCount} agents · {dept.botCount} bots</div>
                  <button onClick={() => toggleActive(dept.id)} className="w-10 h-5 rounded-full transition-all relative shrink-0"
                    style={{ background: dept.active ? 'var(--blue)' : 'var(--bg4)' }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: dept.active ? '22px' : '2px' }} />
                  </button>
                  <button onClick={() => openEdit(dept)} className="px-2.5 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Edit</button>
                  <button onClick={() => setConfirmDelete(dept.id)} className="px-2.5 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>Delete</button>
                </div>
              </div>
            </div>
            {expandedId === dept.id && (
              <div className="px-4 pb-4 pt-0" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Agents ({dept.agents.length})</h4>
                    {dept.agents.length === 0 ? <p className="text-xs" style={{ color: 'var(--text4)' }}>No agents assigned</p> :
                      dept.agents.map((a, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5">
                          <span className="text-xs" style={{ color: 'var(--text)' }}>🤖 {a.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                            background: a.status === 'Active' ? 'rgba(107,164,138,0.15)' : 'var(--bg3)',
                            color: a.status === 'Active' ? 'var(--green)' : 'var(--text4)',
                          }}>{a.status}</span>
                        </div>
                      ))}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Bots ({dept.bots.length})</h4>
                    {dept.bots.length === 0 ? <p className="text-xs" style={{ color: 'var(--text4)' }}>No bots assigned</p> :
                      dept.bots.map((b, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5">
                          <span className="text-xs" style={{ color: 'var(--text)' }}>⚡ {b.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                            background: b.status === 'Active' ? 'rgba(107,164,138,0.15)' : 'var(--bg3)',
                            color: b.status === 'Active' ? 'var(--green)' : 'var(--text4)',
                          }}>{b.status}</span>
                        </div>
                      ))}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>RKBAC Policies ({dept.policies.length})</h4>
                    {dept.policies.length === 0 ? <p className="text-xs" style={{ color: 'var(--text4)' }}>No policies</p> :
                      dept.policies.map((p, i) => (
                        <div key={i} className="py-1.5">
                          <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>🔒 {p.name}</span>
                          <div className="text-[10px]" style={{ color: 'var(--text4)' }}>{p.scope}</div>
                        </div>
                      ))}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Team Members ({dept.members.length})</h4>
                    {dept.members.length === 0 ? <p className="text-xs" style={{ color: 'var(--text4)' }}>No members</p> :
                      dept.members.map((m, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5">
                          <span className="text-xs" style={{ color: 'var(--text)' }}>👤 {m.name}</span>
                          <span className="text-[10px]" style={{ color: 'var(--text4)' }}>{m.role}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

function UsersSettings({ users, setUsers, departments, showToast }: {
  users: AppUser[]; setUsers: (u: AppUser[]) => void; departments: Department[]; showToast: (m: string) => void
}) {
  const [showInvite, setShowInvite] = useState(false)
  const [invName, setInvName] = useState('')
  const [invEmail, setInvEmail] = useState('')
  const [invDept, setInvDept] = useState('')
  const [invTier, setInvTier] = useState(3)
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null)

  const invite = () => {
    if (!invName.trim() || !invEmail.trim()) return
    setUsers([...users, { id: Date.now().toString(), name: invName, email: invEmail, department: invDept || 'Unassigned', tier: invTier, status: 'Invited', lastActive: '—' }])
    showToast('Invitation sent to ' + invEmail)
    setShowInvite(false); setInvName(''); setInvEmail(''); setInvDept(''); setInvTier(3)
  }

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id !== id) return u
      const newStatus: 'Active' | 'Deactivated' = u.status === 'Deactivated' ? 'Active' : 'Deactivated'
      return { ...u, status: newStatus }
    }))
    setConfirmDeactivate(null); showToast('User status updated')
  }

  const statusColor = (s: string) => {
    if (s === 'Active') return { bg: 'rgba(107,164,138,0.15)', color: 'var(--green)' }
    if (s === 'Invited') return { bg: 'rgba(85,156,181,0.15)', color: 'var(--blue)' }
    return { bg: 'var(--bg3)', color: 'var(--text4)' }
  }

  const deactivateUser = confirmDeactivate ? users.find(u => u.id === confirmDeactivate) : null

  return (
    <>
      {confirmDeactivate && deactivateUser && (
        <ConfirmDialog
          title={deactivateUser.status === 'Deactivated' ? 'Reactivate User' : 'Deactivate User'}
          message={'Are you sure you want to ' + (deactivateUser.status === 'Deactivated' ? 'reactivate' : 'deactivate') + ' ' + deactivateUser.name + '?'}
          onConfirm={() => toggleUserStatus(confirmDeactivate)} onCancel={() => setConfirmDeactivate(null)} />
      )}

      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowInvite(false)}>
          <div className="glass-card" style={{ padding: 24, borderRadius: 16, maxWidth: 440, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>Invite User</h3>
            <InputField label="Full Name *" value={invName} onChange={setInvName} placeholder="Jane Doe" />
            <InputField label="Email *" value={invEmail} onChange={setInvEmail} placeholder="jane@example.com" />
            <div className="mb-3">
              <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Department</label>
              <select value={invDept} onChange={e => setInvDept(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                <option value="">Select department</option>
                {departments.filter(d => d.active).map(d => <option key={d.id} value={d.name}>{d.icon} {d.name}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Permission Tier</label>
              <select value={invTier} onChange={e => setInvTier(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                <option value={1}>Tier 1 — Full Access</option><option value={2}>Tier 2 — Standard</option>
                <option value={3}>Tier 3 — Limited</option><option value={4}>Tier 4 — Read Only</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Cancel</button>
              <button onClick={invite} className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--blue)', color: '#fff', opacity: invName.trim() && invEmail.trim() ? 1 : 0.5 }}>Send Invite</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Users</h2>
          <p className="text-xs" style={{ color: 'var(--text4)' }}>{users.length} users · {users.filter(u => u.status === 'Active').length} active</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--blue)', color: '#fff' }}>+ Invite User</button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden" style={{ padding: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Name','Email','Department','Tier','Status','Last Active',''].map(h => (
                  <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: 'var(--text4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const sc = statusColor(u.status)
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{u.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text3)' }}>{u.email}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text3)' }}>{u.department}</td>
                    <td className="px-4 py-3"><span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text4)' }}>T{u.tier}</span></td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{u.status}</span></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text4)' }}>{u.lastActive}</td>
                    <td className="px-4 py-3">
                      {u.status !== 'Invited' && (
                        <button onClick={() => setConfirmDeactivate(u.id)} className="text-xs px-2.5 py-1 rounded-lg"
                          style={{ background: u.status === 'Deactivated' ? 'rgba(107,164,138,0.15)' : 'rgba(239,68,68,0.15)', color: u.status === 'Deactivated' ? 'var(--green)' : 'var(--red)' }}>
                          {u.status === 'Deactivated' ? 'Reactivate' : 'Deactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function SecuritySettings() {
  const [emailVerification, setEmailVerification] = useState(false)
  const [require2FA, setRequire2FA] = useState(false)
  const [tenantId, setTenantId] = useState('')
  useEffect(() => {
    let id = localStorage.getItem('zynthr_tenant_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('zynthr_tenant_id', id)
    }
    setTenantId(id)
  }, [])
  return (
    <>
      <SectionCard title="🔒 Data Isolation & HIPAA Controls" description="Your organization's PHI protection status">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>Active</span>
          <span style={{ color: 'var(--text)', fontSize: 15, fontWeight: 700 }}>🔒 Tenant Data Isolation</span>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text3)', lineHeight: 1.6 }}>
          Your organization&apos;s data is logically isolated. No other tenant can access your PHI.
        </p>
        <div className="p-3 rounded-lg mb-4" style={{ background: 'var(--bg)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text4)' }}>Tenant ID</div>
          <div className="text-xs font-mono" style={{ color: 'var(--text)', wordBreak: 'break-all' }}>{tenantId}</div>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Encryption at Rest', value: 'AES-256 ✅' },
            { label: 'Encryption in Transit', value: 'TLS 1.3 ✅' },
            { label: 'Audit Logging', value: 'Active ✅' },
            { label: 'Session Timeout', value: '15 minutes ✅' },
            { label: 'HIPAA Compliance Status', value: '✅ Controls Implemented' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <span className="text-sm" style={{ color: 'var(--text)' }}>{item.label}</span>
              <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Verification & Authentication" description="Control how users verify identity">
        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="text-sm" style={{ color: 'var(--text)' }}>Require Email Verification</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>New users must verify their email before accessing the platform</div>
          </div>
          <button onClick={() => setEmailVerification(!emailVerification)} className="w-10 h-5 rounded-full transition-all relative"
            style={{ background: emailVerification ? 'var(--blue)' : 'var(--bg4)' }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: emailVerification ? '22px' : '2px' }} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm" style={{ color: 'var(--text)' }}>Require Two-Factor Authentication (2FA)</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>All users must set up TOTP or SMS-based 2FA</div>
          </div>
          <button onClick={() => setRequire2FA(!require2FA)} className="w-10 h-5 rounded-full transition-all relative"
            style={{ background: require2FA ? 'var(--blue)' : 'var(--bg4)' }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: require2FA ? '22px' : '2px' }} />
          </button>
        </div>
      </SectionCard>
      <SectionCard title="Password Policy" description="Enforce password strength requirements">
        <StaticToggle label="Minimum 8 Characters" description="Passwords must be at least 8 characters long" defaultChecked />
        <StaticToggle label="Require Mixed Case" description="At least one uppercase and one lowercase letter" defaultChecked />
        <StaticToggle label="Require Numbers" description="At least one numeric digit" defaultChecked />
        <StaticToggle label="Require Special Characters" description="At least one symbol (!@#$%^&*)" />
      </SectionCard>
      <SectionCard title="Session Security">
        <StaticToggle label="Force Logout on Password Change" description="Invalidate all sessions when a user changes their password" defaultChecked />
        <StaticToggle label="Single Session Only" description="Allow only one active session per user" />
      </SectionCard>
      <SectionCard title="📄 Agreements" description="Legal agreements and compliance documents">
        <AgreementsSection />
      </SectionCard>
    </>
  )
}

function AgreementsSection() {
  const [agreements, setAgreements] = useState<{
    tosAccepted?: boolean; tosAcceptedAt?: string
    privacyAccepted?: boolean; privacyAcceptedAt?: string
    baaSignedDigitally?: boolean; baaSignedAt?: string; baaSignerName?: string
    baaDocuSignRequested?: boolean; baaDocuSignRequestedAt?: string
  }>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('zynthr_user') || '{}')
        setAgreements(stored)
      } catch { /* noop */ }
    }
  }, [])

  const formatDate = (iso?: string) => {
    if (!iso) return 'N/A'
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const items = [
    {
      name: 'Terms of Service',
      status: agreements.tosAccepted ? 'Accepted' : 'Not Accepted',
      date: agreements.tosAcceptedAt,
      color: agreements.tosAccepted ? '#22c55e' : 'var(--text4)',
      icon: agreements.tosAccepted ? '✅' : '⏳',
    },
    {
      name: 'Privacy Policy',
      status: agreements.privacyAccepted ? 'Accepted' : 'Not Accepted',
      date: agreements.privacyAcceptedAt,
      color: agreements.privacyAccepted ? '#22c55e' : 'var(--text4)',
      icon: agreements.privacyAccepted ? '✅' : '⏳',
    },
    {
      name: 'Business Associate Agreement (BAA)',
      status: agreements.baaSignedDigitally
        ? 'Signed Digitally'
        : agreements.baaDocuSignRequested
        ? 'Awaiting DocuSign Signature'
        : 'Not Required',
      date: agreements.baaSignedAt ?? agreements.baaDocuSignRequestedAt,
      color: agreements.baaSignedDigitally
        ? '#22c55e'
        : agreements.baaDocuSignRequested
        ? '#f59e0b'
        : 'var(--text4)',
      icon: agreements.baaSignedDigitally
        ? '✅'
        : agreements.baaDocuSignRequested
        ? '⚠️'
        : '—',
    },
  ]

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-lg shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.name}</div>
              <div className="text-xs" style={{ color: item.color }}>
                {item.status}{item.date ? ` — ${formatDate(item.date)}` : ''}
              </div>
            </div>
          </div>
          <button className="text-xs px-3 py-1.5 rounded-lg shrink-0 ml-3"
            style={{ background: 'var(--bg3)', color: '#559CB5', cursor: 'pointer', border: '1px solid var(--border)' }}
            title={`Download ${item.name}`}
            onClick={() => {
              const loadAndOpen = async () => {
                let title = '', content = '', sigInfo = ''
                if (item.name === 'Terms of Service') {
                  const { TERMS_OF_SERVICE } = await import('@/lib/legal-docs')
                  title = 'Zynthr \u2014 Terms of Service'; content = TERMS_OF_SERVICE
                  if (agreements.tosAcceptedAt) sigInfo = '\n\n---\nAccepted on: ' + formatDate(agreements.tosAcceptedAt)
                } else if (item.name === 'Privacy Policy') {
                  const { PRIVACY_POLICY } = await import('@/lib/legal-docs')
                  title = 'Zynthr \u2014 Privacy Policy'; content = PRIVACY_POLICY
                  if (agreements.privacyAcceptedAt) sigInfo = '\n\n---\nAccepted on: ' + formatDate(agreements.privacyAcceptedAt)
                } else {
                  const { BAA_CONTENT } = await import('@/lib/baa-content')
                  title = 'Zynthr \u2014 Business Associate Agreement'; content = BAA_CONTENT
                  if (agreements.baaSignedDigitally && agreements.baaSignerName) {
                    const a = agreements as Record<string, unknown>
                    sigInfo = '\n\n---\nDIGITALLY SIGNED\nSigner: ' + agreements.baaSignerName + '\nTitle: ' + (a.baaSignerTitle || 'N/A') + '\nOrganization: ' + (a.baaOrgName || 'N/A') + '\nDate: ' + formatDate(agreements.baaSignedAt) + '\nMethod: Digital signature via Zynthr platform'
                  }
                }
                const w = window.open('', '_blank')
                if (!w) return
                const esc = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                w.document.write('<!DOCTYPE html><html><head><title>' + title + '</title><style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1a1a1a;font-size:14px}h1{font-size:20px;border-bottom:2px solid #1a1a1a;padding-bottom:8px}pre{white-space:pre-wrap;word-wrap:break-word;font-family:inherit;font-size:14px}.tip{background:#3B82F6;color:white;padding:12px 20px;border-radius:8px;margin-bottom:24px;font-family:sans-serif;font-size:14px}@media print{.tip{display:none}}</style></head><body><div class="tip"><strong>\ud83d\udca1</strong> Press Ctrl+P (Cmd+P) to save as PDF</div><h1>' + title + '</h1><pre>' + esc(content + sigInfo) + '</pre></body></html>')
                w.document.close()
              }
              loadAndOpen()
            }}>
            Download PDF
          </button>
        </div>
      ))}
    </div>
  )
}

function SSOSettings() {
  return (
    <>
      <SectionCard title="Microsoft SSO (Entra ID)" description="Allow team members to sign in with their Microsoft work accounts">
        <StaticToggle label="Enable Microsoft SSO" description="Users can sign in with their @example.com accounts" defaultChecked />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <InputField label="Tenant ID" value="••••••••-••••-••••-••••-••••••••••••" />
          <InputField label="Client ID" value="••••••••-••••-••••-••••-••••••••••••" />
        </div>
        <InputField label="Redirect URI" value="https://nqheduewmpomsvnzjtlc.supabase.co/auth/v1/callback" disabled />
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }}></span>
          <span className="text-xs" style={{ color: 'var(--green)' }}>Connected and verified</span>
        </div>
      </SectionCard>
      <SectionCard title="Google SSO" description="Allow sign-in with Google Workspace accounts">
        <StaticToggle label="Enable Google SSO" description="Users can sign in with Google accounts" />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <InputField label="Client ID" value="" placeholder="Google OAuth Client ID" />
          <InputField label="Client Secret" value="" placeholder="Google OAuth Client Secret" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--text4)' }}></span>
          <span className="text-xs" style={{ color: 'var(--text4)' }}>Not configured</span>
        </div>
      </SectionCard>
      <SectionCard title="Email/Password" description="Fallback authentication for users without SSO">
        <StaticToggle label="Allow Email/Password Sign-in" description="Users can create accounts with email and password" defaultChecked />
        <StaticToggle label="Require Email Verification" description="New users must verify their email before accessing the platform" defaultChecked />
        <StaticToggle label="Enforce Strong Passwords" description="Minimum 12 characters, mixed case, numbers, and symbols" defaultChecked />
      </SectionCard>
      <SectionCard title="Session Security">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>Session Timeout</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <option>8 hours</option><option>12 hours</option><option>24 hours</option><option>7 days</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>MFA Requirement</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <option>Owner only</option><option>Owner + Department Heads</option><option>All users</option><option>Disabled</option>
            </select>
          </div>
        </div>
      </SectionCard>
    </>
  )
}

function NotificationSettings() {
  return (
    <>
      <SectionCard title="Alert Channels" description="Where should important notifications be sent?">
        <div className="space-y-3">
          {[
            { icon: '📧', name: 'Email', detail: 'cgordon@example.com', active: true },
            { icon: '📱', name: 'Telegram', detail: '@millie_bot', active: true },
            { icon: '💬', name: 'Slack', detail: 'Not connected', active: false },
          ].map((ch, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{ch.icon}</span>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text)' }}>{ch.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{ch.detail}</div>
                </div>
              </div>
              {ch.active ? (
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(107,164,138,0.15)', color: 'var(--green)' }}>Active</span>
              ) : (
                <button className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Connect</button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Notification Preferences" description="Choose what triggers alerts">
        <StaticToggle label="Security Alerts" description="Prompt injection attempts, unusual access patterns, failed logins" defaultChecked />
        <StaticToggle label="Ticket Escalations" description="When tickets are escalated or SLA breached" defaultChecked />
        <StaticToggle label="Exception Requests" description="When team members request access exceptions" defaultChecked />
        <StaticToggle label="Policy Changes" description="When RKBAC policies are created or modified" defaultChecked />
        <StaticToggle label="Workflow Failures" description="When automated workflows encounter errors" defaultChecked />
        <StaticToggle label="Agent Status Changes" description="When agents go offline or encounter issues" />
        <StaticToggle label="Weekly Summary" description="Digest of all activity, trends, and recommendations" defaultChecked />
      </SectionCard>
      <SectionCard title="Quiet Hours" description="Suppress non-critical notifications during off-hours">
        <StaticToggle label="Enable Quiet Hours" description="Only critical/security alerts during quiet hours" defaultChecked />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <InputField label="Start" value="11:00 PM" />
          <InputField label="End" value="7:00 AM" />
        </div>
      </SectionCard>
    </>
  )
}

function BrandingSettings() {
  const [colors, setColors] = useState({
    primary: '#559CB5',
    accent: '#8b5cf6',
    success: '#22c55e',
  })
  const [saved, setSaved] = useState(false)

  // Load saved brand colors
  useEffect(() => {
    const stored = localStorage.getItem('zynthr_brand')
    if (stored) {
      try { setColors(JSON.parse(stored)) } catch {}
    }
  }, [])

  const applyColors = (c: typeof colors) => {
    document.documentElement.style.setProperty('--brand-primary', c.primary)
    document.documentElement.style.setProperty('--brand-accent', c.accent)
    document.documentElement.style.setProperty('--brand-success', c.success)
    // Also override the main blue/purple used throughout
    document.documentElement.style.setProperty('--blue', c.primary)
    document.documentElement.style.setProperty('--purple', c.accent)
    document.documentElement.style.setProperty('--green', c.success)
  }

  const handleSave = async () => {
    localStorage.setItem('zynthr_brand', JSON.stringify(colors))
    applyColors(colors)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Persist to DB
    try {
      const stored = JSON.parse(localStorage.getItem('zynthr_user') || '{}')
      if (stored.userId) {
        await fetch('/api/org/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: stored.userId, settings: { brandColors: colors } })
        })
      }
    } catch {}
  }

  // Apply on mount
  useEffect(() => {
    const stored = localStorage.getItem('zynthr_brand')
    if (stored) {
      try { applyColors(JSON.parse(stored)) } catch {}
    }
  }, [])

  const presets = [
    { name: 'Zynthr Default', primary: '#559CB5', accent: '#8b5cf6', success: '#22c55e' },
    { name: 'Ocean', primary: '#0ea5e9', accent: '#6366f1', success: '#10b981' },
    { name: 'Rose', primary: '#e11d48', accent: '#be185d', success: '#22c55e' },
    { name: 'Forest', primary: '#059669', accent: '#047857', success: '#16a34a' },
    { name: 'Sunset', primary: '#ea580c', accent: '#dc2626', success: '#65a30d' },
    { name: 'Midnight', primary: '#3b82f6', accent: '#8b5cf6', success: '#22c55e' },
  ]

  return (
    <>
      <SectionCard title="Brand Colors" description="Your colors apply across the entire platform — dashboard, agents, bots, buttons, and accents">
        <div className="grid grid-cols-3 gap-4">
          {([
            { key: 'primary' as const, label: 'Primary', desc: 'Buttons, links, active states' },
            { key: 'accent' as const, label: 'Accent', desc: 'Gradients, highlights, badges' },
            { key: 'success' as const, label: 'Success', desc: 'Confirmations, active status' },
          ]).map(c => (
            <div key={c.key}>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text2)' }}>{c.label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={colors[c.key]}
                  onChange={e => { const newColors = { ...colors, [c.key]: e.target.value }; setColors(newColors); applyColors(newColors) }}
                  style={{ width: 40, height: 40, borderRadius: 8, border: '2px solid var(--border)', cursor: 'pointer', padding: 0 }} />
                <div>
                  <input type="text" value={colors[c.key]}
                    onChange={e => { const newColors = { ...colors, [c.key]: e.target.value }; setColors(newColors); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) applyColors(newColors) }}
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', width: 80 }} />
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text4)' }}>{c.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text2)' }}>Presets</label>
          <div className="flex gap-2 flex-wrap">
            {presets.map(p => (
              <button key={p.name} onClick={() => { const c = { primary: p.primary, accent: p.accent, success: p.success }; setColors(c); applyColors(c) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all hover:scale-105"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: p.primary, display: 'inline-block' }} />
                <span style={{ width: 12, height: 12, borderRadius: 4, background: p.accent, display: 'inline-block' }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 rounded-lg p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text4)' }}>PREVIEW</div>
            <div className="flex items-center gap-2 mb-2">
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: colors.primary }}>Primary Button</button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>Gradient</button>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ background: colors.success }}>Active</span>
            </div>
            <div className="flex gap-1">
              <span className="text-xs" style={{ color: colors.primary }}>Link text</span>
              <span className="text-xs" style={{ color: colors.accent }}>Accent text</span>
            </div>
          </div>
          <button onClick={handleSave}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: saved ? colors.success : `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
            {saved ? '✓ Saved!' : 'Save Colors'}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Organization Logo" description="Your logo appears in the sidebar, login screen, and reports. Max 500KB, PNG or SVG recommended.">
        <div className="grid grid-cols-2 gap-4">
          {(['dark', 'light'] as const).map(mode => {
            const key = 'zynthr_logo_' + mode
            const [logo, setLogo] = useState<string | null>(null)
            useEffect(() => { setLogo(localStorage.getItem(key)) }, [])
            const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              if (!file || file.size > 512000) { alert('Max 500KB'); return }
              const reader = new FileReader()
              reader.onload = () => {
                const dataUrl = reader.result as string
                localStorage.setItem(key, dataUrl)
                setLogo(dataUrl)
                // Dispatch event so sidebar picks it up
                window.dispatchEvent(new Event('zynthr_brand_updated'))
              }
              reader.readAsDataURL(file)
            }
            return (
              <div key={mode}>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text2)' }}>
                  {mode === 'dark' ? '🌙 Dark Mode Logo' : '☀️ Light Mode Logo'}
                </label>
                <label className="w-full h-28 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:opacity-80"
                  style={{ background: mode === 'dark' ? '#0a0e1a' : '#f8fafc', border: '2px dashed var(--border)' }}>
                  {logo ? (
                    <img src={logo} alt="Logo" style={{ maxHeight: 60, maxWidth: '80%', objectFit: 'contain' }} />
                  ) : (
                    <span className="text-sm" style={{ color: mode === 'dark' ? '#666' : '#999' }}>Click to upload</span>
                  )}
                  <input type="file" accept="image/png,image/svg+xml,image/jpeg" onChange={handleUpload} style={{ display: 'none' }} />
                </label>
                {logo && (
                  <button onClick={() => { localStorage.removeItem(key); setLogo(null); window.dispatchEvent(new Event('zynthr_brand_updated')) }}
                    className="text-[10px] mt-1" style={{ color: 'var(--red-text, #ff6b7a)', cursor: 'pointer', background: 'none', border: 'none' }}>Remove</button>
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title="Custom Domain" description="Point your own domain to this platform">
        <InputField label="Custom Domain" value="" placeholder="agents.yourdomain.com" />
        <div className="p-3 rounded-lg mt-2" style={{ background: 'var(--bg)', border: '1px dashed var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text4)' }}>Add a CNAME record pointing to <code style={{ color: colors.primary }}>cname.vercel-dns.com</code> then verify below.</p>
        </div>
        <button className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: colors.primary }}>Verify Domain</button>
      </SectionCard>

      <SectionCard title="White Label" description="Remove Zynthr Inc. branding for your tenants">
        <StaticToggle label="Hide 'Powered by Zynthr Inc.'" description="Remove platform attribution from footer and login screen" />
        <StaticToggle label="Custom Email Templates" description="Use your branding in system-sent emails" />
      </SectionCard>
    </>
  )
}

function BillingSettings() {
  const currentPlan = 'enterprise'
  const planNames: Record<string, string> = { free: 'Starter', professional: 'Professional', enterprise: 'Enterprise' }
  const planPrices: Record<string, string> = { free: 'Free', professional: '$49', enterprise: '$499' }
  const planDesc: Record<string, string> = {
    free: '2 agents • 1 bot • 100 queries/day • Community support',
    professional: '10 agents • 5 bots • 1,000 queries/day • Email support • SSO',
    enterprise: 'Unlimited agents • Custom domain • Priority support • RKBAC™',
  }
  const usageItems = [
    { label: 'AI Agents', used: 4, limit: 999, unit: 'agents' },
    { label: 'Bots', used: 2, limit: 999, unit: 'bots' },
    { label: 'AI Queries Today', used: 247, limit: 99999, unit: 'queries' },
    { label: 'Storage', used: 2.4, limit: 50, unit: 'GB' },
  ]

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId: 'current' }) })
      const data = await res.json() as { url?: string }
      if (data.url) window.location.href = data.url
    } catch { /* noop */ }
  }

  return (
    <>
      <SectionCard title="Current Plan">
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--blue)40' }}>
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{planNames[currentPlan]}</div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>{planDesc[currentPlan]}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: 'var(--blue)' }}>{planPrices[currentPlan]}<span className="text-sm font-normal" style={{ color: 'var(--text4)' }}>/mo</span></div>
            <div className="text-xs" style={{ color: 'var(--text4)' }}>Billed annually</div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <a href="/pricing" className="flex-1 py-2 rounded-lg font-medium text-sm text-center transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))', color: '#fff' }}>View Plans</a>
          <button onClick={handleManageBilling} className="flex-1 py-2 rounded-lg font-medium text-sm transition-all"
            style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Manage Billing</button>
        </div>
      </SectionCard>
      <SectionCard title="Usage This Period">
        <div className="space-y-3">
          {usageItems.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text2)' }}>{item.label}</span>
                <span style={{ color: 'var(--text4)' }}>{item.used.toLocaleString()} / {item.limit >= 999 ? '∞' : item.limit.toLocaleString()} {item.unit}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: item.limit >= 999 ? '5%' : Math.min((item.used / item.limit) * 100, 100) + '%', background: 'var(--blue)' }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Invoice History">
        <div className="space-y-2">
          {[{ date: 'Feb 1, 2026', amount: '$499.00' }, { date: 'Jan 1, 2026', amount: '$499.00' }, { date: 'Dec 1, 2025', amount: '$499.00' }].map((inv, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-3">
                <span className="text-sm">📄</span>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text)' }}>{inv.date}</div>
                  <div className="text-xs" style={{ color: 'var(--text4)' }}>{inv.amount}</div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(107,164,138,0.15)', color: 'var(--green)' }}>Paid</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text4)' }}>Payments processed securely via Stripe.</p>
      </SectionCard>
    </>
  )
}

function DangerZone() {
  return (
    <div className="p-1 rounded-xl" style={{ border: '1px solid var(--red)40' }}>
      <SectionCard title="⚠️ Danger Zone" description="These actions are irreversible. Proceed with caution.">
        <div className="space-y-4">
          {[
            { title: 'Reset All Agent Memory', desc: 'Wipe all stored knowledge and conversation history for all agents', btn: 'Reset Memory' },
            { title: 'Delete All Workflows', desc: 'Remove all workflows including active ones. This will stop all automations.', btn: 'Delete Workflows' },
            { title: 'Delete Organization', desc: 'Permanently delete this organization and all its data. Cannot be undone.', btn: 'Delete Organization' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div>
                <div className="text-sm" style={{ color: 'var(--text)' }}>{item.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text4)' }}>{item.desc}</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>{item.btn}</button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
