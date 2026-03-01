-- Returns TRUE if the handle is available, FALSE if already taken.
-- SECURITY DEFINER bypasses RLS so unauthenticated users (signup page)
-- can check handle availability without reading profile data.
CREATE OR REPLACE FUNCTION check_handle_available(
  p_handle TEXT,
  p_current_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE LOWER(handle) = LOWER(TRIM(p_handle))
    AND (p_current_user_id IS NULL OR user_id != p_current_user_id)
  );
END;
$$;

-- Allow any role (including anon/unauthenticated) to call this function.
GRANT EXECUTE ON FUNCTION check_handle_available(TEXT, UUID) TO anon, authenticated;
