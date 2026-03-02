import { NextRequest, NextResponse } from 'next/server'

interface AgentTemplate {
  name: string
  description: string
  department: string
  model: string
  capabilities: string[]
  icon: string
}

const industryTemplates: Record<string, AgentTemplate[]> = {
  property: [
    { name: 'Leasing Assistant', description: 'Answer inquiries, schedule tours, pre-qualify prospects.', department: 'Leasing', model: 'llama-4-maverick', capabilities: ['chat', 'scheduling', 'data_retrieval', 'email_compose'], icon: '🏠' },
    { name: 'Maintenance Router', description: 'Categorize work orders, assign priority, route to teams.', department: 'Maintenance', model: 'llama-4-maverick', capabilities: ['chat', 'data_retrieval', 'workflow_execution'], icon: '🔧' },
    { name: 'Reporting Engine', description: 'Generate DLRs, occupancy tracking, revenue analysis.', department: 'Operations', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'document_generation', 'analytics', 'reporting'], icon: '📊' },
    { name: 'Renewal Manager', description: 'Track expirations, send offers, negotiate lease renewals.', department: 'Leasing', model: 'claude-4-sonnet', capabilities: ['email_compose', 'scheduling', 'data_retrieval', 'document_generation'], icon: '📋' },
    { name: 'HR Onboarder', description: 'New hire paperwork, training schedules, compliance tracking.', department: 'HR', model: 'claude-4-sonnet', capabilities: ['document_generation', 'scheduling', 'email_compose'], icon: '🎓' },
    { name: 'IT Helpdesk', description: 'Password resets, ticket triage, equipment requests.', department: 'IT', model: 'llama-4-maverick', capabilities: ['chat', 'workflow_execution', 'data_retrieval'], icon: '💻' },
  ],
  healthcare: [
    { name: 'Intake Coordinator', description: 'Patient registration, insurance verification, intake forms.', department: 'Front Office', model: 'claude-4-sonnet', capabilities: ['chat', 'data_retrieval', 'document_generation'], icon: '📝' },
    { name: 'Scheduling Assistant', description: 'Book appointments, handle cancellations, send reminders.', department: 'Front Office', model: 'llama-4-maverick', capabilities: ['scheduling', 'chat', 'send_notifications'], icon: '📅' },
    { name: 'Follow-Up Agent', description: 'Post-visit check-ins, care plan reminders, wellness tracking.', department: 'Clinical', model: 'claude-4-sonnet', capabilities: ['email_compose', 'chat', 'scheduling', 'data_retrieval'], icon: '💚' },
    { name: 'Compliance Monitor', description: 'HIPAA audit logging, BAA tracking, access reviews.', department: 'Admin', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'reporting', 'document_analysis'], icon: '🛡️' },
    { name: 'Billing Agent', description: 'Claims submission, payment tracking, patient billing.', department: 'Finance', model: 'llama-4-maverick', capabilities: ['data_retrieval', 'document_generation', 'reporting'], icon: '💰' },
  ],
  construction: [
    { name: 'Project Tracker', description: 'Monitor milestones, track deliverables, flag delays.', department: 'Operations', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'reporting', 'send_notifications'], icon: '🏗️' },
    { name: 'Safety Inspector', description: 'Log safety incidents, track certifications, compliance alerts.', department: 'Safety', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'document_analysis', 'reporting'], icon: '🦺' },
    { name: 'Bid Analyst', description: 'Parse RFPs, compare bids, generate cost estimates.', department: 'Estimating', model: 'claude-4-sonnet', capabilities: ['document_analysis', 'data_retrieval', 'document_generation'], icon: '📐' },
    { name: 'Subcontractor Coordinator', description: 'Schedule subs, track insurance docs, manage communications.', department: 'Operations', model: 'llama-4-maverick', capabilities: ['scheduling', 'email_compose', 'data_retrieval'], icon: '🤝' },
  ],
  legal: [
    { name: 'Contract Reviewer', description: 'Analyze contracts, flag risks, extract key terms.', department: 'Legal', model: 'claude-4-sonnet', capabilities: ['document_analysis', 'data_retrieval', 'reporting'], icon: '📜' },
    { name: 'Case Researcher', description: 'Research precedents, summarize rulings, compile briefs.', department: 'Research', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'document_generation', 'analytics'], icon: '🔍' },
    { name: 'Client Intake', description: 'Screen new clients, collect case details, conflict checks.', department: 'Admin', model: 'llama-4-maverick', capabilities: ['chat', 'data_retrieval', 'document_generation'], icon: '📋' },
    { name: 'Billing Tracker', description: 'Track billable hours, generate invoices, manage retainers.', department: 'Finance', model: 'llama-4-maverick', capabilities: ['data_retrieval', 'document_generation', 'reporting'], icon: '⏱️' },
  ],
  finance: [
    { name: 'Fraud Detector', description: 'Monitor transactions for anomalies, flag suspicious activity.', department: 'Risk', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'analytics', 'send_notifications'], icon: '🚨' },
    { name: 'Portfolio Analyst', description: 'Track investments, generate performance reports, risk analysis.', department: 'Investments', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'analytics', 'reporting'], icon: '📈' },
    { name: 'Compliance Officer', description: 'Regulatory monitoring, audit preparation, policy enforcement.', department: 'Compliance', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'document_analysis', 'reporting'], icon: '🛡️' },
    { name: 'Client Service Bot', description: 'Answer account inquiries, process requests, route escalations.', department: 'Client Services', model: 'llama-4-maverick', capabilities: ['chat', 'data_retrieval', 'send_notifications'], icon: '🏦' },
  ],
  hr: [
    { name: 'Recruiter Assistant', description: 'Screen resumes, schedule interviews, track candidates.', department: 'Talent Acquisition', model: 'claude-4-sonnet', capabilities: ['document_analysis', 'scheduling', 'email_compose'], icon: '🎯' },
    { name: 'Onboarding Guide', description: 'Walk new hires through setup, assign tasks, track completion.', department: 'People Ops', model: 'claude-4-sonnet', capabilities: ['chat', 'scheduling', 'document_generation'], icon: '🎓' },
    { name: 'Benefits Advisor', description: 'Answer benefits questions, enrollment support, plan comparisons.', department: 'Benefits', model: 'llama-4-maverick', capabilities: ['chat', 'data_retrieval', 'document_generation'], icon: '🏥' },
    { name: 'Policy Assistant', description: 'Answer HR policy questions, track acknowledgments.', department: 'Compliance', model: 'llama-4-maverick', capabilities: ['chat', 'data_retrieval', 'document_analysis'], icon: '📖' },
  ],
  education: [
    { name: 'Enrollment Assistant', description: 'Process applications, verify documents, guide applicants.', department: 'Admissions', model: 'claude-4-sonnet', capabilities: ['chat', 'data_retrieval', 'document_generation'], icon: '🎒' },
    { name: 'Student Advisor', description: 'Course recommendations, schedule planning, academic support.', department: 'Academic Affairs', model: 'claude-4-sonnet', capabilities: ['chat', 'data_retrieval', 'scheduling'], icon: '📚' },
    { name: 'Grading Assistant', description: 'Auto-grade assignments, provide feedback, track progress.', department: 'Faculty', model: 'claude-4-sonnet', capabilities: ['document_analysis', 'data_retrieval', 'reporting'], icon: '✏️' },
    { name: 'Financial Aid Bot', description: 'Answer aid questions, track applications, deadline reminders.', department: 'Financial Aid', model: 'llama-4-maverick', capabilities: ['chat', 'data_retrieval', 'send_notifications'], icon: '💲' },
  ],
  insurance: [
    { name: 'Claims Processor', description: 'Intake claims, validate documentation, route for review.', department: 'Claims', model: 'claude-4-sonnet', capabilities: ['document_analysis', 'data_retrieval', 'workflow_execution'], icon: '📄' },
    { name: 'Underwriting Assistant', description: 'Risk assessment, policy pricing, application review.', department: 'Underwriting', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'analytics', 'document_analysis'], icon: '📊' },
    { name: 'Policy Service Bot', description: 'Answer policyholder questions, process changes, renewals.', department: 'Customer Service', model: 'llama-4-maverick', capabilities: ['chat', 'data_retrieval', 'document_generation'], icon: '🤝' },
    { name: 'Fraud Analyst', description: 'Flag suspicious claims, pattern detection, investigation support.', department: 'Special Investigations', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'analytics', 'reporting'], icon: '🔍' },
  ],
  retail: [
    { name: 'Customer Service Agent', description: 'Handle inquiries, process returns, track orders.', department: 'Customer Service', model: 'llama-4-maverick', capabilities: ['chat', 'data_retrieval', 'send_notifications'], icon: '🛍️' },
    { name: 'Inventory Manager', description: 'Track stock levels, reorder alerts, demand forecasting.', department: 'Operations', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'analytics', 'reporting'], icon: '📦' },
    { name: 'Marketing Automator', description: 'Segment customers, personalize campaigns, track performance.', department: 'Marketing', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'email_compose', 'analytics'], icon: '📣' },
    { name: 'Merchandising Analyst', description: 'Pricing optimization, product mix analysis, trend spotting.', department: 'Merchandising', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'analytics', 'reporting'], icon: '🏷️' },
  ],
  logistics: [
    { name: 'Dispatch Optimizer', description: 'Route optimization, load planning, driver assignment.', department: 'Operations', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'analytics', 'workflow_execution'], icon: '🚛' },
    { name: 'Shipment Tracker', description: 'Real-time tracking, ETA updates, exception alerts.', department: 'Operations', model: 'llama-4-maverick', capabilities: ['data_retrieval', 'send_notifications', 'chat'], icon: '📍' },
    { name: 'Warehouse Assistant', description: 'Pick/pack optimization, inventory reconciliation.', department: 'Warehouse', model: 'llama-4-maverick', capabilities: ['data_retrieval', 'workflow_execution'], icon: '🏭' },
    { name: 'Compliance Tracker', description: 'DOT compliance, driver hours, vehicle maintenance.', department: 'Compliance', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'reporting', 'send_notifications'], icon: '📋' },
  ],
  hospitality: [
    { name: 'Reservation Agent', description: 'Handle bookings, modifications, cancellations, upsells.', department: 'Front Desk', model: 'llama-4-maverick', capabilities: ['chat', 'scheduling', 'data_retrieval'], icon: '🛎️' },
    { name: 'Guest Concierge', description: 'Local recommendations, service requests, complaint resolution.', department: 'Guest Services', model: 'claude-4-sonnet', capabilities: ['chat', 'data_retrieval', 'email_compose'], icon: '🌟' },
    { name: 'Revenue Manager', description: 'Dynamic pricing, occupancy forecasting, comp set analysis.', department: 'Revenue', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'analytics', 'reporting'], icon: '💹' },
    { name: 'Housekeeping Coordinator', description: 'Room assignment, turnover tracking, supply management.', department: 'Housekeeping', model: 'llama-4-maverick', capabilities: ['workflow_execution', 'data_retrieval'], icon: '🧹' },
  ],
  manufacturing: [
    { name: 'Production Planner', description: 'Schedule runs, optimize capacity, manage work orders.', department: 'Production', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'analytics', 'scheduling'], icon: '⚙️' },
    { name: 'Quality Inspector', description: 'Track defects, manage NCRs, analyze quality trends.', department: 'Quality', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'reporting', 'document_analysis'], icon: '🔬' },
    { name: 'Supply Chain Agent', description: 'Vendor management, PO tracking, lead time monitoring.', department: 'Procurement', model: 'llama-4-maverick', capabilities: ['data_retrieval', 'email_compose'], icon: '🔗' },
    { name: 'Safety Monitor', description: 'Incident reporting, OSHA compliance, training tracking.', department: 'EHS', model: 'claude-4-sonnet', capabilities: ['data_retrieval', 'reporting', 'send_notifications'], icon: '🦺' },
  ],
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const industry = searchParams.get('industry')

  if (industry) {
    const templates = industryTemplates[industry]
    if (!templates) {
      return NextResponse.json({ error: `Unknown industry: ${industry}. Supported: ${Object.keys(industryTemplates).join(', ')}` }, { status: 400 })
    }
    return NextResponse.json({ industry, templates })
  }

  const summary = Object.entries(industryTemplates).map(([key, templates]) => ({
    industry: key,
    templateCount: templates.length,
    templates,
  }))

  return NextResponse.json({ industries: summary })
}
