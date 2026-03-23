# Prova d'Água — AI Showcase Hub

> **Branch `provadagua` | prova.encontrodagua.com** | Demo · Sandbox · Portfolio

---

## 🎯 What is this?

This is the live showcase of the Encontro d'Água CRM's AI capabilities. It is a **100% isolated sandbox** — no real client data is ever exposed here.

Use this environment to:
- See AI agents (Mazô, Jury, Precy) in action
- Explore the full CRM interface without risk
- Onboard new team members safely

---

## 🤖 AI Agents on Demo

### Mazô — Sales Intelligence
- Generates daily briefings from demo leads
- Suggests upsells, rescues stalled deals, detects birthdays
- In DEMO mode: fresh context — no real client history

### Jury — Contract Generator
- Generates professional contracts via natural language
- Opens PDF viewer inline — no external tools needed

### Precy — AI Pricing Calculator
- Quotes services in BRL, USD and EUR
- Saves quoted price in BRL as canonical catalog price
- Original currency stored in `metadata.price_original`

---

## 🔒 Isolation Architecture

```
VITE_APP_MODE = DEMO
       ↓
IS_DEMO = true
       ↓
┌──────────────────────────────┐
│ activitiesService → []       │
│ productsService   → []       │
│ QRdaguaPage       → []       │
│ contactsService   → DB OR filter │
│ PromptLabPage     → localStorage│
│ dealsService      → isDemoVisible filter │
└──────────────────────────────┘
```

Only QA contacts (tag `🤖 sdr`, email `@teste`, name `Gamer pc`/`Lilas`) are visible.

---

## 🌐 Languages

Interface defaults to **English** (`VITE_APP_MODE=DEMO → DEFAULT_LANG='en'`).
Users can switch to Portuguese via the language button.

---

## ✅ Live Test Credentials

| Field | Value |
|---|---|
| Email | `lidi@teste.com` |
| Phone | `0000000000` |
| Test leads | Gamer pc, Lilas, 🤖 sdr |

---

*Prova d'Água — Encontro d'Água AI Demo | Stack: React + Supabase + Gemini*
