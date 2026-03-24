# User Guide — Prova d'Água (Demo)

> **Branch `provadagua` | prova.encontrodagua.com** | AI Sandbox · Demo

---

## 👋 Welcome to the Demo

Prova d'Água is a free, fully isolated sandbox of the Encontro d'Água Hub CRM. You can explore all features safely — no real client data is ever at risk.

---

## 🚀 Getting Started

1. Visit [prova.encontrodagua.com](https://prova.encontrodagua.com)
2. Log in with your invite link or request access
3. The interface defaults to **English** (toggle 🇧🇷 / 🇺🇸 to switch)

---

## 🗂️ Key Modules

| Module | What it does in Demo |
|---|---|
| **Dashboard** | Shows metrics based on demo leads only |
| **Board (Kanban)** | Demo deals — isolated from production |
| **Contacts** | Test leads only (tag `🤖 sdr`, `@teste` emails) |
| **Inbox (Mazô)** | AI agent with fresh context — no real client history |
| **Activities** | Your own demo activities (saved per branch) |
| **Prompt Lab** | Saved prompts are isolated per branch via DB |
| **Reports** | Based on demo deals only |
| **Precy (AI Hub)** | Pricing calculator — choose save currency (BRL/USD/EUR/AUD) |
| **Jury (AI Hub)** | Contract generator — PDF viewer inline |

---

## 🔒 Data Isolation Guarantee

| Action | Result |
|---|---|
| Add a product | Visible in Demo only |
| Save a prompt | Visible in Demo only (`is_demo_data = true`) |
| Create a contact | Must use `@teste` email or `🤖 sdr` tag to stay visible |
| Hub (production) data | **Never visible here** |

---

## 🤖 AI Agents

### Mazô
- Access via **Inbox** or the floating widget (bottom right)
- In demo: fresh context — no production client history
- Generates briefings from your demo leads

### Jury
- Open any Deal → **Documents** tab → generate contract
- AI-powered, displayed inline as a rich viewer

### Precy
- **AI Hub → Precy** tab
- Calculate fair price → choose save currency → **Save as Product (USD/BRL/EUR/AUD)**

---

## 🏢 Deals — Card Features

- **+ Nova empresa** / **+ New company**: create inline without leaving the card
- **Products tab**: add products with quantity — layout adapts to any screen width
- **Timeline**: notes, calls, meetings linked to the deal
- **AI Insights**: Gemini analysis of the lead

---

## 🌐 Language
Click the **🇧🇷 / 🇺🇸** button at the top to switch between Portuguese and English.

> Demo defaults to **English** (set by `VITE_APP_MODE=DEMO`).

---

*Prova d'Água — AI Demo Sandbox | Encontro d'Água*
