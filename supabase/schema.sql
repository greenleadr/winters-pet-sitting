-- ============================================================
-- Winter's Pet Sitting & House Cleaning - Database Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'helper')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Owners can read all profiles; helpers can only read their own
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id                    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Core info
  first_name                  TEXT NOT NULL,
  last_name                   TEXT NOT NULL,
  phone                       TEXT,
  email                       TEXT,
  address                     TEXT,

  -- Emergency contact
  emergency_contact_name      TEXT,
  emergency_contact_phone     TEXT,

  -- Service type
  service_type                TEXT NOT NULL CHECK (service_type IN ('pet_sitting', 'house_cleaning', 'both')),

  -- Access / entry
  access_code                 TEXT,
  key_location                TEXT,
  gate_code                   TEXT,
  alarm_code                  TEXT,
  parking_instructions        TEXT,

  -- House Cleaning specific
  home_size                   TEXT,
  num_bedrooms                INTEGER,
  num_bathrooms               INTEGER,
  cleaning_frequency          TEXT CHECK (cleaning_frequency IN ('weekly', 'biweekly', 'monthly', 'as_needed', '')),
  cleaning_products_preference TEXT,
  cleaning_products_location  TEXT,
  fragile_items_notes         TEXT,
  cleaning_special_instructions TEXT,

  -- Payment
  payment_notes               TEXT,

  -- General notes
  notes                       TEXT,

  -- Soft delete
  is_active                   BOOLEAN DEFAULT TRUE,
  deleted_at                  TIMESTAMPTZ,

  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Owner sees all their clients; helper sees all non-deleted clients
CREATE POLICY "clients_select" ON public.clients
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'helper')
    )
  );

CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'helper')
    )
  );

CREATE POLICY "clients_update" ON public.clients
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'helper')
    )
  );

-- Only owner can hard delete
CREATE POLICY "clients_delete" ON public.clients
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- PETS (belongs to a client)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pets (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id             UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,

  name                  TEXT NOT NULL,
  species               TEXT,
  breed                 TEXT,
  age                   TEXT,
  color_markings        TEXT,

  -- Care
  feeding_instructions  TEXT,
  medications           TEXT,
  behavioral_notes      TEXT,
  outdoor_indoor        TEXT CHECK (outdoor_indoor IN ('indoor', 'outdoor', 'both', '')),
  walk_instructions     TEXT,

  -- Vet info
  vet_name              TEXT,
  vet_phone             TEXT,
  vet_address           TEXT,
  emergency_vet_name    TEXT,
  emergency_vet_phone   TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_select" ON public.pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id
        AND (
          c.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('owner', 'helper')
          )
        )
    )
  );

CREATE POLICY "pets_insert" ON public.pets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id
        AND (
          c.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('owner', 'helper')
          )
        )
    )
  );

CREATE POLICY "pets_update" ON public.pets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id
        AND (
          c.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('owner', 'helper')
          )
        )
    )
  );

CREATE POLICY "pets_delete" ON public.pets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id AND c.owner_id = auth.uid()
    )
  );

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id       UUID REFERENCES public.clients(id) ON DELETE SET NULL,

  title           TEXT NOT NULL,
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  service_type    TEXT CHECK (service_type IN ('pet_sitting', 'house_cleaning', '')),
  notes           TEXT,
  payment_status  TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'pending')),
  payment_notes   TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select" ON public.appointments
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'helper')
    )
  );

CREATE POLICY "appointments_insert" ON public.appointments
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'helper')
    )
  );

CREATE POLICY "appointments_update" ON public.appointments
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'helper')
    )
  );

CREATE POLICY "appointments_delete" ON public.appointments
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'owner'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_clients_owner_id ON public.clients(owner_id);
CREATE INDEX idx_clients_service_type ON public.clients(service_type);
CREATE INDEX idx_clients_is_active ON public.clients(is_active);
CREATE INDEX idx_pets_client_id ON public.pets(client_id);
CREATE INDEX idx_appointments_owner_id ON public.appointments(owner_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
