-- DIAGNÓSTICO: Identificar usuários com roles conflitantes
-- Data: 2026-01-04
-- Objetivo: Listar TODOS os usuários que NÃO têm role 'admin' ou 'equipe'
-- ATENÇÃO: Este script apenas CONSULTA dados, não altera nada

-- 1. Listar TODOS os usuários e suas roles atuais
SELECT 
    email,
    role,
    user_type,
    status,
    created_at,
    id
FROM profiles
ORDER BY role, email;

-- 2. Identificar usuários com roles CONFLITANTES (não são 'admin' nem 'equipe')
SELECT 
    email,
    role,
    user_type,
    status,
    created_at,
    id
FROM profiles
WHERE role NOT IN ('admin', 'equipe')
   OR role IS NULL
ORDER BY role, email;

-- 3. Contagem por role (para visão geral)
SELECT 
    role,
    COUNT(*) as total_usuarios
FROM profiles
GROUP BY role
ORDER BY total_usuarios DESC;

-- 4. Verificar se existem roles NULL
SELECT 
    COUNT(*) as usuarios_sem_role
FROM profiles
WHERE role IS NULL;

-- INSTRUÇÕES PARA A ADMIN:
-- 1. Execute este script no Supabase Dashboard → SQL Editor
-- 2. Analise a lista de usuários conflitantes (query #2)
-- 3. Para cada usuário, decida:
--    - Converter para 'equipe' (membro da equipe interna)
--    - Converter para 'cliente' (cliente c om acesso ao portal)
--    - Converter para 'cliente_restrito' (cliente com acesso limitado)
--    - Deletar (se for conta de teste/inválida)
-- 4. Informe ao Antigravity a decisão para cada email
