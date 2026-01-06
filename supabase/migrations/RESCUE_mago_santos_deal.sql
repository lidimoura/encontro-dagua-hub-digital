-- RESGATE DO MAGO SANTOS
-- Script para mover deal travado do Board SDR para Pipeline de Vendas
-- Data: 2026-01-05

-- PASSO 1: Identificar o Deal "Mago Santos"
SELECT id, title, board_id, status, created_at
FROM deals
WHERE title ILIKE '%mago%' OR title ILIKE '%santos%';

-- PASSO 2: Identificar o Board "Pipeline de Vendas" (ou similar)
SELECT id, name, description
FROM boards
WHERE name ILIKE '%pipeline%' OR name ILIKE '%vendas%'
ORDER BY created_at;

-- PASSO 3: Mover o Deal para o novo Board
-- ATENÇÃO: Substitua os IDs pelos valores corretos encontrados acima

-- Exemplo (ajuste os IDs conforme necessário):
-- UPDATE deals
-- SET 
--   board_id = '[ID_DO_BOARD_PIPELINE]',
--   status = '[ID_DO_PRIMEIRO_ESTAGIO]',  -- Ex: 'DISCOVERY', 'QUALIFICATION', etc
--   updated_at = NOW()
-- WHERE id = '[ID_DO_DEAL_MAGO_SANTOS]';

-- PASSO 4: Verificar a mudança
-- SELECT id, title, board_id, status, updated_at
-- FROM deals
-- WHERE id = '[ID_DO_DEAL_MAGO_SANTOS]';

-- INSTRUÇÕES PARA A ADMIN:
-- 1. Execute o PASSO 1 para encontrar o ID do deal do Mago Santos
-- 2. Execute o PASSO 2 para encontrar o ID do Board "Pipeline de Vendas"
-- 3. Copie os IDs e substitua no PASSO 3
-- 4. Descomente e execute o UPDATE do PASSO 3
-- 5. Execute o PASSO 4 para confirmar

-- ALTERNATIVA: Usar a UI
-- Se preferir usar a interface:
-- 1. Abra o Board SDR
-- 2. Localize o card "Mago Santos"
-- 3. Arraste-o para o Board "Pipeline de Vendas"
-- 4. O sistema deve permitir a movimentação entre boards
