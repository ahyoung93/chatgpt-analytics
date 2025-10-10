-- Debug script to check user and org setup
-- Run this in Supabase SQL Editor to see what's in your database

-- 1. Check all users
SELECT
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check all orgs
SELECT
    id,
    name,
    slug,
    plan,
    created_at
FROM orgs
ORDER BY created_at DESC;

-- 3. Check all org_members
SELECT
    id,
    org_id,
    user_id,
    email,
    name,
    role,
    created_at
FROM org_members
ORDER BY created_at DESC;

-- 4. Check if user_id column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'org_members';
