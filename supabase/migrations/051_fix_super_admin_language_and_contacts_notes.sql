-- =============================================================================
-- Migration 051: Fix Super Admin preferred language + contacts stability
-- V9.9.7 — 2026-05-01
-- =============================================================================

BEGIN;

-- ── 1. Reset Super Admin preferred language to Portuguese ─────────────────────
-- A sessão de demo pode ter gravado 'en' no perfil da Super Admin.
-- Este comando garante que lidimfc@gmail.com volta para PT.
UPDATE public.profiles
SET preferred_language = 'pt'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'lidimfc@gmail.com'
)
AND (preferred_language IS NULL OR preferred_language = 'en');

-- ── 2. Garantir que contacts.notes seja nullable (sem NOT NULL) ───────────────
-- Alguns inserts falhavam silenciosamente por constraint NOT NULL em notes.
ALTER TABLE public.contacts
  ALTER COLUMN notes DROP NOT NULL;

-- ── 3. Índice de performance em crm_companies.company_id ─────────────────────
CREATE INDEX IF NOT EXISTS idx_crm_companies_company_id
  ON public.crm_companies (company_id);

-- ── 4. Índice de performance em contacts.company_id ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_contacts_company_id
  ON public.contacts (company_id);

COMMIT;
