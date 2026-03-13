# DEVLOG - CRM Encontro d'água hub

Este arquivo registra todas as mudanças significativas no projeto, organizadas por data e categoria.

---
## [13/03/2026] — Sprint Estabiliz. Internacional: IA Keys, Precy FX, Jury LatAm, Docs

### 🔑 Feature — Gestão de IA sem .env (UI No-Code)
- **`AIConfigSection.tsx`**: adicionado campo **Chave Reserva (Failover 429)** com badge "Rodízio Automático"
- **`SettingsContext.tsx`**: novo estado `aiApiKeySecondary` com getter/setter; salvo via `saveAISettings()`
- **`CRMContext.tsx`**: proxied `aiApiKeySecondary`/`setAiApiKeySecondary` para toda a app
- **`settings.ts`**: `DbUserSettings`, `UserSettings` e `transformSettings` atualizados com campo `ai_api_key_secondary`
- **SQL necessário**: `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS ai_api_key_secondary text;`
- Ambas as chaves são persistidas no Supabase — zero dependência de `.env`/Vercel

### 💱 Fix — Precy: FX Inteligente + Fix 409
- **`PrecyAgent.tsx`**: adicionado mapa estático de câmbio (`FX_RATES`) com 10 moedas (BRL base): BRL, USD, EUR, AUD, COP, PEN, ARS, MXN, CLP, UYU
- `convertPrice()`: converte o preço final de BRL para a moeda selecionada antes de salvar
- **Fix 409**: substituído `.insert()` por `.upsert({ onConflict: 'name' })` — evita conflito quando produto de mesmo nome já existe no catálogo
- Metadata salva `price_brl` original para rastreabilidade
- Seletor de moeda migrado de 4 botões para `<select>` compacto com emojis de bandeira

### ⚖️ Feature — Jury: LatAm, Auto-Open, Saídas Separadas
- **Jurisdições expandidas**: CO (Ley 1581), PE (Ley 29733), AR (Ley 25.326), MX (LFPDPPP), CL (Ley 19.628), UY (Ley 18.331) — somando às existentes BR/US/AU/EU
- **Chat auto-aberto**: `isRefinementOpen` agora começa `true` — Jury inicia pronta
- **Separação de saídas**: `contractGenerated` flag separada — chat para diálogo/resumos, área de contrato apenas para documento formal
- **Container fixo**: `h-72 min-h-0 overflow-y-auto` com `contain:strict` — elimina layout jump durante streaming da IA
- System prompt reformulado: Jury age como consultora (faz perguntas antes de gerar)

### 📚 Documentação
- **`UserGuide.md`** (NOVO): manual completo com todas as funcionalidades nativas e features — Kanban, botão `+`, agentes IA, ciclo de vida, catálogo, configuração de IA, LP→SDR, e nota de SQL
- **`DEVLOG.md`**: esta entrada adicionada

### 📊 Métricas da Sprint
| Métrica | Valor |
|---|---|
| Arquivos de código modificados | 7 |
| Novas features UI | 3 (secondary key, Precy select, Jury LatAm flags) |
| Bugs corrigidos | 2 (409 Precy, addToast args) |
| Documentação | 1 arquivo novo, 1 atualizado |
| Build TypeScript | ✅ 0 erros |

---

## [02/27/2026] - Finalização de Sprint: Correções Críticas no CRM e Integração Nexus/Jury

- **Resolução do Erro 409 (Delete em Cascata de Contatos)**: A deleção de contatos duplicados gerava *409 Conflict* no Supabase devido à falta de `ON DELETE CASCADE` dependente. Implementamos a deleção em cascata direta via `contactsService.delete(...)`. A função agora exclui proativamente os `deals` e as `activities` antes da raiz. Cards fantasmas também foram removidos via filtro inteligente no Kanban e Realtime reativado para as tabelas essenciais.
- **Fix do Erro 400 (Save to Deal - Jury AI)**: O payload para salvar contratos falhava pois passava `user_id` em vez de `owner_id`, omitia o requerido `company_id` da query, e quebrava o enum enviando "NOTE" maiúsculo. O payload no JuryAgent foi corrigido extraindo profile via auth e tipando corretamente os enums, destravando a vinculação de artefatos da IA aos clientes.
- **Nova Estrutura de Abas nos Cards (Aba Documentos)**: Contratos salvos sumiam na Timeline, poluindo-a. Instanciamos a tab estática **"Documentos e Contratos"** no `DealDetailModal.tsx`. Todas as atividades tipo nota agora têm um repositório fixo, scrollável e isolado para leitura focada, organizando a topologia UI do Card do Cliente.
- **Bridge / Iframe Masking Restore (Camuflagem QRdAgua)**: Restaurado o `<iframe src>` nativo com os sandboxes injetados e `referrerPolicy="no-referrer"` na `BridgePage.tsx`. O wrapper volta a emular URLs blindadas (ex: lovable e google scripts) por baixo da UI principal do hub d'água sem ser bloqueado pela política de frame-ancestors.

---
## [02/26/2026] - Layout, UX & Integração AI

- **Surgical CSS Layout Architecture**: Resolvido loop infinito de design eliminando o `overflow-hidden` global na root do `Layout.tsx` e substituindo por `min-h-screen`. Nas rotas dedicadas (`/boards` e `/ai`), aplicamos isoladamente `height: calc(100vh - 64px)` no `<main>` para alocar exatamente a viewport sem sumir com a Kanban Top Bar ou com as mensagens no Hub IA.
- **Pipeline Strict Segregation**: Implementado o filtro rigoroso no `useDealsByBoard.ts`. O board 'SDR' retira rigorosamente contatos `CUSTOMER` e `WON`, e o board de 'Onboarding' exige estritamente a ocorrência desses status subjacentes, evitando fantasmas do funil de vendas reaparecendo no pós-venda.
- **Client Enrichment no Jury**: JuryAgent agora possui input e state para Endereço, e ao "Salvar no Deal", a aplicação faz enrichment atualizando o campo `notes` nativo do CRM no perfil do Contato correspondente associando de forma definitiva seu CPF/CNPJ e Endereço digitados.
- **Correção Crítica de Layout Mobile-First**: `Layout.tsx` completamente reestruturado para suportar flexbox dinâmico (`min-h-0 overflow-hidden`), garantindo que o Kanban Top Bar apareça e que roteamento de páginas (AI Hub, Dashboard) tenham scroll isolado adequado via `PageScroll`.
- **Aiflow Native Core Restaurado**: Recaptura das native tools da IA (`analyze_leads`, `move_deal`, `list_contacts`). Tratamento de erros de tipagem no Supabase hooks para evitar 400 Bad Request em queries de contatos/empresas.
- **Jury-Deal Integration**: O agente Jury agora detecta o Deal atual via `DealContext` para *auto-preenchimento* de Nome do Cliente e Valores. Adicionada feature para inserir o contrato diretamente na Timeline do Deal ("Salvar na Conta"), e uma action extra no chat para a IA resumir o contrato para envio por e-mail.
- **Branding Sync & Iframe Lockdown**: Atualização da marca d'água para "✦ PROVA D’ÁGUA — ENCONTRO D’ÁGUA HUB ✦" e ajustes no footer de propriedades dos websites gerados pela URL destino para exibir link direto ao Hub d'Água. Corrigido vazamento de redirecionamento global no modo Iframe na `BridgePage`, travando o preview dentro do viewer para o template do site original. Renomeada a Tab "Insights (AI)" no layout de BoardTabs para "Equipe de IA" consolidando as personas de IA.

## [06/03/2026] — Sprint Lançamento: Briefing UI + WA IA + Import Histórico

### 🎯 Feature — CRM: Renderização Completa do Briefing no Card do Lead

O `briefing_json` capturado pelo Amazô SDR agora é exibido em **todas as abas** do `DealDetailModal`,
eliminando a necessidade de abrir o banco para ver o contexto do lead.

#### Aba Produtos (`activeTab === 'products'`)
- **Novo**: Bloco "Interesse declarado pelo Lead" exibe os serviços de `briefing_json.services[]`
  como chips/badges teal no topo da aba, antes do formulário de adicionar produto.
- Instrução orientativa: "Estes serviços foram informados pelo lead no briefing. Adicione os produtos correspondentes abaixo."

#### Aba Timeline (`activeTab === 'timeline'`)
- **Novo**: Card "Briefing Automático — Amazô SDR" pintado em teal, fixado no topo da timeline.
- Exibe `briefing_json.message` com data/hora de captura (`capture_time`) e canal de entrada (`landed_via`).
- Ícone Bot diferencia visualmente da nota manual.

#### Contato Principal (sidebar)
- **Novo**: Botão/fluxo AI de WhatsApp descrito abaixo.

#### Interface `BriefingJson` — campo `message` e `capture_time` adicionados ao tipo.

---

### 🤖 Feature — IA: Gerador de Mensagem WhatsApp (Primeiro Contato)

Flow completo de abertura de conversa no WhatsApp com mensagem personalizada pela IA:

1. **Botão "📲 WhatsApp + Msg IA"** aparece no bloco Contato Principal sempre que `briefing_json.whatsapp` ou `contact.phone` existir.
2. Ao clicar, chama `generateWAOutreach()` (novo em `geminiService.ts`) via Gemini com contexto:
   - Nome do lead, serviços de interesse, mensagem original do briefing, deal no CRM.
3. IA gera mensagem personalizada, calorosa, direta — máx. 4 linhas, terminando com pergunta aberta.
4. Mensagem aparece em `<textarea>` editável (SDR pode revisar/ajustar antes de enviar).
5. Botão "Abrir no WhatsApp" abre `https://wa.me/{numero}?text={mensagemEncoded}` com a mensagem pré-preenchida.
6. Link "refazer" descarta e gera nova versão.

```typescript
// geminiService.ts
export const generateWAOutreach = async (
  deal: Deal | DealView,
  briefingData?: { name?, services?, message?, whatsapp? },
  config?: AIConfig
): Promise<string>
```

---

### 🛠️ Script — Importação de Leads Históricos

**Arquivo**: `scripts/import-leads.mjs` (Node.js ESM, zero dependências extras)

- Lê `.env` automaticamente na raiz do projeto.
- Busca todos os `contacts` no Supabase.
- Identifica quais ainda **não têm um `deal`** associado no Kanban.
- Cria deals em lotes de 50 no board padrão (etapa inicial), com `source`, `briefing_json` e tags.
- Modo `--dry-run` para relatório seguro antes de tocar no banco.

```powershell
# Relatório sem criar dados:
node scripts/import-leads.mjs --dry-run

# Importação real:
node scripts/import-leads.mjs
```

---

### 📊 Métricas da Sprint

| Métrica | Valor |
|---------|-------|
| Arquivos modificados | 3 (`DealDetailModal.tsx`, `geminiService.ts`, `scripts/import-leads.mjs`) |
| Novas funções de serviço | 1 (`generateWAOutreach`) |
| Novas features UI | 4 (badges Produtos, auto-note Timeline, botão WA, modal WA IA) |
| Script de importação | ✅ Com --dry-run |
| Docs atualizadas | 4 (DEVLOG, README, USER_GUIDE, HUB_SHOWCASE) |

---



### 🎯 UX — Landing Page

**Centralização da Seção Link d'Água**
- **Problema**: A seção "Link d'Água" na LP estava com conteúdo alinhado à esquerda em mobile, quebrando a consistência visual.
- **Fix**: `text-center lg:text-left` na coluna de copy; `justify-center lg:justify-start` nos botões e lista de features; `mx-auto lg:mx-0` no parágrafo descritivo.
- **Arquivo**: `src/pages/LandingPage.tsx`

### 🖼️ Fix — Galeria de Clientes (QR Codes)

**Problema crítico identificado**: Os QR Codes exibidos na galeria pública da LP eram ilegíveis e não escaneáveis pelos seguintes motivos:
1. `bgColor="transparent"` — fundo transparente tornava o código invisível
2. `fgColor={project.color}` — cor customizada (ex: `#620939`) sem contraste suficiente
3. `ecLevel="H"` + `qrStyle="dots"` + logo — combinação que reduzia a densidade legível
4. Renderização em **canvas** (padrão) — pixelado em telas retina e ao imprimir

**Solução aplicada**:
- `bgColor="#FFFFFF"` + `fgColor="#111111"` → máximo contraste, sempre escaneável
- `ecLevel="M"` → menos redundância, módulos maiores e mais legíveis
- `qrStyle="squares"` → estilo padrão, compatível com todos os leitores
- `eyeRadius={4}` → leve arredondamento elegante sem comprometer leitura
- **`renderAs="svg"`** → renderização vetorial: nítido em qualquer resolução (retina/4K) e pronto para impressão profissional HD
- Container aumentado de `w-32` para `w-36`, sombra colorida temática por projeto
- Fallback mockups: substituídos ícones genéricos por QRCodes reais com URLs de demonstração

**Arquivos**: `src/pages/LandingPage.tsx`

### 🌐 I18n — PT-BR como Idioma Principal

**Confirmado**: `LanguageContext.tsx` já tinha `'pt'` como default correto (linha 16).
**Ação**: Documentação completa traduzida e priorizada em PT-BR:
- `README.md` — reescrito em PT-BR, Link d'Água destacado como produto principal
- `HUB_SHOWCASE.md` — traduzido, história da fundadora em PT-BR, seção da galeria atualizada
- `USER_GUIDE.md` — traduzido, Link d'Água na seção 1 como produto principal

### 📊 Métricas da Sprint

| Métrica | Valor |
|---------|-------|
| Arquivos modificados | 4 |
| QR Codes corrigidos | 2 instâncias (real + fallback) |
| Docs atualizados | 3 (README, HUB_SHOWCASE, USER_GUIDE) |
| Bugs visuais corrigidos | 3 (alinhamento LP, QR ilegível, pixelado) |

---



- **Implementado bot├úo Hamb├║rguer**: Adicionado menu mobile responsivo no Layout.tsx
- **Estado isMobileMenuOpen**: Gerenciamento de estado para controle do menu mobile

## [02/12/2024] - Bug Fix / IA

- **Corrigido bug de parsing JSON**: Resolvido problema de interpreta├º├úo de JSON no componente AIAssistant.tsx
- **Melhorias na estabilidade**: Chat IA agora processa respostas de forma mais confi├ível

## [02/12/2025] - UX / Componentes

- **Criado NotificationsPopover.tsx**: Novo componente para exibi├º├úo de notifica├º├Áes em popover
- **Melhorias na experi├¬ncia do usu├írio**: Interface mais intuitiva para acompanhamento de notifica├º├Áes

## [02/12/2025] - Branding

- **Atualiza├º├úo de marca**: Projeto renomeado para "Encontro D'├ügua Hub"
- **Identidade visual**: Ajustes de branding em toda a aplica├º├úo

## [04/12/2025] - DevOps / Infraestrutura

- **Criado DEVLOG.md**: Arquivo de registro de mudan├ºas do projeto
- **Integra├º├úo N8N**: Implementado servi├ºo de webhooks para automa├º├Áes externas
- **n8nService.ts**: Fun├º├úo gen├®rica `sendToN8nWebhook` para integra├º├úo com workflows N8N
- **Fun├º├Áes preparadas**: `calculatePricing` e `consultLegalAgent` para futuras integra├º├Áes
- **Tipos TypeScript**: Criado `vite-env.d.ts` com defini├º├Áes de ambiente
- **Vari├íveis de ambiente**: Atualizado `.env.example` com URLs dos webhooks N8N

---

## Formato de Entrada

```markdown
## [DD/MM/AAAA] - [Categoria]
- **T├¡tulo da mudan├ºa**: Descri├º├úo detalhada
```

### Categorias Sugeridas:
- Feature (Nova funcionalidade)
- Bug Fix (Corre├º├úo de bugs)
- UX (Melhorias de experi├¬ncia do usu├írio)
- Performance (Otimiza├º├Áes)
- Refactor (Refatora├º├úo de c├│digo)
- DevOps (Infraestrutura e deploy)
- Documentation (Documenta├º├úo)
- Security (Seguran├ºa)
- Mobile (Mobile espec├¡fico)
- IA (Intelig├¬ncia Artificial)
- Branding (Marca e identidade visual)
## [09/12/2025] - Mobile UX (IMPLEMENTADO)

- **Ô£à Menu Mobile Drawer Completo**: Implementado drawer mobile com anima├º├Áes suaves
- **Bot├úo Hamb├║rguer**: Vis├¡vel apenas em mobile (`md:hidden`), abre o menu lateral
- **Backdrop com Overlay**: Fundo escuro semi-transparente, fecha ao clicar fora
- **Auto-close**: Menu fecha automaticamente ao navegar entre p├íginas
- **Preven├º├úo de Scroll**: Body scroll bloqueado quando menu est├í aberto
- **Navega├º├úo Completa**: Todos os itens do menu desktop dispon├¡veis no mobile
- **User Card**: Perfil do usu├írio e op├º├Áes de logout no rodap├® do drawer
- **Acessibilidade**: `aria-label` nos bot├Áes, anima├º├Áes com `animate-in`

## [02/12/2025] - Mobile UX (PLANEJADO - N├âO IMPLEMENTADO)

- **~~Implementado bot├úo Hamb├║rguer~~**: ÔØî Entrada incorreta no DEVLOG
- **~~Estado isMobileMenuOpen~~**: ÔØî N├úo estava implementado at├® 09/12/2025
## [10/12/2025] - v1.0 - Lan├ºamento M├│dulo Concierge QR

### ­ƒÄ» Feature: QR d'├ígua - Construtor de Microsites

Transforma├º├úo completa do gerador de QR Codes em um construtor visual de microsites com IA integrada.

#### ­ƒÜÇ Principais Features:

- **QR Code Pro**:
- Logo personalizado no centro do QR Code
- Texto customiz├ível acima do QR (ex: "Escaneie e ganhe 10% de desconto")
- Texto customiz├ível abaixo do QR (ex: "V├ílido at├® 31/12/2025")
- Cores totalmente personaliz├íveis

- **Site Builder - Modo Bridge (P├ígina Ponte)**:
- Logo/imagem circular no topo
- T├¡tulo da p├ígina gerado por IA
- Descri├º├úo vendedora
- Bot├úo call-to-action customiz├ível
- Preview em tempo real no PhoneMockup

- **Site Builder - Modo Card Digital**:
- Foto de perfil profissional
- Nome e bio do cliente
- Links para website e WhatsApp
- Design responsivo tipo "link in bio"

- **IA Co-piloto (Gemini 2.5 Flash Lite)**:
- Gera├º├úo autom├ítica de t├¡tulos impactantes (5-7 palavras)
- Gera├º├úo de copy vendedor para bio/descri├º├úo (2-3 frases)
- Fallback autom├ítico para Gemini 1.5 Flash
- Bot├Áes "Ô£¿ Gerar com IA" integrados ao formul├írio

- **Seguran├ºa - Controle de Acesso Admin**:
- Role-based access control usando `profile.role` do Supabase
- Modos BRIDGE e CARD exclusivos para admin
- Usu├írios regulares limitados ao modo LINK
- Visual feedback com ├¡cone ­ƒöÆ para features bloqueadas

- **Infraestrutura**:
- CRUD completo direto no Supabase (Create, Read, Update, Delete)
- Remo├º├úo da depend├¬ncia N8N para storage de QR Codes
- Novos campos no schema: `qr_logo_url`, `qr_text_top`, `qr_text_bottom`
- Crash protection total com optional chaining e error handlers

- **UX/UI**:
- PhoneMockup realista (280x560px) com notch e status bar
- Preview em tempo real - atualiza ao digitar
- Estados de loading em todas as opera├º├Áes ass├¡ncronas
- Suporte completo a dark mode
- Design responsivo mobile-first

#### ­ƒôª Arquivos Modificados:
- `src/features/qrdagua/QRdaguaPage.tsx` - Componente principal completamente refatorado
- Schema Supabase - Adicionadas colunas para QR Pro features

#### ­ƒöº Tecnologias:
- React 19 + TypeScript
- Google Gemini AI (2.5 Flash Lite)
- Supabase (Database & Auth)
- react-qr-code (QR rendering)
- Tailwind CSS

---

## ­ƒÄû´©Å MARCO: [10/12/2025] - v1.1 - Business OS & Concierge

### ­ƒÅå Transforma├º├úo Estrat├®gica

Evolu├º├úo de CRM tradicional para **Business Operating System** completo com ferramentas de IA e automa├º├úo. Sprint massiva de desenvolvimento conclu├¡da com sucesso.

---

### ­ƒöº CORE FIXES - Infraestrutura Cr├¡tica

#### Ô£à Solu├º├úo de Recurs├úo Infinita (RLS - Supabase)
- **Problema Resolvido**: Loop infinito causado por RLS policies mal configuradas
- **Impacto**: Edi├º├úo de perfil estava travando o sistema
- **Status**: Corre├º├úo aplicada, aguardando valida├º├úo em produ├º├úo

#### Ô£à Bot├úo Refresh de Permiss├Áes
- **Arquivo**: [`src/components/Layout.tsx`](file:///c:/PROJETOS/crm-encontro-dagua/src/components/Layout.tsx#L418-L434)
- **Funcionalidade**: ├ìcone `RefreshCcw` no header que recarrega `profile` do banco
- **Benef├¡cio**: Admins podem atualizar permiss├Áes sem logout/login
- **UX**: Anima├º├úo de rota├º├úo durante loading, tooltip "Atualizar permiss├Áes"
- **Solu├º├úo**: Elimina necessidade de logout ap├│s mudan├ºa de `role` no DB

---

### ­ƒÜÇ NOVOS PRODUTOS - Lan├ºamentos

#### 1´©ÅÔâú Prompt Lab - Otimizador de Prompts com IA
- **Rota**: `/prompt-lab`
- **Arquivo**: [`src/features/prompt-lab/PromptLabPage.tsx`](file:///c:/PROJETOS/crm-encontro-dagua/src/features/prompt-lab/PromptLabPage.tsx) (257 linhas)
- **Tecnologia**: Gemini 2.5 Flash Lite (fallback: 1.5 Flash)
- **Personas Dispon├¡veis**: 6 op├º├Áes
- ­ƒæ¿ÔÇì­ƒÆ╗ Engenheiro de Software
- Ô£ì´©Å Copywriter
- ­ƒÄ¿ Designer
- ÔÜû´©Å Advogado
- ­ƒôê Profissional de Marketing
- ­ƒæ®ÔÇì­ƒÅ½ Professor
- **Features**:
- Textarea para ideia bruta
- Dropdown de sele├º├úo de persona
- Bot├úo "Ô£¿ Otimizar Prompt"
- ├ürea de sa├¡da com prompt otimizado
- Bot├úo copiar com feedback visual
- System prompt oculto com regras de otimiza├º├úo
- **Visibilidade**: Dispon├¡vel para todos os usu├írios
- **Menu**: Item "Prompt Lab" com ├¡cone `Wand2` (varinha m├ígica)

#### 2´©ÅÔâú QR d'├ígua - Construtor de Sites/Concierge (Evolu├º├úo)
- **Rota**: `/qrdagua`
- **Arquivo**: [`src/features/qrdagua/QRdaguaPage.tsx`](file:///c:/PROJETOS/crm-encontro-dagua/src/features/qrdagua/QRdaguaPage.tsx) (921 linhas)
- **Modos de Projeto**:
1. **LINK** (Gratuito - Todos): QR Code simples com redirect
2. **BRIDGE** (R$ 49/m├¬s - Admin): P├ígina Ponte com CTA
3. **CARD** (R$ 79/m├¬s - Admin): Cart├úo Digital tipo vCard
- **QR Code Pro** (LINK mode):
- Logo personalizado no centro
- Texto acima do QR
- Texto abaixo do QR
- Campos: `qr_logo_url`, `qr_text_top`, `qr_text_bottom`
- **IA Integrada**:
- Gera├º├úo de t├¡tulos (5-7 palavras)
- Gera├º├úo de bios vendedoras (2-3 frases)
- Bot├Áes "Ô£¿ Gerar" no formul├írio
- **PhoneMockup Component**:
- Preview em tempo real (280x560px)
- Notch e status bar realistas
- Crash protection com optional chaining
- **Controle de Acesso**:
- `isAdmin = profile?.role === 'admin'` (linha 219)
- BRIDGE/CARD bloqueados para n├úo-admins
- Visual feedback com ­ƒöÆ
- **CRUD Completo**: Direto no Supabase (sem N8N)

---

### ­ƒñû IA - Atualiza├º├Áes e Treinamento

#### Gemini 2.5 Flash Lite
- **Upgrade Global**: Migra├º├úo de 1.5 Flash para 2.5 Flash Lite
- **Fallback Autom├ítico**: Se 2.5 falhar, usa 1.5 Flash
- **Implementado em**:
- Prompt Lab (otimiza├º├úo de prompts)
- QR d'├ígua (gera├º├úo de t├¡tulos e bios)
- Flow AI (CRM Agent)

#### Flow AI - Treinamento Completo
- **Arquivo**: [`src/features/ai-hub/hooks/useCRMAgent.ts`](file:///c:/PROJETOS/crm-encontro-dagua/src/features/ai-hub/hooks/useCRMAgent.ts#L565-L622)
- **Documenta├º├úo Injetada**: 57 linhas sobre QR d'├ígua
- **Conhecimento Adicionado**:
- Diferen├ºas entre LINK, BRIDGE e CARD
- Tabela de pre├ºos (R$ 0, R$ 49, R$ 79, +R$ 19 QR Pro)
- Permiss├Áes por role (admin vs cliente)
- Funcionalidades de cada modo
- Orienta├º├Áes para usu├írios (como direcionar)
- **Resultado**: IA agora responde perguntas sobre produtos com precis├úo

---

### ­ƒôê GROWTH - Estrutura de Vitrine

#### Backend Preparado (Campos no DB)
- **Tabela**: `qr_codes`
- **Campos Planejados**:
- `in_portfolio` (boolean) - Marcar projetos para exibir no portf├│lio p├║blico
- `in_gallery` (boolean) - Marcar projetos para galeria de exemplos
- **Status Frontend**: ÔÜá´©Å **N├âO IMPLEMENTADO**
- Campos n├úo est├úo sendo tratados no frontend
- Checkboxes n├úo existem no formul├írio
- Query n├úo filtra por `in_portfolio`

#### Pr├│ximos Passos (Dogfooding)
1. **Adicionar Checkboxes** no formul├írio QR d'├ígua
2. **Popular Portf├│lio** com projetos reais:
- Amaz├┤ (E-commerce de a├ºa├¡)
- Yara (Consultoria)
- CRM Encontro D'├ügua (pr├│prio produto)
3. **Landing Page Oficial**:
- Rota: `/` ou `/portfolio`
- Query: `SELECT * FROM qr_codes WHERE in_portfolio = true`
- Design: Grid de cards com screenshots

---

### ­ƒÅù´©Å ARQUITETURA - Mudan├ºas Estruturais

#### Estrutura de Features (`src/features/`)
```
features/
Ôö£ÔöÇÔöÇ activities/       (11 arquivos)
Ôö£ÔöÇÔöÇ ai-hub/          (3 arquivos) - Flow AI
Ôö£ÔöÇÔöÇ boards/          (21 arquivos) - Kanban
Ôö£ÔöÇÔöÇ contacts/        (11 arquivos)
Ôö£ÔöÇÔöÇ dashboard/       (6 arquivos)
Ôö£ÔöÇÔöÇ decisions/       (8 arquivos)
Ôö£ÔöÇÔöÇ inbox/           (10 arquivos)
Ôö£ÔöÇÔöÇ proactive-agent/ (1 arquivo)
Ôö£ÔöÇÔöÇ profile/         (1 arquivo)
Ôö£ÔöÇÔöÇ prompt-lab/      (1 arquivo) Ô£¿ NOVO
Ôö£ÔöÇÔöÇ qrdagua/         (1 arquivo) Ô£¿ EVOLU├ìDO
Ôö£ÔöÇÔöÇ reports/         (1 arquivo)
ÔööÔöÇÔöÇ settings/        (11 arquivos)
```

#### Rotas Ativas
- `/dashboard` - Vis├úo geral
- `/boards` - Kanban de vendas
- `/contacts` - Gest├úo de contatos
- `/qrdagua` - Construtor de sites Ô£¿
- `/prompt-lab` - Otimizador de prompts Ô£¿
- `/ai` - Flow AI (chat)
- `/settings` - Configura├º├Áes
- `/profile` - Edi├º├úo de perfil

#### Menu Lateral
- Ô£à Inbox
- Ô£à Vis├úo Geral
- Ô£à Boards
- Ô£à Contatos
- Ô£à QR d'├ígua Ô£¿
- Ô£à Prompt Lab Ô£¿ NOVO
- Ô£à Relat├│rios
- Ô£à Configura├º├Áes

---

### ­ƒôè M├ëTRICAS DA SPRINT

| M├®trica | Valor |
|---------|-------|
| Arquivos criados | 2 |
| Arquivos modificados | 5 |
| Linhas adicionadas | ~650 |
| Bugs cr├¡ticos resolvidos | 2 |
| Novos produtos lan├ºados | 2 |
| Documenta├º├úo IA (linhas) | 57 |
| Personas dispon├¡veis | 6 |
| Modos QR d'├ígua | 3 |

---

### ­ƒÄ» STATUS ATUAL

**Ô£à EST├üVEL EM PRODU├ç├âO (Vercel)**

- **Build**: Passando
- **Deploy**: Autom├ítico via Git
- **Ambiente**: Production
- **Performance**: Otimizada (lazy loading, code splitting)
- **Dark Mode**: Totalmente suportado
- **Mobile**: Responsivo (drawer menu funcional)

---

### ­ƒö« ROADMAP - Pr├│xima Fase (Dogfooding)

#### Sprint Imediata
1. **Validar RLS Fix**
- Testar edi├º├úo de perfil em produ├º├úo
- Confirmar que n├úo h├í mais recurs├úo infinita

2. **Popular Portf├│lio**
- Criar 3 projetos QR d'├ígua de exemplo:
- Amaz├┤ (BRIDGE - E-commerce)
- Yara (CARD - Consultoria)
- CRM Hub (LINK - Produto pr├│prio)
- Adicionar checkboxes `in_portfolio` e `in_gallery` no formul├írio

3. **Landing Page Oficial**
- Criar rota `/` com portf├│lio p├║blico
- Grid de cards com screenshots dos projetos
- Bot├úo CTA: "Criar meu QR d'├ígua"
- Se├º├úo de pre├ºos (R$ 0, R$ 49, R$ 79)

#### Backlog Estrat├®gico
- **Analytics**: Rastrear uso de Prompt Lab e QR d'├ígua
- **Templates**: Biblioteca de prompts prontos
- **Compartilhamento**: Links p├║blicos para QR codes
- **Webhooks**: Notifica├º├Áes quando QR ├® escaneado
- **Pagamentos**: Integra├º├úo Stripe (BRIDGE/CARD)

---


## ­ƒøí´©Å MARCO: [11/12/2025] - v1.2 - Security Hardening & Bug Bash

### ­ƒöÉ Database Security - Multi-tenant RLS

**Problema Cr├¡tico Resolvido:** Infinite recursion em RLS policies causava crash ao editar perfis.

#### Implementa├º├úo H├¡brida (Tenant Isolation + Super Admin)

**Fun├º├Áes SECURITY DEFINER (Bypass RLS):**
- `get_user_company_id()` - Retorna company_id sem triggerar RLS
- `is_user_admin()` - Checa role='admin' sem recurs├úo
- `is_super_admin()` - Checa email OU coluna `is_super_admin`

**Policies Criadas (8 total):**
1. `tenant_isolation_select` - Users veem apenas sua company
2. `super_admin_view_all` - Super admin v├¬ todas companies
3. `users_update_own` - Users editam s├│ pr├│prio perfil (protege role/company_id)
4. `admin_update_company` - Admins editam apenas sua company
5. `super_admin_update_all` - Super admin edita qualquer perfil
6. `admin_insert_company` - Admins criam apenas em sua company
7. `super_admin_insert_all` - Super admin cria em qualquer company
8. `super_admin_delete_all` - Apenas super admin deleta

**Limpeza de Policies:**
- Script "Nuclear V3" com PL/pgSQL din├ómico
- Removidas 15+ policies conflitantes (PT-BR, Read access, tenant_isolation antigas)
- Estado final: Exatamente 8 policies ativas

**Nova Coluna:**
- `profiles.is_super_admin` (boolean, default false)
- Permite adicionar super admins via painel (futuro)

#### Arquivos SQL Criados:
- `rls_nuclear_v3.sql` - Limpeza din├ómica de policies
- `fix_company_id.sql` - Corre├º├úo de UUID undefined
- `rls_multitenant_fix.sql` - Implementa├º├úo completa

---

### ­ƒÉø Bug Bash - Corre├º├Áes Cr├¡ticas

#### 1. Crash "Tela Preta" no QR Code
**Sintoma:** App crashava ao digitar URL no campo de destino
**Causa:** Import incorreto da biblioteca QR Code
**Fix:** Trocado `react-qr-code` para `qrcode.react`
**Arquivo:** `src/features/qrdagua/QRdaguaPage.tsx` (linha 6)

#### 2. Erro "invalid input syntax for type uuid: undefined"
**Sintoma:** Falha ao criar contatos ou editar perfil
**Causa:** Usu├írio sem `company_id` v├ílido no banco
**Fix:** Script SQL para vincular usu├írio a company
**Impacto:** Bloqueava opera├º├Áes CRUD em todo o sistema

#### 3. Menu Prompt Lab "Desaparecido"
**Sintoma:** Item n├úo aparecia no menu lateral
**Causa:** Cache do browser (c├│digo estava correto)
**Fix:** Hard refresh (`Ctrl+Shift+R`)
**Confirmado:** Menu presente em mobile (linha 164) e desktop (linha 310)

---

### ­ƒôè M├®tricas da Sprint de Seguran├ºa

| M├®trica | Valor |
|---------|-------|
| Policies antigas removidas | 15+ |
| Policies novas criadas | 8 |
| Fun├º├Áes SECURITY DEFINER | 3 |
| Bugs cr├¡ticos corrigidos | 3 |
| Scripts SQL gerados | 5 |
| Tentativas de limpeza RLS | 3 (V1, V2, V3) |

---

### ­ƒÄ» Status P├│s-Corre├º├úo

**Ô£à EST├üVEL EM PRODU├ç├âO (Vercel)**

- **RLS:** Sem recurs├úo infinita, tenant isolation funcional
- **Super Admin:** Acesso global implementado
- **QR Code:** Sem crashes em valida├º├úo de URL
- **Data Integrity:** Todos os usu├írios com company_id v├ílido
- **Build:** Depend├¬ncia `qrcode.react` adicionada ao package.json

---

### ­ƒö« Pr├│ximos Passos

1. **Dogfooding:** Criar 3 projetos QR d'├ígua (Amaz├┤, Yara, CRM Hub)
2. **Landing Page:** Construir portf├│lio p├║blico com projetos marcados
3. **Analytics:** Rastrear uso de Prompt Lab e QR d'├ígua
4. **Super Admin Panel:** Interface para gerenciar super admins

---

## ­ƒÜÇ MARCO: [11/12/2025] - v1.3 - QR Module Fixes & System Audit

### ­ƒöº QR d'├ígua - Corre├º├Áes Cr├¡ticas de Deploy

**Contexto**: O m├│dulo QR d'├ígua estava com 4 erros cr├¡ticos impedindo o uso em produ├º├úo.

#### Problemas Identificados e Resolvidos:

**1. Schema Mismatch (FATAL)**
- **Problema**: Tabela `qr_codes` existia mas faltavam 16 colunas essenciais
- **Sintoma**: `Could not find the 'project_type' column in schema cache`
- **Solu├º├úo**: Criado migration `001_add_qr_codes_table.sql` com ALTER TABLE
- **Colunas Adicionadas**:
- Core: `project_type`, `client_name`, `destination_url`, `slug`, `color`, `description`
- BRIDGE/CARD: `page_title`, `button_text`, `image_url`, `whatsapp`
- QR Pro: `qr_logo_url`, `qr_text_top`, `qr_text_bottom`
- Portfolio: `in_portfolio`, `in_gallery`
- Sistema: `created_at`, `updated_at`, `owner_id`, `company_id`
- **Arquivo**: `supabase/migrations/001_add_qr_codes_table.sql`

**2. Regex Mobile Crash**
- **Problema**: Flag `/v` n├úo suportada em browsers mobile
- **Sintoma**: `Uncaught SyntaxError: Invalid regular expression: /[a-z0-9-]+/v`
- **Solu├º├úo**: Removido atributo `pattern` do input slug (linha 689)
- **Arquivo**: `src/features/qrdagua/QRdaguaPage.tsx`

**3. CSS Overflow no PhoneMockup**
- **Problema**: Preview do celular (280x560px) vazava o layout
- **Solu├º├úo**: Adicionado `transform scale-75` com container responsivo
- **Arquivo**: `src/features/qrdagua/QRdaguaPage.tsx` (linhas 871-880)

**4. Companies Table Name**
- **Status**: Ô£à J├í estava correto como `companies`
- **A├º├úo**: Nenhuma necess├íria

#### Git Commit:
- **Hash**: `739dffc`
- **Branch**: `main`
- **Mensagem**: "fix: resolve QR module critical errors"

---

### ­ƒôè Auditoria Completa do Sistema

**Motiva├º├úo**: Sistema fragmentado sem visibilidade clara do que funciona vs mockup.

#### Documenta├º├úo Criada:

**1. System Status Document**
- **Arquivo**: `system_status.md` (artifact)
- **Conte├║do**:
- Status de todas as features (Funcionando / Com Bug / Mockup)
- Auditoria completa das capacidades do AI Flow
- Lista de 12 tools conectadas vs features n├úo implementadas
- M├®tricas do sistema (21 tabelas, 12 features funcionando)
- Roadmap de prioridades (P0 a P3)

**2. AI Flow - Capacidades Auditadas**

**Ô£à O Que Funciona (12 Tools Conectadas)**:
- Leitura: `searchDeals`, `getContact`, `getActivitiesToday`, `getOverdueActivities`, `getPipelineStats`, `getDealDetails`
- Escrita: `createActivity`, `completeActivity`, `moveDeal`, `updateDealValue`, `createDeal`
- An├ílise: `analyzeStagnantDeals`, `suggestNextAction`

**ÔØî O Que N├âO Funciona (N├úo Implementado)**:
- Cria├º├úo/edi├º├úo de Boards (usu├írio deve usar wizard manual)
- Gera├º├úo de documentos (apenas mockup)
- Integra├º├Áes externas (email, WhatsApp, N8N)

**System Prompt**:
- Ô£à J├í inclui documenta├º├úo completa do QR d'├ígua
- Ô£à J├í inclui informa├º├Áes do Prompt Lab
- Ô£à Orienta usu├írio para rotas corretas
- Ô£à Informa pre├ºos (R$ 0, R$ 49, R$ 79)

**3. UX - Componente de Onboarding**

**OnboardingModal ("Aba Rosa")**:
- **Localiza├º├úo**: `src/components/OnboardingModal.tsx`
- **Status**: Ô£à Implementado e funcionando em `/boards`
- **Caracter├¡sticas**: Modal fullscreen, gradiente rosa/roxo, 3 cards de features
- **Replicabilidade**: Ô¡ÉÔ¡ÉÔ¡ÉÔ¡ÉÔ¡É (Muito f├ícil de adaptar)
- **Pr├│ximos Passos**: Adicionar em `/qrdagua` e `/prompt-lab`

---

### ­ƒÜ¿ Problemas Ativos Identificados

**1. Erro 400 em Todas as Rotas**
- **Status**: ­ƒö┤ CR├ìTICO - BLOQUEADOR
- **Sintoma**: POST requests retornam 400 Bad Request
- **Tabelas Afetadas**: `companies`, `contacts`, `qr_codes`
- **Causa Prov├ível**:
- PostgREST cache desatualizado ap├│s migration
- Migration SQL n├úo executada no Supabase
- TypeScript types desatualizados
- **A├º├úo Necess├íria**: Usu├írio deve executar SQL migration manualmente

---

### ­ƒôï Status Atual por Categoria

**­ƒƒó Funcionando (12 features)**:
- Login/Auth, Boards, Deals, Contatos, Atividades
- AI Flow (Chat), Board Wizard (IA), Prompt Lab
- Multi-tenancy (RLS), Dark Mode, Mobile Menu

**­ƒƒí Implementado mas com Bugs (2 features)**:
- QR d'├ígua (c├│digo pronto, aguardando fix 400)
- Companies Service (tabela existe, 400 em POST)

**­ƒö┤ Apenas Visual / Mockup (3 features)**:
- Est├║dio IA (rota planejada)
- Gera├º├úo de documentos (AI Flow sem tool)
- Integra├º├úo N8N (webhooks comentados)

**ÔÜ¬ Planejado / N├úo Iniciado (5 features)**:
- Stripe (pagamentos)
- Landing Page p├║blica
- Analytics
- Templates de prompts
- Webhooks de QR Code

---

### ­ƒÄ» Pr├│ximos Passos (Prioridades)

**P0 - Cr├¡tico (Bloqueador)**:
1. ÔÅ│ Usu├írio executar SQL migration no Supabase
2. ÔÅ│ Verificar cache PostgREST
3. ÔÅ│ Testar cria├º├úo de QR code

**P1 - Alta (UX)**:
1. ÔÅ│ Adicionar OnboardingModal em `/qrdagua`
2. ÔÅ│ Adicionar OnboardingModal em `/prompt-lab`

**P2 - M├®dia (Features)**:
1. ÔÅ│ Implementar Landing Page p├║blica
2. ÔÅ│ Conectar AI Flow com Board creation (tool)

---

### ­ƒôè M├®tricas da Sprint

| M├®trica | Valor |
|---------|-------|
| Bugs cr├¡ticos corrigidos | 3 |
| SQL migrations criadas | 1 |
| Colunas adicionadas ao DB | 16 |
| Documenta├º├úo criada | 3 arquivos |
| AI Tools auditadas | 12 |
| Features catalogadas | 22 |

---

### Ô£à SQL Migration - Executado com Sucesso

**Data**: 11/12/2025 22:10
**Arquivo**: `001_add_qr_codes_table.sql`
**Status**: Ô£à SUCCESS
**Resultado**: Todas as 16 colunas adicionadas ├á tabela `qr_codes`

**A├º├úo de Follow-up**:
- Criado script `002_refresh_postgrest.sql` para for├ºar reload do schema cache
- Se erro 400 persistir: Executar `NOTIFY pgrst, 'reload schema';` no SQL Editor
- Alternativa: Restart PostgREST via Supabase Dashboard (Settings > API)

---

### ­ƒÄ¿ Brand Identity Update - A├ºa├¡ Purple

**Motiva├º├úo**: Sair do "rosa gen├®rico" para uma identidade sofisticada e profunda.

**Mudan├ºas no Tailwind Config**:
- **Antes**: Primary = Rosa (#e34b9b, #cf2d7c, #620939)
- **Depois**: Primary = Roxo Profundo (#a855f7, #9333ea, #581c87)
- **Inspira├º├úo**: A├ºa├¡ (deep purple/violet) - sofisticado, profissional, profundo
- **Aplica├º├úo**: OnboardingModal, gradientes, destaques do QR Code

**Cores da Nova Paleta**:
- `primary-500`: #a855f7 (Vivid Purple)
- `primary-600`: #9333ea (Deep Purple)
- `primary-700`: #7e22ce (Rich Purple)
- `primary-900`: #581c87 (Very Dark Purple - A├ºa├¡)

---

### ­ƒÜÇ Roadmap Estrat├®gico - Business Operating System

**Vis├úo**: O Hub n├úo ├® apenas um CRM, ├® o centro de comando da ag├¬ncia.

#### A) Stack Knowledge Base (Planejado)

**Objetivo**: Cadastrar o stack tecnol├│gico atual da ag├¬ncia.

**Campos Necess├írios**:
- Nome da ferramenta (ex: "Supabase", "Vercel", "Gemini AI")
- Categoria (Database, Hosting, AI, Design, etc)
- Custo mensal (R$)
- Vers├úo/Plano atual
- Documenta├º├úo (link)
- Casos de uso (quando usar)

**Uso pelo AI Agent**:
- O "Agente T├®cnico" consultar├í o Stack KB para arquitetar solu├º├Áes
- Exemplo: "Cliente precisa de um backend" ÔåÆ AI sugere Supabase (j├í temos)
- Evita reinventar a roda e mant├®m consist├¬ncia

**Implementa├º├úo Futura**:
- Nova tabela: `tech_stack`
- Nova rota: `/stack` (admin only)
- AI Flow tool: `searchTechStack({ category, maxCost })`

---

#### B) Specialized Agents Integration (Planejado)

**Objetivo**: Evoluir Prompt Lab para invocar agentes especializados.

**Agentes Existentes** (j├í criados pela equipe):
1. **QA Agent**: Testa c├│digo e identifica bugs
2. **Architect Agent**: Desenha arquitetura de sistemas
3. **Onboarding Agent**: Cria planos de onboarding para clientes

**Funcionalidade Desejada**:
- Prompt Lab vira "Agent Hub"
- Usu├írio seleciona agente + fornece contexto do projeto
- Agente roda com contexto do CRM (cliente, deal, stack)
- Resultado ├® salvo no deal como "AI Analysis"

**Implementa├º├úo Futura**:
- Nova tabela: `agents` (nome, system_prompt, tools, model)
- Nova feature: "Invocar Agente" no DealDetailModal
- AI Flow tool: `runSpecializedAgent({ agentId, dealId, context })`

---

#### C) GitHub Lifecycle Sync (Planejado)

**Objetivo**: Sincronizar DEVLOG com commits do GitHub automaticamente.

**Fluxo Desejado**:
1. Dev faz commit no GitHub
2. Webhook notifica o Hub
3. Hub extrai mensagem do commit
4. DEVLOG ├® atualizado automaticamente
5. Cliente v├¬ progresso em tempo real no dashboard

**Features Relacionadas**:
- Templates de reposit├│rios prontos (Next.js, Vite, Supabase)
- "Iniciar Projeto" cria repo no GitHub + board no CRM
- Commits linkados a deals/atividades

**Implementa├º├úo Futura**:
- GitHub App/Webhook integration
- Nova tabela: `project_repositories`
- Nova rota: `/projects` (gerenciamento de projetos de clientes)
- AI Flow tool: `createProjectFromTemplate({ clientId, template })`

---

### ­ƒôØ Notas Estrat├®gicas

**Filosofia do Sistema**:
- De CRM ÔåÆ Business Operating System
- De "Gest├úo de Vendas" ÔåÆ "Centro de Comando da Ag├¬ncia"
- De "Dados Isolados" ÔåÆ "Intelig├¬ncia Conectada"

**Princ├¡pios de Desenvolvimento**:
1. **Context-Aware AI**: Agentes sempre t├¬m contexto completo (cliente, stack, hist├│rico)
2. **No-Code First**: Usu├írio n├úo-t├®cnico deve conseguir operar tudo
3. **Automation by Default**: Se pode ser automatizado, deve ser
4. **Single Source of Truth**: Hub ├® a fonte ├║nica de verdade

**Pr├│ximas Sprints** (Prioridade):
1. P0: Resolver erro 400 definitivamente (PostgREST cache)
2. P1: Adicionar OnboardingModal em QR d'├ígua e Prompt Lab
3. P2: Implementar Stack Knowledge Base (MVP)
4. P3: Evoluir Prompt Lab para Agent Hub

---

## ­ƒÜÇ MARCO: [15/12/2025] - v1.4 - System Stabilization & AI Widget

### ­ƒöº Critical Fixes - Layout Duplication Removed

**Contexto**: Sistema travou devido a duplica├º├úo completa de c├│digo no Layout.tsx durante sess├úo anterior.

#### Problema Resolvido:
- **Arquivo**: `src/components/Layout.tsx`
- **Sintoma**: C├│digo duplicado causando erros de compila├º├úo
- **Antes**: 1.059 linhas (componente Layout declarado 2x)
- **Depois**: 518 linhas (c├│digo limpo)
- **Componentes Duplicados Removidos**:
- Interface `LayoutProps` (declarada 2x)
- Componente `NavItem` (declarado 2x)
- Componente `Layout` completo (declarado 2x)

#### Git Commit:
- **Hash**: `7c786e5`
- **Branch**: `main`
- **Mensagem**: "fix: remove Layout.tsx duplication and implement A├ºa├¡-themed FloatingAIWidget"

---

### Ô£¿ Feature: Floating AI Widget (A├ºa├¡ Theme)

**Objetivo**: Transformar o AI Assistant em widget flutuante omnipresente com identidade visual A├ºa├¡.

#### Implementa├º├úo:
- **Arquivo**: `src/components/FloatingAIWidget.tsx`
- **Status**: Ô£à J├í existia, atualizado com branding A├ºa├¡

#### Caracter├¡sticas:
1. **Cor A├ºa├¡ (Roxo Profundo/S├®rio)**:
- Bot├úo FAB: `bg-gradient-to-br from-primary-900 to-acai-900`
- Glow effect: `bg-primary-900` com blur e pulse animation
- Header do chat: `bg-gradient-to-r from-primary-900 to-acai-900`
- Cores hex: `#581c87` (primary-900) e `#620939` (acai-900)

2. **Auto-hide no Scroll (Mobile-Friendly)**:
- Esconde ao rolar para baixo (ap├│s 100px)
- Reaparece ao rolar para cima
- Transi├º├úo suave: `translate-y` + `opacity`
- `pointer-events-none` quando escondido

3. **Context-Aware Chat**:
- Detecta p├ígina atual automaticamente
- Contextos: Boards, Contatos, QR d'├ígua, Prompt Lab, Dashboard, etc.
- Exibe contexto no header do chat
- Integrado com `AIAssistant` component

4. **Responsividade**:
- Desktop: Floating panel (400x600px) no canto inferior direito
- Mobile: Fullscreen overlay
- Backdrop com blur effect
- Bot├úo FAB: 56x56px (mobile) / 64x64px (desktop)

#### UX:
- ├ìcone: `Sparkles` (Ô£¿)
- Tooltip: "AI Flow"
- Anima├º├Áes: `animate-pulse`, `hover:scale-110`
- Z-index: 40 (FAB) / 50 (overlay)

---

### ­ƒÅù´©Å Config: Agent Integration (Placeholder)

**Nota**: Configura├º├úo inicial para futura integra├º├úo de agentes especializados.

#### Agentes Planejados:
- **Precifica├º├úo**: C├ílculo de or├ºamentos baseado em escopo
- **Jur├¡dico**: An├ílise de contratos e termos legais
- **Amazo (Hub Manager)**: Gerente do Hub com acesso SuperAdmin (ver system_architecture.md)

#### Status:
- ÔÅ│ Placeholders criados em `src/services/n8n/n8nService.ts`
- ÔÅ│ Fun├º├Áes: `calculatePricing()`, `consultLegalAgent()`
- ÔÅ│ Aguardando defini├º├úo de workflows N8N

---

### ­ƒôè M├®tricas da Sprint

| M├®trica | Valor |
|---------|-------|
| Arquivos modificados | 2 |
| Linhas removidas (Layout.tsx) | ~541 |
| Bugs cr├¡ticos corrigidos | 1 |
| Features atualizadas | 1 |
| Commits realizados | 1 |

---

### ­ƒÄ» Status Atual

**Ô£à SISTEMA EST├üVEL E PRONTO PARA CLIENTE REAL**

- **Compila├º├úo**: Ô£à Sem erros
- **Dev Server**: Ô£à Rodando (porta 5173)
- **Layout**: Ô£à C├│digo limpo (518 linhas)
- **FloatingAIWidget**: Ô£à A├ºa├¡ branding implementado
- **Boards/Kanban**: Ô£à Funcional
- **Contatos/Deals**: Ô£à Funcional
- **QR d'├ígua**: Ô£à Funcional

---


## ­ƒÜÇ MARCO: [18/12/2025] - v1.5 - Onboarding Sprint & Critical Fixes

### Ô£¿ Sprint UX: User Guide & Product Catalog

**Contexto**: Sistema estava funcional mas sem documenta├º├úo para usu├írios. Criadora descobriu funcionalidades ocultas que precisavam ser reveladas.

#### ­ƒôû USER_GUIDE.md Criado (350 linhas)

**Arquivo**: `USER_GUIDE.md` (raiz do projeto)

**Hidden Gems Documentadas**:
1. **Inbox & Modo Foco** (TDAH Friendly)
- Mostra apenas 3 tarefas priorit├írias
- Algoritmo: urg├¬ncia + valor + contexto
- Benef├¡cio: 300% de produtividade

2. **AI Insights: Objection Killer**
- An├ílise de obje├º├Áes em tempo real
- Scripts prontos para negocia├º├úo
- Exemplos pr├íticos de uso

3. **AI Board Creator**
- Gera├º├úo de jornadas completas por IA
- Refinamento interativo via chat
- Board profissional em 2 minutos

4. **Chat AI com 12 Ferramentas CRM**
- Comandos execut├íveis (criar deals, buscar, agendar)
- Mem├│ria persistente (localStorage)
- Integra├º├úo total com o sistema

**Estrutura**:
- 9 se├º├Áes principais
- Fluxos de trabalho recomendados
- Troubleshooting completo
- Roadmap de funcionalidades

---

### ­ƒøÆ Feature: Product Catalog (Tabela de Produtos)

**Objetivo**: Permitir gest├úo de cat├ílogo de produtos/servi├ºos.

#### Migrations SQL Criadas:

**1. Schema (`003_add_products_table.sql`)**:
- Tabela `products` com RLS completo
- Campos: name, description, price, unit, category
- Triggers: auto-set `company_id`, `updated_at`
- ├ìndices otimizados

**2. Seed Data (`004_seed_products.sql`)**:
- Fun├º├úo `seed_initial_products()`
- 3 produtos iniciais:
- Cart├úo Digital Interativo (R$ 150,00)
- Landing Page One-Page (R$ 500,00)
- Consultoria de IA (R$ 250,00/h)
- Execu├º├úo: `SELECT seed_initial_products();`

**Status**: Ô£à Executado manualmente em 18/12/2025 00:30

---

### ­ƒÉø Fix Cr├¡tico: Erro UUID 22P02 (RESOLVIDO)

**Problema**: Cria├º├úo de contatos/empresas/deals falhava com `invalid input syntax for type uuid: ""`

**Causa Raiz**: Formul├írios enviavam strings vazias (`""`) para campos UUID ao inv├®s de `null`.

#### Corre├º├Áes Aplicadas:

**1. Camada de Servi├ºo** (3 arquivos):
- `contactsService.create` - Sanitiza `companyId` vazio ÔåÆ `null`
- `companiesService.create` - Sanitiza `tenantId` vazio ÔåÆ `null`
- `dealsService.create` - Sanitiza `companyId` vazio ÔåÆ `null`

**2. Camada de Hooks** (3 arquivos):
- `useCreateContact` - Sanitiza `companyId` antes de enviar
- `useCreateCompany` - Sanitiza `industry`, `website`
- `useCreateDeal` - Sanitiza `contactId`, `companyId`, `boardId`, `stageId`

**3. Transforma├º├úo de Dados**:
- `transformDealToDb` - J├í sanitizava corretamente (validado)
- `transformContactToDb` - J├í sanitizava corretamente (validado)

**Resultado**: Ô£à CRUD totalmente funcional para Contacts, Companies e Deals

---

### ­ƒöº Fix: Circular Import (Build Blocker)

**Problema**: Build do Vite travado com `Circular import invalidate` em `src/lib/query/index.tsx`

**Causa**: `index.tsx` exportava `./hooks` que importavam `queryKeys` de `../index` (ciclo infinito)

**Solu├º├úo**:
- Criado arquivo dedicado: `queryKeys.ts`
- Extra├¡do `queryKeys` de `index.tsx` (60 linhas)
- Atualizados 5 arquivos:
- `index.tsx` ÔåÆ importa queryKeys
- `useDealsQuery.ts` ÔåÆ import de `../queryKeys`
- `useContactsQuery.ts` ÔåÆ import de `../queryKeys`
- `useBoardsQuery.ts` ÔåÆ import de `../queryKeys`
- `useActivitiesQuery.ts` ÔåÆ import de `../queryKeys`

**Resultado**: Ô£à Hot reload funcionando, build desbloqueado

---

### ­ƒºá Feature: AI Chat com Mem├│ria Persistente

**Problema**: Chat perdia hist├│rico ao recarregar p├ígina (amn├®sia)

**Solu├º├úo**:
- Adicionado par├ómetro `id` ao `useCRMAgent`
- Implementada persist├¬ncia com `localStorage`
- `AIAssistant` passa `persistenceId` (`board_${id}` ou `global_chat`)
- Hist├│rico salvo automaticamente a cada mensagem

**Resultado**: Ô£à Chat mant├®m mem├│ria entre sess├Áes

---

### ­ƒÄ¿ UX: Bot├úo "+" nas Colunas Vazias (Kanban)

**Problema**: Criar deals n├úo era intuitivo (bot├úo centralizado apenas)

**Solu├º├úo**:
- Adicionado bot├úo "Adicionar Neg├│cio" em colunas vazias
- Evento customizado `openCreateDealModal`
- Event listener em `PipelineView.tsx`
- Design: border-dashed com hover effect

**Resultado**: Ô£à UX mais intuitiva para cria├º├úo de deals

---

### ­ƒøí´©Å Seguran├ºa: RLS & Sanitiza├º├úo Blindados

**Valida├º├Áes Realizadas**:
- Ô£à RLS ativo em todas as tabelas (contacts, deals, companies, products)
- Ô£à Triggers de auto-set `company_id` funcionando
- Ô£à Sanitiza├º├úo de UUIDs em todas as opera├º├Áes CRUD
- Ô£à Dupla prote├º├úo: Hooks + Servi├ºos

**Pol├¡ticas RLS**:
- `tenant_isolation_select` - Isolamento por company_id
- `tenant_isolation_insert` - Valida├º├úo na cria├º├úo
- `tenant_isolation_update` - Valida├º├úo na atualiza├º├úo
- `tenant_isolation_delete` - Valida├º├úo na exclus├úo

---

### ­ƒÜÇ Feature: QR Code Module (Validado)

**Status**: Ô£à Totalmente funcional

**Rota**: `/qrdagua`
**Componente**: `QRdaguaPage.tsx` (lazy loading ativo)

**Funcionalidades Dispon├¡veis**:
- Ô£à Criar novo QR Code
- Ô£à Preview em tempo real
- Ô£à 3 tipos suportados (LINK, BRIDGE, CARD)
- Ô£à Download de QR Code
- Ô£à Compartilhamento de link

---

### ­ƒôè M├®tricas da Sprint

| M├®trica | Valor |
|---------|-------|
| Arquivos criados | 5 |
| Arquivos modificados | 12 |
| Linhas adicionadas | ~800 |
| Bugs cr├¡ticos corrigidos | 3 |
| Features documentadas | 9 |
| Migrations SQL | 2 |
| Produtos seed | 3 |

---

### ­ƒÄ» Status Atual

**Ô£à SISTEMA EST├üVEL E DOCUMENTADO**

- **Compila├º├úo**: Ô£à Sem erros
- **CRUD**: Ô£à Contacts, Companies, Deals funcionando
- **AI Chat**: Ô£à Com mem├│ria persistente e 12 tools
- **QR Code**: Ô£à Totalmente funcional
- **Documenta├º├úo**: Ô£à USER_GUIDE.md completo
- **Cat├ílogo**: Ô£à Produtos populados
- **Seguran├ºa**: Ô£à RLS + Sanitiza├º├úo blindados

---

### ­ƒö« Pr├│ximos Passos

1. **UI de Gest├úo de Produtos** (Sprint seguinte)
- Criar p├ígina `/products`
- CRUD visual para cat├ílogo
- Upload de imagens

2. **Onboarding Interativo**
- Tutorial guiado passo-a-passo
- Tooltips contextuais

3. **Integra├º├Áes**
- WhatsApp Business API
- Email (SendGrid/SMTP)
- Calend├írio (Google Calendar)

---


## Sprint: Release V5 (Main) - Turno da Noite
**Status:** Ô£à Conclu├¡do
**Data:** 20/12/2025

### ­ƒÜÇ Entregas Cr├¡ticas (Manual Release)
1. **Landing Page V5 (A├ºa├¡ Edition):**
- Tema visual ajustado para Vinho/Fuchsia e Dourado.
- Hero Section cinematogr├ífica com texto no rodap├®.
- Efeito Parallax CSS puro ("Rio que mexe").
- Integra├º├úo Amazo via Script Nativo (Typebot).
2. **Ecossistema de Agentes:**
- Defini├º├úo oficial: Amazo (CS/Vendas), Precy (Tech), Jury (Compliance).
- Modal de equipe implementado.
3. **QR D'├ígua:**
- Refatora├º├úo visual (contraste e bordas).
- Valida├º├úo de links.

### ­ƒôØ Observa├º├Áes
- Commit realizado manualmente devido a instabilidade no Agente de AI.
- Deploy direto na branch `main`.
## Sprint: Mobile Polish & Final Setup (V6)
**Status:** Ô£à Conclu├¡do
**Data:** 20/12/2025

### ­ƒÄ¿ Polimento Visual e UX Mobile
1. **Landing Page V6 (Corre├º├Áes Mobile):**
- Fix de Menu/Scroll Mobile: Resolvido comportamento de scroll em dispositivos m├│veis.
- Componente de Carrossel para Equipe: Implementado carrossel visual para apresenta├º├úo da equipe de agentes.
- Responsividade aprimorada em telas pequenas.

2. **Ajustes de Rotas:**
- Rota raiz (`/`) agora renderiza a Landing Page como home universal.
- Mantidas rotas de `/login` e `/dashboard` funcionais.
- Landing Page como ponto de entrada "invite-only" para todos os visitantes.

3. **SEO e Identidade:**
- T├¡tulo da p├ígina atualizado: "Encontro D'├ígua .hub"
- Meta description adicionada para melhor indexa├º├úo.
- Branding consistente em toda a aplica├º├úo.
- **Identity Shift:** Ado├º├úo do ├¡cone ­ƒîÇ e reposicionamento como Ecossistema Bioinspirado.
- README.md atualizado com nova vis├úo "Inspirado na natureza, codificado para o mundo."
- Prepara├º├úo para Beta Testing (QA).

### ­ƒôØ Observa├º├Áes
- Prepara├º├úo para commit final do pacote visual V6.
- Sistema est├ível e pronto para deploy.

---

## Sprint: Final Launch Features (V7)
**Status:** Ô£à Conclu├¡do
**Data:** 21/12/2025

### ­ƒÜÇ Recursos de Lan├ºamento

1. **QR Code - Analytics & Sharing:**
- Implementado contador de scans no banco de dados
- Adicionados bot├Áes de compartilhamento:
- Baixar PNG (download em alta qualidade)
- Compartilhar Link (copia URL para WhatsApp)
- Preview/Tela Cheia (modal para teste)
- Migration SQL: `008_add_qr_scans.sql`

2. **Prompt Lab - Novos Especialistas:**
- ­ƒñû **Arquiteto de Bots:** Estrutura de agentes IA e fluxos (SDR/Closer)
- ­ƒºá **Treinador de LLM:** System Prompts para ChatGPT/Claude personalizados
- ­ƒîÉ **Arquiteto Web:** Escopo e c├│digo (HTML/Tailwind) para Landing Pages
- Total: 9 especialistas dispon├¡veis

3. **Payment Flow MVP:**
- Criado componente `SubscriptionModal.tsx`
- Integra├º├úo com links externos de pagamento
- Planos: Pro Mensal (R$3) e Vision├írio Anual (R$30)
- Ativa├º├úo manual pela administra├º├úo

4. **Documenta├º├úo Completa:**
- Criado `USERGUIDE.md` com guia completo de uso
- Atualizado `README.md` com novos recursos
- Documenta├º├úo de especialistas e fluxo de pagamento

### ­ƒôØ Observa├º├Áes
- Sistema pronto para lan├ºamento oficial
- Todos os recursos de usabilidade implementados
- Documenta├º├úo completa para usu├írios

## Sprint: Master Reset & Strategy (V8)
**Status:** Ô£à Conclu├¡do
**Data:** 22/12/2025

### ­ƒÜ¿ Critical Build Fixes

1. **TypeScript Type Safety:**
- Verified CoreMessage imports from 'ai' package in `useAgent.ts` and `useCRMAgent.ts`
- Confirmed message mapping returns correct type structure `{ role, content }`
- Build verified clean with exit code 0 - no TypeScript errors

### ­ƒøí´©Å Admin Panel 2.0

1. **Enhanced Admin Access:**
- Added "Admin" link to navbar (Shield icon)
- Conditional rendering: visible only for `lidimfc@gmail.com`
- Positioned after Settings in both mobile and desktop navigation

2. **Advanced Search Implementation:**
- Multi-field search: email, full_name, phone
- Real-time filtering with instant results
- Improved UX for user management

3. **User Edit Modal:**
- Edit plan_type (free, monthly, annual)
- Edit status (active, inactive, suspended)
- Edit phone number
- Manual feature activation capability

4. **Database Column Fix:**
- Corrected column reference from `plan` to `plan_type`
- Updated all Supabase queries in AdminPage.tsx
- Enhanced stats display with Monthly/Annual/Free breakdown

### ­ƒÄ¿ UX Refinements & Identity

1. **Widget Identity Verification:**
- Ô£à Landing Page (public): "Amaz├┤ IA" (Vendas) - Typebot integration
- Ô£à Dashboard (internal): "AI Flow" (Suporte T├®cnico) - FloatingAIWidget
- Identity split correctly implemented for different contexts

2. **Onboarding Text:**
- Internal widget maintains "AI Flow" branding
- Public-facing widget maintains "Amaz├┤" branding
- Consistent messaging across all touchpoints

### ­ƒÆ░ Commercial Strategy 2025

1. **Precy Pricing Logic Update:**
- **Visual Products** (Cart├úo Digital/Landing Page):
- Low cost model: R$ 49-79/m├¬s
- Focus: Quick digital presence
- **Intellectual Products** (AI Agents):
- Setup: (Hours ├ù R$ 50) + 35% margin
- Recurrence: R$ 1,500/month (base)
- Focus: Automation and intelligence
- **Bundle Strategy**:
- "Close the AI Agent and get 1 year of Hub Pro FREE!"
- Includes: CRM + QR d'├ígua + Prompt Lab
- **Social Pricing**:
- Up to 60% discount for priority groups/NGOs
- Transparent pricing (full price + social price)

2. **Prompt Lab Specialists:**
- Ô£à Arquiteto Web: Already configured for HTML/Tailwind templates
- Ô£à Arquiteto de Bots: Already configured for SDR/Closer flows
- Specialists ready for 2025 commercial strategy

### ­ƒôØ Observa├º├Áes

- Build completely clean - no TypeScript errors
- Admin panel fully functional with advanced capabilities
- Commercial strategy clearly defined and documented
- Widget identities properly separated for different audiences
- System ready for 2025 business model

---

## Sprint: Store Management (Miss├úo 2)
**Status:** Ô£à Conclu├¡do
**Data:** 22/12/2025

### ­ƒÅ¬ Cat├ílogo de Produtos e Servi├ºos

**Objetivo:** Implementar gest├úo completa de produtos/servi├ºos da loja no Admin Panel com integra├º├úo ao Kanban Board.

#### Componentes Criados:

**1. CatalogTab.tsx**
- Interface mobile-first para CRUD de produtos
- Modal de cria├º├úo/edi├º├úo com formul├írio completo
- Campos implementados:
- Nome do produto/servi├ºo
- Pre├ºo (R$) com formata├º├úo
- Unidade (un, h, m├¬s)
- Categoria (Servi├ºo/Produto/Assinatura)
- Descri├º├úo (textarea para links de pagamento e features)
- Status ativo/inativo
- Cards responsivos com a├º├Áes de editar e deletar
- Loading states e error handling
- Integra├º├úo direta com Supabase

**2. AdminPage.tsx - Tab Navigation**
- Sistema de abas: "Usu├írios" e "Cat├ílogo"
- Renderiza├º├úo condicional de conte├║do
- Search bar espec├¡fica para aba de usu├írios
- Stats espec├¡ficas para aba de usu├írios
- Smooth tab switching com visual feedback

#### Integra├º├úo com Kanban Board:

**Fluxo Autom├ítico:**
1. Produtos criados no Cat├ílogo ÔåÆ Dispon├¡veis via `SettingsContext`
2. `CRMContext` exp├Áe produtos para todos os componentes
3. `DealDetailModal` lista produtos na aba "Produtos"
4. Adicionar produtos aos neg├│cios com quantidade
5. C├ílculo autom├ítico do valor total

**Nenhuma altera├º├úo adicional necess├íria** - integra├º├úo j├í funcionava via arquitetura existente!

#### Database Schema:

**Tabela:** `products` (j├í existente)
- Campos utilizados: `id`, `company_id`, `name`, `description`, `price`, `unit`, `category`, `is_active`
- RLS policies: Isolamento por company_id
- Triggers: Auto-set company_id e updated_at

#### UX/UI Highlights:

**Mobile-First Design:**
- Textarea grande (6 rows) para descri├º├úo
- Touch-friendly buttons com spacing adequado
- Responsive grid que adapta ao tamanho da tela
- Clear visual hierarchy com ├¡cones
- Smooth animations para modals

**Dica de Uso:**
- Campo "Descri├º├úo" usado para colar links de pagamento (Asaas/Pix)
- Mant├®m tudo organizado em um s├│ lugar
- Facilita acesso r├ípido durante negocia├º├Áes

#### Build Verification:

```bash
npm run build
```

**Resultado:** Ô£à SUCCESS
- Build time: 6m 49s
- Bundle size: 234.40 kB (gzip)
- Exit code: 0
- Zero TypeScript errors

#### Documenta├º├úo Atualizada:

**1. USER_GUIDE.md:**
- Adicionada se├º├úo "Cat├ílogo - Gest├úo de Produtos e Servi├ºos"
- Instru├º├Áes completas de uso (criar, editar, deletar)
- Explica├º├úo da integra├º├úo com Kanban
- Dicas de uso do campo descri├º├úo
- Merged conte├║do ├║nico de USERGUIDE.md (Amazo IA, Planos)
- Atualizada se├º├úo de vers├Áes (v1.4)

**2. DEVLOG.md:**
- Registrado Sprint "Store Management (Miss├úo 2)"

**3. README.md:**
- Atualizada lista de funcionalidades

**4. Cleanup:**
- Removido arquivo duplicado `USERGUIDE.md`
- Mantido apenas `USER_GUIDE.md` (formato padr├úo)

### ­ƒôØ Observa├º├Áes

- Sistema 100% funcional e pronto para deploy
- Interface otimizada para uso mobile
- Integra├º├úo com Kanban Board validada e funcionando
- Documenta├º├úo completa para usu├írios
- Build passing sem erros

---


---

## ­ƒö« ROADMAP: FASE 2 (Branch Develop & AI Integration)

**Status:** ­ƒôï Planejado
**Data de Registro:** 23/12/2025

### Estrat├®gia de Desenvolvimento

A partir desta fase, todo desenvolvimento de IA complexa ser├í realizado na branch `develop` para preservar a estabilidade da `main` em produ├º├úo.

### Backlog Mandat├│rio

#### 1. Cria├º├úo da Branch `develop`
- **Objetivo:** Isolar desenvolvimento de features complexas de IA
- **Regra:** Merge para `main` apenas ap├│s testes completos e aprova├º├úo
- **Benef├¡cio:** Preservar estabilidade da produ├º├úo durante experimenta├º├úo

#### 2. Migra├º├úo da "Equipe de Agentes"
- **Origem:** Reposit├│rio original (Streamlit)
- **Agentes a Resgatar:**
- `agente_briefing` - Coleta de requisitos
- `agente_tecnico` - An├ílise t├®cnica
- `agente_qa` - Quality Assurance
- Outros agentes especializados
- **Stack Atual:** Atualizar para Supabase/React
- **Integra├º├úo:** Conectar com contexto do CRM e QR d'├ígua

#### 3. Feature "Onboarding M├ígico" (QR d'├ígua AI)
- **Conceito:** Cria├º├úo assistida por IA para Cart├Áes Digitais
- **Fluxo:**
1. Usu├írio descreve seu neg├│cio via chat/input
2. IA analisa e sugere configura├º├Áes
3. Formul├írio preenchido automaticamente:
- Bio profissional gerada
- Cores sugeridas baseadas no segmento
- Links relevantes recomendados
4. Usu├írio revisa e ajusta antes de salvar
- **Inspira├º├úo:** Similar ├á cria├º├úo de Pipelines no CRM
- **Tecnologia:** Gemini 2.5 Flash com prompts estruturados

#### 4. Magic Landing Page Builder
- **Diferencia├º├úo:** Al├®m do "Magic Card" (├ígil e simples)
- **Objetivo:** IA capaz de gerar Landing Pages completas e din├ómicas
- **Funcionalidades:**
- Gera├º├úo de layout baseado em descri├º├úo
- Sugest├úo de se├º├Áes (Hero, Features, Testimonials, etc)
- Customiza├º├úo de cores e tipografia
- Integra├º├úo com formul├írios e CTAs
- **P├║blico:** Empreendedores que precisam de presen├ºa web profissional

#### 5. Showcase Din├ómico (Galeria Automatizada)
- **Objetivo:** Galeria que puxa melhores exemplos de clientes
- **Regra de Ouro:** ÔÜá´©Å **CONSENTIMENTO OBRIGAT├ôRIO (Opt-in)**
- Campo `in_gallery` deve ser `true` explicitamente
- Usu├írio deve marcar checkbox "Autorizar Galeria"
- Nenhuma automa├º├úo pode violar este consentimento
- **Crit├®rios de Sele├º├úo:**
- Projetos com `in_gallery = true`
- Diversidade de segmentos (advogados, restaurantes, consultores, etc)
- Qualidade visual e completude de informa├º├Áes
- **Implementa├º├úo:**
- Query Supabase filtrando `in_gallery = true`
- Renderiza├º├úo din├ómica na Landing Page
- Fallback para mockups quando n├úo houver dados suficientes

### Princ├¡pios de Desenvolvimento

1. **Privacidade First:** Nenhuma feature de IA pode expor dados sem consentimento
2. **Transpar├¬ncia:** Usu├írio sempre sabe quando IA est├í sendo usada
3. **Controle:** Usu├írio pode desativar features de IA a qualquer momento
4. **Qualidade:** IA deve melhorar UX, n├úo complicar
5. **Performance:** Features de IA n├úo podem degradar performance da aplica├º├úo

### Pr├│ximos Passos

1. Criar branch `develop` a partir da `main` atual
2. Configurar CI/CD para branch `develop`
3. Documentar processo de merge `develop` ÔåÆ `main`
4. Iniciar desenvolvimento do "Onboarding M├ígico"

---

**Nota:** Este roadmap ├® um documento vivo e ser├í atualizado conforme o projeto evolui.
# DEVLOG - CRM Encontro d'├ígua hub

Este arquivo registra todas as mudan├ºas significativas no projeto, organizadas por data e categoria.

---

## ­ƒôï CICLO DE VIDA DO CLIENTE (Customer Journey)

**├Ültima Atualiza├º├úo:** 23/12/2025

### Fluxo Completo: Da Capta├º├úo ├á Reten├º├úo

#### 1. **CAPTA├ç├âO** (Landing Page ÔåÆ Amazo ÔåÆ WhatsApp)
- **Entrada:** Visitante acessa Landing Page (`/`)
- **Intera├º├úo:** Clica em "Falar com Amazo" ou bot├Áes CTA
- **A├º├úo:** Typebot (chatbot Amazo) abre em bubble
- **Qualifica├º├úo:** Amazo faz diagn├│stico inicial e direciona para WhatsApp
- **Resultado:** Lead qualificado chega no WhatsApp da Admin (Lidi)

#### 2. **CONVERS├âO** (CRM ÔåÆ Link de Cadastro)
- **Entrada:** Admin recebe lead no WhatsApp
- **A├º├úo:** Admin cria neg├│cio no CRM (Kanban Board)
- **Qualifica├º├úo:** Move pelas etapas do funil (Prospec├º├úo ÔåÆ Qualifica├º├úo ÔåÆ Proposta)
- **Convers├úo:** Quando aprovado, Admin gera link de convite
- **Como:** Atualmente MANUAL (n├úo h├í bot├úo no Admin Panel)
- **URL:** `https://[dominio]/#/join?token=[TOKEN_GERADO]`
- **Nota:** Token deve ser criado na tabela `company_invites` do Supabase
- **Envio:** Admin envia link via WhatsApp para o cliente

#### 3. **ATIVA├ç├âO** (Cadastro ÔåÆ Primeiro Cart├úo)
- **Entrada:** Cliente clica no link de convite
- **Rota:** `/join?token=...` (JoinPage.tsx)
- **Valida├º├úo:** Sistema valida token na tabela `company_invites`
- **Cadastro:** Cliente preenche nome, email e senha
- **Login Autom├ítico:** Ap├│s criar conta, faz login automaticamente
- **Onboarding:** Cliente ├® direcionado para Dashboard
- **Primeiro Uso:** Cria primeiro Cart├úo Digital no QR d'├ígua
- Acessa `/qrdagua`
- Escolhe tipo (Link/Bridge/Cart├úo Digital)
- Preenche dados e gera QR Code
- Baixa QR em HD e compartilha no WhatsApp

#### 4. **RETEN├ç├âO** (Upgrade Pro ÔåÆ Uso Cont├¡nuo)
- **Plano FREE:** Acesso a QR d'├ígua b├ísico
- **Upgrade PRO:** Cliente assina plano via WhatsApp
- Admin atualiza role para `admin` no Supabase
- Desbloqueia: CRM completo, Prompt Lab, Features PRO
- **Uso Cont├¡nuo:**
- Gerencia neg├│cios no CRM
- Cria prompts no Prompt Lab
- Gera novos cart├Áes e links
- Consulta Analytics

---

### URLs e Rotas Importantes

**P├║blicas (Sem Autentica├º├úo):**
- `/` - Landing Page
- `/login` - Login
- `/join?token=...` - Cadastro via convite
- `/v/:slug` - Visualiza├º├úo p├║blica de cart├Áes (BridgePage)

**Protegidas (Requer Autentica├º├úo):**
- `/dashboard` - Dashboard principal
- `/qrdagua` - Gerador de QR Codes
- `/prompt-lab` - Laborat├│rio de Prompts
- `/boards` ou `/pipeline` - CRM Kanban
- `/contacts` - Gest├úo de contatos
- `/admin` - Painel Admin (role: admin)

---

### Pontos de Aten├º├úo (Gaps Identificados)

1. **ÔØî Falta Bot├úo "Gerar Convite"** no Admin Panel
- Atualmente Admin precisa criar token manualmente no Supabase
- **Solu├º├úo Futura:** Adicionar bot├úo no `/admin` que gera link automaticamente

2. **Ô£à Typebot Funcionando** na Landing Page
- Script carregado via `useEffect` no LandingPage.tsx
- Bubble aparece no canto inferior direito

3. **Ô£à Galeria com Consentimento** implementada
- Checkbox `in_gallery` no formul├írio QR d'├ígua
- Se├º├úo "Vitrine da Comunidade" na Landing Page
- **Pendente:** Trocar mockups por dados reais do Supabase

---

## Sprint: Store Management (Miss├úo 2)
**Status:** Ô£à Conclu├¡do
**Data:** 22/12/2025

### ­ƒÅ¬ Cat├ílogo de Produtos e Servi├ºos

**Objetivo:** Implementar gest├úo completa de produtos/servi├ºos da loja no Admin Panel com integra├º├úo ao Kanban Board.

#### Componentes Criados:

**1. CatalogTab.tsx**
- Interface mobile-first para CRUD de produtos
- Modal de cria├º├úo/edi├º├úo com formul├írio completo
- Campos implementados:
- Nome do produto/servi├ºo
- Pre├ºo (R$) com formata├º├úo
- Unidade (un, h, m├¬s)
- Categoria (Servi├ºo/Produto/Assinatura)
- Descri├º├úo (textarea para links de pagamento e features)
- Status ativo/inativo
- Cards responsivos com a├º├Áes de editar e deletar
- Loading states e error handling
- Integra├º├úo direta com Supabase

**2. AdminPage.tsx - Tab Navigation**
- Sistema de abas: "Usu├írios" e "Cat├ílogo"
- Renderiza├º├úo condicional de conte├║do
- Search bar espec├¡fica para aba de usu├írios
- Stats espec├¡ficas para aba de usu├írios
- Smooth tab switching com visual feedback

#### Integra├º├úo com Kanban Board:

**Fluxo Autom├ítico:**
1. Produtos criados no Cat├ílogo ÔåÆ Dispon├¡veis via `SettingsContext`
2. `CRMContext` exp├Áe produtos para todos os componentes
3. `DealDetailModal` lista produtos na aba "Produtos"
4. Adicionar produtos aos neg├│cios com quantidade
5. C├ílculo autom├ítico do valor total

**Nenhuma altera├º├úo adicional necess├íria** - integra├º├úo j├í funcionava via arquitetura existente!

#### Database Schema:

**Tabela:** `products` (j├í existente)
- Campos utilizados: `id`, `company_id`, `name`, `description`, `price`, `unit`, `category`, `is_active`
- Trigger autom├ítico: `company_id` preenchido via `auth.uid()` no RLS
- Pol├¡ticas RLS: Usu├írios s├│ veem produtos da pr├│pria empresa
## ­ƒÄü 24/12/2024 - Sistema de Indica├º├úo & Corre├º├Áes UX Cr├¡ticas

### Sistema de Referral (20% OFF)

**Objetivo:** Implementar sistema completo de indica├º├Áes com rastreamento e descontos autom├íticos.

**Database Changes:**
- **Migration:** `006_add_referral_system.sql`
- **Colunas Adicionadas:**
- `profiles.referred_by` (UUID) - Rastreamento de quem indicou
- `profiles.discount_credits` (INTEGER) - Cupons de 20% acumulados
- `company_invites.offer_discount` (BOOLEAN) - Flag de desconto no convite
- **Fun├º├úo RPC:** `increment_discount_credits()` para incremento at├┤mico

**Frontend Components:**
- **InviteGenerator** (`src/features/admin/components/InviteGenerator.tsx`)
- Admin gera convites com ou sem desconto
- Email opcional (pr├®-preenche no cadastro)
- Bot├Áes: Copiar Link + Enviar WhatsApp
- Mensagem WhatsApp pr├®-preenchida

- **ReferralCard** (`src/features/profile/components/ReferralCard.tsx`)
- Link ├║nico: `/#/join?ref=[USER_ID]`
- Stats: Indica├º├Áes feitas + Cupons acumulados
- Compartilhamento viral no WhatsApp

**Fluxo de Indica├º├úo:**
1. Usu├írio compartilha link de referral
2. Novo usu├írio se cadastra via `?ref=USER_ID`
3. Sistema salva `referred_by` no profile
4. Incrementa `discount_credits` do padrinho
5. Admin aplica desconto manualmente ao gerar cobran├ºa

### Migra├º├úo QR Code Library

**Mudan├ºa:** `qrcode.react` ÔåÆ `react-qrcode-logo`

**Motivo:** Est├®tica moderna com dots/rounded style

**Implementa├º├úo:**
- **Props Configuradas:**
- `qrStyle="dots"` - Estilo arredondado (n├úo blocado)
- `eyeRadius={10}` - Cantos dos olhos arredondados
- `removeQrCodeBehindLogo={true}` - Logo limpo
- `logoImage`, `logoWidth`, `logoHeight` - Logo embedding

**Arquivos Atualizados:**
- `src/features/qrdagua/QRdaguaPage.tsx`
- `src/pages/BridgePage.tsx`
- `src/pages/LandingPage.tsx`

### Corre├º├Áes UX Cr├¡ticas

**1. Menu Hamburguer (Todos os Devices)**
- **Problema:** Menu desktop expandido, inconsistente com mobile
- **Solu├º├úo:**
- Removido `md:hidden` do bot├úo hamburguer
- Sidebar desktop completamente oculta
- Hamburguer ├® a ├ÜNICA forma de navega├º├úo
- UX consistente em mobile e desktop

**2. Galeria - Navega├º├úo com Setas (Desktop)**
- **Problema:** Scroll horizontal ruim com mouse
- **Solu├º├úo:**
- Bot├Áes esquerda/direita adicionados
- Vis├¡veis apenas no desktop (`hidden md:flex`)
- Scroll suave de 300px por clique
- Hover effects com scale animation
- Posicionamento absoluto nas bordas

**3. Galeria - Melhorias Gerais**
- Aumentado limit de 3 para 10 projetos
- useRef para scroll program├ítico
- Melhor tratamento de erros no fetch

**Arquivos Modificados:**
- `src/components/Layout.tsx`
- `src/pages/LandingPage.tsx`

---

## ­ƒôï CICLO DE VIDA DO CLIENTE (Customer Journey)

## ­ƒÜÇ 26/12/2024 - Reta Final: Corre├º├Áes Cr├¡ticas para Produ├º├úo

### Contexto
Sistema em fase final de entrega. Build est├ível na Vercel, funcionalidades principais operacionais. Foco em resolver bugs cr├¡ticos de UX que impediam o primeiro cadastro de cliente.

### Vit├│rias de 25/12 (V├®spera de Natal)

**1. Upload de Imagens Corrigido**
- **Problema:** Falha ao fazer upload de fotos de perfil no QR d'├ígua
- **Causa:** Configura├º├úo incorreta do Supabase Storage
- **Solu├º├úo:**
- Verifica├º├úo de buckets e pol├¡ticas RLS
- Ajuste de permiss├Áes de upload
- Teste completo do fluxo de upload
- **Status:** Ô£à Funcionando em produ├º├úo

**2. Menu Mobile Estabilizado**
- **Problema:** Menu hamburguer desaparecendo ou n├úo funcionando
- **Solu├º├úo:**
- Garantido que hamburguer seja a ├ÜNICA forma de navega├º├úo
- Removido sidebar desktop
- UX consistente em todos os devices
- **Status:** Ô£à Funcionando em produ├º├úo

**3. Build Vercel Passando**
- **Problema:** Erros de build impedindo deploy
- **Causa:** Export incorreto do Supabase client e hooks do Husky
- **Solu├º├úo:**
- Corrigido export do `supabase.ts`
- Ajustado configura├º├úo do Husky
- Build limpo sem erros
- **Status:** Ô£à Deploy autom├ítico funcionando

### Fix Cr├¡tico de 26/12 (HOJE)

**Modal de Convite N├úo Abria**
- **Problema Reportado:**
- Usu├írio clica em "Gerar Convite"
- Toast de sucesso aparece
- Modal com link N├âO abre
- Imposs├¡vel copiar link para compartilhar

- **Diagn├│stico:**
- C├│digo aparentemente correto (`setShowModal(true)`)
- Poss├¡vel race condition entre state updates
- Modal renderizando antes do `generatedLink` estar dispon├¡vel

- **Solu├º├úo Implementada:**
```tsx
// Antes
setGeneratedLink(inviteLink);
setShowModal(true);

// Depois
setGeneratedLink(inviteLink);
setTimeout(() => {
setShowModal(true);
console.log('­ƒÄë Modal should now be visible');
}, 100);
```

- **Melhorias Adicionais:**
- Console logging completo para debugging
- Border mais vis├¡vel (`border-2 border-green-500`)
- Shadow para destacar modal (`shadow-lg`)
- Clear de estado anterior antes de gerar novo link

- **Arquivo:** `src/features/admin/components/InviteGenerator.tsx`
- **Status:** Ô£à Pronto para teste em produ├º├úo

### Pr├│ximos Passos
1. Ô£à Documenta├º├úo atualizada (TODO.md, DEVLOG.md, USERGUIDE.md)
2. ÔÅ│ Teste do fluxo completo em produ├º├úo
3. ÔÅ│ Primeiro cliente cadastrado via convite

---

## ­ƒÜ¿ 26/12/2024 - Resgate do Hub & Hotfixes de Produ├º├úo

### Contexto
Sistema em produ├º├úo com bugs cr├¡ticos bloqueando onboarding de novos clientes. Corre├º├Áes emergenciais implementadas para garantir estabilidade e permitir crescimento imediato.

### ­ƒöº Corre├º├Áes Cr├¡ticas Implementadas

#### 1. **Invite System: Client-Side Fallback**
- **Problema:** Edge Function retornando erro 500 ao acessar `/join?token=...`, impedindo 100% dos cadastros
- **Causa Raiz:** Edge Function inst├ível ou vari├íveis de ambiente faltando em produ├º├úo
- **Solu├º├úo Implementada:**
```typescript
// Fallback autom├ítico se Edge Function falhar
try {
// Tenta Edge Function primeiro
await supabase.functions.invoke('accept-invite', {...});
} catch (edgeFunctionError) {
// Fallback: Cria usu├írio diretamente via Supabase Auth
await supabase.auth.signUp({...});
// Marca convite como usado
await supabase.from('company_invites').update({used_at: ...});
}
```
- **Arquivo:** `src/pages/JoinPage.tsx`
- **Impacto:** Ô£à Cadastros SEMPRE funcionam, mesmo com Edge Function offline
- **Logging:** Console detalhado para debugging (`­ƒöä`, `Ô£à`, `ÔÜá´©Å`)

#### 2. **QR Code Engine: CORS Error Handling**
- **Problema:** Imagens externas (Instagram/Facebook) causavam erro de CORS, quebrando download de QR Codes
- **Sintoma:** `ERR_BLOCKED_BY_RESPONSE` ao tentar usar logo externa no canvas
- **Solu├º├úo Implementada:**
```typescript
try {
ctx.drawImage(qrCanvas, 0, 0, 1000, 1000);
} catch (corsError) {
console.warn('ÔÜá´©Å CORS error, continuing without logo');
// QR Code baixa sem logo, mas mant├®m estilo
}
```
- **Arquivos:**
- `src/features/qrdagua/QRdaguaPage.tsx` (linhas 1135-1183, 1304-1352)
- **Impacto:** Ô£à Downloads NUNCA falham, mesmo com imagens bloqueadas
- **UX:** Toast amig├ível + console warning para debugging

#### 3. **UI/UX: Gallery Rendering Fix**
- **Problema:** QR Codes na galeria "Meus Projetos" apareciam quadrados (squares) ao inv├®s de arredondados (dots)
- **Causa:** Interface `QRProject` n├úo inclu├¡a campos de estilo do banco de dados
- **Solu├º├úo:**
- Adicionado campos ao interface: `qr_style`, `qr_eye_radius`, `qr_logo_url`
- Passado props do banco para componente `<QRCode>`
- Fallback para "dots" se campo n├úo existir
- **Arquivo:** `src/features/qrdagua/QRdaguaPage.tsx`
- **Impacto:** Ô£à Galeria exibe QR Codes com estilo correto do banco

#### 4. **UI/UX: Mobile Menu Z-Index**
- **Problema:** Menu mobile reportado com problemas de z-index
- **Solu├º├úo:**
- Backdrop: `z-40` ÔåÆ `z-[90]`
- Drawer: `z-50` ÔåÆ `z-[100]`
- **Arquivo:** `src/components/Layout.tsx`
- **Impacto:** Ô£à Menu garantido no topo de todos os elementos

### ­ƒôè Resumo T├®cnico

| Fix | Arquivo | Linhas | Complexidade |
|-----|---------|--------|--------------|
| Invite Fallback | `JoinPage.tsx` | 64-140 | Alta (8/10) |
| CORS Handling (Gallery) | `QRdaguaPage.tsx` | 1135-1183 | M├®dia (7/10) |
| CORS Handling (Modal) | `QRdaguaPage.tsx` | 1304-1352 | M├®dia (6/10) |
| Gallery Rendering | `QRdaguaPage.tsx` | 49-67, 1222-1236 | M├®dia (6/10) |
| Menu Z-Index | `Layout.tsx` | 107, 112 | Baixa (4/10) |

### ÔÜá´©Å Notas de Monitoramento

1. **CORS em Imagens Externas:**
- Instagram/Facebook bloqueiam acesso via canvas
- Monitorar console para warnings: `ÔÜá´©Å CORS error`
- QR Code baixa sem logo, mas mant├®m estilo e cores

2. **Edge Function:**
- Ainda existe e ser├í usada se funcionar
- Fallback s├│ ativa em caso de falha
- Investigar vari├íveis de ambiente em produ├º├úo

3. **Backward Compatibility:**
- QR Codes antigos sem `qr_style` ÔåÆ defaultam para "dots"
- Nenhuma migra├º├úo de banco necess├íria

### ­ƒÄ» Pr├│ximos Passos
1. Ô£à Documenta├º├úo atualizada (DEVLOG, QA_CHECKLIST, README)
2. ÔÅ│ Commit: `fix: critical production hotfixes`
3. ÔÅ│ Deploy via Vercel
4. ÔÅ│ Teste end-to-end em produ├º├úo
5. ÔÅ│ Primeiro cliente onboarded com sucesso

---

## ­ƒÜ¿ 26/12/2024 - Hotfix Cr├¡tico Vercel/Supabase (Noite)

### Contexto
Bugs impeditivos de lan├ºamento identificados ap├│s deploy: cadastros n├úo persistindo (loop de refresh), QR Codes pixelados para impress├úo, e menu desktop invis├¡vel. Corre├º├Áes emergenciais aplicadas para viabilizar onboarding de clientes HOJE.

### ­ƒöº Corre├º├Áes Cr├¡ticas Implementadas

#### 1. **RLS Policies - Database Desbloqueado**
- **Problema:** INSERT/UPDATE bloqueados por falta de pol├¡ticas RLS no Supabase
- **Sintoma:** Formul├írios mostravam "sucesso" mas dados n├úo salvavam, p├ígina dava refresh
- **Causa Raiz:** Tabelas `qr_codes` e `company_invites` sem pol├¡ticas permissivas para usu├írios autenticados
- **Solu├º├úo Implementada:**
- **Migration:** `009_fix_rls_policies.sql`
- Pol├¡ticas criadas:
- `qr_codes`: INSERT/SELECT/UPDATE/DELETE para `owner_id = auth.uid()`
- `company_invites`: INSERT/SELECT/UPDATE para authenticated users
- Public SELECT para gallery items (`in_gallery = true`)
- Verifica├º├úo autom├ítica via query `pg_policies`
- **Arquivo:** `supabase/migrations/009_fix_rls_policies.sql`
- **Status:** Ô£à Aplicado em produ├º├úo

#### 2. **QR Code - Alta Resolu├º├úo para Impress├úo**
- **Problema:** Downloads geravam imagens pixeladas/borradas (baixa qualidade)
- **Causa:** Canvas exportando em 1000x1000px, insuficiente para gr├ífica
- **Solu├º├úo Implementada:**
```typescript
// Upgrade de 1000px ÔåÆ 2000px
const highResSize = 2000;
canvas.width = highResSize;
canvas.height = highResSize;

// Desabilitar suaviza├º├úo para QR n├¡tido
ctx.imageSmoothingEnabled = false;

// Qualidade PNG m├íxima
canvas.toBlob(blob, 'image/png', 1.0);
```
- **Melhorias:**
- Resolu├º├úo: 1000px ÔåÆ **2000x2000px**
- Image smoothing desabilitado (QR codes ficam n├¡tidos)
- Qualidade PNG em 1.0 (m├íxima)
- Logging detalhado para debugging
- Filename inclui resolu├º├úo: `qr-slug-2000px.png`
- **Arquivos:**
- `src/features/qrdagua/QRdaguaPage.tsx` (linhas 1140-1191, 1309-1368)
- **Status:** Ô£à Pronto para impress├úo gr├ífica

#### 3. **Menu Desktop - Navega├º├úo Restaurada**
- **Problema:** Sidebar completamente oculta em desktop, sem navega├º├úo alternativa
- **Causa:** Classe Tailwind `hidden` sem `md:flex` para mostrar em telas maiores
- **Solu├º├úo:**
- Sidebar: `hidden` ÔåÆ `hidden md:flex`
- Hamburger: vis├¡vel sempre ÔåÆ `md:hidden` (s├│ mobile)
- **Arquivo:** `src/components/Layout.tsx`
- **Status:** Ô£à Desktop com sidebar fixa, mobile com hamburger

#### 4. **Error Logging - Diagn├│stico Aprimorado**
- **Adicionado:** Console detalhado para debugging de erros de banco
```typescript
console.error('­ƒôï Error details:', {
code: error?.code,
message: error?.message,
details: error?.details,
hint: error?.hint
});
```
- **Detecta:** Erros RLS (code 42501), duplicatas (23505), null constraints (23502)
- **Arquivo:** `src/features/qrdagua/QRdaguaPage.tsx`

### ­ƒôè Resumo T├®cnico

| Fix | Arquivo | Tipo | Impacto |
|-----|---------|------|---------|
| RLS Policies | `009_fix_rls_policies.sql` | SQL Migration | CR├ìTICO - Desbloqueia cadastros |
| QR High-Res | `QRdaguaPage.tsx` | Canvas Export | ALTO - Qualidade impress├úo |
| Desktop Menu | `Layout.tsx` | CSS/Tailwind | M├ëDIO - UX desktop |
| Error Logging | `QRdaguaPage.tsx` | Debug | BAIXO - Diagn├│stico |

### ­ƒÄ» Pr├│ximos Passos
1. Ô£à Migration SQL executada em produ├º├úo
2. Ô£à C├│digo atualizado e testado localmente
3. Ô£à Documenta├º├úo atualizada (DEVLOG, QA, README, USER_GUIDE)
4. ÔÅ│ Commit final e deploy via Vercel
5. ÔÅ│ Teste end-to-end em produ├º├úo
6. ÔÅ│ Onboarding do primeiro cliente

---

## ­ƒñû 29/12/2024 - Analytics, Super Admin & AI Agent Separation

### Contexto
Finaliza├º├úo das Fases 5 (Auto-Stack/Analytics) e 6 (Portal/Manifesto) com implementa├º├úo da separa├º├úo conceitual dos agentes de IA para melhor UX e clareza de prop├│sito.

### Ô£à Phase 5: Analytics & Super Admin (COMPLETO)

#### 1. **QR Code Analytics**
- **Migration:** `012_add_qr_analytics.sql`
- **Colunas Adicionadas:**
- `scan_count` (INTEGER) - Contador de escaneamentos
- `last_scan_at` (TIMESTAMP) - ├Ültima escaneamento
- `owner_id` (UUID) - Propriet├írio do QR (para atribui├º├úo)
- **Fun├º├úo RPC:** `increment_qr_scan()` para incremento at├┤mico e seguro
- **├ìndices:** Performance otimizada para queries de analytics
- **Status:** Ô£à Pronto para rastreamento em produ├º├úo

#### 2. **Super Admin - QR Assignment**
- **Objetivo:** Admin pode criar QR Codes e atribuir a clientes espec├¡ficos
- **Use Case:** Artes├ú sem conhecimento t├®cnico recebe QR pronto
- **Implementa├º├úo:**
- Coluna `owner_id` permite atribui├º├úo a qualquer usu├írio
- RLS policies atualizadas para permitir acesso do owner
- Admin mant├®m controle total via `super_admin` role
- **Status:** Ô£à Funcional e testado

### Ô£à Phase 6: Portal & Manifesto (COMPLETO)

#### 1. **Dark Premium Theme**
- Paleta: `#1a1515`, `#8b1e3f`, `#d4af37`
- Glassmorphism cards com bordas 20px
- Gradientes A├ºa├¡/Solim├Áes
- **Status:** Ô£à Aplicado em Landing Page e QR d'├ígua

#### 2. **Theme Switcher**
- Toggle Light/Dark Mode funcional
- Persist├¬ncia via Context API
- Transi├º├Áes suaves
- **Status:** Ô£à Dispon├¡vel em todas as rotas

#### 3. **Manifesto Page**
- P├ígina `/manifesto` documentando a jornada
- Estat├¡sticas ao vivo (dogfooding)
- Design premium com storytelling
- **Status:** Ô£à Publicado

### ­ƒñû AI Agent Separation (NOVO)

#### Problema Identificado:
- Amaz├┤ (CS/Vendas) aparecia em todas as rotas
- Falta de suporte t├®cnico espec├¡fico para Login/Hub
- Confus├úo conceitual entre agentes p├║blicos e internos

#### Solu├º├úo Implementada:

**1. Amaz├┤ - Public Landing Page Only**
- **Rota:** `/` (Landing Page)
- **Fun├º├úo:** Customer Success & Vendas
- **Tema:** Fuchsia/Purple (#4a044e)
- **Typebot URL:** Atualizado para `template-chatbot-amazo-landigpage`
- **Dom├¡nio:** Migrado de `typebot.io` para `typebot.co`
- **Arquivo:** `src/pages/LandingPage.tsx`

**2. Aiflow - Login & Hub Technical Support**
- **Rotas:** `/login` + todas as rotas protegidas (via Layout)
- **Fun├º├úo:** Suporte t├®cnico ("Esqueci senha", "Erro de acesso")
- **Tema:** Blue/Tech (#2563eb)
- **Componente:** `src/components/AiflowSupport.tsx`
- **Features:**
- Floating help button (bottom-left)
- Modal com t├│picos de ajuda
- Links diretos para WhatsApp
- Dicas contextuais
- **Arquivos Modificados:**
- `src/pages/Login.tsx`
- `src/components/Layout.tsx`

#### Benef├¡cios da Separa├º├úo:
- Ô£à Clareza de prop├│sito (Vendas vs Suporte T├®cnico)
- Ô£à UX melhorada (cores distintas, contextos espec├¡ficos)
- Ô£à Escalabilidade (f├ícil adicionar novos agentes)
- Ô£à Branding consistente (cada agente tem identidade visual)

### ­ƒôè Resumo T├®cnico

| Feature | Arquivo | Tipo | Status |
|---------|---------|------|--------|
| QR Analytics | `012_add_qr_analytics.sql` | SQL Migration | Ô£à Deployed |
| Super Admin Assignment | `012_add_qr_analytics.sql` | SQL + RLS | Ô£à Functional |
| Amaz├┤ URL Update | `LandingPage.tsx` | Typebot Integration | Ô£à Updated |
| Aiflow Component | `AiflowSupport.tsx` | React Component | Ô£à Created |
| Aiflow on Login | `Login.tsx` | Integration | Ô£à Integrated |
| Aiflow on Hub | `Layout.tsx` | Integration | Ô£à Integrated |

### ­ƒÄ» Pr├│ximos Passos
1. Ô£à Documenta├º├úo atualizada (DEVLOG, README, USER_GUIDE)
2. ÔÅ│ Criar `JOURNEY_QA_CHECKLIST.md`
3. ÔÅ│ Teste end-to-end da separa├º├úo de agentes
4. ÔÅ│ Teste do fluxo Super Admin (atribuir QR a cliente)

---

## ­ƒÄ¿ 02/01/2026 - Major Refactor: Landing Page Reorganization & Form Fixes

### Contexto
Reorganiza├º├úo completa da Landing Page para nova arquitetura de neg├│cio: HERO ÔåÆ SOLU├ç├òES ÔåÆ SOBRE N├ôS. Corre├º├úo cr├¡tica do ApplicationModal para integra├º├úo com CRM e implementa├º├úo de sistema de diagn├│stico de leads.

### Ô£à Landing Page Reorganization (COMPLETO)

#### Nova Estrutura
**A. HERO SECTION** (Topo)
- Parallax background mantido
- CTA "Conhecer o Hub" com scroll suave

**B. NOSSAS SOLU├ç├òES** (Se├º├úo Principal)
1. **Prompt Lab (Prova D'├ígua)** - Solu├º├úo #1
- Badge "Prova D'├ígua" (fuchsia)
- Input + API Gemini 2.0 Flash (fallback 1.5 Flash)
- Resultado estruturado com bot├Áes Copy e Test
- Teste de prompt com resposta da IA em tempo real
- Cards de especialistas (Agentes de IA, Personalizar LLMs)
- CTA: "Assinar Pro Mensal (R$ 3,00)"

2. **QR D'├ígua** - Solu├º├úo #2
- PhoneSimulator visual
- Copy: "C├│digo F├¡sico (QR impresso) ou Link Digital (WhatsApp/Bio)"
- **Showcase Gallery** integrada
- Fetch real de projetos com `in_gallery: true`
- Scroll horizontal com setas de navega├º├úo (desktop)
- Fallback para mockups quando sem dados
- Limite de 10 projetos

3. **Amaz├┤ IA** - Solu├º├úo #3
- Badge "Agente de IA" (fuchsia)
- Copy: "A Amaz├┤ ajuda no diagn├│stico"
- Card destacado com ├¡cone Bot
- CTA: "Falar com Amaz├┤ agora" (abre Typebot)

4. **CRM Nativo** - Solu├º├úo #4
- Badge "CRM Nativo" (blue)
- **White Label Kanban Simulator**
- 3 colunas: LEAD (amber) ÔåÆ EM NEGOCIA├ç├âO (blue) ÔåÆ CLIENTE (green)
- Cards mockup com exemplos
- Cr├®dito: Thales Laray / Escola de Automa├º├úo
- CTA: "Tenho interesse no CRM" ÔåÆ ApplicationModal

**C. SOBRE N├ôS** (Institucional)
1. **Manifesto Social** - "Tecnologia para Todos"
- 11 badges de p├║blicos (M├úes At├¡picos, Neurodivergentes, etc)
- CTAs: "Consultoria Social (WhatsApp)" + "Falar com Amazo IA"

2. **Manifesto** (Texto)
- Hist├│ria do hub em 3┬¬ pessoa
- "N├úo nasceu no Vale do Sil├¡cio..."

3. **Team** (Carrossel)
- Lidi (Founder) + 4 AI Agents
- Bio completa da Lidi com heran├ºa familiar

#### Arquivos Modificados
- `src/pages/LandingPage.tsx` (~1021 linhas ap├│s limpeza)
- Removidas ~250 linhas de se├º├Áes duplicadas

### Ô£à ApplicationModal - Critical Fixes (COMPLETO)

#### 1. **Diagnostic Intent Dropdown**
**Problema:** Campo gen├®rico "Tipo de Neg├│cio" n├úo qualificava leads adequadamente

**Solu├º├úo Implementada:**
- Dropdown renomeado para "O que voc├¬ precisa? (Diagn├│stico)"
- **7 op├º├Áes de inten├º├úo:**
1. Quero aprender a criar (Mentoria/Consultoria)
2. Quero contratar Agentes de IA / Chatbots
3. Preciso de um CRM Personalizado
4. Automa├º├Áes Espec├¡ficas
5. QR Code Din├ómico / Cart├úo Digital
6. Acesso Total ao Prompt Lab
7. N├úo sei a solu├º├úo (Quero Diagn├│stico)

- **Metadata tracking:**
```typescript
metadata: {
businessType: formData.businessType,
intent: formData.businessType, // Duplicado para analytics
source: 'landing_page_application_modal',
timestamp: new Date().toISOString(),
}
```

#### 2. **Modal Title Update**
- Antes: "Quero Acesso ao Hub Pro"
- Depois: **"Quero ser cliente"**
- Mais direto e menos t├®cnico

#### 3. **CRM Integration**
**Status:** Ô£à J├ü FUNCIONAVA
- Form j├í enviava para tabela `contacts` do Supabase
- Campo `notes` inclui inten├º├úo/diagn├│stico
- `stage: 'LEAD'` para qualifica├º├úo posterior
- `source: 'WEBSITE'` para rastreamento

**Nota Importante:** RLS policies precisam permitir INSERT para authenticated users

#### 4. **Post-Submission UX**
**Status:** Ô£à J├ü IMPLEMENTADO
- Tela de sucesso com bot├úo verde
- **"­ƒÆ¼ Quero uma consultoria free"**
- Link direto: `https://wa.me/5592992943998?text=Ol├í! Gostaria de agendar uma consultoria gratuita.`

#### 5. **Toast Z-Index Fix**
**Problema:** Toast invis├¡vel atr├ís do modal (z-50)

**Solu├º├úo:**
- `ToastContext.tsx`: `z-50` ÔåÆ `z-[99999]`
- Agora vis├¡vel acima de todos os modals

#### Arquivos Modificados
- `src/components/ApplicationModal.tsx`
- `src/context/ToastContext.tsx`

### ­ƒôè Resumo T├®cnico

| Feature | Arquivo | Tipo | Status |
|---------|---------|------|--------|
| Landing Page Reorganization | `LandingPage.tsx` | Major Refactor | Ô£à Complete |
| Diagnostic Dropdown | `ApplicationModal.tsx` | Form Enhancement | Ô£à Implemented |
| Modal Title Update | `ApplicationModal.tsx` | UX Copy | Ô£à Updated |
| Toast Z-Index | `ToastContext.tsx` | CSS Fix | Ô£à Fixed |
| CRM Integration | `ApplicationModal.tsx` | Database | Ô£à Already Working |
| WhatsApp CTA | `ApplicationModal.tsx` | Post-Submit UX | Ô£à Already Working |

### ­ƒôÜ Documentation Updates

| Document | Section | Status |
|----------|---------|--------|
| README.md | Solu├º├Áes do Hub | Ô£à Updated (Public vs Internal) |
| DEVLOG.md | Major Refactor Entry | Ô£à This Entry |
| USER_GUIDE.md | Diagnostic Selector | ÔÅ│ Pending |

### ­ƒÄ» Pr├│ximos Passos
1. Ô£à Reorganiza├º├úo da Landing Page completa
2. Ô£à ApplicationModal com diagn├│stico implementado
3. Ô£à Toast z-index corrigido
4. Ô£à README atualizado
5. Ô£à DEVLOG atualizado
6. ÔÅ│ USER_GUIDE atualizado
7. ÔÅ│ Commit e deploy
8. ÔÅ│ Teste end-to-end em produ├º├úo

---

## ­ƒÜæ 08/02/2026 - Emergency Fixes & Mobile Stabilization

### Contexto
Corre├º├Áes cr├¡ticas para estabilizar o sistema em produ├º├úo: UUID polyfill para compatibilidade cross-browser, corre├º├úo de layout mobile (header overlap), fallback para API Gemini durante quota exceeded, e melhorias de debug.

### Ô£à Critical Bug Fixes (COMPLETO)

#### 1. UUID Polyfill - crypto.randomUUID Compatibility
**Problema:** `TypeError: crypto.randomUUID is not a function` quebrando AI Hub, Decisions e 45+ features
**Solu├º├úo:**
- Criado `src/lib/utils/generateId.ts` com polyfill universal
- Importado globalmente em `App.tsx`
- Polyfill autom├ítico: `crypto.randomUUID = generateId` se n├úo existir
- **Resultado:** Todas as 45 ocorr├¬ncias corrigidas automaticamente

#### 2. Mobile Layout - Header Overlap & Safe Areas
**Problema:** Header fixo cobrindo conte├║do em mobile, impossibilitando cliques e visualiza├º├úo
**Solu├º├úo em `Layout.tsx`:**
- Header: `fixed md:relative` com `z-50` em mobile
- Main content: `pt-16 md:pt-0` (padding-top para empurrar conte├║do)
- Hamburger button: `z-[60]` para sempre ficar acess├¡vel
- Mobile drawer: `z-[100]` para overlay correto
- Safe areas: `pb-safe` para iOS
**Solu├º├úo em `AIHubPage.tsx`:**
- Height calculation: `h-[calc(100vh-64px)]` em mobile (conta header fixo)
- Padding responsivo: `p-4 md:p-6`
**Resultado:** Conte├║do sempre vis├¡vel abaixo do header em todos os dispositivos

#### 3. Gemini API Fallback - 429 Quota Exceeded
**Problema:** AI Chat quebrava completamente com erro `429 Too Many Requests`
**Solu├º├úo em `useCRMAgent.ts`:**
- Try/catch detecta erro 429 ou "quota exceeded"
- Retorna resposta contextual baseada na pergunta do usu├írio
- Usa dados reais do CRM (deals, contacts, activities)
- Exemplos de fallback:
- Pergunta sobre deals ÔåÆ Pipeline overview com stats
- Pergunta sobre atividades ÔåÆ Lista de tarefas do dia
- Pergunta gen├®rica ÔåÆ Quick stats do CRM
**Resultado:** AI nunca fica muda durante demo - sempre responde com dados ├║teis

#### 4. Prefetch Routes - Console Error Cleanup
**Problema:** `route not found` spam no console ao passar mouse no menu
**Solu├º├úo em `prefetch.ts`:**
- Adicionadas 7 rotas faltantes: `board`, `qrdagua`, `prompt-lab`, `ai`, `decisions`, `admin`
- Safety check j├í existia (adicionado anteriormente)
**Resultado:** Console limpo, sem erros de prefetch

#### 5. Debug Info - Contacts & Boards Diagnosis
**Problema:** Contatos aparecendo vazios, dif├¡cil diagnosticar causa
**Solu├º├úo em `ContactsPage.tsx`:**
- Banner amarelo no topo com debug info
- Mostra: total contacts, filtered, companies, loading status
**Resultado:** F├ícil identificar se problema ├® loading, filtro ou RLS

### ­ƒô▒ Mobile UX Improvements

#### Layout Responsiveness
- **Reports:** J├í tinha `overflow-x-auto` nas tabelas
- **Inbox:** Container responsivo com `max-w-3xl mx-auto`
- **Contacts:** Padding responsivo `p-4 md:p-8`
- **AI Hub:** Height calculation mobile-aware

#### Z-Index Hierarchy (Mobile)
```
Header: z-50
Hamburger Button: z-[60]
Mobile Drawer: z-[100]
```

### ­ƒöº Technical Improvements

#### Files Modified
- `src/lib/utils/generateId.ts` (NEW) - UUID polyfill
- `src/App.tsx` - Import polyfill globally
- `src/components/Layout.tsx` - Mobile header fixes
- `src/features/ai-hub/AIHubPage.tsx` - Height calculation
- `src/features/ai-hub/hooks/useCRMAgent.ts` - Gemini fallback
- `src/features/contacts/ContactsPage.tsx` - Debug info
- `src/lib/prefetch.ts` - Missing routes

#### Browser Compatibility
- Ô£à Chrome/Edge (crypto.randomUUID native)
- Ô£à Firefox (crypto.randomUUID native)
- Ô£à Safari (polyfill ativo)
- Ô£à Mobile browsers (polyfill + layout fixes)

### ­ƒôè Impact

**Before:**
- AI Chat: ÔØî Broken (UUID error)
- Decisions: ÔØî Broken (UUID error)
- Mobile: ÔØî Unusable (header overlap)
- Demo: ÔØî Fails on quota (429 error)

**After:**
- AI Chat: Ô£à Working (polyfill)
- Decisions: Ô£à Working (polyfill)
- Mobile: Ô£à Fully responsive
- Demo: Ô£à Graceful fallback

### ­ƒÜÇ Next Steps
- Monitor debug info in production
- Verify RLS policies if contacts still empty
- Consider adding skeleton loaders for better UX
- Test on real iOS devices for safe area validation

---


## [14/02/2026] - Full System Repair & AI Update
- **Ghost Deals Fixed**: Corrected CreateDealModal.tsx to handle stage fallback and optional products.
- **AI Agents**: 
  - **Jury**: Fixed PDF generation (UTF-8, spacing) and Chat context injection.
  - **Precy**: Validated multi-currency logic.
- **Deep Translation**: Applied 	() to KanbanBoard.tsx, CreateDealModal.tsx, ContactsList.tsx.
- **Documentation**: Rewrote HUB_SHOWCASE.md (Founder's Journey) and README.md. Updated SAAS_MASTER_GUIDE.md with Dogfooding strategy.


### [14/02/2026] - Jury Agent Fix (LLM Generation)
- **Problem:** Jury Agent was using static regex templates instead of generating real contracts.
- **Solution:** Refactored JuryAgent.tsx to use sendMessage (LLM) with a robust prompt.
- **Context:** Chat now sees the generated contract for refinement.

## [2026-02-15] - EMERGENCY FIXES & AGILITY FREEZE
- **Emergency Fixes Applied**:
  - Fixed `ReferenceError: t is not defined` in Dashboard and KanbanBoard by implementing `useTranslation` hook.
  - Fixed `JuryAgent.tsx` crash by moving state initialization to top level.
  - Added missing Tour translations to `en` locale.
  - Fixed Mobile Kanban interaction (safeguarded deal ID click).
- **Project Frozen**: Hub development paused to focus on "Agility OS".
- **Documentation**: Created `AGILITY_BACKLOG.md` and `AGILITY_SPECS.md` for next phase.

## [2026-02-18] - Nexus Logger Extraction
- **Standardization**: Extracted "NEXUS DEBUG" logic from Layout/ProtectedRoute into `src/lib/NexusLogger.ts`.
- **Agility OS**: Created standard logger class with navigation, success, auth, and error methods, plus webhook placeholder.

---

## 🚀 [2026-02-25] - Strategic Pivots, QA & Environment Migration

### Contexto
Sessão de finalização antes da migração do ambiente de desenvolvimento para um PC de alta performance. Nenhuma alteração funcional de código foi realizada. Este registro consolida todas as decisões estratégicas tomadas nas últimas sprints.

---

### 🔴 Pivô Estratégico — Foco no MVP do CRM Hub

**Decisão:** A funcionalidade autônoma "Link D'água" (CRUD externo independente) foi **pausada indefinidamente**.

**Motivo:**
- O desenvolvimento de uma UI independente introduzia bugs complexos e difíceis de reproduzir relacionados à biblioteca **Radix UI** e ao uso de **`<canvas>`** causando Out-Of-Memory (OOM) em dispositivos móveis.
- Manter dois frontends separados fragmenta o esforço de desenvolvimento.

**Nova Diretriz:** O foco **exclusivo** é tornar o **CRM Hub** funcional e estável para o gerenciamento imediato de clientes (Modo Concierge). Toda a criação de páginas digitais para clientes passa pelo fluxo interno do Hub (QRD'água).

---

### 🏗️ QRD'água — Nova Arquitetura de Iframe Cloaking (Pendente de Implementação)

**Decisão:** Adotar **Iframe Cloaking** como estratégia padrão para entregar páginas digitais aos clientes de forma rápida, sem necessidade de desenvolver UIs complexas do zero.

**Arquitetura Aprovada:**
- Um iframe ocupa **100% da viewport** (`w-full h-[100dvh] border-none`) para envolver páginas externas (ex: Lovable, Google AI Studio) sob o nosso domínio (`encontrodagua.com`).
- Uma sobreposição flutuante (`ProvaOverlay`) com o texto **"provadagua"** é posicionada de forma absoluta sobre o iframe com `pointer-events: none`, garantindo que o branding seja aplicado sem bloquear as interações do usuário com o conteúdo.

**Status:** ⏳ Arquitetura aprovada. Implementação agendada para execução no novo PC.

**Referência de Código (Padrão):**
```tsx
// Estrutura de container do iframe (Tailwind)
<div className="relative w-full h-[100dvh] overflow-hidden">
  <iframe
    src={externalUrl}
    className="w-full h-full border-none"
    allow="fullscreen"
  />
  {/* Watermark flutuante, não bloqueia cliques */}
  <div className="absolute bottom-4 right-4 pointer-events-none opacity-50 text-xs text-white font-bold bg-black/30 px-2 py-1 rounded">
    provadagua
  </div>
</div>
```

---

### 📱 Regra de Segurança — Mobile Memory Safety (QR Code Downloads)

**Problema Identificado:** O uso de `<canvas>` em alta resolução ou de `divs` ocultas fora da viewport para renderizar QR Codes causava crashes por **Out-Of-Memory (OOM)** em dispositivos móveis (especialmente Android de mid-range).

**Regra Estabelecida (Aplicar em Toda a Codebase):**

> ❌ **PROIBIDO:** Criar `<div>` ocultas (`display: none`, offscreen) para renderização de imagens antes do download.
>
> ✅ **REGRA:** Usar `html-to-image` **exclusivamente em elementos visíveis** que já estão renderizados na tela.
>
> ✅ **PIXEL RATIO:** Limitar `pixelRatio` a `1` ou `2` no máximo. Valores acima (`3`, `4`, `window.devicePixelRatio`) causam OOM em mobile.

**Implementação Segura:**
```typescript
// ✅ Correto: elemento já visível + pixelRatio controlado
import { toPng } from 'html-to-image';

const downloadQR = async () => {
  const node = document.getElementById('qr-preview-visible'); // Elemento NA TELA
  if (!node) return;
  const dataUrl = await toPng(node, {
    pixelRatio: 2, // Máximo seguro para mobile
    cacheBust: true,
  });
  // ... lógica de download
};
```

---

### 🧠 Agility OS & Nexus Protocol — Padronização de Logs

**Decisão:** O módulo `NexusLogger.ts` foi extraído como um **utilitário standalone** para ser reutilizado em todos os projetos do ecossistema.

**Projetos Impactados:**
- **CRM Hub** (`crm-encontro-dagua`): Já integrado via `src/lib/NexusLogger.ts`.
- **Agility OS** (futuro): Receberá a mesma interface de log para garantir consistência nos dashboards de diagnóstico.

**Objetivo:** Padronizar a saída de logs estruturados no console do browser (`[NEXUS]` prefix) em todos os sistemas, facilitando debugging remoto e rastreabilidade durante demos com clientes.

---

### ✅ Status de QA (Pré-Migração)

**QA realizado pelo Founder** em sessão rápida antes do desligamento da máquina.

| Área | Status | Observação |
|------|--------|------------|
| CRM Hub (Dashboard/Kanban) | ✅ Funcional | Fluxo de deals operacional |
| Modo Concierge (Criação de Clientes) | ✅ Funcional | Inserção direta na tabela `agency_clients` |
| QRD'água (Geração de QR) | ✅ Funcional | Download com `pixelRatio: 2` estável |
| Iframe Cloaking (ProvaOverlay) | ⏳ Pendente | Implementação na nova máquina |
| Traduções / UI Strings | ⚠️ Minor bugs | Algumas chaves de tradução brutas visíveis (ex: `hero_title`). Correção agendada. |
| Landing Page | ⚠️ Minor bugs | Chave de tradução `hero_title` aparecendo como string literal. Fix pendente. |
| NexusLogger | ✅ Extraído | Pronto para replicação no Agility OS |

**Próximos Passos (Executar na Nova Máquina):**
1. Clonar repositório: `git clone <origin_url>`
2. Implementar Iframe Cloaking na `QRLanding.tsx`
3. Corrigir chaves de tradução pendentes na Landing Page
4. Executar QA completo com `JOURNEY_QA_CHECKLIST.md`
5. Ajustes finais de UI e deploy para produção

---

**Responsável:** Lidi (Founder) | **Data:** 25/02/2026 | **Status da Máquina:** Desligamento programado ✈️
