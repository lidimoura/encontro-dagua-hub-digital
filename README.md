# Encontro D'Água Hub — Showcase Portfolio
### Branch `provadagua` | Live Demo: [prova.encontrodagua.com](https://prova.encontrodagua.com)

> **Prova d'Água** is our zero-friction demo environment. Any visitor can sign up with the keyword **"provadagua"** and immediately experience a production-grade AI CRM — with full data isolation, trilingual support, and all AI agents active.

---

## 🏆 Why This Matters

This is not a mockup. It is a **real, production-grade SaaS** running on enterprise infrastructure:

| Dimension | Implementation |
|---|---|
| **Isolation** | Triple-wall RLS: Branch/Env → JWT → `is_demo_data` column |
| **Security** | LGPD/GDPR by design. Demo data never leaks to production |
| **AI Agents** | Precy (Pricing), Jury (Legal), Mazô (CS), Amazô (Sales) |
| **Languages** | PT 🇧🇷 · EN 🇺🇸 · ES 🇪🇸 — trilingual with auto-fallback chain |
| **Infrastructure** | Supabase + Vercel + Google Gemini 2.5 Flash |
| **OCI Readiness** | Architecture follows Oracle Cloud Infrastructure patterns: stateless Edge Functions, connection pooling, and row-level security equivalent to OCI IAM policies |

---

## ✨ Feature Matrix

| Module | Status | Demo Value |
|---|---|---|
| **Showcase LP (Portal Gate)** | ✅ Live | Keyword-protected access — keyword `provadagua` |
| **Signup Flow (Zero Friction)** | ✅ Live | No email confirmation needed — `admin.createUser` bypass |
| **Kanban Boards** | ✅ Demo data | SDR pipeline with AI deal analysis |
| **Contacts** | ✅ Isolated | `is_demo_data = true` filter at RLS level |
| **AI Hub (Mazô)** | ✅ Active | Gemini 2.5 Flash — real-time CRM insights |
| **Decision Center** | ✅ Active | Proactive AI decisions: critical/important/moderate/low |
| **Precy (Pricing AI)** | ✅ Active | AUD/USD/BRL — multilingual commercial proposals |
| **Jury (Legal AI)** | ✅ Active | Contract generation with PDF export |
| **Bridge Pages** | ✅ Active | Digital card generator (formerly "QR d'Água") |
| **Prompt Lab** | ✅ Active | AI prompt engineering — save to localStorage |
| **Trilingual UI** | ✅ Live | PT → EN → ES → PT cycle with DB-persisted preferences |
| **Reports** | ✅ Demo metrics | Revenue trend, Win/Loss, Sales Cycle |

---

## 🔒 Security Architecture

### Triple Isolation Wall

```
┌─ WALL 1: Environment ──────────────────────────────────────┐
│  VITE_APP_MODE = DEMO                                       │
│  → DEFAULT_LANG = 'en'  |  DEFAULT_CURRENCY = 'AUD'        │
└────────────────────────────────────────────────────────────┘
        ↓
┌─ WALL 2: Authentication (JWT) ──────────────────────────────┐
│  Every query scoped to auth.uid()                           │
│  Email confirmation bypassed via admin.createUser()         │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─ WALL 3: Database RLS + is_demo_data ──────────────────────┐
│  contacts, deals, activities, qr_codes, saved_prompts,     │
│  products → all filtered by is_demo_data = true            │
│  Production data: is_demo_data = false → NEVER visible      │
└─────────────────────────────────────────────────────────────┘
```

### OCI Cloud-Readiness

This architecture maps directly to Oracle Cloud Infrastructure (OCI) patterns:

- **Stateless Edge Functions** → OCI Functions (Fn Project)
- **Row Level Security** → OCI IAM Policy equivalent at data layer
- **Connection pooling** → OCI Database Connection Pool
- **Multi-tenant isolation** → OCI Compartments (simulated via `company_id`)
- **Audit trail** → `app_source` column traces every write by origin

---

## 🤖 AI Agent Ecosystem

```
PO (Lidi) — Heutagogic Mode
    │ defines: Vision · Ethics · Boundaries · Approvals
    │
    ├── Antigravity (CTO AI)    → Architecture, code, migrations
    ├── Mazô (CS AI)            → Retention, customer health, churn
    ├── Precy (Finance AI)      → Fair pricing with social impact layer
    ├── Jury (Legal AI)         → Contracts, compliance, PDF generation
    └── Amazô (Sales AI)        → External diagnosis via WhatsApp

Principle: AI NEVER makes irreversible decisions alone.
           Every approval, payment, or signature requires human review.
```

---

## 🌍 Trilingual Architecture

```typescript
// Fallback chain: ES → EN → PT
// Zero empty strings guaranteed
// DB-persisted preferences (profiles.preferred_language)

Language type: 'pt' | 'en' | 'es'
Storage: localStorage (instant) + Supabase profiles (cross-device)
```

| When user selects language | What happens |
|---|---|
| Immediately | UI updates (localStorage) |
| Background | `profiles.preferred_language` updated in DB |
| Next login (any device) | DB value restores preference automatically |

---

## ⚙️ Environment Variables

```env
# Vercel (branch: provadagua)
VITE_APP_MODE=DEMO
VITE_SUPABASE_URL=https://bcdyxnauokxikrtmhnlm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GEMINI_API_KEY=AIza...
```

---

## 🚀 Signup Flow (Zero Friction)

```
1. Visit prova.encontrodagua.com
2. Enter keyword: "provadagua" → form revealed
3. Fill name + email + password
4. Click "Criar Conta e Entrar" → Edge Function signup-showcase
5. Account created (email_confirm: true — no email sent)
6. Auto-login → redirect to /boards
7. OnboardingModal opens: "Welcome to your CRM! 👋"
```

No credit card. No email confirmation. No friction.

---

## 🛠️ Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Vanilla CSS + custom design tokens |
| State | React Context (Auth, Language, CRM, Theme) |
| Backend | Supabase (PostgreSQL + Row Level Security) |
| Edge Functions | Deno (signup-showcase, fix-trigger, chat-ai) |
| AI | Google Gemini 2.5 Flash |
| Deploy | Vercel (provadagua branch → prova.encontrodagua.com) |
| Monitoring | Supabase Dashboard + Vercel Analytics |

---

## 📊 Migration History

| # | File | Purpose |
|---|---|---|
| 000 | `schema.sql` | Base schema — multi-tenant by design |
| 034 | `add_is_demo_data_column.sql` | Isolation column for all tables |
| 035 | `push_app_source_and_currency.sql` | Currency preferences |
| 036 | `bulletproof_handle_new_user.sql` | Trigger hardening (Fix 500 error) |
| 037 | `profiles_preferences.sql` | DB-persistent language + currency |

---

*Encontro D'Água Hub · Branch provadagua · Powered by Antigravity AI CTO*  
*Architecture: Privacy by Design · Ethics by Default · Scale by Intention*
