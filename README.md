# Encontro d'Água Hub — CRM de Produção `v3.0`

> **Branch `main` → hub.encontrodagua.com**
> CRM interno para gestão de leads reais, automação WhatsApp e operação SDR.
> 🚀 **V3.0**: Super Admin · company_id isolation · ShowcasePage · access_expires_at

---

## 🚀 Sobre o Hub

O **Encontro d'Água Hub** é o sistema operacional de vendas da Encontro d'Água. Centraliza todos os leads reais capturados via Link d'Água (webhook WhatsApp/Typebot), gerencia os deals no Board Kanban e automatiza o follow-up com a IA Mazô.

---

## ✨ Funcionalidades Principais

| Módulo | Descrição |
|---|---|
| **Board Kanban** | Leads SDR (`🤖 sdr`) aparecem no primeiro estágio automaticamente |
| **Contatos** | Todos os leads reais sincronizados — isolamento por `company_id` |
| **Atividades / Inbox** | Tarefas e compromissos reais com briefing da Mazô |
| **Mazô (IA)** | Agente de vendas com contexto completo dos leads |
| **Jury (IA)** | Geração de contratos com visualização de PDF |
| **Precy (IA)** | Precificação em BRL/USD/EUR com conversão automática |
| **QRDágua** | Geração e gestão de QR Codes / Cartões Digitais |
| **Catálogo** | Produtos salvos em BRL (preço canônico) |
| **Reports** | Top Oportunidades, ciclo de vendas, win/loss real |
| **Showcase** | Landing page pública bilingue em `/#/showcase` |
| **Admin** | Super Admin (`lidimfc@gmail.com`), `access_expires_at`, Tech Stack |

---

## 🛠️ Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **IA**: Google Gemini (principal), OpenAI, Anthropic
- **Deploy**: Vercel (branch `main` → `hub.encontrodagua.com`)
- **Webhook SDR**: Supabase Edge Function `form-lp-lead`

---

## ⚙️ Variáveis de Ambiente

```env
VITE_APP_MODE=PRODUCTION
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # Apenas Vercel Secrets — nunca commitar
VITE_CRM_API_KEY=...            # Opcional: Nexus Bridge (Agility OS webhook)
```

---

## 🔑 Fluxo SDR (Link d'Água → Board)

1. Lead preenche formulário no Typebot / WhatsApp
2. Webhook `form-lp-lead` chama `capture_amazo_lead` no Supabase
3. Contato criado com tag `🤖 sdr`
4. Board auto-mapeia o contato para o **primeiro estágio**
5. Mazô analisa e sugere follow-up no Inbox

---

## 🏗️ Estrutura

```
src/
  features/       # Pages e módulos (boards, contacts, admin, ...)
  lib/
    supabase/     # Services com IS_DEMO guards
    query/hooks/  # TanStack Query hooks
    appConfig.ts  # IS_DEMO = false em PRODUCTION
  hooks/
    useTranslation.ts  # i18n (pt-BR padrão em PRODUCTION)
```

---

## 📦 Deploy

```bash
git push origin main
# Vercel detecta e faz build automático → hub.encontrodagua.com
```

---

*Mantido pela equipe Encontro d'Água | Manager: Antigravity AI*
