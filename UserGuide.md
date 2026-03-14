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

## 8. Automações de Lead e Real-Time (Sem F5)

O CRM suporta **3 portas de entrada principais** de Leads, e todas disparam a atualização em tempo real do Kanban (sem necessidade de dar F5):

### 1. Link d'Água (NFC / QR Code)
- **Fluxo:** O visitante escaneia o cartão NFC/QR Code → Acessa o perfil Bridge → Clica no botão de WhatsApp / Ação.
- **Automação:** Se configurado via N8N/Webhook externo, a captura dos dados da interação cria o Lead no CRM.

### 2. Amazô-SDR (Landing Page)
- **Fluxo:** O visitante preenche o formulário conversacional / Typebot na LP → Os dados são enviados para o Supabase.
- **Automação:** A Edge Function `amazo-sdr` (ou `process-lead`) processa o payload, localiza/cria o `Contato` (evitando duplicatas se o telefone já existir) e cria um `Deal` automático na primeira etapa do board configurado (status `LEAD`).
- **Briefing:** Os dados informados (nome, serviços, empresa, telefone) são salvos na aba **Briefing** do modal, permitindo que o atendimento humano ou a IA iniciem a conversa (Via botão de WhatsApp IA) com contexto completo.

### 3. Criação Manual (Kanban UI)
- **Fluxo:** O usuário clica no **Botão `+`** localizado no cabeçalho de qualquer coluna do Kanban.
- **Ação:** Abre o formulário rápido para cadastrar Nome do Lead, Valor e selecionar um Contato existente (ou criar um na hora).

### ⚡ O "Cérebro" do Real-Time Kanban
- Independentemente de qual das 3 rotas acima cria o Lead, você **não precisa recarregar a aba**.
- O sistema mantém uma conexão WebSockets ativa (`postgres_changes`) ouvindo a tabela `deals`.
- O Kanban recarrega automaticamente os cards visuais na etapa correta (em cerca de 1 a 2 segundos) assim que a inserção ocorre no banco de dados.

### Configurações de IA — Dual Key (Failover)
- **Chave Principal**: usada em todas as chamadas normais de IA.
- **Nota da Chave**: campo de texto livre para identificar a origem (ex: "Conta Pessoal Google").
- **Chave Reserva**: assume automaticamente se a chave principal estourar o limite de uso (erro de cota 429).
- **Segurança e Banco**: As chaves são salvas no próprio Supabase (`user_settings`) e possuem botão "Olhinho" para visualizar na UI.


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
