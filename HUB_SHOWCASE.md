# Encontro d'Água Hub — Showcase

> **Branch `main` → hub.encontrodagua.com** | CRM de Produção Real

---

## 🎯 O que é o Hub

O Hub é o sistema nervoso da operação de vendas da Encontro d'Água. Não é um demo — é produção.

---

## 🏆 Diferenciais Técnicos

### 1. SDR Automatizado (Link d'Água)
Leads do WhatsApp chegam via webhook, ganham a tag `🤖 sdr` e aparecem automaticamente no Board Kanban no primeiro estágio. A deduplicação por email (DISTINCT) garante que replays do webhook não criem cards duplicados.

### 2. Agente Mazô — Contexto Real de Vendas
A Mazô lê todos os deals, contatos e atividades reais para gerar briefings diários, sugerir upsells e resgatar deals parados. Em produção, ela tem contexto completo da base de clientes.

### 3. Board Kanban + Sincronização Bidirecional
- Mover um card no Board atualiza o estágio do Contato
- Criar uma atividade no Inbox reflete no deal correspondente
- Ghost cards (auto-mapeados) mostram contatos sem deal

### 4. Precificação em BRL (Precy)
A Precy converte USD/EUR → BRL no momento do save, garantindo que o catálogo sempre exiba em Reais.

### 5. Isolamento de Dados por Branch
Os filtros `IS_DEMO` garantem que a Provadágua nunca acesse dados da operação real. O Hub e a Prova são mundos separados.

---

## 📊 Módulos Ativos em Produção

| Módulo | Status |
|---|---|
| Board Kanban + SDR | ✅ Ativo |
| Contatos + Sync | ✅ Ativo |
| Inbox / Mazô | ✅ Ativo |
| Jury (Contratos) | ✅ Ativo |
| Precy (Precif.) | ✅ Ativo |
| QRDágua | ✅ Ativo |
| Reports | ✅ Ativo |
| Prompt Lab | ✅ Ativo |
| Admin (Usuários) | ✅ Ativo |

---

*hub.encontrodagua.com — Operação desde 2025 | Stack: React + Supabase + Gemini*
