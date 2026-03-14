# 📘 UserGuide — Encontro d'Água Hub CRM

> Manual completo de todas as funcionalidades nativas e features implementadas.

---

## 🏠 Visão Geral do Sistema

O **Encontro d'Água Hub** é um CRM SaaS modular com:
- **Kanban de Oportunidades** com múltiplos boards e drag-and-drop
- **Equipe de IA** embutida nos cards (Precy, Jury, AIFlow, AI Hub)  
- **Gestão de Contatos** com ciclo de vida completo (Lead → Customer)
- **Catálogo de Produtos** separado do Tech Stack interno
- **Briefing automático** via SDR (Amazô) capturando leads da Landing Page

---

## 1. Kanban (Boards)

### Criando um Board com IA
1. Acesse **Boards** → botão **+** no seletor de boards
2. Descreva o objetivo do board (ex: "Funil de vendas para clientes internacionais")
3. A IA gera automaticamente as etapas e configurações adequadas ao contexto

### Templates Disponíveis
| Template | Etapas incluídas | Agentes de IA inclusos |
|---|---|---|
| **SDR Pipeline** | Lista Fria → Agendado → Proposta → Fechado | Precy, Jury, WA AI |
| **Onboarding** | Contratado → Kit enviado → Ativo → Concluído | Jury, AIFlow |
| **Projetos** | Backlog → Em andamento → Revisão → Entregue | AIFlow, Precy |
| **Personalizado** | Definido pelo usuário | Todos disponíveis |

### Botão `+` de Oportunidades
- Aparece em cada coluna do Kanban
- Cria um novo deal diretamente na etapa correspondente
- Formulário rápido: Título, Valor, Contato (vincula ou cria)

### Drag and Drop (DnD)
- Arraste cards entre colunas para mudar de etapa
- O status é atualizado no Supabase e sincronizado em tempo real
- O Card aberto reflete a mudança instantaneamente (Board ↔ Card sync)

---

## 2. Card do Lead (DealDetailModal)

### Abas disponíveis
| Aba | Conteúdo |
|---|---|
| **Overview** | Dados gerais, valor, tags, campos customizados |
| **Briefing** | Mensagem automática capturada pelo Amazô SDR |
| **Contato** | Dados do lead + botão WhatsApp IA |
| **Produtos** | Serviços adicionados ao deal + interesses declarados |
| **Timeline** | Histórico de atividades e notas |
| **Documentos** | Contratos gerados pelo Jury |
| **Equipe de IA** | Precy, AIFlow, Jury — agentes dentro do card |

### WhatsApp + Mensagem IA
- Aparece automaticamente quando o lead tem telefone cadastrado
- Botão **📲 WhatsApp + Msg IA**: gera mensagem personalizada via Gemini
- Mensagem editável antes de enviar
- Abre `wa.me/{numero}?text=...` pré-preenchido
- Requer: API Key da IA configurada em Configurações

### Fluxo de Fechamento
1. Status barra de progresso (topo do card) — clique para mover de etapa
2. Botão **GANHO** (verde): move para `CLOSED_WON`
3. Botão **PERDIDO** (vermelho): move para `CLOSED_LOST`
4. Botão **CONVERTER** (teal): promove contato para `CUSTOMER` no ciclo de vida

---

## 3. Agentes de IA (Equipe de IA)

### AIFlow (Estratégia e Análise)
- Analisa o deal atual e sugere próximos passos estratégicos
- Acessa tools nativas: `analyze_leads`, `move_deal`, `list_contacts`
- Pode criar atividades e notas automaticamente
- Prompt: descreva o cenário e peça uma recomendação de ação

### Precy (Agente de Precificação)
- Calcula preço final com base em: horas × valor/hora + margem + impacto + stack
- **Impactos**: Low (1×), Medium (1.2×), High (1.5×)
- **Precificação Social**: desconto de 60%
- **Câmbio Real**: 10 moedas suportadas (BRL, USD, EUR, AUD, COP, PEN, ARS, MXN, CLP, UYU)
  - O `Valor/hora` deve ser digitado **na moeda selecionada** (ex: se escolher USD, digite em dólares)
  - O sistema converte internamente para BRL, calcula, e exibe o resultado de volta na moeda certa
  - Ao trocar moeda, o cálculo é resetado — redigite o valor/hora na nova moeda
- **Salvar no Catálogo**: usa upsert — cria ou atualiza produto pelo nome (sem erro 409)
- **Tech Stack**: selecione ferramentas cadastradas para somar custo à base (valores em BRL)

### Jury (Consultora Jurídica Internacional)
- Chat **fechado por padrão** — clique em **"Abrir Chat Jury"** no cabeçalho para ativar
- O chat aparece como **overlay flutuante** (canto inferior direito) — **não empurra** a página
- Botão **✕** no header do chat fecha sem F5
- **Jurisdições**: BR, US, AU, EU, CO, PE, AR, MX, CL, UY (leis específicas de cada)
- **Saídas separadas**:
  - **Chat overlay**: diálogo, perguntas jurídicas, resumos para e-mail
  - **Contrato** (seção abaixo): documento formal pronto para PDF
- Botão **Gerar Contrato**: produz documento Markdown estruturado
- Botão **Copiar para Clipboard**: exporta o texto do contrato
- Botão **Salvar na Conta**: salva como nota na Timeline do Deal

---

## 4. Gestão de Contatos

### Ciclo de Vida (Lifecycle Stages)
```
LEAD → MQL → PROSPECT → CUSTOMER
```
- Stages editáveis em **Configurações → Ciclo de Vida**
- Cor e nome personalizáveis

### Contatos Duplicados (Caso Djavan)
- O sistema filtra automaticamente contatos sem `contactId` válido ao renderizar o Kanban
- Cards sem contato aparecem com badge "SEM CONTATO" — podem ser vinculados manualmente no card
- Use **Vincular a um contato existente** ou **+ Criar novo contato** dentro do card

---

## 5. Catálogo de Produtos

- Acesse: **Configurações → Catálogo**
- Mostra apenas produtos `is_internal: false` e `product_type != 'tech_stack'`
- Produtos da Precy aparecem aqui após o "Salvar no Catálogo"
- Dropdown dentro dos cards (aba Produtos) usa a mesma filtragem — nunca mostra tools internas

---

## 6. Configurações de IA

### API Keys (Rodízio Automático)
1. Acesse **Configurações → IA**
2. **Chave Principal**: sua API key primária (Gemini, OpenAI ou Claude)
3. **Chave Reserva (Failover 429)**: assume automaticamente quando a principal atinge quota
4. Clique **Salvar** — as chaves são persistidas no Supabase (não dependem de `.env` ou Vercel)

### Modelos disponíveis por provedor
| Provider | Modelos | Nota |
|---|---|---|
| Google Gemini | 2.5 Flash, Flash Lite, 2.5 Pro, 3.0 Pro | Flash = recomendado |
| Anthropic Claude | Sonnet 4.5, Haiku 4.5, Opus 4.5 | Sonnet = recomendado |
| OpenAI | GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo | — |

### Configurações avançadas
- **Thinking (Google)**: ativa raciocínio de cadeia antes de responder
- **Prompt Caching (Anthropic)**: economiza tokens em conversas longas
- **Web Search**: conecta o modelo à internet (Google Grounding / Anthropic tools)

---

## 7. AI Hub (Chat Global)

- Acesse via menu lateral → **AI Hub**
- Chat sem contexto de deal — para perguntas estratégicas, análise do CRM inteiro
- Acessa dados via tools: lista de deals, contatos, atividades pendentes
- Histórico persistido na sessão

## 8. Automações de Lead — Como Funciona por Completo

### Fluxo Completo (LP → Kanban)
```
[Lead preenche LP] → [Typebot coleta dados] → [typebot-webhook (Edge Function)]
         ↓
[Cria Contato no Supabase]  →  [Cria Deal no board SDR]
         ↓
[Kanban atualiza em Real-Time automaticamente — sem F5]
```

### Edge Function: `typebot-webhook`
- **Localização no código**: `supabase/functions/typebot-webhook/index.ts`
- **Localização no painel**: Supabase Dashboard → Edge Functions → `typebot-webhook`
- **O que ela faz**:
  1. Recebe o payload do Typebot (nome, e-mail, WhatsApp, serviços, mensagem)
  2. Cria/encontra o `Contato` (se phone já existir, reutiliza o ID — sem duplicata)
  3. Cria um `Deal` no board SDR com status `LEAD`
  4. Adiciona à `waitlist` para compatibilidade retroativa
- **Para redesployar após mudanças**: Supabase → Edge Functions → typebot-webhook → **Redeploy**

### Automações configuráveis na UI dos Boards
- Em **Boards → Configurações do Board** você pode configurar:
  - **Gatilhos de etapa**: ao mover para determinada coluna, o sistema pode criar uma atividade automática
  - **Notificações**: ao entrar em determinada etapa, o owner recebe notificação push
  - **Tarefas automáticas**: agenda follow-up com X dias de prazo ao entrar na etapa
- Essas automações **não interferem** no fluxo do webhook — são independentes
- O webhook cria o Deal diretamente com `status: 'LEAD'` (primeira coluna do SDR)

### Real-Time Kanban (sem F5)
- `DealsContext` mantém uma conexão `supabase.channel('postgres_changes')` ativa
- Qualquer `INSERT` ou `UPDATE` na tabela `deals` dispara `fetchDeals()` automaticamente
- Isso significa: quando o webhook cria o Deal do Ben Jor, o card aparece no Kanban **em segundos**, sem recarregar
- A conexão é por `company_id` (isolamento multi-tenant)

### Configurações de IA — Dual Key
- **Chave Principal**: usada em todas as chamadas normais
- **Nota da Chave**: campo de texto livre para identificar de qual conta/e-mail veio
- **Chave Reserva**: assume automaticamente quando a principal retorna erro 429 (quota)
- **Persistência**: salvas no Supabase (`user_settings`) — não dependem de `.env` ou Vercel

---

## 9. ⚠️ SQL Necessário (Execute no Supabase SQL Editor)

```sql
-- Colunas para AI Keys e notas (execute uma vez)
ALTER TABLE user_settings
    ADD COLUMN IF NOT EXISTS ai_api_key_secondary text,
    ADD COLUMN IF NOT EXISTS ai_api_key_note text,
    ADD COLUMN IF NOT EXISTS ai_api_key_secondary_note text;
```

---

## 10. Campos Customizados e Tags

- **Configurações → Campos Customizados**: crie campos text, number, select, boolean para qualquer deal
- **Configurações → Tags**: organize deals por categoria (ex: "Internacional", "Urgente")

---

*Última atualização: 13/03/2026 — Sprint: Real-Time, Precy FX Real, Jury Overlay, Webhook Fix*
