# DEVLOG - CRM Encontro d'água hub

Este arquivo registra todas as mudanças significativas no projeto, organizadas por data e categoria.

---

## 📋 CICLO DE VIDA DO CLIENTE (Customer Journey)

**Última Atualização:** 23/12/2025

### Fluxo Completo: Da Captação à Retenção

#### 1. **CAPTAÇÃO** (Landing Page → Amazo → WhatsApp)
- **Entrada:** Visitante acessa Landing Page (`/`)
- **Interação:** Clica em "Falar com Amazo" ou botões CTA
- **Ação:** Typebot (chatbot Amazo) abre em bubble
- **Qualificação:** Amazo faz diagnóstico inicial e direciona para WhatsApp
- **Resultado:** Lead qualificado chega no WhatsApp da Admin (Lidi)

#### 2. **CONVERSÃO** (CRM → Link de Cadastro)
- **Entrada:** Admin recebe lead no WhatsApp
- **Ação:** Admin cria negócio no CRM (Kanban Board)
- **Qualificação:** Move pelas etapas do funil (Prospecção → Qualificação → Proposta)
- **Conversão:** Quando aprovado, Admin gera link de convite
  - **Como:** Atualmente MANUAL (não há botão no Admin Panel)
  - **URL:** `https://[dominio]/#/join?token=[TOKEN_GERADO]`
  - **Nota:** Token deve ser criado na tabela `company_invites` do Supabase
- **Envio:** Admin envia link via WhatsApp para o cliente

#### 3. **ATIVAÇÃO** (Cadastro → Primeiro Cartão)
- **Entrada:** Cliente clica no link de convite
- **Rota:** `/join?token=...` (JoinPage.tsx)
- **Validação:** Sistema valida token na tabela `company_invites`
- **Cadastro:** Cliente preenche nome, email e senha
- **Login Automático:** Após criar conta, faz login automaticamente
- **Onboarding:** Cliente é direcionado para Dashboard
- **Primeiro Uso:** Cria primeiro Cartão Digital no QR d'água
  - Acessa `/qrdagua`
  - Escolhe tipo (Link/Bridge/Cartão Digital)
  - Preenche dados e gera QR Code
  - Baixa QR em HD e compartilha no WhatsApp

#### 4. **RETENÇÃO** (Upgrade Pro → Uso Contínuo)
- **Plano FREE:** Acesso a QR d'água básico
- **Upgrade PRO:** Cliente assina plano via WhatsApp
  - Admin atualiza role para `admin` no Supabase
  - Desbloqueia: CRM completo, Prompt Lab, Features PRO
- **Uso Contínuo:**
  - Gerencia negócios no CRM
  - Cria prompts no Prompt Lab
  - Gera novos cartões e links
  - Consulta Analytics

---

### URLs e Rotas Importantes

**Públicas (Sem Autenticação):**
- `/` - Landing Page
- `/login` - Login
- `/join?token=...` - Cadastro via convite
- `/v/:slug` - Visualização pública de cartões (BridgePage)

**Protegidas (Requer Autenticação):**
- `/dashboard` - Dashboard principal
- `/qrdagua` - Gerador de QR Codes
- `/prompt-lab` - Laboratório de Prompts
- `/boards` ou `/pipeline` - CRM Kanban
- `/contacts` - Gestão de contatos
- `/admin` - Painel Admin (role: admin)

---

### Pontos de Atenção (Gaps Identificados)

1. **❌ Falta Botão "Gerar Convite"** no Admin Panel
   - Atualmente Admin precisa criar token manualmente no Supabase
   - **Solução Futura:** Adicionar botão no `/admin` que gera link automaticamente

2. **✅ Typebot Funcionando** na Landing Page
   - Script carregado via `useEffect` no LandingPage.tsx
   - Bubble aparece no canto inferior direito

3. **✅ Galeria com Consentimento** implementada
   - Checkbox `in_gallery` no formulário QR d'água
   - Seção "Vitrine da Comunidade" na Landing Page
   - **Pendente:** Trocar mockups por dados reais do Supabase

---

## Sprint: Store Management (Missão 2)
**Status:** ✅ Concluído
**Data:** 22/12/2025

### 🏪 Catálogo de Produtos e Serviços

**Objetivo:** Implementar gestão completa de produtos/serviços da loja no Admin Panel com integração ao Kanban Board.

#### Componentes Criados:

**1. CatalogTab.tsx**
- Interface mobile-first para CRUD de produtos
- Modal de criação/edição com formulário completo
- Campos implementados:
  - Nome do produto/serviço
  - Preço (R$) com formatação
  - Unidade (un, h, mês)
  - Categoria (Serviço/Produto/Assinatura)
  - Descrição (textarea para links de pagamento e features)
  - Status ativo/inativo
- Cards responsivos com ações de editar e deletar
- Loading states e error handling
- Integração direta com Supabase

**2. AdminPage.tsx - Tab Navigation**
- Sistema de abas: "Usuários" e "Catálogo"
- Renderização condicional de conteúdo
- Search bar específica para aba de usuários
- Stats específicas para aba de usuários
- Smooth tab switching com visual feedback

#### Integração com Kanban Board:

**Fluxo Automático:**
1. Produtos criados no Catálogo → Disponíveis via `SettingsContext`
2. `CRMContext` expõe produtos para todos os componentes
3. `DealDetailModal` lista produtos na aba "Produtos"
4. Adicionar produtos aos negócios com quantidade
5. Cálculo automático do valor total

**Nenhuma alteração adicional necessária** - integração já funcionava via arquitetura existente!

#### Database Schema:

**Tabela:** `products` (já existente)
- Campos utilizados: `id`, `company_id`, `name`, `description`, `price`, `unit`, `category`, `is_active`
- Trigger automático: `company_id` preenchido via `auth.uid()` no RLS
- Políticas RLS: Usuários só veem produtos da própria empresa

---

## 🔮 ROADMAP: FASE 2 (Branch Develop & AI Integration)

**Status:** 📋 Planejado
**Data de Registro:** 23/12/2025

### Estratégia de Desenvolvimento

A partir desta fase, todo desenvolvimento de IA complexa será realizado na branch `develop` para preservar a estabilidade da `main` em produção.

### Backlog Mandatório

#### 1. Criação da Branch `develop`
- **Objetivo:** Isolar desenvolvimento de features complexas de IA
- **Regra:** Merge para `main` apenas após testes completos e aprovação
- **Benefício:** Preservar estabilidade da produção durante experimentação

#### 2. Migração da "Equipe de Agentes"
- **Origem:** Repositório original (Streamlit)
- **Agentes a Resgatar:**
  - `agente_briefing` - Coleta de requisitos
  - `agente_tecnico` - Análise técnica
  - `agente_qa` - Quality Assurance
  - Outros agentes especializados
- **Stack Atual:** Atualizar para Supabase/React
- **Integração:** Conectar com contexto do CRM e QR d'água

#### 3. Feature "Onboarding Mágico" (QR d'água AI)
- **Conceito:** Criação assistida por IA para Cartões Digitais
- **Fluxo:**
  1. Usuário descreve seu negócio via chat/input
  2. IA analisa e sugere configurações
  3. Formulário preenchido automaticamente:
     - Bio profissional gerada
     - Cores sugeridas baseadas no segmento
     - Links relevantes recomendados
  4. Usuário revisa e ajusta antes de salvar
- **Inspiração:** Similar à criação de Pipelines no CRM
- **Tecnologia:** Gemini 2.5 Flash com prompts estruturados

#### 4. Magic Landing Page Builder
- **Diferenciação:** Além do "Magic Card" (ágil e simples)
- **Objetivo:** IA capaz de gerar Landing Pages completas e dinâmicas
- **Funcionalidades:**
  - Geração de layout baseado em descrição
  - Sugestão de seções (Hero, Features, Testimonials, etc)
  - Customização de cores e tipografia
  - Integração com formulários e CTAs
- **Público:** Empreendedores que precisam de presença web profissional

#### 5. Showcase Dinâmico (Galeria Automatizada)
- **Objetivo:** Galeria que puxa melhores exemplos de clientes
- **Regra de Ouro:** ⚠️ **CONSENTIMENTO OBRIGATÓRIO (Opt-in)**
  - Campo `in_gallery` deve ser `true` explicitamente
  - Usuário deve marcar checkbox "Autorizar Galeria"
  - Nenhuma automação pode violar este consentimento
- **Critérios de Seleção:**
  - Projetos com `in_gallery = true`
  - Diversidade de segmentos (advogados, restaurantes, consultores, etc)
  - Qualidade visual e completude de informações
- **Implementação:**
  - Query Supabase filtrando `in_gallery = true`
  - Renderização dinâmica na Landing Page
  - Fallback para mockups quando não houver dados suficientes

### Princípios de Desenvolvimento

1. **Privacidade First:** Nenhuma feature de IA pode expor dados sem consentimento
2. **Transparência:** Usuário sempre sabe quando IA está sendo usada
3. **Controle:** Usuário pode desativar features de IA a qualquer momento
4. **Qualidade:** IA deve melhorar UX, não complicar
5. **Performance:** Features de IA não podem degradar performance da aplicação

### Próximos Passos

1. Criar branch `develop` a partir da `main` atual
2. Configurar CI/CD para branch `develop`
3. Documentar processo de merge `develop` → `main`
4. Iniciar desenvolvimento do "Onboarding Mágico"

---

**Nota:** Este roadmap é um documento vivo e será atualizado conforme o projeto evolui.
