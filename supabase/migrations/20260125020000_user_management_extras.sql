
-- Function to get all users with their verification status
-- SECURITY DEFINER needed to access auth.users
CREATE OR REPLACE FUNCTION public.get_users_with_status()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    raw_user_meta_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id, 
        au.email::VARCHAR, -- Cast to varchar to match return type
        au.created_at, 
        au.last_sign_in_at, 
        au.email_confirmed_at,
        au.raw_user_meta_data
    FROM auth.users au
    ORDER BY au.created_at DESC;
END;
$$;

-- Function to bulk delete unverified users
-- Deletes users who have not confirmed their email
CREATE OR REPLACE FUNCTION public.delete_unverified_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- We can just delete from auth.users, and the cascading FKs we set up 
    -- (or the trigger logic if any) should handle the rest.
    -- However, explicit cleanup of public tables first is safer if constraints aren't perfect.
    
    WITH deleted_users AS (
        DELETE FROM auth.users
        WHERE email_confirmed_at IS NULL
        RETURNING id
    )
    SELECT count(*) INTO deleted_count FROM deleted_users;
    
    RETURN deleted_count;
END;
$$;

-- Permissions
REVOKE ALL ON FUNCTION public.get_users_with_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_users_with_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_status() TO service_role;

REVOKE ALL ON FUNCTION public.delete_unverified_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_unverified_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_unverified_users() TO service_role;
