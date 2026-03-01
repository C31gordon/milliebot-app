// Data service layer — queries Supabase with org context
import { supabase } from './supabase'
import type { Agent, Bot, Ticket, Suggestion, AppUser, Department } from './supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any

// Timeout wrapper — abort query after 4s
function withTimeout<T>(promise: Promise<T>, fallback: T, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => {
      console.warn(`${label}: timed out after 4s`)
      resolve(fallback)
    }, 4000)),
  ])
}

export async function getAgents(orgId?: string) {
  if (!orgId) return []
  return withTimeout((async () => {
    try {
      const { data, error } = await db.from('agents').select('*, department:departments(id, name, icon, slug)').eq('org_id', orgId)
      if (error) throw error
      return data || []
    } catch (e) { console.error('getAgents:', e); return [] }
  })(), [], 'getAgents')
}

export async function getBots(orgId?: string) {
  if (!orgId) return []
  return withTimeout((async () => {
    try {
      const { data, error } = await db.from('bots').select('*, agent:agents(id, name), department:departments(id, name)').eq('org_id', orgId)
      if (error) throw error
      return data || []
    } catch (e) { console.error('getBots:', e); return [] }
  })(), [], 'getBots')
}

export async function getTickets(orgId?: string) {
  if (!orgId) return []
  return withTimeout((async () => {
    try {
      const { data, error } = await db.from('tickets').select('*').eq('org_id', orgId).order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (e) { console.error('getTickets:', e); return [] }
  })(), [], 'getTickets')
}

export async function getSuggestions(orgId?: string) {
  if (!orgId) return []
  return withTimeout((async () => {
    try {
      const { data, error } = await db.from('suggestions').select('*').eq('org_id', orgId).order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (e) { console.error('getSuggestions:', e); return [] }
  })(), [], 'getSuggestions')
}

export async function getUsers(orgId?: string) {
  if (!orgId) return []
  return withTimeout((async () => {
    try {
      const { data, error } = await db.from('org_members').select('*').eq('org_id', orgId)
      if (error) throw error
      return data || []
    } catch (e) { console.error('getUsers:', e); return [] }
  })(), [], 'getUsers')
}

export async function getDepartments(orgId?: string) {
  if (!orgId) return []
  return withTimeout((async () => {
    try {
      const { data, error } = await db.from('departments').select('*').eq('org_id', orgId).order('name')
      if (error) throw error
      return data || []
    } catch (e) { console.error('getDepartments:', e); return [] }
  })(), [], 'getDepartments')
}

export async function getAuditLog(limit = 50, orgId?: string) {
  if (!orgId) return []
  return withTimeout((async () => {
    try {
      const { data, error } = await db.from('audit_log').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(limit)
      if (error) throw error
      return data || []
    } catch (e) { console.error('getAuditLog:', e); return [] }
  })(), [], 'getAuditLog')
}

export async function getPolicies(orgId?: string) {
  if (!orgId) return []
  return withTimeout((async () => {
    try {
      const { data, error } = await db.from('rkbac_policies').select('*').eq('org_id', orgId)
      if (error) throw error
      return data || []
    } catch (e) { console.error('getPolicies:', e); return [] }
  })(), [], 'getPolicies')
}

export type { Agent, Bot, Ticket, Suggestion, AppUser, Department }
