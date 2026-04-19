
<div align="center">

  <img src="./public/logos/logo-icon-gold-transp.png" alt="Logo CRM Hub" width="120">

  <h1>Encontro D'Água Hub & CRM</h1>

  <p>Ecossistema de Gestão com IA — Multi-Tenant · Bilingue · LGPD-Ready</p>

</div>

### CRM de Produção `V8.0` — Encerramento · Provadágua Go-Live

> **Branch `main` → hub.encontrodagua.com** — Acesso restrito à equipe interna
> **Branch `provadagua` → prova.encontrodagua.com** — Trial público 7 dias via Keyword Gate
> CRM interno para gestão de leads reais, automação WhatsApp e operação SDR.
> **V8.0**: Painel Admin CRUD · Isolamento company_id implacável · AiflowSupport bilingue · Header mobile fix · SW cache-free

---

## Arquitetura Multi-Tenant (Hub vs Provadágua)

O projeto opera em **dois contextos distintos**:

| Contexto | URL | Branch | Acesso | Perfil |
|---|---|---|---|---|
| **Hub Digital** | `hub.encontrodagua.com` | `main` | Super Admin apenas | `is_super_admin = true` |
| **Provadágua** | `prova.encontrodagua.com` | `provadagua` | Keyword Gate → trial 7d | `access_level = provadagua-trial` |

### Fluxo Provadágua (V8.0 — sem Edge Function)
```
/#/showcase  →  [CTA "Experimentar"]  →  /#/login?from=showcase
              →  Aba "Novo Cadastro" (padrão)
              →  Preenche Palavra-chave + Nome + E-mail + Senha
              →  supabase.auth.signUp() nativo (sem CORS, sem Edge Function)
              →  auto-login  →  /dashboard  (trial ativo 7 dias)
              →  Lead inserido em contacts (CRM) automaticamente
```

### Fluxo Hub
```
/#/login  →  Aba "Entrar" (única)  →  SignIn com e-mail/senha
          →  Valida is_super_admin  →  /dashboard
          →  Não-admin: bloqueado + link para /#/showcase
```

---

## Endpoints Principais

| Rota | Acesso | Descrição |
|---|---|---|
| `/#/` | Público | LandingPage Hub |
| `/#/showcase` | Público | ShowcasePage Provadágua (LP pitch) |
| `/#/login` | Público | Login Hub (só SignIn) |
| `/#/login?from=showcase` | Público | Login Provadágua (SignUp com Keyword + SignIn) |
| `/#/dashboard` | Auth | Dashboard CRM (ProtectedRoute) |
| `/#/trial-expired` | Auth | Página pós-trial com NPS + CTA fechar negócio |
| `/#/admin` | Admin | Painel CRUD de usuários (Lidi) |
| `/#/admin/leads` | Admin | Painel de leads Provadágua com trial control |
| `/#/settings` | Auth | Configurações — usuários filtrados por `company_id` |

### Edge Functions (Supabase)

| Função | Método | Descrição |
|---|---|---|
| ~~`signup-showcase`~~ | ~~POST~~ | **DESCONTINUADA V6.6** — substituída por `supabase.auth.signUp()` nativo |
| `form-lp-lead` | POST | Captura lead via LeadCaptureModal → Board |
| `qr-redirect` | GET | Redireciona slug QR Code para URL real |

---

## Gestão de Leads e Multi-tenancy (V8.0)

### Separação de Visões: Super Admin vs Owner/Lead

O sistema usa `company_id` como parede de isolamento total entre organizações:

| Papel | Visão | Rota |
|---|---|---|
| **Super Admin (Lidi)** | Todos os usuários do sistema | `/#/admin` |
| **Owner/Lead (Amanda)** | Apenas usuários da `company_id` dela | `/#/settings` |

### Sistema de Trial (7 dias)

```
Lead se cadastra via Keyword Gate
  → supabase.auth.signUp() + metadata { user_type: 'lead_provadagua' }
  → trial_expires_at = now() + 7 dias (setado no profile)
  → access_level = 'trial'
  → Lead inserido em contacts com source='showcase'
```

**Renovação Manual (Lidi):**
1. Acessar `/#/admin` → aba Usuários
2. Localizar o lead pela coluna E-mail
3. Clicar em **+7d** para estender a partir da data atual ou do trial vigente
4. Ou clicar em **Suspender** para bloquear acesso imediatamente
5. O modal **Editar** permite ajuste fino: `trial_expires_at`, `access_level`, plano e role

**Filtro de Privacy (`/#/settings`):**
- Query Supabase com `.eq('company_id', currentUser.company_id)`
- Amanda **nunca** vê os 10+ usuários de teste da Lidi
- Amanda **só** vê a si mesma e quem ela convidar

---

## Funcionalidades

| Módulo | Descrição |
|---|---|
| **Board Kanban** | Leads mapeados ao funil automaticamente (tag `🤖 sdr` → estágio 1) |
| **Contatos** | Base isolada por `company_id` (RLS ativo) |
| **Jury** | Contratos BR + Common Law, PDF inline |
| **Precy** | Precificação BRL/USD/EUR com catálogo |
| **QR D'água** | QR Codes + Bridge Pages + galeria pública |
| **Reports** | Pipeline + Win/Loss real (sem dados demo) |
| **Admin** | Usuários, `access_expires_at`, Tech Stack, Super Admin |
| **Amazô** | Agente IA: CS/SDR nas LPs + CRM nativo |
| **Prompt Lab** | Engenharia de prompts multi-persona |
| **ShowcasePage** | LP pública `/showcase` bilingue com FAQ + QA + Tech |
| **Trial Gate** | Keyword `provadagua` → signup imediato · 7d trial |
| **TrialExpiredPage** | NPS + feedback + CTA fechar negócio |

---

## Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **IA**: Google Gemini (principal), OpenAI, Anthropic (fallback)
- **Deploy**: Vercel (banch-based: `main` → hub / `provadagua` → prova)
- **Webhook SDR**: Supabase Edge Function `form-lp-lead`
- **Pagamentos**: Stripe (Prompt Lab Mensal R$3 · Anual R$29,90 · Agente IA R$80)

---

## Variáveis de Ambiente

```env
# ── Públicas (bundled no client JS) ──────────────────────────────────────────
VITE_APP_MODE=PRODUCTION          # DEMO em prova.encontrodagua.com
VITE_SUPABASE_URL=https://...     # Supabase Project URL
VITE_SUPABASE_ANON_KEY=eyJ...     # Anon key (segura — scoped por RLS)
VITE_GEMINI_API_KEY=AIza...       # Google Gemini (público by design)
VITE_GA4_MEASUREMENT_ID=G-...     # Google Analytics 4
VITE_ACCESS_KEYWORD=provadagua    # Keyword Gate — mude para aumentar segurança
VITE_VAPID_PUBLIC_KEY=BE-...      # Web Push (público)

# ── Privadas (APENAS Vercel Secrets / .env local) ─────────────────────────────
SUPABASE_SERVICE_ROLE_KEY=...     # NUNCA expor — server-only / Edge Functions
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` **jamais deve ter prefixo `VITE_`** — se tiver, rotate imediatamente.

---

## Segurança & RLS

- Todas as tabelas críticas têm `company_id UUID` + RLS policy com bypass `is_super_admin`
- Dados de demo isolados por `is_demo_data = true`
- `access_expires_at` controlado por usuário — ProtectedRoute verifica em toda rota autenticada
- `SUPABASE_SERVICE_ROLE_KEY` apenas em Vercel Secrets + `.env` local (nunca commitada)

---

## Deploy

```bash
# Provadágua (branch provadagua)
git push origin provadagua
# Vercel detecta → build → prova.encontrodagua.com

# Hub (branch main)
git push origin main
# Vercel detecta → build → hub.encontrodagua.com
```

---

## Estrutura

```
src/
  pages/
    LandingPage.tsx      # Hub LP — inclui CTA Provadágua após CRMSimulator
    ShowcasePage.tsx     # Provadágua pitch LP bilingue completa
    Login.tsx            # Multi-rota: Hub SignIn / Showcase SignUp+Keyword
    TrialExpiredPage.tsx # Pós-trial: NPS + fechar negócio
  features/              # Módulos CRM (boards, contacts, admin, ...)
  lib/
    supabase/            # Services com IS_DEMO guards
    analytics.ts         # GA4 eventos (trial_start, lead_capture, login, sign_up)
  hooks/
    useTranslation.ts    # i18n PT-BR / EN
```

---

*Mantido pela equipe Encontro d'Água | Manager: Antigravity AI | V8.0 — Go-Live Provadágua*
