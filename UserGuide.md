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
- **Impactos**: Low (1×), Medium (1.2×), High (1.5×), Ultra (2×), Transformational (3×)
- **Precificação Social**: desconto de 60% com campo de note explicativo
- **Câmbio**: 10 moedas suportadas (BRL, USD, EUR, AUD, COP, PEN, ARS, MXN, CLP, UYU)
  - Ao trocar moeda, o cálculo é **resetado** (evita valores incorretos)
  - Preço salvo no catálogo já convertido para a moeda selecionada
- **Salvar no Catálogo**: usa upsert (sem duplicatas/409) com nome + currency como chave
- **Tech Stack**: selecione ferramentas cadastradas para somar custo à base

### Jury (Consultora Jurídica Internacional)
- Chat **aberto automaticamente** ao entrar na aba
- **Jurisdições**: BR, US, AU, EU, CO, PE, AR, MX, CL, UY (com leis específicas de cada)
- **Modo Consulta**: a Jury faz perguntas antes de gerar qualquer documento
- **Saídas separadas**:
  - **Chat**: diálogo, perguntas jurídicas, resumos para e-mail
  - **Contrato** (abaixo do chat): documento formal pronto para PDF
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

---

## 8. Leads da Landing Page → SDR Automático

1. Lead preenche o formulário no site (LP)
2. Webhook Supabase cria automaticamente: **Contato** + **Deal** no board SDR
3. O `briefing_json` captura: nome, e-mail, WhatsApp, serviços de interesse, mensagem
4. Deal aparece na coluna inicial do board SDR
5. SDR vê o briefing na aba **Briefing** do card — e usa o botão WA IA para o primeiro contato

---

## 9. ⚠️ SQL Necessário (Ação Manual)

Para que a coluna `ai_api_key_secondary` seja persistida no Supabase, execute no SQL Editor:

```sql
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS ai_api_key_secondary text;
```

---

## 10. Campos Customizados e Tags

- **Configurações → Campos Customizados**: crie campos text, number, select, boolean para qualquer deal
- **Configurações → Tags**: organize deals por categoria (ex: "Internacional", "Urgente")

---

*Última atualização: 13/03/2026 — Sprint Estabilização Internacional*
