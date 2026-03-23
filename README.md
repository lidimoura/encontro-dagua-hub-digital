# Prova d'Água — AI CRM Demo / Sandbox

> **Branch `provadagua` → prova.encontrodagua.com**
> Free demo environment. No real client data. English-first interface.

---

## 🌊 What is Prova d'Água?

**Prova d'Água** is a fully isolated demo environment showcasing the capabilities of the Encontro d'Água Hub CRM. It is designed for:

- **AI feature demonstration** — Mazô, Jury, Precy agents in action
- **Client onboarding** — new users can sign up and explore without contaminating production data
- **Portfolio showcase** — demonstrates the platform's capabilities in a controlled environment

> ⚠️ **This is NOT production.** All data is isolated from `hub.encontrodagua.com`.

---

## ✨ Features Available in Demo

| Module | Status | Notes |
|---|---|---|
| **Board Kanban** | ✅ Demo data only | Test leads only (`🤖 sdr`, QA contacts) |
| **Contacts** | ✅ Demo only | Filtered by tag/email — real clients never visible |
| **Mazô (AI)** | ✅ Fresh context | No production data fed to AI suggestions |
| **Jury (AI Contracts)** | ✅ Available | PDF viewer integration |
| **Precy (AI Pricing)** | ✅ Available | BRL/USD/EUR conversion |
| **Prompt Lab** | ✅ Local save | Prompts saved to localStorage only |
| **QRDágua** | ✅ Empty state | No real QR projects shown |
| **Reports** | ✅ Demo metrics | Based on demo deals only |
| **Admin / Invite** | ✅ Available | Generic invite flow, no company_id required |

---

## 🔒 Data Isolation Guarantee

Every Supabase query in DEMO mode is either:
1. **Early-returned as `[]`** (activities, products, QR projects)
2. **Filtered at DB level** via `.or("tags.cs.{🤖 sdr},email.ilike.%0000000000%,...")`

A product added in the Demo **will never appear in the Hub**, and vice versa.

---

## ⚙️ Environment Variables

```env
VITE_APP_MODE=DEMO
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=...
```

---

## 🚀 Getting Started (Demo User)

1. Visit [prova.encontrodagua.com](https://prova.encontrodagua.com)
2. Enter your invite link or request access from your manager
3. Explore AI features — Mazô, Jury, Precy — in a safe sandbox
4. No credit card required. No real data at risk.

---

## 🛠️ Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (shared instance, isolated by RLS + IS_DEMO filters)
- **AI**: Google Gemini 2.5 Flash
- **Deploy**: Vercel (branch `provadagua` → `prova.encontrodagua.com`)

---

*Prova d'Água — Encontro d'Água Hub Demo | Powered by Antigravity AI*
