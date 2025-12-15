# System Architecture - Encontro D'Água Hub

## Overview

O Encontro D'Água Hub é um **Business Operating System** completo, evoluindo de um CRM tradicional para um centro de comando de agência com IA integrada.

---

## 🤖 AI Agents Architecture

### 1. Amazo - Hub Manager (SuperAdmin Agent)

**Nova Definição** (15/12/2025):

#### Papel
- **Gerente do Hub**: Orquestra todos os outros agentes e processos
- **Assistente de Desenvolvimento**: Gerencia o desenvolvimento enquanto a usuária foca na criação
- **Filosofia**: Aprendizado Heutagógico - o agente aprende e se adapta ao estilo de trabalho da usuária

#### Permissões
- **Nível de Acesso**: SuperAdmin
- **Escopo**: Leitura/escrita transversal em todo o CRM
- **Capacidades**:
  - Acesso a todas as tabelas do Supabase
  - Criação e modificação de boards, deals, contatos
  - Execução de agentes especializados
  - Gerenciamento de templates e bibliotecas
  - Análise de métricas e relatórios

#### Responsabilidades
1. **Orquestração de Agentes**:
   - Invocar agente de Precificação quando necessário
   - Consultar agente Jurídico para contratos
   - Acionar Documentador para gerar documentos finais

2. **Gestão de Conhecimento**:
   - Manter Stack Knowledge Base atualizado
   - Sugerir ferramentas do stack para novos projetos
   - Documentar decisões e aprendizados

3. **Automação de Processos**:
   - Criar atividades e lembretes automaticamente
   - Mover deals entre estágios baseado em triggers
   - Gerar relatórios periódicos

#### Implementação Técnica
- **Arquivo**: `src/features/ai-hub/hooks/useCRMAgent.ts`
- **Model**: Gemini 2.5 Flash Lite (fallback: 1.5 Flash)
- **Tools**: 12+ ferramentas conectadas (searchDeals, createActivity, etc.)
- **Context**: Acesso completo ao perfil do usuário e dados do CRM

---

### 2. Agente de Precificação

**Status**: ⏳ Planejado (Placeholder criado)

#### Função
- Calcular orçamentos baseado em escopo de projeto
- Considerar complexidade, prazo, stack tecnológico
- Sugerir preços competitivos baseado em histórico

#### Implementação Futura
- Webhook N8N: `calculatePricing()`
- Input: Descrição do projeto, prazo, requisitos
- Output: Orçamento detalhado com breakdown de custos

---

### 3. Agente Jurídico

**Status**: ⏳ Planejado (Placeholder criado)

#### Função
- Análise de contratos e termos legais
- Identificação de cláusulas problemáticas
- Sugestão de melhorias em documentos

#### Implementação Futura
- Webhook N8N: `consultLegalAgent()`
- Input: Texto do contrato
- Output: Análise de riscos e sugestões

---

### 4. Documentador (NOVO)

**Status**: ⏳ Planejado (Backlog)

#### Função
- Pegar template da Biblioteca Compartilhada
- Preencher com dados do CRM (cliente, deal, empresa)
- Gerar documento final pronto para uso

#### Casos de Uso
- **Contratos**: Template de contrato + dados do cliente → Contrato preenchido
- **Propostas**: Template de proposta + dados do deal → Proposta comercial
- **Planos de Negócio**: Template + dados da empresa → Business plan completo

#### Implementação Futura
- Nova tabela: `document_templates`
- Nova tool: `generateDocument({ templateId, dealId, data })`
- Output: PDF ou DOCX pronto para download

---

## 📚 Shared Library (Biblioteca Compartilhada)

**Status**: ⏳ Planejado (Backlog - Prioridade Alta)

### Objetivo
Permitir que usuários salvem e compartilhem templates reutilizáveis dentro do Hub.

### Funcionalidades

#### 1. Templates Privados
- Usuário cria template e marca como "Privado"
- Apenas o criador e sua company têm acesso
- Exemplos: Contrato padrão da agência, proposta personalizada

#### 2. Templates Públicos (Hub)
- Templates criados pela equipe do Hub
- Disponíveis para todos os usuários
- Exemplos: Contrato de desenvolvimento web, NDA padrão, proposta de design

#### 3. Clonagem de Templates
- Usuário pode clonar template público para sua biblioteca privada
- Permite customização sem afetar o original
- Versionamento automático

### Tipos de Templates

#### A) Contratos
- Campos: Título, Corpo do texto, Variáveis ({{cliente_nome}}, {{valor}}, etc.)
- Categorias: Desenvolvimento, Design, Consultoria, NDA
- Formato de saída: PDF, DOCX

#### B) Prompts
- Campos: Título, System Prompt, User Prompt, Persona
- Categorias: Copywriting, Código, Design, Marketing
- Integração com Prompt Lab

#### C) Planos de Negócio
- Campos: Estrutura (Sumário Executivo, Análise de Mercado, etc.)
- Variáveis: Dados da empresa, projeções financeiras
- Formato de saída: PDF, PPTX

### Schema do Banco de Dados

```sql
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'contract', 'prompt', 'business_plan'
  category TEXT,
  content JSONB NOT NULL, -- Template body com variáveis
  variables JSONB, -- Lista de variáveis disponíveis
  is_public BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  cloned_from UUID REFERENCES document_templates(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
-- Users veem templates públicos + seus próprios templates privados
-- Admins podem criar templates públicos
```

### Interface (Planejado)

#### Rota: `/library`
- Grid de cards com templates
- Filtros: Tipo, Categoria, Público/Privado
- Botões: "Usar Template", "Clonar", "Editar" (se owner)
- Modal de criação/edição de template

#### Integração com Documentador
1. Usuário seleciona template na biblioteca
2. Clica em "Gerar Documento"
3. Modal pede dados adicionais (se necessário)
4. Documentador preenche variáveis com dados do CRM
5. Documento final é gerado e salvo no deal

---

## 🏗️ Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)

### Backend
- Supabase (Database + Auth + Storage)
- PostgreSQL (database)
- Row Level Security (RLS)

### AI/ML
- Google Gemini 2.5 Flash Lite (primary)
- Google Gemini 1.5 Flash (fallback)
- Function calling / Tool use

### DevOps
- Vercel (hosting)
- GitHub (version control)
- N8N (workflow automation - planejado)

---

## 📊 Database Schema (Principais Tabelas)

### Core Tables
- `profiles` - Usuários do sistema
- `companies` - Multi-tenancy
- `boards` - Kanban boards
- `deals` - Negócios/oportunidades
- `contacts` - Pessoas e empresas
- `activities` - Tarefas e eventos

### Feature Tables
- `qr_codes` - QR d'água projects
- `document_templates` - Biblioteca compartilhada (planejado)
- `agents` - Agentes especializados (planejado)
- `tech_stack` - Stack knowledge base (planejado)

---

## 🔐 Security & Permissions

### Role-Based Access Control (RBAC)
- **Super Admin**: Acesso total (Amazo agent)
- **Admin**: Acesso completo à sua company
- **User**: Acesso limitado (CRUD próprios dados)

### Row Level Security (RLS)
- Tenant isolation por `company_id`
- Policies específicas por tabela
- SECURITY DEFINER functions para bypass controlado

---

## 🚀 Roadmap

### Fase Atual (v1.4)
- ✅ Layout.tsx duplication fix
- ✅ FloatingAIWidget Açaí theme
- ✅ Sistema estável para cliente real

### Próxima Fase (v1.5)
- ⏳ Shared Library (Templates)
- ⏳ Documentador Agent
- ⏳ Amazo SuperAdmin implementation

### Backlog Estratégico
- Stack Knowledge Base
- Agent Hub (Prompt Lab evolution)
- GitHub Lifecycle Sync
- Landing Page pública
- Analytics dashboard

---

## 📝 Notas de Arquitetura

### Princípios de Design
1. **Context-Aware AI**: Agentes sempre têm contexto completo
2. **No-Code First**: Usuário não-técnico deve conseguir operar
3. **Automation by Default**: Se pode ser automatizado, deve ser
4. **Single Source of Truth**: Hub é a fonte única de verdade

### Filosofia do Sistema
- De CRM → Business Operating System
- De "Gestão de Vendas" → "Centro de Comando da Agência"
- De "Dados Isolados" → "Inteligência Conectada"

---

**Última Atualização**: 15/12/2025  
**Versão**: 1.4  
**Autor**: Equipe Encontro D'Água
