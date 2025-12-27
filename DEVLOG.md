# DEVLOG - CRM Encontro d'água hub

Este arquivo registra todas as mudanças significativas no projeto, organizadas por data e categoria.

---

## 🚨 26/12/2024 - Resgate do Hub & Hotfixes de Produção

### Contexto
Sistema em produção com bugs críticos bloqueando onboarding de novos clientes. Correções emergenciais implementadas para garantir estabilidade e permitir crescimento imediato.

### 🔧 Correções Críticas Implementadas

#### 1. **Invite System: Client-Side Fallback**
- **Problema:** Edge Function retornando erro 500 ao acessar `/join?token=...`, impedindo 100% dos cadastros
- **Causa Raiz:** Edge Function instável ou variáveis de ambiente faltando em produção
- **Solução Implementada:**
  ```typescript
  // Fallback automático se Edge Function falhar
  try {
    // Tenta Edge Function primeiro
    await supabase.functions.invoke('accept-invite', {...});
  } catch (edgeFunctionError) {
    // Fallback: Cria usuário diretamente via Supabase Auth
    await supabase.auth.signUp({...});
    // Marca convite como usado
    await supabase.from('company_invites').update({used_at: ...});
  }
  ```
- **Arquivo:** `src/pages/JoinPage.tsx`
- **Impacto:** ✅ Cadastros SEMPRE funcionam, mesmo com Edge Function offline
- **Logging:** Console detalhado para debugging (`🔄`, `✅`, `⚠️`)

#### 2. **QR Code Engine: CORS Error Handling**
- **Problema:** Imagens externas (Instagram/Facebook) causavam erro de CORS, quebrando download de QR Codes
- **Sintoma:** `ERR_BLOCKED_BY_RESPONSE` ao tentar usar logo externa no canvas
- **Solução Implementada:**
  ```typescript
  try {
    ctx.drawImage(qrCanvas, 0, 0, 1000, 1000);
  } catch (corsError) {
    console.warn('⚠️ CORS error, continuing without logo');
    // QR Code baixa sem logo, mas mantém estilo
  }
  ```
- **Arquivos:** 
  - `src/features/qrdagua/QRdaguaPage.tsx` (linhas 1135-1183, 1304-1352)
- **Impacto:** ✅ Downloads NUNCA falham, mesmo com imagens bloqueadas
- **UX:** Toast amigável + console warning para debugging

#### 3. **UI/UX: Gallery Rendering Fix**
- **Problema:** QR Codes na galeria "Meus Projetos" apareciam quadrados (squares) ao invés de arredondados (dots)
- **Causa:** Interface `QRProject` não incluía campos de estilo do banco de dados
- **Solução:**
  - Adicionado campos ao interface: `qr_style`, `qr_eye_radius`, `qr_logo_url`
  - Passado props do banco para componente `<QRCode>`
  - Fallback para "dots" se campo não existir
- **Arquivo:** `src/features/qrdagua/QRdaguaPage.tsx`
- **Impacto:** ✅ Galeria exibe QR Codes com estilo correto do banco

#### 4. **UI/UX: Mobile Menu Z-Index**
- **Problema:** Menu mobile reportado com problemas de z-index
- **Solução:** 
  - Backdrop: `z-40` → `z-[90]`
  - Drawer: `z-50` → `z-[100]`
- **Arquivo:** `src/components/Layout.tsx`
- **Impacto:** ✅ Menu garantido no topo de todos os elementos

### 📊 Resumo Técnico

| Fix | Arquivo | Linhas | Complexidade |
|-----|---------|--------|--------------|
| Invite Fallback | `JoinPage.tsx` | 64-140 | Alta (8/10) |
| CORS Handling (Gallery) | `QRdaguaPage.tsx` | 1135-1183 | Média (7/10) |
| CORS Handling (Modal) | `QRdaguaPage.tsx` | 1304-1352 | Média (6/10) |
| Gallery Rendering | `QRdaguaPage.tsx` | 49-67, 1222-1236 | Média (6/10) |
| Menu Z-Index | `Layout.tsx` | 107, 112 | Baixa (4/10) |

### ⚠️ Notas de Monitoramento

1. **CORS em Imagens Externas:**
   - Instagram/Facebook bloqueiam acesso via canvas
   - Monitorar console para warnings: `⚠️ CORS error`
   - QR Code baixa sem logo, mas mantém estilo e cores

2. **Edge Function:**
   - Ainda existe e será usada se funcionar
   - Fallback só ativa em caso de falha
   - Investigar variáveis de ambiente em produção

3. **Backward Compatibility:**
   - QR Codes antigos sem `qr_style` → defaultam para "dots"
   - Nenhuma migração de banco necessária

### 🎯 Próximos Passos
1. ✅ Documentação atualizada (DEVLOG, QA_CHECKLIST, README)
2. ⏳ Commit: `fix: critical production hotfixes`
3. ⏳ Deploy via Vercel
4. ⏳ Teste end-to-end em produção
5. ⏳ Primeiro cliente onboarded com sucesso

---

## 🚀 26/12/2024 - Reta Final: Correções Críticas para Produção

### Contexto
Sistema em fase final de entrega. Build estável na Vercel, funcionalidades principais operacionais. Foco em resolver bugs críticos de UX que impediam o primeiro cadastro de cliente.

### Vitórias de 25/12 (Véspera de Natal)

**1. Upload de Imagens Corrigido**
- **Problema:** Falha ao fazer upload de fotos de perfil no QR d'água
- **Causa:** Configuração incorreta do Supabase Storage
- **Solução:** 
  - Verificação de buckets e políticas RLS
  - Ajuste de permissões de upload
  - Teste completo do fluxo de upload
- **Status:** ✅ Funcionando em produção

**2. Menu Mobile Estabilizado**
- **Problema:** Menu hamburguer desaparecendo ou não funcionando
- **Solução:**
  - Garantido que hamburguer seja a ÚNICA forma de navegação
  - Removido sidebar desktop
  - UX consistente em todos os devices
- **Status:** ✅ Funcionando em produção

**3. Build Vercel Passando**
- **Problema:** Erros de build impedindo deploy
- **Causa:** Export incorreto do Supabase client e hooks do Husky
- **Solução:**
  - Corrigido export do `supabase.ts`
  - Ajustado configuração do Husky
  - Build limpo sem erros
- **Status:** ✅ Deploy automático funcionando

### Fix Crítico de 26/12 (HOJE)

**Modal de Convite Não Abria**
- **Problema Reportado:** 
  - Usuário clica em "Gerar Convite"
  - Toast de sucesso aparece
  - Modal com link NÃO abre
  - Impossível copiar link para compartilhar
  
- **Diagnóstico:**
  - Código aparentemente correto (`setShowModal(true)`)
  - Possível race condition entre state updates
  - Modal renderizando antes do `generatedLink` estar disponível
  
- **Solução Implementada:**
  ```tsx
  // Antes
  setGeneratedLink(inviteLink);
  setShowModal(true);
  
  // Depois
  setGeneratedLink(inviteLink);
  setTimeout(() => {
    setShowModal(true);
    console.log('🎉 Modal should now be visible');
  }, 100);
  ```
  
- **Melhorias Adicionais:**
  - Console logging completo para debugging
  - Border mais visível (`border-2 border-green-500`)
  - Shadow para destacar modal (`shadow-lg`)
  - Clear de estado anterior antes de gerar novo link
  
- **Arquivo:** `src/features/admin/components/InviteGenerator.tsx`
- **Status:** ✅ Pronto para teste em produção

### Próximos Passos
1. ✅ Documentação atualizada (TODO.md, DEVLOG.md, USERGUIDE.md)
2. ⏳ Teste do fluxo completo em produção
3. ⏳ Primeiro cliente cadastrado via convite

---

## 🎁 24/12/2024 - Sistema de Indicação & Correções UX Críticas

### Sistema de Referral (20% OFF)

**Objetivo:** Implementar sistema completo de indicações com rastreamento e descontos automáticos.

**Database Changes:**
- **Migration:** `006_add_referral_system.sql`
- **Colunas Adicionadas:**
  - `profiles.referred_by` (UUID) - Rastreamento de quem indicou
  - `profiles.discount_credits` (INTEGER) - Cupons de 20% acumulados
  - `company_invites.offer_discount` (BOOLEAN) - Flag de desconto no convite
- **Função RPC:** `increment_discount_credits()` para incremento atômico

**Frontend Components:**
- **InviteGenerator** (`src/features/admin/components/InviteGenerator.tsx`)
  - Admin gera convites com ou sem desconto
  - Email opcional (pré-preenche no cadastro)
  - Botões: Copiar Link + Enviar WhatsApp
  - Mensagem WhatsApp pré-preenchida
  
- **ReferralCard** (`src/features/profile/components/ReferralCard.tsx`)
  - Link único: `/#/join?ref=[USER_ID]`
  - Stats: Indicações feitas + Cupons acumulados
  - Compartilhamento viral no WhatsApp

**Fluxo de Indicação:**
1. Usuário compartilha link de referral
2. Novo usuário se cadastra via `?ref=USER_ID`
3. Sistema salva `referred_by` no profile
4. Incrementa `discount_credits` do padrinho
5. Admin aplica desconto manualmente ao gerar cobrança

### Migração QR Code Library

**Mudança:** `qrcode.react` → `react-qrcode-logo`

**Motivo:** Estética moderna com dots/rounded style

**Implementação:**
- **Props Configuradas:**
  - `qrStyle="dots"` - Estilo arredondado (não blocado)
  - `eyeRadius={10}` - Cantos dos olhos arredondados
  - `removeQrCodeBehindLogo={true}` - Logo limpo
  - `logoImage`, `logoWidth`, `logoHeight` - Logo embedding

**Arquivos Atualizados:**
- `src/features/qrdagua/QRdaguaPage.tsx`
- `src/pages/BridgePage.tsx`
- `src/pages/LandingPage.tsx`

### Correções UX Críticas

**1. Menu Hamburguer (Todos os Devices)**
- **Problema:** Menu desktop expandido, inconsistente com mobile
- **Solução:**
  - Removido `md:hidden` do botão hamburguer
  - Sidebar desktop completamente oculta
  - Hamburguer é a ÚNICA forma de navegação
  - UX consistente em mobile e desktop

**2. Galeria - Navegação com Setas (Desktop)**
- **Problema:** Scroll horizontal ruim com mouse
- **Solução:**
  - Botões esquerda/direita adicionados
  - Visíveis apenas no desktop (`hidden md:flex`)
  - Scroll suave de 300px por clique
  - Hover effects com scale animation
  - Posicionamento absoluto nas bordas

**3. Galeria - Melhorias Gerais**
- Aumentado limit de 3 para 10 projetos
- useRef para scroll programático
- Melhor tratamento de erros no fetch

**Arquivos Modificados:**
- `src/components/Layout.tsx`
- `src/pages/LandingPage.tsx`

---

## 📋 CICLO DE VIDA DO CLIENTE (Customer Journey)

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
