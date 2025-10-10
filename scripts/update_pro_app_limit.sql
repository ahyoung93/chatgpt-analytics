-- Update the can_create_app function to limit Pro plan to 3 apps (down from 5)
CREATE OR REPLACE FUNCTION can_create_app(org_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    org_plan plan_tier;
    current_app_count INTEGER;
BEGIN
    SELECT plan INTO org_plan FROM orgs WHERE id = org_uuid;
    SELECT COUNT(*) INTO current_app_count FROM apps WHERE org_id = org_uuid;

    CASE org_plan
        WHEN 'free' THEN RETURN current_app_count < 1;
        WHEN 'pro' THEN RETURN current_app_count < 3;
        WHEN 'team' THEN RETURN true;
        ELSE RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql;
