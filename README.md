
<div align="center">

  <img src="./public/logos/logo-icon-gold-transp.png" alt="Logo CRM Hub" width="150">

  <h1>Encontro D'água Hub & CRM</h1>

  <p>Ecossistema de Inteligência Aplicada a Data Science</p>

</div>

  ### CRM de Produção `v4.4` — Lançamento Agente IA

> **Branch `main` → hub.encontrodagua.com**
> **Branch `provadagua` → prova.encontrodagua.com**
> CRM interno para gestão de leads reais, automação WhatsApp e operação SDR.
> **V4.4**: Agente IA R$80 (oferta de lançamento) · LeadCaptureModal com redirect Stripe · source hub-lp-launch

---

##  Sobre o Hub

O **Encontro d'Água Hub** é o sistema operacional de vendas da Encontro d'Água. Centraliza todos os leads reais capturados via Link d'Água (webhook WhatsApp/Typebot), gerencia os deals no Board Kanban e automatiza o follow-up com a IA Mazô.

---

## Funcionalidades Principais

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
| **Showcase LP** | Landing page pública bilingue com Pricing em `/#/showcase` |
| **Pricing** | 3 planos: Mensal R$3 · Anual R$29,90 · Agente IA R$80 (Stripe) |
| **Trial Gate** | Keyword `provadagua` → signup imediato sem email confirm · 7d trial |
| **Agente IA** | Produto de lançamento R$80/mês — banner na HomePage + modal + redirect Stripe |
| **Admin** | Super Admin (`lidimfc@gmail.com`), `access_expires_at`, Tech Stack |

---

## Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **IA**: Google Gemini (principal), OpenAI, Anthropic
- **Deploy**: Vercel (branch `main` → `hub.encontrodagua.com`)
- **Webhook SDR**: Supabase Edge Function `form-lp-lead`

---

## Variáveis de Ambiente

```env
VITE_APP_MODE=PRODUCTION
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=...
VITE_GA4_MEASUREMENT_ID=G-MHH0WSX5QS   # GA4 (também injetado em index.html)
VITE_ACCESS_KEYWORD=provadagua          # Palavra-chave do Lead Gate
SUPABASE_SERVICE_ROLE_KEY=...           # Apenas Vercel Secrets — nunca commitar
VITE_CRM_API_KEY=...                    # Opcional: Nexus Bridge
```

---

## Planos & Preços

| Plano | Valor | Stripe / Ação |
|---|---|---|
| Prompt Lab Mensal | R$ 3,00/mês | fallback `/#/login` |
| Prompt Lab Anual | R$ 29,90/ano | fallback `/#/login` |
| Agente IA (SDR/SAC) | R$ 80,00/mês | [buy.stripe.com/...](https://buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02) — via LeadCaptureModal |

> V4.4: Leads do Agente IA entram no Board com tags `agente-ia-80`, `launch-offer` e source `hub-lp-launch`.

---

## Fluxo SDR (Link d'Água → Board)

1. Lead preenche formulário no Typebot / WhatsApp
2. Webhook `form-lp-lead` chama `capture_amazo_lead` no Supabase
3. Contato criado com tag `🤖 sdr`
4. Board auto-mapeia o contato para o **primeiro estágio**
5. Mazô analisa e sugere follow-up no Inbox

---

## Estrutura

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

## Deploy

```bash
git push origin main
# Vercel detecta e faz build automático → hub.encontrodagua.com
```

---

*Mantido pela equipe Encontro d'Água | Manager: Antigravity AI*

