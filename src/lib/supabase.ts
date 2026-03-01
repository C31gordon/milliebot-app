import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// Database Types (matches schema.sql)
// ============================================================

export interface Organization {
  id: string
  name: string
  slug: string
  industry: string | null
  plan: string
  owner_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  hipaa_required: boolean
  baa_signed: boolean
  baa_signed_at: string | null
  baa_method: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface OrgMember {
  id: string
  org_id: string
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'member'
  permission_tier: number
  department: string | null
  status: 'active' | 'invited' | 'deactivated'
  invited_at: string | null
  joined_at: string | null
  last_active_at: string | null
  created_at: string
}

export interface DepartmentRow {
  id: string
  org_id: string
  name: string
  icon: string | null
  description: string | null
  default_tier: number
  status: string
  created_at: string
}

export interface AgentRow {
  id: string
  org_id: string
  department_id: string | null
  name: string
  description: string | null
  icon: string | null
  permission_tier: number
  model: string
  capabilities: string[]
  connected_systems: string[]
  status: 'online' | 'offline' | 'deploying' | 'error'
  created_at: string
  updated_at: string
}

export interface BotRow {
  id: string
  org_id: string
  agent_id: string
  name: string
  description: string | null
  capabilities: string[]
  status: string
  created_at: string
}

export interface ChatMessage {
  id: string
  org_id: string
  user_id: string
  agent_id: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuditLogEntry {
  id: string
  org_id: string
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface Agreement {
  id: string
  org_id: string
  user_id: string
  type: 'tos' | 'privacy_policy' | 'baa'
  version: string
  accepted_at: string
  ip_address: string | null
  user_agent: string | null
  signer_name: string | null
  signer_title: string | null
  method: string | null
  docusign_envelope_id: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization> & { name: string; slug: string }; Update: Partial<Organization> }
      org_members: { Row: OrgMember; Insert: Partial<OrgMember> & { org_id: string; user_id: string; role: string }; Update: Partial<OrgMember> }
      departments: { Row: DepartmentRow; Insert: Partial<DepartmentRow> & { org_id: string; name: string }; Update: Partial<DepartmentRow> }
      agents: { Row: AgentRow; Insert: Partial<AgentRow> & { org_id: string; name: string }; Update: Partial<AgentRow> }
      bots: { Row: BotRow; Insert: Partial<BotRow> & { org_id: string; agent_id: string; name: string }; Update: Partial<BotRow> }
      chat_messages: { Row: ChatMessage; Insert: Partial<ChatMessage> & { org_id: string; user_id: string; role: string; content: string }; Update: Partial<ChatMessage> }
      audit_log: { Row: AuditLogEntry; Insert: Partial<AuditLogEntry> & { org_id: string; action: string }; Update: Partial<AuditLogEntry> }
      agreements: { Row: Agreement; Insert: Partial<Agreement> & { org_id: string; user_id: string; type: string; version: string; accepted_at: string }; Update: Partial<Agreement> }
    }
  }
}

// ============================================================
// Legacy types (kept for existing component compatibility)
// ============================================================

export type RoleTier = 'owner' | 'department_head' | 'manager' | 'specialist'
export type AgentStatus = 'active' | 'paused' | 'configuring' | 'error'
export type BotStatus = 'active' | 'paused' | 'configuring' | 'error'
export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'waiting_on_requester' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type SuggestionStatus = 'new' | 'under_review' | 'planned' | 'building' | 'shipped' | 'declined'
export type SensitivityLevel = 'public' | 'internal' | 'confidential' | 'restricted'
export type ExceptionDuration = 'one_time' | '30_days' | '60_days' | '90_days' | 'custom' | 'permanent'
export type ExceptionStatus = 'pending' | 'approved' | 'denied' | 'expired' | 'revoked'
export type MemoryScope = 'core' | 'department' | 'agent' | 'bot'

export interface Tenant {
  id: string
  name: string
  slug: string
  domain: string | null
  logo_url: string | null
  brand_primary: string
  brand_secondary: string
  plan: string
}

export interface Department {
  id: string
  tenant_id: string
  name: string
  slug: string
  icon: string | null
  sort_order: number
}

export interface Role {
  id: string
  tenant_id: string
  name: string
  tier: RoleTier
  department_id: string | null
}

export interface AppUser {
  id: string
  auth_id: string
  tenant_id: string
  role_id: string
  department_id: string | null
  email: string
  full_name: string
  avatar_url: string | null
  is_active: boolean
  dashboard_config: Record<string, unknown>
  settings: Record<string, unknown>
  role?: Role
  department?: Department
  tenant?: Tenant
}

export interface Agent {
  id: string
  tenant_id: string
  department_id: string
  name: string
  description: string | null
  avatar_url: string | null
  status: AgentStatus
  owner_user_id: string | null
  capabilities: string[]
  department?: Department
}

export interface Bot {
  id: string
  tenant_id: string
  agent_id: string
  department_id: string
  name: string
  description: string | null
  icon: string | null
  status: BotStatus
  bot_type: string | null
  capabilities: string[]
}

export interface Ticket {
  id: string
  tenant_id: string
  ticket_number: number
  title: string
  description: string
  requester_id: string
  target_department_id: string
  assigned_to: string | null
  status: TicketStatus
  priority: TicketPriority
  category: string | null
  created_at: string
  updated_at: string
  requester?: AppUser
  target_department?: Department
}

export interface Suggestion {
  id: string
  tenant_id: string
  suggestion_number: number
  title: string
  description: string
  submitted_by: string
  status: SuggestionStatus
  vote_count: number
  created_at: string
}

export interface Notification {
  id: string
  title: string
  body: string | null
  type: string
  is_read: boolean
  created_at: string
}

// ============================================================
// Client Setup
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const hasSupabase = !!(supabaseUrl && supabaseAnonKey)

// Demo mode: explicit env var OR missing Supabase config
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !hasSupabase

export const supabase: SupabaseClient<Database> = hasSupabase
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder', {
      auth: { persistSession: false },
    })

// Service role client for server-side operations
export const supabaseAdmin: SupabaseClient<Database> = hasSupabase
  ? createClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
      { auth: { persistSession: false } }
    )
  : supabase

// Demo user for unauthenticated browsing
export const DEMO_USER = {
  id: 'demo-user',
  email: 'cgordon@risere.com',
  full_name: 'Courtney Gordon',
  role: 'COO',
  tier: 'owner' as RoleTier,
  tenant: 'RISE Real Estate',
}

// ============================================================
// Helper Functions
// ============================================================

export async function getOrganization(orgId: string): Promise<Organization | null> {
  if (DEMO_MODE) return null
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()
  return data
}

export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  if (DEMO_MODE) return []
  const { data } = await supabase
    .from('org_members')
    .select('*')
    .eq('org_id', orgId)
    .eq('status', 'active')
  return data ?? []
}

export async function getDepartments(orgId: string): Promise<DepartmentRow[]> {
  if (DEMO_MODE) return []
  const { data } = await supabase
    .from('departments')
    .select('*')
    .eq('org_id', orgId)
    .eq('status', 'active')
  return data ?? []
}

export async function getAgents(orgId: string): Promise<AgentRow[]> {
  if (DEMO_MODE) return []
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('org_id', orgId)
  return data ?? []
}

export async function logAudit(entry: {
  org_id: string
  user_id?: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}): Promise<void> {
  if (DEMO_MODE) {
    console.log('[DEMO] Audit log:', entry.action, entry)
    return
  }
  await (supabaseAdmin as SupabaseClient).from("audit_log").insert(entry)
}
