-- Add Row Level Security (RLS) Policies
-- This allows authenticated users to access their own org's data

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORG_MEMBERS POLICIES
-- ============================================

-- Users can read their own org_member record
CREATE POLICY "Users can read own org_member record"
ON org_members FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert org_member records (for signup)
CREATE POLICY "Users can insert org_member records"
ON org_members FOR INSERT
WITH CHECK (true);

-- ============================================
-- ORGS POLICIES
-- ============================================

-- Users can read their own org
CREATE POLICY "Users can read own org"
ON orgs FOR SELECT
USING (
  id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- Allow inserting orgs (for signup)
CREATE POLICY "Allow org creation"
ON orgs FOR INSERT
WITH CHECK (true);

-- ============================================
-- APPS POLICIES
-- ============================================

-- Users can read apps from their org
CREATE POLICY "Users can read own org apps"
ON apps FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- Users can create apps for their org
CREATE POLICY "Users can create apps for own org"
ON apps FOR INSERT
WITH CHECK (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- Users can update apps from their org
CREATE POLICY "Users can update own org apps"
ON apps FOR UPDATE
USING (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- Users can delete apps from their org
CREATE POLICY "Users can delete own org apps"
ON apps FOR DELETE
USING (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- ============================================
-- EVENTS POLICIES
-- ============================================

-- Users can read events from their org's apps
CREATE POLICY "Users can read own org events"
ON events FOR SELECT
USING (
  app_id IN (
    SELECT id FROM apps WHERE org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  )
);

-- Allow anyone to insert events (for API tracking)
CREATE POLICY "Allow event insertion"
ON events FOR INSERT
WITH CHECK (true);
