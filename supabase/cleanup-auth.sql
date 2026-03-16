-- ============================================================
-- Run this in your Supabase SQL Editor to remove the old
-- auth-based schema and replace it with the no-auth version.
-- ============================================================

-- 1. Drop old RLS policies on clients
DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;
DROP POLICY IF EXISTS "clients_delete" ON public.clients;

-- 2. Drop old RLS policies on pets
DROP POLICY IF EXISTS "pets_select" ON public.pets;
DROP POLICY IF EXISTS "pets_insert" ON public.pets;
DROP POLICY IF EXISTS "pets_update" ON public.pets;
DROP POLICY IF EXISTS "pets_delete" ON public.pets;

-- 3. Drop old RLS policies on appointments
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;

-- 4. Drop old RLS policies on profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- 5. Disable RLS on all tables (no auth = no per-user restrictions needed)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

-- 6. Drop the auth trigger and profile auto-create function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 7. Drop the profiles table (no longer used)
DROP TABLE IF EXISTS public.profiles;

-- 8. Drop owner_id column from clients (if it exists)
ALTER TABLE public.clients DROP COLUMN IF EXISTS owner_id;

-- 9. Drop owner_id column from appointments (if it exists)
ALTER TABLE public.appointments DROP COLUMN IF EXISTS owner_id;

-- Done! The app will now work without authentication.
