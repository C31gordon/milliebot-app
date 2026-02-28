'use client'

import { useState } from 'react'

// ── Helpers ──────────────────────────────────────────

function calcGA(edd: Date): { weeks: number; days: number } {
  const now = new Date()
  const conception = new Date(edd)
  conception.setDate(conception.getDate() - 280)
  const diff = Math.floor((now.getTime() - conception.getTime()) / (1000 * 60 * 60 * 24))
  return { weeks: Math.floor(diff / 7), days: diff % 7 }
}

const EDD = new Date('2026-03-08')
const ga = calcGA(EDD)
const gaStr = `${ga.weeks}w${ga.days}d`
const gaTotal = ga.weeks + ga.days / 7

// ── Demo Data ──────────────────────────────────────────

const patient = {
  name: 'Amanda Foster',
  age: 31,
  gravida: 2,
  para: 1,
  edd: 'March 8, 2026',
  ga: gaStr,
  bloodType: 'O+',
  insurance: 'Blue Cross PPO',
  allergies: 'Penicillin',
  birthPlan: 'Home Birth',
  phone: '(904) 555-0147',
  email: 'amanda.foster@email.com',
}

const flowsheetData = [
  { date: '06/28/25', ga: '8w0d',  weight: 142, bp: '112/72', fh: '-',  fhr: '-',   position: '-',     urine: 'Neg/Neg',     edema: 'None', notes: 'Initial prenatal visit. Dating scan confirmed.', flag: false, upcoming: false },
  { date: '07/26/25', ga: '12w0d', weight: 143, bp: '110/70', fh: '-',  fhr: '160',  position: '-',     urine: 'Neg/Neg',     edema: 'None', notes: 'NT scan normal. NIPT low risk.', flag: false, upcoming: false },
  { date: '09/20/25', ga: '20w0d', weight: 148, bp: '114/74', fh: '20', fhr: '148',  position: '-',     urine: 'Neg/Neg',     edema: 'None', notes: 'Anatomy scan — all normal. Girl!', flag: false, upcoming: false },
  { date: '10/18/25', ga: '24w0d', weight: 153, bp: '116/72', fh: '24', fhr: '144',  position: '-',     urine: 'Neg/Neg',     edema: 'None', notes: 'Glucose screen scheduled for 26w.', flag: false, upcoming: false },
  { date: '11/01/25', ga: '26w0d', weight: 155, bp: '118/76', fh: '26', fhr: '140',  position: 'Cephalic', urine: 'Neg/Neg',  edema: 'None', notes: '1-hr glucose: 118 mg/dL — Pass.', flag: false, upcoming: false },
  { date: '11/15/25', ga: '28w0d', weight: 158, bp: '120/78', fh: '28', fhr: '142',  position: 'Cephalic', urine: 'Neg/Neg',  edema: 'Trace', notes: 'Rh+ confirmed. Rhogam not needed.', flag: false, upcoming: false },
  { date: '12/13/25', ga: '32w0d', weight: 162, bp: '118/74', fh: '32', fhr: '138',  position: 'Cephalic', urine: 'Neg/Neg',  edema: 'Trace', notes: 'Home birth supplies checklist reviewed.', flag: false, upcoming: false },
  { date: '01/10/26', ga: '36w0d', weight: 167, bp: '122/78', fh: '35', fhr: '136',  position: 'Cephalic', urine: 'Neg/Neg',  edema: '1+',    notes: 'GBS culture collected. Home visit done.', flag: false, upcoming: false },
  { date: '01/24/26', ga: '38w0d', weight: 170, bp: '124/80', fh: '37', fhr: '140',  position: 'LOA',      urine: 'Trace/Neg', edema: '1+',   notes: 'Trace protein — recheck next visit. BP borderline.', flag: true, upcoming: false },
  { date: '02/07/26', ga: '40w0d', weight: 0, bp: '-',      fh: '-',  fhr: '-',    position: '-',     urine: '-',           edema: '-',    notes: 'Upcoming — EDD visit', flag: false, upcoming: true },
]

const labResults = [
  { name: 'Blood Type & Antibody Screen', ga: '8w', date: '06/28/25', status: 'completed', result: 'O+ / Ab neg' },
  { name: 'CBC', ga: '8w', date: '06/28/25', status: 'completed', result: 'Hgb 12.8, Hct 38.2, Plt 245K' },
  { name: 'NIPT / NT Scan', ga: '12w', date: '07/26/25', status: 'completed', result: 'Low risk all trisomies. NT 1.2mm' },
  { name: 'Anatomy Scan', ga: '20w', date: '09/20/25', status: 'completed', result: 'Normal anatomy. Female. AFI normal.' },
  { name: 'Glucose Tolerance (1-hr)', ga: '26w', date: '11/01/25', status: 'completed', result: '118 mg/dL — Pass' },
  { name: 'CBC Repeat', ga: '28w', date: '11/15/25', status: 'completed', result: 'Hgb 11.6, Hct 35.1, Plt 238K' },
  { name: 'GBS Culture', ga: '36w', date: '01/10/26', status: 'completed', result: 'Negative' },
]

const birthPlan = {
  location: 'Home Birth (water birth tub)',
  waterBirth: true,
  painMgmt: 'Hydrotherapy, breathing techniques, TENS unit, no pharmacological',
  support: ['Partner (Marcus)', 'Doula (Sarah Chen)', 'Birth photographer'],
  cordClamping: 'Delayed (3+ minutes)',
  skinToSkin: 'Immediate & uninterrupted for 1+ hour',
  feedingPlan: 'Exclusive breastfeeding',
  placenta: 'Encapsulation',
  thirdStage: 'Physiologic (expectant management)',
}

const riskFactors = [
  { factor: 'Multiparous (G2P1)', risk: 'low' },
  { factor: 'Prior uncomplicated SVD', risk: 'low' },
  { factor: 'No gestational diabetes', risk: 'low' },
  { factor: 'GBS Negative', risk: 'low' },
  { factor: 'Trace proteinuria (38w) — monitoring', risk: 'watch' },
  { factor: 'BMI 24.3 (normal)', risk: 'low' },
]

const postpartumPlan = {
  homeVisits: ['Day 1 (24h postpartum)', 'Day 3', 'Week 1', 'Week 2', 'Week 6'],
  edinburgh: ['Week 2', 'Week 6', '3 months', '6 months'],
  pediatrician: 'Dr. Rachel Kim — First Coast Pediatrics',
  lactation: 'IBCLC consult Day 3 if needed; breastfeeding support group Wednesdays',
  newbornScreening: 'State metabolic screen 24-48h; hearing screen Day 3',
}

// ── Cell style ──────────────────────────────────────
const cellStyle: React.CSSProperties = {
  padding: '8px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text)', whiteSpace: 'nowrap' as const,
}

// ── Sub-components ──────────────────────────────────────

function InfoRow({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div style={{ fontSize: 13, marginBottom: 4 }}>
      <span style={{ color: 'var(--text4)' }}>{label}: </span>
      <span style={{
        color: warn ? '#f87171' : highlight ? '#4ade80' : 'var(--text)',
        fontWeight: highlight || warn ? 700 : 500,
      }}>{value}</span>
    </div>
  )
}

function RiskBadge({ level }: { level: 'Low' | 'Moderate' | 'High' }) {
  const colors = { Low: '#4ade80', Moderate: '#f59e0b', High: '#ef4444' }
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 6,
      background: `${colors[level]}22`, color: colors[level],
      border: `1px solid ${colors[level]}44`,
    }}>
      {level === 'Low' ? '🟢' : level === 'Moderate' ? '🟡' : '🔴'} {level} Risk
    </span>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 12px' }}>{children}</h3>
}

function PlanItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ color: 'var(--text)', marginTop: 2, fontSize: 13 }}>{value}</div>
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────

function OverviewTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
      <div className="glass-card" style={{ padding: 18 }}>
        <SectionTitle>🛡️ Risk Assessment</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <RiskBadge level="Low" />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Updated 01/24/26</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {riskFactors.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: f.risk === 'low' ? '#4ade80' : '#f59e0b',
              }} />
              <span style={{ color: f.risk === 'watch' ? '#f59e0b' : 'var(--text3)' }}>{f.factor}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: 18 }}>
        <SectionTitle>📅 Visit History</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
          {flowsheetData.filter(v => !v.upcoming).reverse().map((v, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 10px', borderRadius: 6,
              background: v.flag ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.02)',
              border: v.flag ? '1px solid rgba(248,113,113,0.2)' : '1px solid transparent',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{v.date} — {v.ga}</div>
                <div style={{ fontSize: 11, color: v.flag ? '#f87171' : 'var(--text4)', marginTop: 2 }}>{v.notes}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text4)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                BP {v.bp}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: 18 }}>
        <SectionTitle>🧪 Lab Summary</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {labResults.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <span style={{ color: '#4ade80' }}>✅</span>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{l.name}</span>
                <span style={{ color: 'var(--text4)', marginLeft: 6 }}>({l.ga})</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text4)' }}>{l.result}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: 18 }}>
        <SectionTitle>🏠 Birth Plan Summary</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
          <PlanItem label="Location" value={birthPlan.location} />
          <PlanItem label="Water Birth" value={birthPlan.waterBirth ? 'Yes — birth tub' : 'No'} />
          <PlanItem label="Pain Management" value={birthPlan.painMgmt} />
          <PlanItem label="Support Team" value={birthPlan.support.join(', ')} />
          <PlanItem label="Cord Clamping" value={birthPlan.cordClamping} />
          <PlanItem label="Skin-to-Skin" value={birthPlan.skinToSkin} />
          <PlanItem label="Feeding Plan" value={birthPlan.feedingPlan} />
          <PlanItem label="Placenta" value={birthPlan.placenta} />
        </div>
      </div>
    </div>
  )
}

// ── Flowsheet Tab ──────────────────────────────────────

function FlowsheetTab() {
  return (
    <div className="glass-card" style={{ padding: 18, overflowX: 'auto' }}>
      <SectionTitle>📋 Prenatal Flowsheet</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {['Date', 'GA', 'Wt (lb)', 'BP', 'FH (cm)', 'FHR', 'Position', 'Urine (P/G)', 'Edema', 'Notes'].map(h => (
              <th key={h} style={{
                textAlign: 'left' as const, padding: '8px 10px', borderBottom: '1px solid var(--border)',
                color: 'var(--text4)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' as const,
                letterSpacing: '0.05em', whiteSpace: 'nowrap' as const,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flowsheetData.map((row, i) => (
            <tr key={i} style={{
              background: row.flag ? 'rgba(248,113,113,0.06)' : row.upcoming ? 'rgba(96,165,250,0.06)' : 'transparent',
              opacity: row.upcoming ? 0.5 : 1,
            }}>
              <td style={cellStyle}>{row.date}</td>
              <td style={cellStyle}><span style={{ color: 'var(--blue)', fontWeight: 600 }}>{row.ga}</span></td>
              <td style={cellStyle}>{row.weight || '-'}</td>
              <td style={{ ...cellStyle, color: row.flag ? '#f87171' : 'var(--text)', fontWeight: row.flag ? 700 : 400 }}>{row.bp}</td>
              <td style={cellStyle}>{row.fh}</td>
              <td style={cellStyle}>{row.fhr}</td>
              <td style={cellStyle}>{row.position}</td>
              <td style={{ ...cellStyle, color: row.urine?.includes('Trace') ? '#f59e0b' : 'var(--text)' }}>{row.urine}</td>
              <td style={cellStyle}>{row.edema}</td>
              <td style={{ ...cellStyle, maxWidth: 280, fontSize: 11, color: row.flag ? '#f87171' : 'var(--text3)', whiteSpace: 'normal' as const }}>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Labs Tab ──────────────────────────────────────

function LabsTab() {
  return (
    <div>
      <SectionTitle>🧪 Lab Results Timeline</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {labResults.map((l, i) => (
          <div key={i} className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{l.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 2 }}>{l.ga} — {l.date}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                background: 'rgba(74,222,128,0.12)', color: '#4ade80',
              }}>✅ Completed</span>
            </div>
            <div style={{
              fontSize: 13, color: 'var(--text)', padding: '8px 12px', borderRadius: 6,
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
            }}>
              {l.result}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Plan Tab ──────────────────────────────────────

function PlanTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
      <div className="glass-card" style={{ padding: 18 }}>
        <SectionTitle>🏠 Birth Plan</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PlanItem label="Birth Location" value={birthPlan.location} />
          <PlanItem label="Water Birth" value={birthPlan.waterBirth ? 'Yes — inflatable birth tub' : 'No'} />
          <PlanItem label="Pain Management" value={birthPlan.painMgmt} />
          <PlanItem label="Support Team" value={birthPlan.support.join(', ')} />
          <PlanItem label="Cord Clamping" value={birthPlan.cordClamping} />
          <PlanItem label="Skin-to-Skin" value={birthPlan.skinToSkin} />
          <PlanItem label="Feeding Plan" value={birthPlan.feedingPlan} />
          <PlanItem label="Placenta" value={birthPlan.placenta} />
          <PlanItem label="Third Stage Management" value={birthPlan.thirdStage} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 18 }}>
        <SectionTitle>🍼 Postpartum Plan</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase' as const, marginBottom: 6 }}>Home Visit Schedule</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {postpartumPlan.homeVisits.map((v, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(96,165,250,0.1)', color: 'var(--blue)', border: '1px solid rgba(96,165,250,0.2)',
                }}>{v}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase' as const, marginBottom: 6 }}>Edinburgh Screening (PPD)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {postpartumPlan.edinburgh.map((v, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)',
                }}>{v}</span>
              ))}
            </div>
          </div>
          <PlanItem label="Newborn Pediatrician" value={postpartumPlan.pediatrician} />
          <PlanItem label="Lactation Support" value={postpartumPlan.lactation} />
          <PlanItem label="Newborn Screening" value={postpartumPlan.newbornScreening} />
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────

function trimesterColor(week: number) {
  if (week <= 13) return '#a78bfa'
  if (week <= 27) return '#60a5fa'
  return '#4ade80'
}

const milestones = [
  { week: 12, label: 'NT Scan', color: '#a78bfa' },
  { week: 20, label: 'Anatomy', color: '#60a5fa' },
  { week: 26, label: 'Glucose', color: '#60a5fa' },
  { week: 36, label: 'GBS', color: '#4ade80' },
  { week: 37, label: 'Full Term', color: '#4ade80' },
  { week: 40, label: 'EDD', color: '#f59e0b' },
  { week: 42, label: 'Post-dates', color: '#ef4444' },
]

export default function PatientDashboardView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'flowsheet' | 'labs' | 'plan'>('overview')

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            👩‍⚕️ Patient Dashboard
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13, margin: '4px 0 0' }}>Midwifery Clinical View</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Schedule Next Visit', 'Order Labs', 'Update Birth Plan', 'Message Patient', 'View Full Chart'].map(a => (
            <button key={a} className="glass-card" style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'var(--blue)',
              border: '1px solid var(--blue)', borderRadius: 8, cursor: 'pointer', background: 'rgba(85,156,181,0.08)',
              whiteSpace: 'nowrap',
            }}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{patient.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Age {patient.age} · G{patient.gravida}P{patient.para}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{patient.phone} · {patient.email}</div>
          </div>
          <div>
            <InfoRow label="EDD" value={patient.edd} />
            <InfoRow label="Current GA" value={patient.ga} highlight />
            <InfoRow label="Blood Type" value={patient.bloodType} />
          </div>
          <div>
            <InfoRow label="Insurance" value={patient.insurance} />
            <InfoRow label="Allergies" value={patient.allergies} warn />
            <InfoRow label="Birth Plan" value={patient.birthPlan} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <RiskBadge level="Low" />
            <span style={{ fontSize: 12, color: 'var(--text4)', padding: '4px 10px', background: 'rgba(74,222,128,0.1)', borderRadius: 6, border: '1px solid rgba(74,222,128,0.2)' }}>
              🏠 Home Birth Candidate
            </span>
            <span style={{ fontSize: 12, color: 'var(--text4)', padding: '4px 10px', background: 'rgba(96,165,250,0.1)', borderRadius: 6, border: '1px solid rgba(96,165,250,0.2)' }}>
              GBS Negative ✓
            </span>
          </div>
        </div>
      </div>

      {/* GA Tracker */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
          Gestational Age Tracker — {patient.ga}
        </div>
        <div style={{ position: 'relative', height: 36, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(13/42)*100}%`, background: 'rgba(167,139,250,0.15)' }} />
          <div style={{ position: 'absolute', left: `${(13/42)*100}%`, top: 0, bottom: 0, width: `${(14/42)*100}%`, background: 'rgba(96,165,250,0.15)' }} />
          <div style={{ position: 'absolute', left: `${(27/42)*100}%`, top: 0, bottom: 0, width: `${(15/42)*100}%`, background: 'rgba(74,222,128,0.15)' }} />
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${Math.min((gaTotal/42)*100, 100)}%`,
            background: `linear-gradient(90deg, #a78bfa, #60a5fa, ${trimesterColor(ga.weeks)})`,
            opacity: 0.3, borderRadius: 8,
          }} />
          <div style={{
            position: 'absolute', left: `${(gaTotal/42)*100}%`, top: -2, bottom: -2,
            width: 3, background: trimesterColor(ga.weeks), borderRadius: 2,
            boxShadow: `0 0 8px ${trimesterColor(ga.weeks)}`,
          }} />
        </div>
        <div style={{ position: 'relative', height: 40, marginTop: 4 }}>
          {milestones.map(m => (
            <div key={m.week} style={{
              position: 'absolute', left: `${(m.week/42)*100}%`, transform: 'translateX(-50%)',
              textAlign: 'center', fontSize: 10, lineHeight: 1.2,
            }}>
              <div style={{ width: 1, height: 8, background: m.color, margin: '0 auto 2px', opacity: 0.6 }} />
              <div style={{ color: m.color, fontWeight: 600 }}>{m.week}w</div>
              <div style={{ color: 'var(--text4)', whiteSpace: 'nowrap' }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 4 }}>
          <div style={{ width: `${(13/42)*100}%`, textAlign: 'center', fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>1st Trimester</div>
          <div style={{ width: `${(14/42)*100}%`, textAlign: 'center', fontSize: 11, color: '#60a5fa', fontWeight: 600 }}>2nd Trimester</div>
          <div style={{ width: `${(15/42)*100}%`, textAlign: 'center', fontSize: 11, color: '#4ade80', fontWeight: 600 }}>3rd Trimester</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {([
          { id: 'overview' as const, label: 'Overview' },
          { id: 'flowsheet' as const, label: 'Prenatal Flowsheet' },
          { id: 'labs' as const, label: 'Lab Results' },
          { id: 'plan' as const, label: 'Birth & Postpartum Plan' },
        ]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: 'transparent', border: 'none',
            color: activeTab === t.id ? 'var(--blue)' : 'var(--text3)',
            borderBottom: activeTab === t.id ? '2px solid var(--blue)' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'flowsheet' && <FlowsheetTab />}
      {activeTab === 'labs' && <LabsTab />}
      {activeTab === 'plan' && <PlanTab />}
    </div>
  )
}
