-- ════════════════════════════════════════════════════════════════
-- CLEANUP: Deals Zumbis, Órfãos e Duplicatas
-- Execute no Supabase SQL Editor (safe — usa transaction)
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Deletar Deals órfãos (contact_id IS NULL e sem título real)
DELETE FROM deals
WHERE contact_id IS NULL
  AND (title IS NULL OR title = '' OR title LIKE 'Ghost%' OR title LIKE '%undefined%');

-- ── 2. Deletar Deals com board_id inválido (board não existe)
DELETE FROM deals d
WHERE NOT EXISTS (
    SELECT 1 FROM boards b WHERE b.id = d.board_id
);

-- ── 3. Remover duplicatas técnicas — mantém o mais recente por (contact_id, board_id, title)
-- Apaga os mais antigos, preserva o id maior (mais recente)
DELETE FROM deals
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY contact_id, board_id, LOWER(TRIM(title))
                   ORDER BY created_at DESC
               ) AS rn
        FROM deals
        WHERE contact_id IS NOT NULL
    ) ranked
    WHERE rn > 1
);

-- ── 4. Remover contatos duplicados com nome vazio ou NULL
--    (mantém o mais recente por phone)
DELETE FROM contacts
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY phone
                   ORDER BY created_at DESC
               ) AS rn
        FROM contacts
        WHERE phone IS NOT NULL AND phone != ''
          AND (name IS NULL OR TRIM(name) = '')
    ) ranked
    WHERE rn > 1
);

-- ── 5. Colunas de notas para AI Keys (execute junto se ainda não rodou)
ALTER TABLE user_settings
    ADD COLUMN IF NOT EXISTS ai_api_key_secondary text,
    ADD COLUMN IF NOT EXISTS ai_api_key_note text,
    ADD COLUMN IF NOT EXISTS ai_api_key_secondary_note text;

COMMIT;

-- ── Verificação (rode após o COMMIT para confirmar limpeza)
SELECT
    (SELECT COUNT(*) FROM deals WHERE contact_id IS NULL) AS orphan_deals,
    (SELECT COUNT(*) FROM deals) AS total_deals,
    (SELECT COUNT(*) FROM contacts WHERE name IS NULL OR TRIM(name) = '') AS empty_name_contacts;
