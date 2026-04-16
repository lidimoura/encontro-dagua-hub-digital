# Guia do Usuário — Encontro D'Água Hub & Provadágua

> **V5.7 — Final Release** | Atualizado em: 2026-04-16

---

## 🌊 O que é a Provadágua?

A **Provadágua** é o período de teste gratuito de 7 dias do Hub Digital da Encontro D'Água. Você experimenta o CRM completo — com IA, SDR automatizado e dados isolados por empresa — sem precisar de cartão de crédito.

Acesse: [prova.encontrodagua.com](https://prova.encontrodagua.com)

---

## 🚀 Fluxo do Trial de 7 Dias

### Passo 1 — Conheça a Vitrine

Acesse `/#/showcase` (Provadágua) e explore:
- As funcionalidades do CRM
- Os módulos nativos e Agentes de IA
- O Relatório de QA & Segurança
- As perguntas frequentes (FAQ)

### Passo 2 — Solicite a Palavra-Chave

Para iniciar o trial você precisa de uma **palavra-chave de acesso**.

- Clique em **"Não tem a palavra-chave?"** na tela de cadastro
- Ou acesse diretamente: [wa.me/5541992557600](https://wa.me/5541992557600)
- Informe: *"Olá! Estou na página de acesso da Provadágua e gostaria de solicitar a palavra-chave para experimentar o sistema."*
- O admin irá fornecê-la em até 1 dia útil.

### Passo 3 — Cadastre-se

Acesse `/#/login?from=showcase` (ou clique em "Entrar no Hub" na vitrine):

1. A tela abre automaticamente na aba **"Novo Cadastro"**
2. Preencha:
   - **Nome completo**
   - **E-mail profissional**
   - **Palavra-chave** (fornecida pelo admin)
3. Clique em **"Iniciar Provadágua Grátis"**
4. Você é redirecionado diretamente ao Dashboard — **sem confirmação de e-mail**

> ✅ O trial começa imediatamente. Nenhum cartão de crédito é solicitado.

### Passo 4 — Explore o CRM

Durante os 7 dias você tem acesso a:

| Módulo | O que faz |
|---|---|
| **Dashboard** | Visão geral do pipeline com métricas reais |
| **Board (Kanban)** | Gestão visual de deals por estágio |
| **Contatos** | Base isolada — só você vê seus dados |
| **Prompt Lab** | Criação de prompts com IA (multi-persona) |
| **Amazô (IA)** | Agente de CS/SDR — responde leads 24/7 |
| **Jury** | Geração de contratos com PDF inline |
| **Precy** | Precificação BRL/USD/EUR |
| **QR D'água** | QR Codes + cartão digital + bridge pages |
| **Reports** | Funil de vendas real + win/loss |

### Passo 5 — O que acontece após 7 dias?

Ao expirar o trial:
- Você é redirecionado para a página **"Trial Expirado"**
- Preencha o **NPS** (0–10) e deixe feedback
- Escolha:
  - **"Fechar Negócio"** → WhatsApp direto com a equipe
  - **"Indica e Ganha 20%"** → programa de indicação

> Não há cobrança automática. Você decide se ativa um plano.

---

## 🔑 Acesso ao Hub (Equipe Interna)

O Hub (`hub.encontrodagua.com`) é restrito à equipe interna com `is_super_admin = true`.

### Login Hub
1. Acesse `hub.encontrodagua.com/#/login`
2. A tela abre em **"Entrar"** (SignIn) — sem opção de cadastro
3. Use o e-mail e senha da conta administrativa
4. Apenas contas com `is_super_admin = true` têm acesso

> Não é da equipe? Clique em **"Não é da equipe? Conheça a Provadágua →"**

### God Mode (Super Admin)
- Clique **3 vezes seguidas** no logo da tela de login em < 600ms
- Abre o formulário de acesso administrativo avançado

---

## 🤖 Agentes de IA

### Amazô — CS/SDR
- Acesse via **Inbox** ou widget flutuante (canto inferior direito)
- Gera briefings, sugere upsell, qualifica leads
- Atende via WhatsApp e sites 24/7

### Jury — Contratos
- Disponível no card de Deal → aba **Documentos**
- Gera contratos BR + Common Law → exibe PDF inline

### Precy — Precificação
- Disponível no **AI Hub** → aba Precy
- Calcula preço justo por hora/stack/impacto
- Salva no Catálogo em BRL, USD, EUR

---

## 🏢 Isolamento de Dados (Multi-Tenant)

Cada empresa tem:
- Um `company_id` único no banco de dados
- **RLS (Row Level Security)** ativo — dados invisíveis para outros tenants
- `access_expires_at` — controle de expiração por usuário

O Super Admin vê todos os dados (bypass de RLS por `is_super_admin`).

---

## 📋 SDR Automatizado

Leads do WhatsApp chegam automaticamente com a tag `🤖 sdr` e aparecem no **primeiro estágio do Board** sem nenhuma ação manual.

**Deduplicação**: Replays do webhook não criam cards duplicados (filtro DISTINCT por e-mail).

---

## 🌐 Idioma

Clique no toggle **🇧🇷 PT / 🇺🇸 EN** no topo da página para alternar entre Português e Inglês. Disponível em todas as telas, incluindo a Vitrine (ShowcasePage).

---

## 📞 Suporte

- **WhatsApp**: [wa.me/5541992557600](https://wa.me/5541992557600)
- **E-mail**: lidi@encontrodagua.com
- **LinkedIn**: [Encontro D'Água Hub](https://www.linkedin.com/company/encontro-d-agua-hub/)

---

*Encontro D'Água Hub · V5.7 Final Release · Mantido pela equipe Encontro D'Água | Manager: Antigravity AI*
