
<div align="center">

  <img src="./public/logos/logo-icon-gold-transp.png" alt="Logo CRM Hub" width="120">

<div align="center">

  <img src="./public/logos/logo-icon-gold-transp.png" alt="Logo CRM Hub" width="120">

  <h1>Encontro D'Ãƒ gua Hub & CRM</h1>

  <p>Ecossistema de GestÃƒÂ£o com IA Ã¢â‚¬â€ Multi-Tenant Ã‚Â· Bilingue Ã‚Â· LGPD-Ready</p>

</div>

### CRM de ProduÃ§Ã£o `V9.6` â€” Security & Multi-tenancy Hotfix (Code Freeze)

> **Branch `main` â†’ hub.encontrodagua.com** â€” Acesso restrito Ã  equipe interna
> **Branch `provadagua` â†’ prova.encontrodagua.com** â€” Trial pÃºblico 7 dias via Keyword Gate
> CRM interno para gestÃ£o de leads reais, automaÃ§Ã£o WhatsApp e operaÃ§Ã£o SDR.
> **V9.7.2 (RLS Fallback)**: Correcao definitiva de RLS para tabelas legadas sem ownership columns. Policy auth_only em products e companies (bloqueio de anonimos). Backlog documentado para adicao de company_id pos-validacao.

---

## Arquitetura Multi-Tenant (Hub vs ProvadÃƒÂ¡gua)

O projeto opera em **dois contextos distintos**:

| Contexto | URL | Branch | Acesso | Perfil |
|---|---|---|---|---|
| **Hub Digital** | `hub.encontrodagua.com` | `main` | Super Admin apenas | `is_super_admin = true` |
| **ProvadÃƒÂ¡gua** | `prova.encontrodagua.com` | `provadagua` | Keyword Gate Ã¢â€ â€™ trial 7d | `access_level = provadagua-trial` |

### Fluxo ProvadÃƒÂ¡gua (V8.0 Ã¢â‚¬â€ sem Edge Function)
```
/#/showcase  Ã¢â€ â€™  [CTA "Experimentar"]  Ã¢â€ â€™  /#/login?from=showcase
              Ã¢â€ â€™  Aba "Novo Cadastro" (padrÃƒÂ£o)
              Ã¢â€ â€™  Preenche Palavra-chave + Nome + E-mail + Senha
              Ã¢â€ â€™  supabase.auth.signUp() nativo (sem CORS, sem Edge Function)
              Ã¢â€ â€™  auto-login  Ã¢â€ â€™  /dashboard  (trial ativo 7 dias)
              Ã¢â€ â€™  Lead inserido em contacts (CRM) automaticamente
```

### Fluxo Hub
```
/#/login  Ã¢â€ â€™  Aba "Entrar" (ÃƒÂºnica)  Ã¢â€ â€™  SignIn com e-mail/senha
          Ã¢â€ â€™  Valida is_super_admin  Ã¢â€ â€™  /dashboard
          Ã¢â€ â€™  NÃƒÂ£o-admin: bloqueado + link para /#/showcase
```

---

## Endpoints Principais

| Rota | Acesso | DescriÃƒÂ§ÃƒÂ£o |
|---|---|---|
| `/#/` | PÃƒÂºblico | LandingPage Hub |
| `/#/showcase` | PÃƒÂºblico | ShowcasePage ProvadÃƒÂ¡gua (LP pitch) |
| `/#/login` | PÃƒÂºblico | Login Hub (sÃƒÂ³ SignIn) |
| `/#/login?from=showcase` | PÃƒÂºblico | Login ProvadÃƒÂ¡gua (SignUp com Keyword + SignIn) |
| `/#/dashboard` | Auth | Dashboard CRM (ProtectedRoute) |
| `/#/trial-expired` | Auth | PÃƒÂ¡gina pÃƒÂ³s-trial com NPS + CTA fechar negÃƒÂ³cio |
| `/#/admin` | Admin | Painel CRUD de usuarios (Super Admin) |
| `/#/admin/leads` | Admin | Painel de leads ProvadÃƒÂ¡gua com trial control |
| `/#/settings` | Auth | ConfiguraÃƒÂ§ÃƒÂµes Ã¢â‚¬â€ usuÃƒÂ¡rios filtrados por `company_id` |

### Edge Functions (Supabase)

| FunÃƒÂ§ÃƒÂ£o | MÃƒÂ©todo | DescriÃƒÂ§ÃƒÂ£o |
|---|---|---|
| ~~`signup-showcase`~~ | ~~POST~~ | **DESCONTINUADA V6.6** Ã¢â‚¬â€ substituÃƒÂ­da por `supabase.auth.signUp()` nativo |
| `form-lp-lead` | POST | Captura lead via LeadCaptureModal Ã¢â€ â€™ Board |
| `qr-redirect` | GET | Redireciona slug QR Code para URL real |

---

## GestÃƒÂ£o de Leads e Multi-tenancy (V8.0)

### SeparaÃƒÂ§ÃƒÂ£o de VisÃƒÂµes: Super Admin vs Owner/Lead

O sistema usa `company_id` como parede de isolamento total entre organizaÃƒÂ§ÃƒÂµes:

| Papel | VisÃƒÂ£o | Rota |
|---|---|---|
| **Super Admin** | Todos os usuÃƒÂ¡rios do sistema | `/#/admin` |
| **Owner/Lead (Tenant)** | Apenas usuÃƒÂ¡rios da propria `company_id` | `/#/settings` |

### Sistema de Trial (7 dias)

```
Lead se cadastra via Keyword Gate
  Ã¢â€ â€™ supabase.auth.signUp() + metadata { user_type: 'lead_provadagua' }
  Ã¢â€ â€™ trial_expires_at = now() + 7 dias (setado no profile)
  Ã¢â€ â€™ access_level = 'trial'
  Ã¢â€ â€™ Lead inserido em contacts com source='showcase'
```

**Renovacao Manual (Super Admin):**
1. Acessar `/#/admin` Ã¢â€ â€™ aba UsuÃƒÂ¡rios
2. Localizar o lead pela coluna E-mail
3. Clicar em **+7d** para estender a partir da data atual ou do trial vigente
4. Ou clicar em **Suspender** para bloquear acesso imediatamente
5. O modal **Editar** permite ajuste fino: `trial_expires_at`, `access_level`, plano e role

**Filtro de Privacy (`/#/settings`):**
- Query Supabase com `.eq('company_id', currentUser.company_id)`
- O Lead/Tenant **nunca** ve os dados de outros tenants
- O Lead/Tenant **so** ve a si mesmo e quem ele convidar

---

## Funcionalidades

| MÃƒÂ³dulo | DescriÃƒÂ§ÃƒÂ£o |
|---|---|
| **Board Kanban** | Leads mapeados ao funil automaticamente (tag `Ã°Å¸Â¤â€“ sdr` Ã¢â€ â€™ estÃƒÂ¡gio 1) |
| **Contatos** | Base isolada por `company_id` (RLS ativo) |
| **Jury** | Contratos BR + Common Law, PDF inline |
| **Precy** | PrecificaÃƒÂ§ÃƒÂ£o BRL/USD/EUR com catÃƒÂ¡logo |
| **QR D'ÃƒÂ¡gua** | QR Codes + Bridge Pages + galeria pÃƒÂºblica |
| **Reports** | Pipeline + Win/Loss real (sem dados demo) |
| **Admin** | UsuÃƒÂ¡rios, `access_expires_at`, Tech Stack, Super Admin |
| **AmazÃƒÂ´** | Agente IA: CS/SDR nas LPs + CRM nativo |
| **Prompt Lab** | Engenharia de prompts multi-persona |
| **ShowcasePage** | LP pÃƒÂºblica `/showcase` bilingue com FAQ + QA + Tech |
| **Trial Gate** | Keyword `provadagua` Ã¢â€ â€™ signup imediato Ã‚Â· 7d trial |
| **TrialExpiredPage** | NPS + feedback + CTA fechar negÃƒÂ³cio |

---

## Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **IA**: Google Gemini (principal), OpenAI, Anthropic (fallback)
- **Deploy**: Vercel (banch-based: `main` Ã¢â€ â€™ hub / `provadagua` Ã¢â€ â€™ prova)
- **Webhook SDR**: Supabase Edge Function `form-lp-lead`
- **Pagamentos**: Stripe (Prompt Lab Mensal R$3 Ã‚Â· Anual R$29,90 Ã‚Â· Agente IA R$80)

---

## VariÃƒÂ¡veis de Ambiente

```env
# Ã¢â€â‚¬Ã¢â€â‚¬ PÃƒÂºblicas (bundled no client JS) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
VITE_APP_MODE=PRODUCTION          # DEMO em prova.encontrodagua.com
VITE_SUPABASE_URL=https://...     # Supabase Project URL
VITE_SUPABASE_ANON_KEY=eyJ...     # Anon key (segura Ã¢â‚¬â€ scoped por RLS)
VITE_GEMINI_API_KEY=AIza...       # Google Gemini (pÃƒÂºblico by design)
VITE_GA4_MEASUREMENT_ID=G-...     # Google Analytics 4
VITE_ACCESS_KEYWORD=provadagua    # Keyword Gate Ã¢â‚¬â€ mude para aumentar seguranÃƒÂ§a
VITE_VAPID_PUBLIC_KEY=BE-...      # Web Push (pÃƒÂºblico)

# Ã¢â€â‚¬Ã¢â€â‚¬ Privadas (APENAS Vercel Secrets / .env local) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
SUPABASE_SERVICE_ROLE_KEY=...     # NUNCA expor Ã¢â‚¬â€ server-only / Edge Functions
```

> Ã¢Å¡Â Ã¯Â¸  `SUPABASE_SERVICE_ROLE_KEY` **jamais deve ter prefixo `VITE_`** Ã¢â‚¬â€ se tiver, rotate imediatamente.

---

## SeguranÃƒÂ§a & RLS

- Todas as tabelas crÃƒÂ­ticas tÃƒÂªm `company_id UUID` + RLS policy com bypass `is_super_admin`
- Dados de demo isolados por `is_demo_data = true`
- `access_expires_at` controlado por usuÃƒÂ¡rio Ã¢â‚¬â€ ProtectedRoute verifica em toda rota autenticada
- `SUPABASE_SERVICE_ROLE_KEY` apenas em Vercel Secrets + `.env` local (nunca commitada)

---

## Deploy

```bash
# ProvadÃƒÂ¡gua (branch provadagua)
git push origin provadagua
# Vercel detecta Ã¢â€ â€™ build Ã¢â€ â€™ prova.encontrodagua.com

# Hub (branch main)
git push origin main
# Vercel detecta Ã¢â€ â€™ build Ã¢â€ â€™ hub.encontrodagua.com
```

---

## Estrutura

```
src/
  pages/
    LandingPage.tsx      # Hub LP Ã¢â‚¬â€ inclui CTA ProvadÃƒÂ¡gua apÃƒÂ³s CRMSimulator
    ShowcasePage.tsx     # ProvadÃƒÂ¡gua pitch LP bilingue completa
    Login.tsx            # Multi-rota: Hub SignIn / Showcase SignUp+Keyword
    TrialExpiredPage.tsx # PÃƒÂ³s-trial: NPS + fechar negÃƒÂ³cio
  features/              # MÃƒÂ³dulos CRM (boards, contacts, admin, ...)
  lib/
    supabase/            # Services com IS_DEMO guards
    analytics.ts         # GA4 eventos (trial_start, lead_capture, login, sign_up)
  hooks/
    useTranslation.ts    # i18n PT-BR / EN
```

---

*Mantido pela equipe Encontro d'Ãƒ gua | Manager: Antigravity AI | V8.0 Ã¢â‚¬â€ Go-Live ProvadÃƒÂ¡gua*

---

## Roadmap / PrÃ³ximos Passos (PÃ³s-ValidaÃ§Ã£o V9.5)

> Funcionalidades planejadas que estÃ£o fora do escopo do MVP Go-Live:

| Feature | Status | Prioridade |
|---|---|---|
| **GestÃ£o AutÃ´noma de Equipes** â€” convite por link com company_id | ðŸ”’ Em breve | Alta |
| ConfirmaÃ§Ã£o de e-mail de convite via Supabase | ðŸ”’ Backlog | Alta |
| NotificaÃ§Ã£o automÃ¡tica no WA ao expirar o trial | ðŸ• Planejado | MÃ©dia |
| i18n completo em BoardTemplates e CreateBoardModal | ðŸ• Backlog | Baixa |
| Dashboard de mÃ©tricas por company_id para o lead | ðŸ• Planejado | MÃ©dia |
| Export de contatos / deals em CSV | ðŸ• Planejado | Baixa |

---

*Atualizado automaticamente pelo Manager (Antigravity AI) â€” V9.8 Strict RLS, Isolation & MVP Banner*


