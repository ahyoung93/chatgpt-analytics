-- Fix existing user's org_member link
-- This links your existing org_members record to your auth.users account

UPDATE org_members
SET user_id = (
    SELECT id
    FROM auth.users
    WHERE email = org_members.email
    LIMIT 1
)
WHERE user_id IS NULL AND email IN (SELECT email FROM auth.users);

-- Verify the fix
SELECT
    om.id,
    om.org_id,
    om.user_id,
    om.email,
    om.name,
    om.role,
    u.email as user_email
FROM org_members om
LEFT JOIN auth.users u ON om.user_id = u.id
ORDER BY om.created_at DESC;
