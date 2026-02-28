-- Zynthr Multi-Tenant Schema
-- Run this migration manually on Supabase SQL Editor
-- Designed for HIPAA-compliant, multi-tenant AI agent platform

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM org_members
  WHERE user_id = auth.uid() AND status = 'active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_user_permission_tier()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT permission_tier FROM org_members
  WHERE user_id = auth.uid() AND status = 'active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_org_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
  );
$$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  industry text,
  plan text DEFAULT 'starter',
  owner_id uuid REFERENCES auth.users(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  hipaa_required boolean DEFAULT false,
  baa_signed boolean DEFAULT false,
  baa_signed_at timestamptz,
  baa_method text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  permission_tier int DEFAULT 4,
  department text,
  status text DEFAULT 'active',
  invited_at timestamptz,
  joined_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  description text,
  default_tier int DEFAULT 3,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  icon text,
  permission_tier int DEFAULT 3,
  model text DEFAULT 'claude-3.5-sonnet',
  capabilities jsonb DEFAULT '[]',
  connected_systems jsonb DEFAULT '[]',
  status text DEFAULT 'online',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  capabilities jsonb DEFAULT '[]',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  role text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL,
  version text NOT NULL,
  accepted_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  signer_name text,
  signer_title text,
  method text,
  docusign_envelope_id text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_org_members_org_user ON org_members(org_id, user_id);
CREATE INDEX idx_departments_org ON departments(org_id);
CREATE INDEX idx_agents_org ON agents(org_id);
CREATE INDEX idx_chat_messages_org_created ON chat_messages(org_id, created_at DESC);
CREATE INDEX idx_audit_log_org_created ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_organizations_stripe ON organizations(stripe_customer_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;

-- Organizations: users can see orgs they belong to
CREATE POLICY "org_member_select" ON organizations FOR SELECT USING (
  id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND status = 'active')
);
CREATE POLICY "org_owner_update" ON organizations FOR UPDATE USING (
  owner_id = auth.uid()
);
CREATE POLICY "org_insert" ON organizations FOR INSERT WITH CHECK (
  owner_id = auth.uid()
);

-- Org members: see members of your org
CREATE POLICY "members_select" ON org_members FOR SELECT USING (
  org_id IN (SELECT om.org_id FROM org_members AS om WHERE om.user_id = auth.uid() AND om.status = 'active')
);
CREATE POLICY "members_insert" ON org_members FOR INSERT WITH CHECK (
  org_id IN (SELECT om.org_id FROM org_members AS om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin') AND om.status = 'active')
);
CREATE POLICY "members_update" ON org_members FOR UPDATE USING (
  org_id IN (SELECT om.org_id FROM org_members AS om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin') AND om.status = 'active')
);

-- Departments: see departments in your org
CREATE POLICY "departments_select" ON departments FOR SELECT USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND status = 'active')
);
CREATE POLICY "departments_modify" ON departments FOR INSERT WITH CHECK (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);
CREATE POLICY "departments_update" ON departments FOR UPDATE USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);
CREATE POLICY "departments_delete" ON departments FOR DELETE USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);

-- Agents: see agents in your org
CREATE POLICY "agents_select" ON agents FOR SELECT USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND status = 'active')
);
CREATE POLICY "agents_insert" ON agents FOR INSERT WITH CHECK (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);
CREATE POLICY "agents_update" ON agents FOR UPDATE USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);
CREATE POLICY "agents_delete" ON agents FOR DELETE USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);

-- Bots: see bots in your org
CREATE POLICY "bots_select" ON bots FOR SELECT USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND status = 'active')
);
CREATE POLICY "bots_insert" ON bots FOR INSERT WITH CHECK (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);
CREATE POLICY "bots_update" ON bots FOR UPDATE USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);
CREATE POLICY "bots_delete" ON bots FOR DELETE USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);

-- Chat messages: see messages in your org
CREATE POLICY "chat_select" ON chat_messages FOR SELECT USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND status = 'active')
);
CREATE POLICY "chat_insert" ON chat_messages FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND status = 'active')
);

-- Audit log: only tier 1-2 can view
CREATE POLICY "audit_select" ON audit_log FOR SELECT USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND permission_tier <= 2 AND status = 'active')
);
CREATE POLICY "audit_insert" ON audit_log FOR INSERT WITH CHECK (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND status = 'active')
);

-- Agreements: users see own; org owners see all org agreements
CREATE POLICY "agreements_own" ON agreements FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "agreements_org_owner" ON agreements FOR SELECT USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active')
);
CREATE POLICY "agreements_insert" ON agreements FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
