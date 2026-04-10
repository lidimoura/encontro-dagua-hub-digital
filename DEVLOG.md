# DEVLOG — Encontro d'Água Hub

---

## 2026-04-10 — V4.3: MVP Provadágua — Branch `provadagua` 🚀

### ShowcasePage — Seção de Pricing (NOVO)
- 3 cards de preço com paleta Earth-Neon (glassmorphism dark):
  - **Prompt Lab Mensal**: R$ 3,00/mês → fallback `/#/login`
  - **Prompt Lab Anual**: R$ 29,90/ano → fallback `/#/login` (badge "Mais Popular")
  - **Agente IA (SDR/SAC)**: R$ 80,00/mês → link Stripe real: `https://buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02`
- Tracking GA4: `trackShowcaseCTA('pricing_agente_ia_r80')` no clique do botão Stripe
- Nota de rodapé: "Sem fidelidade · Cancele a qualquer momento · Suporte via WhatsApp"

### ShowcasePage — Correções V4.3
- CSS `.screen-mock` + `.scanline` + `@keyframes scanAnim` adicionados inline (eram dependência de Tailwind não carregada)
- Trial CTA link corrigido: `/#/` → `/#/login`
- Footer version atualizado: `V3.0` → `V4.3 — MVP Provadágua`
- `::selection` color atualizado para paleta neon-green

### Identidade Visual Confirmada
- Paleta Earth-Neon: Fundo `#070D09` · Verde `#00C97B` · Ciano `#00E5FF` · Dourado `#D4A853`
- Founder badge: "Lidi Moura: Formada em Psicologia e Especialista em Dados"
- Bilinguismo PT/EN mantido em todos os novos componentes

### Lógica de Acesso (já estava completa — confirmada V4.3)
- Palavra-chave `provadagua` → Edge Function `signup-showcase` → `email_confirm: true`
- Trial de 7 dias via `access_expires_at` ativo imediatamente no Dashboard
- Sem barreira de confirmação de e-mail (flow V4.3 end-to-end)

### GA4 (já estava completo — confirmado)
- ID: `YOUR_GA4_ID_HERE` injetado em `index.html` + `analytics.ts`
- Novos eventos: `pricing_agente_ia_r80`, `trial_start`, `showcase_cta_click`

### Git
- Branch `provadagua` criada localmente e sincronizada com remoto
- Commit: `feat(showcase): add pricing section + fix trial CTA + V4.3 footer`

---

## 2026-04-07 — V4.2: Trial Multi-Tenant + Lead Gate + Build Verde

### Lead Gate V2 (Login.tsx)
- Fluxo de 3 caminhos: Lead (→ prova.), Palavra-chave provadagua, God Mode (triplo clique)
- Palavra-chave padrão via VITE_ACCESS_KEYWORD=provadagua

### ShowcasePage — Segmentação de Público
- Nova seção "Escolha seu caminho" com 3 cards: Saúde & Consultório, Empreendedores & Times, Kit Básico (Link d'Água)
- CTA primário abre LeadCaptureModal em vez de navegar
- Integração LeadCaptureModal com prefilledData={interest:'provadagua_trial'}

### AdminUsersPage — Gestão de Trials
- Coluna ccess_expires_at com badges ATIVO/EXPIRA/EXPIRADO
- Filtro "Apenas trials" ativo
- Botões +7d (grant) e Block (revoke) por usuário trial
- JSX corrigido: <thead> estava dentro de <button> — reestruturado

### LeadCaptureModal
- Opções de interesse: provadagua_trial, crm_saude, utomacoes_saas
- Auto-tagging provadagua-trial + source correto para trials

### Stripe
- Mensal R$ 3,00: prod_UGWT3Pm4ztKmcU
- Anual R$ 29,90: prod_UGVFdr4qUVufSu

### Correções Técnicas
- Deno Edge Functions: .vscode/settings.json com deno.enablePaths + supabase/functions/deno.json
- qr-redirect/index.ts: erro unknown no catch → error instanceof Error ? error.message : String(error)
- Build Vite: EXIT 0 ✅ (3m11s, 913KB)

---
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

