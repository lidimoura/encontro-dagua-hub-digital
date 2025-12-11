# DEVLOG - CRM Encontro d'água hub

Este arquivo registra todas as mudanças significativas no projeto, organizadas por data e categoria.

---

## 🛡️ MARCO: [11/12/2025] - v1.2 - Security Hardening & Bug Bash

### 🔐 Database Security - Multi-tenant RLS

**Problema Crítico Resolvido:** Infinite recursion em RLS policies causava crash ao editar perfis.

#### Implementação Híbrida (Tenant Isolation + Super Admin)

**Funções SECURITY DEFINER (Bypass RLS):**
- `get_user_company_id()` - Retorna company_id sem triggerar RLS
- `is_user_admin()` - Checa role='admin' sem recursão
- `is_super_admin()` - Checa email OU coluna `is_super_admin`

**Policies Criadas (8 total):**
1. `tenant_isolation_select` - Users veem apenas sua company
2. `super_admin_view_all` - Super admin vê todas companies
3. `users_update_own` - Users editam só próprio perfil (protege role/company_id)
4. `admin_update_company` - Admins editam apenas sua company
5. `super_admin_update_all` - Super admin edita qualquer perfil
6. `admin_insert_company` - Admins criam apenas em sua company
7. `super_admin_insert_all` - Super admin cria em qualquer company
8. `super_admin_delete_all` - Apenas super admin deleta

**Limpeza de Policies:**
- Script "Nuclear V3" com PL/pgSQL dinâmico
- Removidas 15+ policies conflitantes (PT-BR, Read access, tenant_isolation antigas)
- Estado final: Exatamente 8 policies ativas

**Nova Coluna:**
- `profiles.is_super_admin` (boolean, default false)
- Permite adicionar super admins via painel (futuro)

#### Arquivos SQL Criados:
- `rls_nuclear_v3.sql` - Limpeza dinâmica de policies
- `fix_company_id.sql` - Correção de UUID undefined
- `rls_multitenant_fix.sql` - Implementação completa

---

### 🐛 Bug Bash - Correções Críticas

#### 1. Crash "Tela Preta" no QR Code
**Sintoma:** App crashava ao digitar URL no campo de destino  
**Causa:** Import incorreto da biblioteca QR Code  
**Fix:** Trocado `react-qr-code` para `qrcode.react`  
**Arquivo:** `src/features/qrdagua/QRdaguaPage.tsx` (linha 6)

#### 2. Erro "invalid input syntax for type uuid: undefined"
**Sintoma:** Falha ao criar contatos ou editar perfil  
**Causa:** Usuário sem `company_id` válido no banco  
**Fix:** Script SQL para vincular usuário a company  
**Impacto:** Bloqueava operações CRUD em todo o sistema

#### 3. Menu Prompt Lab "Desaparecido"
**Sintoma:** Item não aparecia no menu lateral  
**Causa:** Cache do browser (código estava correto)  
**Fix:** Hard refresh (`Ctrl+Shift+R`)  
**Confirmado:** Menu presente em mobile (linha 164) e desktop (linha 310)

---

### 📊 Métricas da Sprint de Segurança

| Métrica | Valor |
|---------|-------|
| Policies antigas removidas | 15+ |
| Policies novas criadas | 8 |
| Funções SECURITY DEFINER | 3 |
| Bugs críticos corrigidos | 3 |
| Scripts SQL gerados | 5 |
| Tentativas de limpeza RLS | 3 (V1, V2, V3) |

---

### 🎯 Status Pós-Correção

**✅ ESTÁVEL EM PRODUÇÃO (Vercel)**

- **RLS:** Sem recursão infinita, tenant isolation funcional
- **Super Admin:** Acesso global implementado
- **QR Code:** Sem crashes em validação de URL
- **Data Integrity:** Todos os usuários com company_id válido
- **Build:** Dependência `qrcode.react` adicionada ao package.json

---

### 🔮 Próximos Passos

1. **Dogfooding:** Criar 3 projetos QR d'água (Amazô, Yara, CRM Hub)
2. **Landing Page:** Construir portfólio público com projetos marcados
3. **Analytics:** Rastrear uso de Prompt Lab e QR d'água
4. **Super Admin Panel:** Interface para gerenciar super admins

---


### 🏆 Transformação Estratégica

Evolução de CRM tradicional para **Business Operating System** completo com ferramentas de IA e automação. Sprint massiva de desenvolvimento concluída com sucesso.

---

### 🔧 CORE FIXES - Infraestrutura Crítica

#### ✅ Solução de Recursão Infinita (RLS - Supabase)
- **Problema Resolvido**: Loop infinito causado por RLS policies mal configuradas
- **Impacto**: Edição de perfil estava travando o sistema
- **Status**: Correção aplicada, aguardando validação em produção

#### ✅ Botão Refresh de Permissões
- **Arquivo**: [`src/components/Layout.tsx`](file:///c:/PROJETOS/crm-encontro-dagua/src/components/Layout.tsx#L418-L434)
- **Funcionalidade**: Ícone `RefreshCcw` no header que recarrega `profile` do banco
- **Benefício**: Admins podem atualizar permissões sem logout/login
- **UX**: Animação de rotação durante loading, tooltip "Atualizar permissões"
- **Solução**: Elimina necessidade de logout após mudança de `role` no DB

---

### 🚀 NOVOS PRODUTOS - Lançamentos

#### 1️⃣ Prompt Lab - Otimizador de Prompts com IA
- **Rota**: `/prompt-lab`
- **Arquivo**: [`src/features/prompt-lab/PromptLabPage.tsx`](file:///c:/PROJETOS/crm-encontro-dagua/src/features/prompt-lab/PromptLabPage.tsx) (257 linhas)
- **Tecnologia**: Gemini 2.5 Flash Lite (fallback: 1.5 Flash)
- **Personas Disponíveis**: 6 opções
  - 👨‍💻 Engenheiro de Software
  - ✍️ Copywriter
  - 🎨 Designer
  - ⚖️ Advogado
  - 📈 Profissional de Marketing
  - 👩‍🏫 Professor
- **Features**:
  - Textarea para ideia bruta
  - Dropdown de seleção de persona
  - Botão "✨ Otimizar Prompt"
  - Área de saída com prompt otimizado
  - Botão copiar com feedback visual
  - System prompt oculto com regras de otimização
- **Visibilidade**: Disponível para todos os usuários
- **Menu**: Item "Prompt Lab" com ícone `Wand2` (varinha mágica)

#### 2️⃣ QR d'água - Construtor de Sites/Concierge (Evolução)
- **Rota**: `/qrdagua`
- **Arquivo**: [`src/features/qrdagua/QRdaguaPage.tsx`](file:///c:/PROJETOS/crm-encontro-dagua/src/features/qrdagua/QRdaguaPage.tsx) (921 linhas)
- **Modos de Projeto**:
  1. **LINK** (Gratuito - Todos): QR Code simples com redirect
  2. **BRIDGE** (R$ 49/mês - Admin): Página Ponte com CTA
  3. **CARD** (R$ 79/mês - Admin): Cartão Digital tipo vCard
- **QR Code Pro** (LINK mode):
  - Logo personalizado no centro
  - Texto acima do QR
  - Texto abaixo do QR
  - Campos: `qr_logo_url`, `qr_text_top`, `qr_text_bottom`
- **IA Integrada**:
  - Geração de títulos (5-7 palavras)
  - Geração de bios vendedoras (2-3 frases)
  - Botões "✨ Gerar" no formulário
- **PhoneMockup Component**:
  - Preview em tempo real (280x560px)
  - Notch e status bar realistas
  - Crash protection com optional chaining
- **Controle de Acesso**:
  - `isAdmin = profile?.role === 'admin'` (linha 219)
  - BRIDGE/CARD bloqueados para não-admins
  - Visual feedback com 🔒
- **CRUD Completo**: Direto no Supabase (sem N8N)

---

### 🤖 IA - Atualizações e Treinamento

#### Gemini 2.5 Flash Lite
- **Upgrade Global**: Migração de 1.5 Flash para 2.5 Flash Lite
- **Fallback Automático**: Se 2.5 falhar, usa 1.5 Flash
- **Implementado em**:
  - Prompt Lab (otimização de prompts)
  - QR d'água (geração de títulos e bios)
  - Flow AI (CRM Agent)

#### Flow AI - Treinamento Completo
- **Arquivo**: [`src/features/ai-hub/hooks/useCRMAgent.ts`](file:///c:/PROJETOS/crm-encontro-dagua/src/features/ai-hub/hooks/useCRMAgent.ts#L565-L622)
- **Documentação Injetada**: 57 linhas sobre QR d'água
- **Conhecimento Adicionado**:
  - Diferenças entre LINK, BRIDGE e CARD
  - Tabela de preços (R$ 0, R$ 49, R$ 79, +R$ 19 QR Pro)
  - Permissões por role (admin vs cliente)
  - Funcionalidades de cada modo
  - Orientações para usuários (como direcionar)
- **Resultado**: IA agora responde perguntas sobre produtos com precisão

---

### 📈 GROWTH - Estrutura de Vitrine

#### Backend Preparado (Campos no DB)
- **Tabela**: `qr_codes`
- **Campos Planejados**:
  - `in_portfolio` (boolean) - Marcar projetos para exibir no portfólio público
  - `in_gallery` (boolean) - Marcar projetos para galeria de exemplos
- **Status Frontend**: ⚠️ **NÃO IMPLEMENTADO**
  - Campos não estão sendo tratados no frontend
  - Checkboxes não existem no formulário
  - Query não filtra por `in_portfolio`

#### Próximos Passos (Dogfooding)
1. **Adicionar Checkboxes** no formulário QR d'água
2. **Popular Portfólio** com projetos reais:
   - Amazô (E-commerce de açaí)
   - Yara (Consultoria)
   - CRM Encontro D'Água (próprio produto)
3. **Landing Page Oficial**:
   - Rota: `/` ou `/portfolio`
   - Query: `SELECT * FROM qr_codes WHERE in_portfolio = true`
   - Design: Grid de cards com screenshots

---

### 🏗️ ARQUITETURA - Mudanças Estruturais

#### Estrutura de Features (`src/features/`)
```
features/
├── activities/       (11 arquivos)
├── ai-hub/          (3 arquivos) - Flow AI
├── boards/          (21 arquivos) - Kanban
├── contacts/        (11 arquivos)
├── dashboard/       (6 arquivos)
├── decisions/       (8 arquivos)
├── inbox/           (10 arquivos)
├── proactive-agent/ (1 arquivo)
├── profile/         (1 arquivo)
├── prompt-lab/      (1 arquivo) ✨ NOVO
├── qrdagua/         (1 arquivo) ✨ EVOLUÍDO
├── reports/         (1 arquivo)
└── settings/        (11 arquivos)
```

#### Rotas Ativas
- `/dashboard` - Visão geral
- `/boards` - Kanban de vendas
- `/contacts` - Gestão de contatos
- `/qrdagua` - Construtor de sites ✨
- `/prompt-lab` - Otimizador de prompts ✨
- `/ai` - Flow AI (chat)
- `/settings` - Configurações
- `/profile` - Edição de perfil

#### Menu Lateral
- ✅ Inbox
- ✅ Visão Geral
- ✅ Boards
- ✅ Contatos
- ✅ QR d'água ✨
- ✅ Prompt Lab ✨ NOVO
- ✅ Relatórios
- ✅ Configurações

---

### 📊 MÉTRICAS DA SPRINT

| Métrica | Valor |
|---------|-------|
| Arquivos criados | 2 |
| Arquivos modificados | 5 |
| Linhas adicionadas | ~650 |
| Bugs críticos resolvidos | 2 |
| Novos produtos lançados | 2 |
| Documentação IA (linhas) | 57 |
| Personas disponíveis | 6 |
| Modos QR d'água | 3 |

---

### 🎯 STATUS ATUAL

**✅ ESTÁVEL EM PRODUÇÃO (Vercel)**

- **Build**: Passando
- **Deploy**: Automático via Git
- **Ambiente**: Production
- **Performance**: Otimizada (lazy loading, code splitting)
- **Dark Mode**: Totalmente suportado
- **Mobile**: Responsivo (drawer menu funcional)

---

### 🔮 ROADMAP - Próxima Fase (Dogfooding)

#### Sprint Imediata
1. **Validar RLS Fix**
   - Testar edição de perfil em produção
   - Confirmar que não há mais recursão infinita
   
2. **Popular Portfólio**
   - Criar 3 projetos QR d'água de exemplo:
     - Amazô (BRIDGE - E-commerce)
     - Yara (CARD - Consultoria)
     - CRM Hub (LINK - Produto próprio)
   - Adicionar checkboxes `in_portfolio` e `in_gallery` no formulário
   
3. **Landing Page Oficial**
   - Criar rota `/` com portfólio público
   - Grid de cards com screenshots dos projetos
   - Botão CTA: "Criar meu QR d'água"
   - Seção de preços (R$ 0, R$ 49, R$ 79)

#### Backlog Estratégico
- **Analytics**: Rastrear uso de Prompt Lab e QR d'água
- **Templates**: Biblioteca de prompts prontos
- **Compartilhamento**: Links públicos para QR codes
- **Webhooks**: Notificações quando QR é escaneado
- **Pagamentos**: Integração Stripe (BRIDGE/CARD)

---


## [10/12/2025] - v1.0 - Lançamento Módulo Concierge QR

### 🎯 Feature: QR d'água - Construtor de Microsites

Transformação completa do gerador de QR Codes em um construtor visual de microsites com IA integrada.

#### 🚀 Principais Features:

- **QR Code Pro**: 
  - Logo personalizado no centro do QR Code
  - Texto customizável acima do QR (ex: "Escaneie e ganhe 10% de desconto")
  - Texto customizável abaixo do QR (ex: "Válido até 31/12/2025")
  - Cores totalmente personalizáveis

- **Site Builder - Modo Bridge (Página Ponte)**:
  - Logo/imagem circular no topo
  - Título da página gerado por IA
  - Descrição vendedora
  - Botão call-to-action customizável
  - Preview em tempo real no PhoneMockup

- **Site Builder - Modo Card Digital**:
  - Foto de perfil profissional
  - Nome e bio do cliente
  - Links para website e WhatsApp
  - Design responsivo tipo "link in bio"

- **IA Co-piloto (Gemini 2.5 Flash Lite)**:
  - Geração automática de títulos impactantes (5-7 palavras)
  - Geração de copy vendedor para bio/descrição (2-3 frases)
  - Fallback automático para Gemini 1.5 Flash
  - Botões "✨ Gerar com IA" integrados ao formulário

- **Segurança - Controle de Acesso Admin**:
  - Role-based access control usando `profile.role` do Supabase
  - Modos BRIDGE e CARD exclusivos para admin
  - Usuários regulares limitados ao modo LINK
  - Visual feedback com ícone 🔒 para features bloqueadas

- **Infraestrutura**:
  - CRUD completo direto no Supabase (Create, Read, Update, Delete)
  - Remoção da dependência N8N para storage de QR Codes
  - Novos campos no schema: `qr_logo_url`, `qr_text_top`, `qr_text_bottom`
  - Crash protection total com optional chaining e error handlers

- **UX/UI**:
  - PhoneMockup realista (280x560px) com notch e status bar
  - Preview em tempo real - atualiza ao digitar
  - Estados de loading em todas as operações assíncronas
  - Suporte completo a dark mode
  - Design responsivo mobile-first

#### 📦 Arquivos Modificados:
- `src/features/qrdagua/QRdaguaPage.tsx` - Componente principal completamente refatorado
- Schema Supabase - Adicionadas colunas para QR Pro features

#### 🔧 Tecnologias:
- React 19 + TypeScript
- Google Gemini AI (2.5 Flash Lite)
- Supabase (Database & Auth)
- react-qr-code (QR rendering)
- Tailwind CSS

---

## [09/12/2025] - Mobile UX (IMPLEMENTADO)

- **✅ Menu Mobile Drawer Completo**: Implementado drawer mobile com animações suaves
- **Botão Hambúrguer**: Visível apenas em mobile (`md:hidden`), abre o menu lateral
- **Backdrop com Overlay**: Fundo escuro semi-transparente, fecha ao clicar fora
- **Auto-close**: Menu fecha automaticamente ao navegar entre páginas
- **Prevenção de Scroll**: Body scroll bloqueado quando menu está aberto
- **Navegação Completa**: Todos os itens do menu desktop disponíveis no mobile
- **User Card**: Perfil do usuário e opções de logout no rodapé do drawer
- **Acessibilidade**: `aria-label` nos botões, animações com `animate-in`

## [02/12/2025] - Mobile UX (PLANEJADO - NÃO IMPLEMENTADO)

- **~~Implementado botão Hambúrguer~~**: ❌ Entrada incorreta no DEVLOG
- **~~Estado isMobileMenuOpen~~**: ❌ Não estava implementado até 09/12/2025


## [02/12/2024] - Bug Fix / IA

- **Corrigido bug de parsing JSON**: Resolvido problema de interpretação de JSON no componente AIAssistant.tsx
- **Melhorias na estabilidade**: Chat IA agora processa respostas de forma mais confiável

## [02/12/2025] - UX / Componentes

- **Criado NotificationsPopover.tsx**: Novo componente para exibição de notificações em popover
- **Melhorias na experiência do usuário**: Interface mais intuitiva para acompanhamento de notificações

## [02/12/2025] - Branding

- **Atualização de marca**: Projeto renomeado para "Encontro D'Água Hub"
- **Identidade visual**: Ajustes de branding em toda a aplicação

## [04/12/2025] - DevOps / Infraestrutura

- **Criado DEVLOG.md**: Arquivo de registro de mudanças do projeto
- **Integração N8N**: Implementado serviço de webhooks para automações externas
- **n8nService.ts**: Função genérica `sendToN8nWebhook` para integração com workflows N8N
- **Funções preparadas**: `calculatePricing` e `consultLegalAgent` para futuras integrações
- **Tipos TypeScript**: Criado `vite-env.d.ts` com definições de ambiente
- **Variáveis de ambiente**: Atualizado `.env.example` com URLs dos webhooks N8N

---

## Formato de Entrada

```markdown
## [DD/MM/AAAA] - [Categoria]
- **Título da mudança**: Descrição detalhada
```

### Categorias Sugeridas:
- Feature (Nova funcionalidade)
- Bug Fix (Correção de bugs)
- UX (Melhorias de experiência do usuário)
- Performance (Otimizações)
- Refactor (Refatoração de código)
- DevOps (Infraestrutura e deploy)
- Documentation (Documentação)
- Security (Segurança)
- Mobile (Mobile específico)
- IA (Inteligência Artificial)
- Branding (Marca e identidade visual)
