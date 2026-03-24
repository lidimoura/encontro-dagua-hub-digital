# Guia do Usuário — Hub d'Água

> **Branch `main` | hub.encontrodagua.com** | CRM de Produção

---

## 🚀 Primeiros Passos

### 1. Login
Acesse [hub.encontrodagua.com](https://hub.encontrodagua.com) e faça login com o e-mail e senha fornecidos pelo admin.

### 2. Navegação Principal

| Módulo | O que faz |
|---|---|
| **Dashboard** | Visão geral: pipeline, deals, atividades recentes |
| **Board (Kanban)** | Gestão visual de deals por estágio |
| **Contatos** | Base de clientes com filtros e histórico |
| **Inbox (Mazô)** | Central de IA: briefings, sugestões, WA automático |
| **Atividades** | Tarefas, reuniões, calls e notas |
| **Reports** | Funil de vendas, conversão, LTV |
| **AI Hub** | Acesso às agentes Mazô, Jury, Precy |
| **QRDágua** | Criação e rastreio de QR Codes |
| **Prompt Lab** | Criação e otimização de prompts com IA |
| **Admin** | Gerenciamento de usuários e permissões |

---

## 🤖 Agentes IA

### Mazô — Inteligência de Vendas
- Acesse via **Inbox** ou o widget flutuante (canto inferior direito)
- Gera briefings de leads do dia, sugere upsell, detecta risco de churn
- Em produção: lê todos os dados reais da sua base

### Jury — Contratos
- Disponível no card de Deal → aba **Documentos**
- Gera contratos em linguagem natural → exibe PDF inline

### Precy — Precificação
- Disponível no **AI Hub** → aba Precy
- Calcula preço justo baseado em hora, stack e impacto
- Permite salvar no Catálogo em BRL, USD, EUR ou AUD

---

## 📋 SDR / Link d'Água

Leads do WhatsApp chegam automaticamente com a tag `🤖 sdr`. Eles aparecem no **primer estágio do Board** sem nenhuma ação manual.

**Deduplicação:** Replays do webhook não criam cards duplicados (filtro DISTINCT por e-mail).

---

## 🏢 Deals — Card de Detalhes

- **+ Nova empresa**: cria inline sem sair do card
- **Produtos**: selecione na lista filtrada → "Adicionar" (layout flex adaptativo)
- **Timeline**: anotações, calls, reuniões e tarefas vinculadas ao deal
- **IA Insights**: análise do lead com Gemini

---

## 🔑 Administração

### Criar Usuário
1. Vá para **Admin → Usuários**
2. Preencha nome, e-mail e senha
3. O sistema cria o perfil automaticamente (trigger `handle_new_user`)

### Convite por Link
1. **Admin → Gerador de Convite**
2. Copie o link e envie para o novo usuário
3. O link expira após o primeiro cadastro

---

## 🌐 Idioma
Clique no botão 🇧🇷 / 🇺🇸 no topo para alternar entre Português e Inglês.

---

*Hub d'Água — Encontro d'Água CRM | Suporte: lidi@encontrodagua.com*
