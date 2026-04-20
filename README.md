
<div align="center">

  <img src="./public/logos/logo-icon-gold-transp.png" alt="Logo CRM Hub" width="120">

<div align="center">

  <img src="./public/logos/logo-icon-gold-transp.png" alt="Logo CRM Hub" width="120">

  <h1>Encontro D'Ã gua Hub & CRM</h1>

  <p>Ecossistema de GestÃ£o com IA â€” Multi-Tenant Â· Bilingue Â· LGPD-Ready</p>

</div>

### CRM de Produção `V9.6` — Security & Multi-tenancy Hotfix (Code Freeze)

> **Branch `main` → hub.encontrodagua.com** — Acesso restrito à equipe interna
> **Branch `provadagua` → prova.encontrodagua.com** — Trial público 7 dias via Keyword Gate
> CRM interno para gestão de leads reais, automação WhatsApp e operação SDR.
> **V9.6 (Security Hotfix)**: RLS recriada nas 4 tabelas core (boards, board_stages, deals, activities). Fix crítico no `useCreateBoard` que omitia `company_id` do payload causando 403 Forbidden. Arquitetura multi-tenant **100% blindada via Row Level Security**.

---

## Arquitetura Multi-Tenant (Hub vs ProvadÃ¡gua)

O projeto opera em **dois contextos distintos**:

| Contexto | URL | Branch | Acesso | Perfil |
|---|---|---|---|---|
| **Hub Digital** | `hub.encontrodagua.com` | `main` | Super Admin apenas | `is_super_admin = true` |
| **ProvadÃ¡gua** | `prova.encontrodagua.com` | `provadagua` | Keyword Gate â†’ trial 7d | `access_level = provadagua-trial` |

### Fluxo ProvadÃ¡gua (V8.0 â€” sem Edge Function)
```
/#/showcase  â†’  [CTA "Experimentar"]  â†’  /#/login?from=showcase
              â†’  Aba "Novo Cadastro" (padrÃ£o)
              â†’  Preenche Palavra-chave + Nome + E-mail + Senha
              â†’  supabase.auth.signUp() nativo (sem CORS, sem Edge Function)
              â†’  auto-login  â†’  /dashboard  (trial ativo 7 dias)
              â†’  Lead inserido em contacts (CRM) automaticamente
```

### Fluxo Hub
```
/#/login  â†’  Aba "Entrar" (Ãºnica)  â†’  SignIn com e-mail/senha
          â†’  Valida is_super_admin  â†’  /dashboard
          â†’  NÃ£o-admin: bloqueado + link para /#/showcase
```

---

## Endpoints Principais

| Rota | Acesso | DescriÃ§Ã£o |
|---|---|---|
| `/#/` | PÃºblico | LandingPage Hub |
| `/#/showcase` | PÃºblico | ShowcasePage ProvadÃ¡gua (LP pitch) |
| `/#/login` | PÃºblico | Login Hub (sÃ³ SignIn) |
| `/#/login?from=showcase` | PÃºblico | Login ProvadÃ¡gua (SignUp com Keyword + SignIn) |
| `/#/dashboard` | Auth | Dashboard CRM (ProtectedRoute) |
| `/#/trial-expired` | Auth | PÃ¡gina pÃ³s-trial com NPS + CTA fechar negÃ³cio |
| `/#/admin` | Admin | Painel CRUD de usuÃ¡rios (Lidi) |
| `/#/admin/leads` | Admin | Painel de leads ProvadÃ¡gua com trial control |
| `/#/settings` | Auth | ConfiguraÃ§Ãµes â€” usuÃ¡rios filtrados por `company_id` |

### Edge Functions (Supabase)

| FunÃ§Ã£o | MÃ©todo | DescriÃ§Ã£o |
|---|---|---|
| ~~`signup-showcase`~~ | ~~POST~~ | **DESCONTINUADA V6.6** â€” substituÃ­da por `supabase.auth.signUp()` nativo |
| `form-lp-lead` | POST | Captura lead via LeadCaptureModal â†’ Board |
| `qr-redirect` | GET | Redireciona slug QR Code para URL real |

---

## GestÃ£o de Leads e Multi-tenancy (V8.0)

### SeparaÃ§Ã£o de VisÃµes: Super Admin vs Owner/Lead

O sistema usa `company_id` como parede de isolamento total entre organizaÃ§Ãµes:

| Papel | VisÃ£o | Rota |
|---|---|---|
| **Super Admin (Lidi)** | Todos os usuÃ¡rios do sistema | `/#/admin` |
| **Owner/Lead (Amanda)** | Apenas usuÃ¡rios da `company_id` dela | `/#/settings` |

### Sistema de Trial (7 dias)

```
Lead se cadastra via Keyword Gate
  â†’ supabase.auth.signUp() + metadata { user_type: 'lead_provadagua' }
  â†’ trial_expires_at = now() + 7 dias (setado no profile)
  â†’ access_level = 'trial'
  â†’ Lead inserido em contacts com source='showcase'
```

**RenovaÃ§Ã£o Manual (Lidi):**
1. Acessar `/#/admin` â†’ aba UsuÃ¡rios
2. Localizar o lead pela coluna E-mail
3. Clicar em **+7d** para estender a partir da data atual ou do trial vigente
4. Ou clicar em **Suspender** para bloquear acesso imediatamente
5. O modal **Editar** permite ajuste fino: `trial_expires_at`, `access_level`, plano e role

**Filtro de Privacy (`/#/settings`):**
- Query Supabase com `.eq('company_id', currentUser.company_id)`
- Amanda **nunca** vÃª os 10+ usuÃ¡rios de teste da Lidi
- Amanda **sÃ³** vÃª a si mesma e quem ela convidar

---

## Funcionalidades

| MÃ³dulo | DescriÃ§Ã£o |
|---|---|
| **Board Kanban** | Leads mapeados ao funil automaticamente (tag `ðŸ¤– sdr` â†’ estÃ¡gio 1) |
| **Contatos** | Base isolada por `company_id` (RLS ativo) |
| **Jury** | Contratos BR + Common Law, PDF inline |
| **Precy** | PrecificaÃ§Ã£o BRL/USD/EUR com catÃ¡logo |
| **QR D'Ã¡gua** | QR Codes + Bridge Pages + galeria pÃºblica |
| **Reports** | Pipeline + Win/Loss real (sem dados demo) |
| **Admin** | UsuÃ¡rios, `access_expires_at`, Tech Stack, Super Admin |
| **AmazÃ´** | Agente IA: CS/SDR nas LPs + CRM nativo |
| **Prompt Lab** | Engenharia de prompts multi-persona |
| **ShowcasePage** | LP pÃºblica `/showcase` bilingue com FAQ + QA + Tech |
| **Trial Gate** | Keyword `provadagua` â†’ signup imediato Â· 7d trial |
| **TrialExpiredPage** | NPS + feedback + CTA fechar negÃ³cio |

---

## Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **IA**: Google Gemini (principal), OpenAI, Anthropic (fallback)
- **Deploy**: Vercel (banch-based: `main` â†’ hub / `provadagua` â†’ prova)
- **Webhook SDR**: Supabase Edge Function `form-lp-lead`
- **Pagamentos**: Stripe (Prompt Lab Mensal R$3 Â· Anual R$29,90 Â· Agente IA R$80)

---

## VariÃ¡veis de Ambiente

```env
# â”€â”€ PÃºblicas (bundled no client JS) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
VITE_APP_MODE=PRODUCTION          # DEMO em prova.encontrodagua.com
VITE_SUPABASE_URL=https://...     # Supabase Project URL
VITE_SUPABASE_ANON_KEY=eyJ...     # Anon key (segura â€” scoped por RLS)
VITE_GEMINI_API_KEY=AIza...       # Google Gemini (pÃºblico by design)
VITE_GA4_MEASUREMENT_ID=G-...     # Google Analytics 4
VITE_ACCESS_KEYWORD=provadagua    # Keyword Gate â€” mude para aumentar seguranÃ§a
VITE_VAPID_PUBLIC_KEY=BE-...      # Web Push (pÃºblico)

# â”€â”€ Privadas (APENAS Vercel Secrets / .env local) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
SUPABASE_SERVICE_ROLE_KEY=...     # NUNCA expor â€” server-only / Edge Functions
```

> âš ï¸  `SUPABASE_SERVICE_ROLE_KEY` **jamais deve ter prefixo `VITE_`** â€” se tiver, rotate imediatamente.

---

## SeguranÃ§a & RLS

- Todas as tabelas crÃ­ticas tÃªm `company_id UUID` + RLS policy com bypass `is_super_admin`
- Dados de demo isolados por `is_demo_data = true`
- `access_expires_at` controlado por usuÃ¡rio â€” ProtectedRoute verifica em toda rota autenticada
- `SUPABASE_SERVICE_ROLE_KEY` apenas em Vercel Secrets + `.env` local (nunca commitada)

---

## Deploy

```bash
# ProvadÃ¡gua (branch provadagua)
git push origin provadagua
# Vercel detecta â†’ build â†’ prova.encontrodagua.com

# Hub (branch main)
git push origin main
# Vercel detecta â†’ build â†’ hub.encontrodagua.com
```

---

## Estrutura

```
src/
  pages/
    LandingPage.tsx      # Hub LP â€” inclui CTA ProvadÃ¡gua apÃ³s CRMSimulator
    ShowcasePage.tsx     # ProvadÃ¡gua pitch LP bilingue completa
    Login.tsx            # Multi-rota: Hub SignIn / Showcase SignUp+Keyword
    TrialExpiredPage.tsx # PÃ³s-trial: NPS + fechar negÃ³cio
  features/              # MÃ³dulos CRM (boards, contacts, admin, ...)
  lib/
    supabase/            # Services com IS_DEMO guards
    analytics.ts         # GA4 eventos (trial_start, lead_capture, login, sign_up)
  hooks/
    useTranslation.ts    # i18n PT-BR / EN
```

---

*Mantido pela equipe Encontro d'Ã gua | Manager: Antigravity AI | V8.0 â€” Go-Live ProvadÃ¡gua*

---

## Roadmap / Próximos Passos (Pós-Validação V9.5)

> Funcionalidades planejadas que estão fora do escopo do MVP Go-Live:

| Feature | Status | Prioridade |
|---|---|---|
| **Gestão Autônoma de Equipes** — convite por link com company_id | 🔒 Em breve | Alta |
| Confirmação de e-mail de convite via Supabase | 🔒 Backlog | Alta |
| Notificação automática no WA ao expirar o trial | 🕐 Planejado | Média |
| i18n completo em BoardTemplates e CreateBoardModal | 🕐 Backlog | Baixa |
| Dashboard de métricas por company_id para o lead | 🕐 Planejado | Média |
| Export de contatos / deals em CSV | 🕐 Planejado | Baixa |

---

*Atualizado automaticamente pelo Manager (Antigravity AI) — V9.6 Security & Multi-tenancy Hotfix*
