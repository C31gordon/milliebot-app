// Data service layer — queries Supabase with fallback to empty arrays
import { supabase } from './supabase'
import type { Agent, Bot, Ticket, Suggestion, AppUser, Department } from './supabase'

// Use untyped client for legacy table queries (tenants, tickets, users, etc.)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any

const TENANT_ID = 'a0000000-0000-0000-0000-000000000001'

export async function getAgents() {
  try {
    const { data, error } = await db
      .from('agents')
      .select('*, department:departments(id, name, icon, slug)')
      .eq('tenant_id', TENANT_ID)
    if (error) throw error
    return data || []
  } catch (e) { console.error('getAgents:', e); return [] }
}

export async function getBots() {
  try {
    const { data, error } = await db
      .from('bots')
      .select('*, agent:agents(id, name), department:departments(id, name)')
      .eq('tenant_id', TENANT_ID)
    if (error) throw error
    return data || []
  } catch (e) { console.error('getBots:', e); return [] }
}

export async function getTickets() {
  try {
    const { data, error } = await db
      .from('tickets')
      .select('*, requester:users!tickets_requester_id_fkey(id, full_name, email), target_department:departments!tickets_target_department_id_fkey(id, name)')
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) { console.error('getTickets:', e); return [] }
}

export async function getSuggestions() {
  try {
    const { data, error } = await db
      .from('suggestions')
      .select('*, submitter:users!suggestions_submitted_by_fkey(id, full_name)')
      .eq('tenant_id', TENANT_ID)
      .order('vote_count', { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) { console.error('getSuggestions:', e); return [] }
}

export async function getUsers() {
  try {
    const { data, error } = await db
      .from('users')
      .select('*, role:roles(id, name, tier), department:departments(id, name)')
      .eq('tenant_id', TENANT_ID)
    if (error) throw error
    return data || []
  } catch (e) { console.error('getUsers:', e); return [] }
}

export async function getDepartments() {
  try {
    const { data, error } = await db
      .from('departments')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('sort_order')
    if (error) throw error
    return data || []
  } catch (e) { console.error('getDepartments:', e); return [] }
}

export async function getAuditLog(limit = 50) {
  try {
    const { data, error } = await db
      .from('audit_log')
      .select('*, user:users(id, full_name)')
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  } catch (e) { console.error('getAuditLog:', e); return [] }
}

export async function getPolicies() {
  try {
    const { data, error } = await db
      .from('rkbac_policies')
      .select('*')
      .eq('tenant_id', TENANT_ID)
    if (error) throw error
    return data || []
  } catch (e) { console.error('getPolicies:', e); return [] }
}

// Re-export types for convenience
export type { Agent, Bot, Ticket, Suggestion, AppUser, Department }
