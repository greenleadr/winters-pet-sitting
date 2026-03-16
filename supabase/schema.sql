-- ============================================================
-- Winter's Pet Sitting & House Cleaning - Database Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,

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

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_clients_service_type ON public.clients(service_type);
CREATE INDEX idx_clients_is_active ON public.clients(is_active);
CREATE INDEX idx_pets_client_id ON public.pets(client_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
