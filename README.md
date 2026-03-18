# 🌀 Encontro D'água Hub

> **Accessible technology, real results.**
> _Tecnologia acessível, resultados reais._

**Encontro D'água Hub** is a Bilingual Enterprise SaaS that integrates Human Strategy with AI Efficiency.
More than a CRM, it's a **Nexus** — the central point where Leads, Deals, and AI Agents meet.

[![Status](https://img.shields.io/badge/Status-Beta%20Launch-brightgreen)](HUB_SHOWCASE.md)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20Gemini-blue)](package.json)
[![Main Language](https://img.shields.io/badge/Language-EN-yellow)](src/context/LanguageContext.tsx)

## 🏆 Credits & Evolution

- **Core CRM Architecture:** Provided by **Thales Laray** (Automation School - Lifetime Access).
- **Evolved by:** **Lidi Moura** (Nexus Protocol, AI Agents, Link d'Água integration).
- **Powered by:** **Deepmind Antigravity Agent**.

## 📖 The Journey

From a Celeron laptop running Streamlit to a cloud-native Enterprise System.
👉 **[Read the Founder's Journey (HUB_SHOWCASE.md)](HUB_SHOWCASE.md)** to understand our "Dogfooding" strategy and the evolution of AI Agents.

---

## Recent Stability Status (March 2026)
* Fixed Link d'Água webhook (restoring `amazo-sdr` identity) and Edge Functions sync.
* Correct visual math applied in PrecyAgent (`step="any"`).
* "Convert" button re-installed on DealCard.
* Restored persistence in SDR Board columns (avoiding RLS failures on global template boards).
* Implemented Privacy Filter (Query Firewall by hostname) for `prova.encontrodagua.com`.

## 🚀 Key Features

### 1. Link d'Água — The Digital Showcase (Core Product)
A powerful "Link in Bio" and QR Code generator that feeds directly into the CRM.
- **Smart Links:** Bridge Pages that capture lead intent.
- **Deep Integration:** Scans instantly become Leads on the Kanban.
- **SVG QR Codes:** Vectorial, sharp on any screen, ready for professional printing.

## Status de Estabilidade Recente (Março de 2026)
* Correção do webhook do Link d'Água (restaurando identidade `amazo-sdr`) e integração de Edge Functions.
* Matemáica visual correta no PrecyAgent (`step="any"`).
* Botão "Converter" reinstalado no DealCard.
* Restauração da persistência nas colunas do Board SDR (evitadas falhas RLS em boards templates globais).
* Implementação do Filtro de Privacidade (Firewall de Queries pelo hostname) para `prova.encontrodagua.com`.

### 2. The AI Squad (The Engine)
- **Amazô (External CS):** 24/7 sales/support agent on the Landing Page.
- **Mazô (Internal CS):** Monitors client health and "rotting" deals.
- **Jury (Legal):** Generates bilingual contracts (PT/EN) with jurisdiction awareness.
- **Precy (Financial):** Multicurrency pricing and ROI calculation.

### 3. Enterprise CRM (The Core)
- **Kanban Board:** Drag-and-drop management with "Rotting" indicators.
- **Lead Briefing:** SDR's `briefing_json` displayed on the Products tab (services of interest), Timeline (automatic bot note) and sidebar (direct WhatsApp button).
- **WhatsApp + AI:** Button that generates a personalized message via Gemini and opens a pre-filled `wa.me?text=` — editable before sending.
- **Ghost Deal Protection:** Robust data integrity checks.
- **Bilingual Interface:** EN as main language on the provadagua branch.

---

## 🛠️ Stack & Architecture

- **Frontend:** React 18, TypeScript, TailwindCSS.
- **Backend:** Supabase (PostgreSQL, Auth, Multitenant RLS).
- **AI:** Google Gemini 2.5 Flash Lite (via `geminiService.ts`).
- **I18n:** Custom `useTranslation` hook.

### Installation

```bash
# 1. Clone & Install
git clone [repo-url]
npm install

# 2. Environment Variables
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=...

# 3. Run
npm run dev
```

## 🔒 Security & Access
**Private** Repository and **Invite-Only** SaaS.
Access managed via "Nexus Protocol" (Role-Based Access Control with Supabase RLS).

---

*Built with ❤️ by Lidi Moura.*
*Powered by Deepmind Antigravity.*
