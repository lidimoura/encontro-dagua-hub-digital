# DEVLOG — Encontro d'Água Hub (main)

> Branch `main` | CRM de Produção

---

## 2026-04-01 — V3.0: Missão Provadágua Completa

### Governança
- `.agent/skills/provadagua-standard/SKILL.md` criada: regras de isolamento por `company_id`, bilinguismo e `access_expires_at`

### GOD MODE — Migration 038
- `supabase/migrations/038_super_admin_and_company_isolation.sql` criada
- Promoção de `lidimfc@gmail.com` a Super Admin (`is_super_admin=true`)
- Coluna `access_expires_at` adicionada em `profiles`
- Coluna `company_id` adicionada em `contacts` (isolamento entre leads)
- Auditoria de leads por `is_demo_data` e tags

### Showcase LP
- `src/pages/ShowcasePage.tsx` criada — página premium dark/glassmorphism, bilingue PT/EN
- Seções: Hero com métricas, 9 Módulos em Produção, Relatório QA & Segurança, Stack Técnica, CTA
- Rota pública `/#/showcase` registrada em `App.tsx` sem autenticação

### Segurança
- `SUPABASE_SERVICE_ROLE_KEY` confirmada nas Vercel Secrets (Production/Preview/Development)
- `.env` nunca commitado (`.gitignore` ativo)
- `VITE_CRM_API_KEY` identificada como independente (uso exclusivo no Nexus Bridge)

---


### Mudanças
- `useDealsQuery.ts`: DISTINCT por email mata duplicatas de leads SDR (replays de webhook)
- `useDealsQuery.ts`: Contatos com `🤖 sdr` são force-mapeados ao primeiro estágio mesmo sem lifecycle stage
- `productsService.ts`: IS_DEMO guard — catálogo vazio na Provadágua
- `contacts.ts`: IS_DEMO filter via query Supabase (OR conditions por tag/email/is_test)
- `PromptLabPage.tsx`: IS_DEMO → localStorage apenas para saves na Provadágua
- `PrecyAgent.tsx`: `price` canônico = BRL (`fallbackBRLPrice`) — `price_original` salvo em metadata
- `QRdaguaPage.tsx`: IS_DEMO early-return → lista de projetos vazia na Provadágua

---

## 2026-03-22 — Round 3: DEMO Isolation Foundation

- `activitiesService.ts`: IS_DEMO guard → getAll() retorna []
- `dealsService.ts`: Substituído hostname check por IS_DEMO
- `contactsService.ts`: IS_DEMO import adicionado
- `AdminUsersPage.tsx`: signUp simplificado — só `full_name` no metadata
- `InviteGenerator.tsx`: Texto genérico (sem "Amanda")
- `useDealsQuery.ts`: Deduplicação por contactId (real deals têm prioridade sobre ghost cards)

---

## 2026-03-20 — Round 2: VITE_APP_MODE + SDR Board

- `appConfig.ts`: IS_DEMO via VITE_APP_MODE (env var Vercel)
- `dealsService.ts`: SDR leads filtrados por isDemoVisible
- `DealDetailModal.tsx`: optional chaining para company_id null
- Vercel: provadagua configurada manualmente com VITE_APP_MODE=DEMO

---

## 2026-03-17 — Invitation System Fix

- `InviteGenerator.tsx`: localStorage persistence para link gerado
- Redirect URLs Supabase: prova.encontrodagua.com adicionado

---

*Atualizado automaticamente pelo Manager (Antigravity AI)*
