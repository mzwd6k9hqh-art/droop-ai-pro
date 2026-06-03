REVOKE EXECUTE ON FUNCTION public.match_assistant_memory(UUID, vector, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_assistant_memory(UUID, vector, INT) TO service_role;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;