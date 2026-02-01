-- ============================================
-- CUSTOM AUTH MIGRATION
-- Adds username/password auth without Supabase Auth
-- ============================================

-- Create users table for custom auth
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Update trigger for users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- UPDATE FOREIGN KEYS
-- Categories and time_entries now reference users table
-- ============================================

-- First, drop existing foreign key constraints
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey;

-- Add new foreign key constraints referencing users table
ALTER TABLE public.categories
    ADD CONSTRAINT categories_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.time_entries
    ADD CONSTRAINT time_entries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- ============================================
-- UPDATE RLS POLICIES
-- For personal use: allow all operations, app filters by user_id
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

DROP POLICY IF EXISTS "Users can view own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON public.time_entries;

-- Create permissive policies (for personal use with trusted users)
-- The app filters by user_id in queries

CREATE POLICY "Allow all on categories" ON public.categories
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on time_entries" ON public.time_entries
    FOR ALL USING (true) WITH CHECK (true);

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on users" ON public.users
    FOR ALL USING (true) WITH CHECK (true);
