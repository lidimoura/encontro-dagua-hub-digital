-- ============================================================================
-- V9.9 ACTION 5: Criar tabela crm_feedbacks
-- ============================================================================
-- Tabela dedicada para feedbacks do MVP Banner.
-- Separada da waitlist_and_feedback para não misturar com o Link d'água.
-- RLS: super_admin vê todos; usuário vê apenas os seus.
-- Date: 2026-04-23
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_feedbacks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id  UUID,
  email       TEXT,
  category    TEXT NOT NULL DEFAULT 'melhoria' CHECK (category IN ('bug', 'melhoria', 'elogio')),
  message     TEXT NOT NULL,
  source      TEXT DEFAULT 'mvp_banner',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_crm_feedbacks_company_id ON public.crm_feedbacks(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_feedbacks_created_at ON public.crm_feedbacks(created_at DESC);

-- RLS
ALTER TABLE public.crm_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_feedbacks_insert"
  ON public.crm_feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Qualquer autenticado pode enviar feedback

CREATE POLICY "crm_feedbacks_select_super_admin"
  ON public.crm_feedbacks FOR SELECT
  USING (
    is_super_admin()
    OR user_id = auth.uid()
  );

-- Comentários
COMMENT ON TABLE public.crm_feedbacks IS 'Feedbacks enviados pelos usuários via MVP Banner. Visível para super_admin no painel administrativo.';
