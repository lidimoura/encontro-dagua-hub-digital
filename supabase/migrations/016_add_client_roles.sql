-- Migration: Add client roles support to profiles table
-- Date: 2026-01-04
-- Purpose: Enable cliente and cliente_restrito roles for customer access

-- Drop existing role constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with client roles
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'vendedor', 'cliente', 'cliente_restrito'));

-- Add user_type column to distinguish team members from clients
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'team_member' 
CHECK (user_type IN ('team_member', 'client'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON profiles(user_type);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Update existing profiles to have user_type
UPDATE profiles FIX URL, SISTEMA DE CONVITES & "MAZÔ CS COPILOT"
STATUS: REFINAMENTO DE PERSONA INTERNA E CORREÇÃO DE URL. A Admin esclareceu a distinção das IAs:

Amazô: Atendimento externo (Landing Page).

Mazô: Inteligência interna de CS (CRM). O módulo de insights do CRM deve ser personificado como Mazô.

EXECUTE ESTES 4 PACOTES DE TAREFAS:

1. 🔗 FIX CRÍTICO: REDIRECT URL (VERCEL)

Problema: O e-mail de convite aponta para localhost.

AÇÃO: Ajuste a Edge Function invite-users. O redirectTo deve apontar dinamicamente para a URL de produção (Vercel) configurada nas variáveis de ambiente.

Meta: Link final: https://crm-encontro-dagua.vercel.app/update-password (ou sua URL oficial).

2. 🧠 ARQUITETURA: MAZÔ CS COPILOT (INTERNO)

Transformação: O componente de IA no CRM deve se chamar "Mazô CS Copilot".

Interface:

O card de sugestão deve ter a identidade da Mazô (Avatar específico/Nome).

Título: "Mazô sugere:".

Lógica Contextual:

Cenário: Se Lead = "Cliente/Ganho" E user_id é Nulo.

Ação: Mazô sugere à Admin: "Lidi, precisamos fazer o onboarding deste cliente. Vamos enviar o convite?"

3. 💬 MODAL DE CONVITE "HUMANIZADO" (SCRIPT DA MAZÔ)

Ao aceitar a sugestão da Mazô, abra o Modal com 2 passos:

Passo 1 (Copy para WhatsApp): Mazô gera um texto para a Admin copiar e enviar.

Template: "Oii [Nome]! 🌊 Aqui é do Hub Encontro D'água. Liberei seu acesso ao Portal! Vai chegar um e-mail para você criar sua senha. Qualquer dúvida, me chama!"

Botão: 📋 Copiar Texto.

Passo 2 (Sistema): Botão "🚀 Disparar E-mail de Acesso".

4. 🔮 PREPARAÇÃO DE DADOS (HISTORY)

Registre essa interação na tabela activities como "Sugestão da Mazô aceita" ou "Convite Enviado via Mazô".

EXECUTE A IMPLEMENTAÇÃO COM A IDENTIDADE DA MAZÔ.
SET user_type = 'team_member' 
WHERE user_type IS NULL;

-- Verify changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_role_check'
    AND check_clause LIKE '%cliente%'
  ) THEN
    RAISE NOTICE '✅ Role constraint updated successfully - client roles enabled';
  ELSE
    RAISE EXCEPTION '❌ Failed to update role constraint';
  END IF;
END $$;

-- Show current role distribution
SELECT role, user_type, COUNT(*) as count
FROM profiles
GROUP BY role, user_type
ORDER BY role, user_type;
