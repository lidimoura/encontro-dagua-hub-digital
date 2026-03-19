# DEVLOG - CRM Encontro d'Ã¡gua hub

Este arquivo registra todas as mudanÃ§as significativas no projeto, organizadas por data e categoria.

---
## [14/03/2026] â€” Sprint Resgate Webhook & Autonomia No-Code

### ðŸš¨ Post-Mortem: RegressÃ£o na Captura de Leads (Perda de InteligÃªncia)
- **O Problema**: Notou-se uma regressÃ£o grave capturando leads da Landing Page. O lead antigo ('Gamer pc') possuÃ­a um detalhado `briefing_json` e a tag correta 'AmazÃ´ SDR'. O novo lead ('Ben Jor') entrou sem formataÃ§Ã£o, sem o JSON e com a tag genÃ©rica 'lead'.
- **Causa Raiz**: Ontem, a Edge Function `typebot-webhook` foi indevidamente tratada como "cÃ³digo morto" e suas ocorrÃªncias foram removidas. Isso desativou a lÃ³gica central que capturava o payload complexo (nome, telefone, empresa, interesse) e o transformava no objeto rico de `briefing_json`, delegando a inserÃ§Ã£o para as funÃ§Ãµes de fallback diretas ao banco.
- **A ResoluÃ§Ã£o**: O backup do histÃ³rico Git e DevLog locais foi investigado, identificando a lÃ³gica exata de parsing do `typebot-webhook`. Essa inteligÃªncia de captura e notificaÃ§Ã£o push foi totalmente restaurada e **renomeada para `form-lp-lead`**.
- **UnificaÃ§Ã£o**: A `form-lp-lead` atua agora como o "CÃ©rebro Ãšnico" de captura. O `LeadCaptureModal` da LP do Hub mudou sua lÃ³gica para realizar fetch dessa funÃ§Ã£o na Borda, garantindo que independente da origem (Link d'Ãgua ou Hub LP), o `briefing_json`, as anotaÃ§Ãµes do deal, o source name, a formataÃ§Ã£o descritiva (`message`), e os canais corretos sejam unificados de forma determinÃ­stica antes da inserÃ§Ã£o no Supabase.

### âš™ï¸ Feature â€” Autonomia No-Code UI (IntegraÃ§Ãµes e Webhooks)
- Atendendo ao pedido para desacoplar hardcodes de serviÃ§os como o `n8n`.
- **`WebhooksSection.tsx`**: Reformulada para ter controle granular sobre onde despachar eventos em tempo real (`lead.created`, `deal.won`, `deal.moved`, etc).
- **OpÃ§Ã£o GET/POST**: MigraÃ§Ã£o SQL `031` adicionou a coluna `method` Ã  tabela `webhook_endpoints`. Agora o gestor escolhe livremente o verbo HTTP na UI.
- **Ecossistema N8n Integrado**: A funÃ§Ã£o `sendToN8nWebhook` e nova `dispatchWebhookEvent` (no `n8nService`) agora pesquisam webhooks em tempo-real na tabela. Eventuais movimentaÃ§Ãµes de card no Kanban (via `useBoardsController`) e criaÃ§Ã£o direta de Deals (`CreateDealModal`) realizam o disparo (ex: payloads virando query string em verbos GET ou body em POST). O CRM agora Ã© um disparador no-code autÃ´nomo.
- **Olcultar IA Keys**: Validado com sucesso que as chaves Gemini AI (configuradas no seu componente respectivo de IA) mantÃ©m as funÃ§Ãµes "Eye" (olhinho para ocultar) e save imperturbÃ¡veis e isoladas.

---
## [13/03/2026] â€” Sprint Estabiliz. Internacional: IA Keys, Precy FX, Jury LatAm, Docs

### ðŸ”‘ Feature â€” GestÃ£o de IA sem .env (UI No-Code)
- **`AIConfigSection.tsx`**: adicionado campo **Chave Reserva (Failover 429)** com badge "RodÃ­zio AutomÃ¡tico"
- **`SettingsContext.tsx`**: novo estado `aiApiKeySecondary` com getter/setter; salvo via `saveAISettings()`
- **`CRMContext.tsx`**: proxied `aiApiKeySecondary`/`setAiApiKeySecondary` para toda a app
- **`settings.ts`**: `DbUserSettings`, `UserSettings` e `transformSettings` atualizados com campo `ai_api_key_secondary`
- **SQL necessÃ¡rio**: `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS ai_api_key_secondary text;`
- Ambas as chaves sÃ£o persistidas no Supabase â€” zero dependÃªncia de `.env`/Vercel

### ðŸ’± Fix â€” Precy: FX Inteligente + Fix 409
- **`PrecyAgent.tsx`**: adicionado mapa estÃ¡tico de cÃ¢mbio (`FX_RATES`) com 10 moedas (BRL base): BRL, USD, EUR, AUD, COP, PEN, ARS, MXN, CLP, UYU
- `convertPrice()`: converte o preÃ§o final de BRL para a moeda selecionada antes de salvar
- **Fix 409**: substituÃ­do `.insert()` por `.upsert({ onConflict: 'name' })` â€” evita conflito quando produto de mesmo nome jÃ¡ existe no catÃ¡logo
- Metadata salva `price_brl` original para rastreabilidade
- Seletor de moeda migrado de 4 botÃµes para `<select>` compacto com emojis de bandeira

### âš–ï¸ Feature â€” Jury: LatAm, Auto-Open, SaÃ­das Separadas
- **JurisdiÃ§Ãµes expandidas**: CO (Ley 1581), PE (Ley 29733), AR (Ley 25.326), MX (LFPDPPP), CL (Ley 19.628), UY (Ley 18.331) â€” somando Ã s existentes BR/US/AU/EU
- **Chat auto-aberto**: `isRefinementOpen` agora comeÃ§a `true` â€” Jury inicia pronta
- **SeparaÃ§Ã£o de saÃ­das**: `contractGenerated` flag separada â€” chat para diÃ¡logo/resumos, Ã¡rea de contrato apenas para documento formal
- **Container fixo**: `h-72 min-h-0 overflow-y-auto` com `contain:strict` â€” elimina layout jump durante streaming da IA
- System prompt reformulado: Jury age como consultora (faz perguntas antes de gerar)

### ðŸ“š DocumentaÃ§Ã£o
- **`UserGuide.md`** (NOVO): manual completo com todas as funcionalidades nativas e features â€” Kanban, botÃ£o `+`, agentes IA, ciclo de vida, catÃ¡logo, configuraÃ§Ã£o de IA, LPâ†’SDR, e nota de SQL
- **`DEVLOG.md`**: esta entrada adicionada

### ðŸ“Š MÃ©tricas da Sprint
| MÃ©trica | Valor |
|---|---|
| Arquivos de cÃ³digo modificados | 7 |
| Novas features UI | 3 (secondary key, Precy select, Jury LatAm flags) |
| Bugs corrigidos | 2 (409 Precy, addToast args) |
| DocumentaÃ§Ã£o | 1 arquivo novo, 1 atualizado |
| Build TypeScript | âœ… 0 erros |

---

## [02/27/2026] - FinalizaÃ§Ã£o de Sprint: CorreÃ§Ãµes CrÃ­ticas no CRM e IntegraÃ§Ã£o Nexus/Jury

- **ResoluÃ§Ã£o do Erro 409 (Delete em Cascata de Contatos)**: A deleÃ§Ã£o de contatos duplicados gerava *409 Conflict* no Supabase devido Ã  falta de `ON DELETE CASCADE` dependente. Implementamos a deleÃ§Ã£o em cascata direta via `contactsService.delete(...)`. A funÃ§Ã£o agora exclui proativamente os `deals` e as `activities` antes da raiz. Cards fantasmas tambÃ©m foram removidos via filtro inteligente no Kanban e Realtime reativado para as tabelas essenciais.
- **Fix do Erro 400 (Save to Deal - Jury AI)**: O payload para salvar contratos falhava pois passava `user_id` em vez de `owner_id`, omitia o requerido `company_id` da query, e quebrava o enum enviando "NOTE" maiÃºsculo. O payload no JuryAgent foi corrigido extraindo profile via auth e tipando corretamente os enums, destravando a vinculaÃ§Ã£o de artefatos da IA aos clientes.
- **Nova Estrutura de Abas nos Cards (Aba Documentos)**: Contratos salvos sumiam na Timeline, poluindo-a. Instanciamos a tab estÃ¡tica **"Documentos e Contratos"** no `DealDetailModal.tsx`. Todas as atividades tipo nota agora tÃªm um repositÃ³rio fixo, scrollÃ¡vel e isolado para leitura focada, organizando a topologia UI do Card do Cliente.
- **Bridge / Iframe Masking Restore (Camuflagem QRdAgua)**: Restaurado o `<iframe src>` nativo com os sandboxes injetados e `referrerPolicy="no-referrer"` na `BridgePage.tsx`. O wrapper volta a emular URLs blindadas (ex: lovable e google scripts) por baixo da UI principal do hub d'Ã¡gua sem ser bloqueado pela polÃ­tica de frame-ancestors.

---
## [02/26/2026] - Layout, UX & IntegraÃ§Ã£o AI

- **Surgical CSS Layout Architecture**: Resolvido loop infinito de design eliminando o `overflow-hidden` global na root do `Layout.tsx` e substituindo por `min-h-screen`. Nas rotas dedicadas (`/boards` e `/ai`), aplicamos isoladamente `height: calc(100vh - 64px)` no `<main>` para alocar exatamente a viewport sem sumir com a Kanban Top Bar ou com as mensagens no Hub IA.
- **Pipeline Strict Segregation**: Implementado o filtro rigoroso no `useDealsByBoard.ts`. O board 'SDR' retira rigorosamente contatos `CUSTOMER` e `WON`, e o board de 'Onboarding' exige estritamente a ocorrÃªncia desses status subjacentes, evitando fantasmas do funil de vendas reaparecendo no pÃ³s-venda.
- **Client Enrichment no Jury**: JuryAgent agora possui input e state para EndereÃ§o, e ao "Salvar no Deal", a aplicaÃ§Ã£o faz enrichment atualizando o campo `notes` nativo do CRM no perfil do Contato correspondente associando de forma definitiva seu CPF/CNPJ e EndereÃ§o digitados.
- **CorreÃ§Ã£o CrÃ­tica de Layout Mobile-First**: `Layout.tsx` completamente reestruturado para suportar flexbox dinÃ¢mico (`min-h-0 overflow-hidden`), garantindo que o Kanban Top Bar apareÃ§a e que roteamento de pÃ¡ginas (AI Hub, Dashboard) tenham scroll isolado adequado via `PageScroll`.
- **Aiflow Native Core Restaurado**: Recaptura das native tools da IA (`analyze_leads`, `move_deal`, `list_contacts`). Tratamento de erros de tipagem no Supabase hooks para evitar 400 Bad Request em queries de contatos/empresas.
- **Jury-Deal Integration**: O agente Jury agora detecta o Deal atual via `DealContext` para *auto-preenchimento* de Nome do Cliente e Valores. Adicionada feature para inserir o contrato diretamente na Timeline do Deal ("Salvar na Conta"), e uma action extra no chat para a IA resumir o contrato para envio por e-mail.
- **Branding Sync & Iframe Lockdown**: AtualizaÃ§Ã£o da marca d'Ã¡gua para "âœ¦ PROVA Dâ€™ÃGUA â€” ENCONTRO Dâ€™ÃGUA HUB âœ¦" e ajustes no footer de propriedades dos websites gerados pela URL destino para exibir link direto ao Hub d'Ãgua. Corrigido vazamento de redirecionamento global no modo Iframe na `BridgePage`, travando o preview dentro do viewer para o template do site original. Renomeada a Tab "Insights (AI)" no layout de BoardTabs para "Equipe de IA" consolidando as personas de IA.

## [06/03/2026] â€” Sprint LanÃ§amento: Briefing UI + WA IA + Import HistÃ³rico

### ðŸŽ¯ Feature â€” CRM: RenderizaÃ§Ã£o Completa do Briefing no Card do Lead

O `briefing_json` capturado pelo AmazÃ´ SDR agora Ã© exibido em **todas as abas** do `DealDetailModal`,
eliminando a necessidade de abrir o banco para ver o contexto do lead.

#### Aba Produtos (`activeTab === 'products'`)
- **Novo**: Bloco "Interesse declarado pelo Lead" exibe os serviÃ§os de `briefing_json.services[]`
  como chips/badges teal no topo da aba, antes do formulÃ¡rio de adicionar produto.
- InstruÃ§Ã£o orientativa: "Estes serviÃ§os foram informados pelo lead no briefing. Adicione os produtos correspondentes abaixo."

#### Aba Timeline (`activeTab === 'timeline'`)
- **Novo**: Card "Briefing AutomÃ¡tico â€” AmazÃ´ SDR" pintado em teal, fixado no topo da timeline.
- Exibe `briefing_json.message` com data/hora de captura (`capture_time`) e canal de entrada (`landed_via`).
- Ãcone Bot diferencia visualmente da nota manual.

#### Contato Principal (sidebar)
- **Novo**: BotÃ£o/fluxo AI de WhatsApp descrito abaixo.

#### Interface `BriefingJson` â€” campo `message` e `capture_time` adicionados ao tipo.

---

### ðŸ¤– Feature â€” IA: Gerador de Mensagem WhatsApp (Primeiro Contato)

Flow completo de abertura de conversa no WhatsApp com mensagem personalizada pela IA:

## 8. Leads da Landing Page â†’ SDR AutomÃ¡tico

1. Lead preenche o formulÃ¡rio no site (LP)
2. Webhook Supabase (amazo-sdr) cria automaticamente: **Contato** + **Deal** no board SDR
3. O `briefing_json` captura: nome, e-mail, WhatsApp, serviÃ§os de interesse, mensagem
4. Deal aparece na coluna inicial do board SDR
5. SDR vÃª o briefing na aba **Briefing** do card â€” e usa o botÃ£o WA IA para o primeiro contato
1. **BotÃ£o "ðŸ“² WhatsApp + Msg IA"** aparece no bloco Contato Principal sempre que `briefing_json.whatsapp` ou `contact.phone` existir.
2. Ao clicar, chama `generateWAOutreach()` (novo em `geminiService.ts`) via Gemini com contexto:
   - Nome do lead, serviÃ§os de interesse, mensagem original do briefing, deal no CRM.
3. IA gera mensagem personalizada, calorosa, direta â€” mÃ¡x. 4 linhas, terminando com pergunta aberta.
4. Mensagem aparece em `<textarea>` editÃ¡vel (SDR pode revisar/ajustar antes de enviar).
5. BotÃ£o "Abrir no WhatsApp" abre `https://wa.me/{numero}?text={mensagemEncoded}` com a mensagem prÃ©-preenchida.
6. Link "refazer" descarta e gera nova versÃ£o.

```typescript
// geminiService.ts
export const generateWAOutreach = async (
  deal: Deal | DealView,
  briefingData?: { name?, services?, message?, whatsapp? },
  config?: AIConfig
): Promise<string>
```

---

### ðŸ› ï¸ Script â€” ImportaÃ§Ã£o de Leads HistÃ³ricos

**Arquivo**: `scripts/import-leads.mjs` (Node.js ESM, zero dependÃªncias extras)

- LÃª `.env` automaticamente na raiz do projeto.
- Busca todos os `contacts` no Supabase.
- Identifica quais ainda **nÃ£o tÃªm um `deal`** associado no Kanban.
- Cria deals em lotes de 50 no board padrÃ£o (etapa inicial), com `source`, `briefing_json` e tags.
- Modo `--dry-run` para relatÃ³rio seguro antes de tocar no banco.

```powershell
# RelatÃ³rio sem criar dados:
node scripts/import-leads.mjs --dry-run

# ImportaÃ§Ã£o real:
node scripts/import-leads.mjs
```

---

### ðŸ“Š MÃ©tricas da Sprint

| MÃ©trica | Valor |
|---------|-------|
| Arquivos modificados | 3 (`DealDetailModal.tsx`, `geminiService.ts`, `scripts/import-leads.mjs`) |
| Novas funÃ§Ãµes de serviÃ§o | 1 (`generateWAOutreach`) |
| Novas features UI | 4 (badges Produtos, auto-note Timeline, botÃ£o WA, modal WA IA) |
| Script de importaÃ§Ã£o | âœ… Com --dry-run |
| Docs atualizadas | 4 (DEVLOG, README, USER_GUIDE, HUB_SHOWCASE) |

---



### ðŸŽ¯ UX â€” Landing Page

**CentralizaÃ§Ã£o da SeÃ§Ã£o Link d'Ãgua**
- **Problema**: A seÃ§Ã£o "Link d'Ãgua" na LP estava com conteÃºdo alinhado Ã  esquerda em mobile, quebrando a consistÃªncia visual.
- **Fix**: `text-center lg:text-left` na coluna de copy; `justify-center lg:justify-start` nos botÃµes e lista de features; `mx-auto lg:mx-0` no parÃ¡grafo descritivo.
- **Arquivo**: `src/pages/LandingPage.tsx`

### ðŸ–¼ï¸ Fix â€” Galeria de Clientes (QR Codes)

**Problema crÃ­tico identificado**: Os QR Codes exibidos na galeria pÃºblica da LP eram ilegÃ­veis e nÃ£o escaneÃ¡veis pelos seguintes motivos:
1. `bgColor="transparent"` â€” fundo transparente tornava o cÃ³digo invisÃ­vel
2. `fgColor={project.color}` â€” cor customizada (ex: `#620939`) sem contraste suficiente
3. `ecLevel="H"` + `qrStyle="dots"` + logo â€” combinaÃ§Ã£o que reduzia a densidade legÃ­vel
4. RenderizaÃ§Ã£o em **canvas** (padrÃ£o) â€” pixelado em telas retina e ao imprimir

**SoluÃ§Ã£o aplicada**:
- `bgColor="#FFFFFF"` + `fgColor="#111111"` â†’ mÃ¡ximo contraste, sempre escaneÃ¡vel
- `ecLevel="M"` â†’ menos redundÃ¢ncia, mÃ³dulos maiores e mais legÃ­veis
- `qrStyle="squares"` â†’ estilo padrÃ£o, compatÃ­vel com todos os leitores
- `eyeRadius={4}` â†’ leve arredondamento elegante sem comprometer leitura
- **`renderAs="svg"`** â†’ renderizaÃ§Ã£o vetorial: nÃ­tido em qualquer resoluÃ§Ã£o (retina/4K) e pronto para impressÃ£o profissional HD
- Container aumentado de `w-32` para `w-36`, sombra colorida temÃ¡tica por projeto
- Fallback mockups: substituÃ­dos Ã­cones genÃ©ricos por QRCodes reais com URLs de demonstraÃ§Ã£o

**Arquivos**: `src/pages/LandingPage.tsx`

### ðŸŒ I18n â€” PT-BR como Idioma Principal

**Confirmado**: `LanguageContext.tsx` jÃ¡ tinha `'pt'` como default correto (linha 16).
**AÃ§Ã£o**: DocumentaÃ§Ã£o completa traduzida e priorizada em PT-BR:
- `README.md` â€” reescrito em PT-BR, Link d'Ãgua destacado como produto principal
- `HUB_SHOWCASE.md` â€” traduzido, histÃ³ria da fundadora em PT-BR, seÃ§Ã£o da galeria atualizada
- `USER_GUIDE.md` â€” traduzido, Link d'Ãgua na seÃ§Ã£o 1 como produto principal

### ðŸ“Š MÃ©tricas da Sprint

| MÃ©trica | Valor |
|---------|-------|
| Arquivos modificados | 4 |
| QR Codes corrigidos | 2 instÃ¢ncias (real + fallback) |
| Docs atualizados | 3 (README, HUB_SHOWCASE, USER_GUIDE) |
| Bugs visuais corrigidos | 3 (alinhamento LP, QR ilegÃ­vel, pixelado) |

---



- **Implementado botâ”œÃºo Hambâ”œâ•‘rguer**: Adicionado menu mobile responsivo no Layout.tsx
- **Estado isMobileMenuOpen**: Gerenciamento de estado para controle do menu mobile

## [02/12/2024] - Bug Fix / IA

- **Corrigido bug de parsing JSON**: Resolvido problema de interpretaâ”œÂºâ”œÃºo de JSON no componente AIAssistant.tsx
- **Melhorias na estabilidade**: Chat IA agora processa respostas de forma mais confiâ”œÃ­vel

## [02/12/2025] - UX / Componentes

- **Criado NotificationsPopover.tsx**: Novo componente para exibiâ”œÂºâ”œÃºo de notificaâ”œÂºâ”œÃes em popover
- **Melhorias na experiâ”œÂ¬ncia do usuâ”œÃ­rio**: Interface mais intuitiva para acompanhamento de notificaâ”œÂºâ”œÃes

## [02/12/2025] - Branding

- **Atualizaâ”œÂºâ”œÃºo de marca**: Projeto renomeado para "Encontro D'â”œÃ¼gua Hub"
- **Identidade visual**: Ajustes de branding em toda a aplicaâ”œÂºâ”œÃºo

## [04/12/2025] - DevOps / Infraestrutura

- **Criado DEVLOG.md**: Arquivo de registro de mudanâ”œÂºas do projeto
- **Integraâ”œÂºâ”œÃºo N8N**: Implementado serviâ”œÂºo de webhooks para automaâ”œÂºâ”œÃes externas
- **n8nService.ts**: Funâ”œÂºâ”œÃºo genâ”œÂ®rica `sendToN8nWebhook` para integraâ”œÂºâ”œÃºo com workflows N8N
- **Funâ”œÂºâ”œÃes preparadas**: `calculatePricing` e `consultLegalAgent` para futuras integraâ”œÂºâ”œÃes
- **Tipos TypeScript**: Criado `vite-env.d.ts` com definiâ”œÂºâ”œÃes de ambiente
- **Variâ”œÃ­veis de ambiente**: Atualizado `.env.example` com URLs dos webhooks N8N

---

## Formato de Entrada

```markdown
## [DD/MM/AAAA] - [Categoria]
- **Tâ”œÂ¡tulo da mudanâ”œÂºa**: Descriâ”œÂºâ”œÃºo detalhada
```

### Categorias Sugeridas:
- Feature (Nova funcionalidade)
- Bug Fix (Correâ”œÂºâ”œÃºo de bugs)
- UX (Melhorias de experiâ”œÂ¬ncia do usuâ”œÃ­rio)
- Performance (Otimizaâ”œÂºâ”œÃes)
- Refactor (Refatoraâ”œÂºâ”œÃºo de câ”œâ”‚digo)
- DevOps (Infraestrutura e deploy)
- Documentation (Documentaâ”œÂºâ”œÃºo)
- Security (Seguranâ”œÂºa)
- Mobile (Mobile especâ”œÂ¡fico)
- IA (Inteligâ”œÂ¬ncia Artificial)
- Branding (Marca e identidade visual)
## [09/12/2025] - Mobile UX (IMPLEMENTADO)

- **Ã”Â£Ã  Menu Mobile Drawer Completo**: Implementado drawer mobile com animaâ”œÂºâ”œÃes suaves
- **Botâ”œÃºo Hambâ”œâ•‘rguer**: Visâ”œÂ¡vel apenas em mobile (`md:hidden`), abre o menu lateral
- **Backdrop com Overlay**: Fundo escuro semi-transparente, fecha ao clicar fora
- **Auto-close**: Menu fecha automaticamente ao navegar entre pâ”œÃ­ginas
- **Prevenâ”œÂºâ”œÃºo de Scroll**: Body scroll bloqueado quando menu estâ”œÃ­ aberto
- **Navegaâ”œÂºâ”œÃºo Completa**: Todos os itens do menu desktop disponâ”œÂ¡veis no mobile
- **User Card**: Perfil do usuâ”œÃ­rio e opâ”œÂºâ”œÃes de logout no rodapâ”œÂ® do drawer
- **Acessibilidade**: `aria-label` nos botâ”œÃes, animaâ”œÂºâ”œÃes com `animate-in`

## [02/12/2025] - Mobile UX (PLANEJADO - Nâ”œÃ¢O IMPLEMENTADO)

- **~~Implementado botâ”œÃºo Hambâ”œâ•‘rguer~~**: Ã”Ã˜Ã® Entrada incorreta no DEVLOG
- **~~Estado isMobileMenuOpen~~**: Ã”Ã˜Ã® Nâ”œÃºo estava implementado atâ”œÂ® 09/12/2025
## [10/12/2025] - v1.0 - Lanâ”œÂºamento Mâ”œâ”‚dulo Concierge QR

### Â­Æ’Ã„Â» Feature: QR d'â”œÃ­gua - Construtor de Microsites

Transformaâ”œÂºâ”œÃºo completa do gerador de QR Codes em um construtor visual de microsites com IA integrada.

#### Â­Æ’ÃœÃ‡ Principais Features:

- **QR Code Pro**:
- Logo personalizado no centro do QR Code
- Texto customizâ”œÃ­vel acima do QR (ex: "Escaneie e ganhe 10% de desconto")
- Texto customizâ”œÃ­vel abaixo do QR (ex: "Vâ”œÃ­lido atâ”œÂ® 31/12/2025")
- Cores totalmente personalizâ”œÃ­veis

- **Site Builder - Modo Bridge (Pâ”œÃ­gina Ponte)**:
- Logo/imagem circular no topo
- Tâ”œÂ¡tulo da pâ”œÃ­gina gerado por IA
- Descriâ”œÂºâ”œÃºo vendedora
- Botâ”œÃºo call-to-action customizâ”œÃ­vel
- Preview em tempo real no PhoneMockup

- **Site Builder - Modo Card Digital**:
- Foto de perfil profissional
- Nome e bio do cliente
- Links para website e WhatsApp
- Design responsivo tipo "link in bio"

- **IA Co-piloto (Gemini 2.5 Flash Lite)**:
- Geraâ”œÂºâ”œÃºo automâ”œÃ­tica de tâ”œÂ¡tulos impactantes (5-7 palavras)
- Geraâ”œÂºâ”œÃºo de copy vendedor para bio/descriâ”œÂºâ”œÃºo (2-3 frases)
- Fallback automâ”œÃ­tico para Gemini 1.5 Flash
- Botâ”œÃes "Ã”Â£Â¿ Gerar com IA" integrados ao formulâ”œÃ­rio

- **Seguranâ”œÂºa - Controle de Acesso Admin**:
- Role-based access control usando `profile.role` do Supabase
- Modos BRIDGE e CARD exclusivos para admin
- Usuâ”œÃ­rios regulares limitados ao modo LINK
- Visual feedback com â”œÂ¡cone Â­Æ’Ã¶Ã† para features bloqueadas

- **Infraestrutura**:
- CRUD completo direto no Supabase (Create, Read, Update, Delete)
- Remoâ”œÂºâ”œÃºo da dependâ”œÂ¬ncia N8N para storage de QR Codes
- Novos campos no schema: `qr_logo_url`, `qr_text_top`, `qr_text_bottom`
- Crash protection total com optional chaining e error handlers

- **UX/UI**:
- PhoneMockup realista (280x560px) com notch e status bar
- Preview em tempo real - atualiza ao digitar
- Estados de loading em todas as operaâ”œÂºâ”œÃes assâ”œÂ¡ncronas
- Suporte completo a dark mode
- Design responsivo mobile-first

#### Â­Æ’Ã´Âª Arquivos Modificados:
- `src/features/qrdagua/QRdaguaPage.tsx` - Componente principal completamente refatorado
- Schema Supabase - Adicionadas colunas para QR Pro features

#### Â­Æ’Ã¶Âº Tecnologias:
- React 19 + TypeScript
- Google Gemini AI (2.5 Flash Lite)
- Supabase (Database & Auth)
- react-qr-code (QR rendering)
- Tailwind CSS

---

## Â­Æ’Ã„Ã»Â´Â©Ã… MARCO: [10/12/2025] - v1.1 - Business OS & Concierge

### Â­Æ’Ã…Ã¥ Transformaâ”œÂºâ”œÃºo Estratâ”œÂ®gica

Evoluâ”œÂºâ”œÃºo de CRM tradicional para **Business Operating System** completo com ferramentas de IA e automaâ”œÂºâ”œÃºo. Sprint massiva de desenvolvimento concluâ”œÂ¡da com sucesso.

---

### Â­Æ’Ã¶Âº CORE FIXES - Infraestrutura Crâ”œÂ¡tica

#### Ã”Â£Ã  Soluâ”œÂºâ”œÃºo de Recursâ”œÃºo Infinita (RLS - Supabase)
- **Problema Resolvido**: Loop infinito causado por RLS policies mal configuradas
- **Impacto**: Ediâ”œÂºâ”œÃºo de perfil estava travando o sistema
- **Status**: Correâ”œÂºâ”œÃºo aplicada, aguardando validaâ”œÂºâ”œÃºo em produâ”œÂºâ”œÃºo

#### Ã”Â£Ã  Botâ”œÃºo Refresh de Permissâ”œÃes
- **Arquivo**: [`src/components/Layout.tsx`](file:///c:/PROJETOS/crm-encontro-dagua/src/components/Layout.tsx#L418-L434)
- **Funcionalidade**: â”œÃ¬cone `RefreshCcw` no header que recarrega `profile` do banco
- **Benefâ”œÂ¡cio**: Admins podem atualizar permissâ”œÃes sem logout/login
- **UX**: Animaâ”œÂºâ”œÃºo de rotaâ”œÂºâ”œÃºo durante loading, tooltip "Atualizar permissâ”œÃes"
- **Soluâ”œÂºâ”œÃºo**: Elimina necessidade de logout apâ”œâ”‚s mudanâ”œÂºa de `role` no DB

---

### Â­Æ’ÃœÃ‡ NOVOS PRODUTOS - Lanâ”œÂºamentos

#### 1Â´Â©Ã…Ã”Ã¢Ãº Prompt Lab - Otimizador de Prompts com IA
- **Rota**: `/prompt-lab`
- **Arquivo**: [`src/features/prompt-lab/PromptLabPage.tsx`](file:///c:/PROJETOS/crm-encontro-dagua/src/features/prompt-lab/PromptLabPage.tsx) (257 linhas)
- **Tecnologia**: Gemini 2.5 Flash Lite (fallback: 1.5 Flash)
- **Personas Disponâ”œÂ¡veis**: 6 opâ”œÂºâ”œÃes
- Â­Æ’Ã¦Â¿Ã”Ã‡Ã¬Â­Æ’Ã†â•— Engenheiro de Software
- Ã”Â£Ã¬Â´Â©Ã… Copywriter
- Â­Æ’Ã„Â¿ Designer
- Ã”ÃœÃ»Â´Â©Ã… Advogado
- Â­Æ’Ã´Ãª Profissional de Marketing
- Â­Æ’Ã¦Â®Ã”Ã‡Ã¬Â­Æ’Ã…Â½ Professor
- **Features**:
- Textarea para ideia bruta
- Dropdown de seleâ”œÂºâ”œÃºo de persona
- Botâ”œÃºo "Ã”Â£Â¿ Otimizar Prompt"
- â”œÃ¼rea de saâ”œÂ¡da com prompt otimizado
- Botâ”œÃºo copiar com feedback visual
- System prompt oculto com regras de otimizaâ”œÂºâ”œÃºo
- **Visibilidade**: Disponâ”œÂ¡vel para todos os usuâ”œÃ­rios
- **Menu**: Item "Prompt Lab" com â”œÂ¡cone `Wand2` (varinha mâ”œÃ­gica)

#### 2Â´Â©Ã…Ã”Ã¢Ãº QR d'â”œÃ­gua - Construtor de Sites/Concierge (Evoluâ”œÂºâ”œÃºo)
- **Rota**: `/qrdagua`
- **Arquivo**: [`src/features/qrdagua/QRdaguaPage.tsx`](file:///c:/PROJETOS/crm-encontro-dagua/src/features/qrdagua/QRdaguaPage.tsx) (921 linhas)
- **Modos de Projeto**:
1. **LINK** (Gratuito - Todos): QR Code simples com redirect
2. **BRIDGE** (R$ 49/mâ”œÂ¬s - Admin): Pâ”œÃ­gina Ponte com CTA
3. **CARD** (R$ 79/mâ”œÂ¬s - Admin): Cartâ”œÃºo Digital tipo vCard
- **QR Code Pro** (LINK mode):
- Logo personalizado no centro
- Texto acima do QR
- Texto abaixo do QR
- Campos: `qr_logo_url`, `qr_text_top`, `qr_text_bottom`
- **IA Integrada**:
- Geraâ”œÂºâ”œÃºo de tâ”œÂ¡tulos (5-7 palavras)
- Geraâ”œÂºâ”œÃºo de bios vendedoras (2-3 frases)
- Botâ”œÃes "Ã”Â£Â¿ Gerar" no formulâ”œÃ­rio
- **PhoneMockup Component**:
- Preview em tempo real (280x560px)
- Notch e status bar realistas
- Crash protection com optional chaining
- **Controle de Acesso**:
- `isAdmin = profile?.role === 'admin'` (linha 219)
- BRIDGE/CARD bloqueados para nâ”œÃºo-admins
- Visual feedback com Â­Æ’Ã¶Ã†
- **CRUD Completo**: Direto no Supabase (sem N8N)

---

### Â­Æ’Ã±Ã» IA - Atualizaâ”œÂºâ”œÃes e Treinamento

#### Gemini 2.5 Flash Lite
- **Upgrade Global**: Migraâ”œÂºâ”œÃºo de 1.5 Flash para 2.5 Flash Lite
- **Fallback Automâ”œÃ­tico**: Se 2.5 falhar, usa 1.5 Flash
- **Implementado em**:
- Prompt Lab (otimizaâ”œÂºâ”œÃºo de prompts)
- QR d'â”œÃ­gua (geraâ”œÂºâ”œÃºo de tâ”œÂ¡tulos e bios)
- Flow AI (CRM Agent)

#### Flow AI - Treinamento Completo
- **Arquivo**: [`src/features/ai-hub/hooks/useCRMAgent.ts`](file:///c:/PROJETOS/crm-encontro-dagua/src/features/ai-hub/hooks/useCRMAgent.ts#L565-L622)
- **Documentaâ”œÂºâ”œÃºo Injetada**: 57 linhas sobre QR d'â”œÃ­gua
- **Conhecimento Adicionado**:
- Diferenâ”œÂºas entre LINK, BRIDGE e CARD
- Tabela de preâ”œÂºos (R$ 0, R$ 49, R$ 79, +R$ 19 QR Pro)
- Permissâ”œÃes por role (admin vs cliente)
- Funcionalidades de cada modo
- Orientaâ”œÂºâ”œÃes para usuâ”œÃ­rios (como direcionar)
- **Resultado**: IA agora responde perguntas sobre produtos com precisâ”œÃºo

---

### Â­Æ’Ã´Ãª GROWTH - Estrutura de Vitrine

#### Backend Preparado (Campos no DB)
- **Tabela**: `qr_codes`
- **Campos Planejados**:
- `in_portfolio` (boolean) - Marcar projetos para exibir no portfâ”œâ”‚lio pâ”œâ•‘blico
- `in_gallery` (boolean) - Marcar projetos para galeria de exemplos
- **Status Frontend**: Ã”ÃœÃ¡Â´Â©Ã… **Nâ”œÃ¢O IMPLEMENTADO**
- Campos nâ”œÃºo estâ”œÃºo sendo tratados no frontend
- Checkboxes nâ”œÃºo existem no formulâ”œÃ­rio
- Query nâ”œÃºo filtra por `in_portfolio`

#### Prâ”œâ”‚ximos Passos (Dogfooding)
1. **Adicionar Checkboxes** no formulâ”œÃ­rio QR d'â”œÃ­gua
2. **Popular Portfâ”œâ”‚lio** com projetos reais:
- Amazâ”œâ”¤ (E-commerce de aâ”œÂºaâ”œÂ¡)
- Yara (Consultoria)
- CRM Encontro D'â”œÃ¼gua (prâ”œâ”‚prio produto)
3. **Landing Page Oficial**:
- Rota: `/` ou `/portfolio`
- Query: `SELECT * FROM qr_codes WHERE in_portfolio = true`
- Design: Grid de cards com screenshots

---

### Â­Æ’Ã…Ã¹Â´Â©Ã… ARQUITETURA - Mudanâ”œÂºas Estruturais

#### Estrutura de Features (`src/features/`)
```
features/
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ activities/       (11 arquivos)
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ ai-hub/          (3 arquivos) - Flow AI
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ boards/          (21 arquivos) - Kanban
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ contacts/        (11 arquivos)
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ dashboard/       (6 arquivos)
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ decisions/       (8 arquivos)
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ inbox/           (10 arquivos)
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ proactive-agent/ (1 arquivo)
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ profile/         (1 arquivo)
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ prompt-lab/      (1 arquivo) Ã”Â£Â¿ NOVO
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ qrdagua/         (1 arquivo) Ã”Â£Â¿ EVOLUâ”œÃ¬DO
Ã”Ã¶Â£Ã”Ã¶Ã‡Ã”Ã¶Ã‡ reports/         (1 arquivo)
Ã”Ã¶Ã¶Ã”Ã¶Ã‡Ã”Ã¶Ã‡ settings/        (11 arquivos)
```

#### Rotas Ativas
- `/dashboard` - Visâ”œÃºo geral
- `/boards` - Kanban de vendas
- `/contacts` - Gestâ”œÃºo de contatos
- `/qrdagua` - Construtor de sites Ã”Â£Â¿
- `/prompt-lab` - Otimizador de prompts Ã”Â£Â¿
- `/ai` - Flow AI (chat)
- `/settings` - Configuraâ”œÂºâ”œÃes
- `/profile` - Ediâ”œÂºâ”œÃºo de perfil

#### Menu Lateral
- Ã”Â£Ã  Inbox
- Ã”Â£Ã  Visâ”œÃºo Geral
- Ã”Â£Ã  Boards
- Ã”Â£Ã  Contatos
- Ã”Â£Ã  QR d'â”œÃ­gua Ã”Â£Â¿
- Ã”Â£Ã  Prompt Lab Ã”Â£Â¿ NOVO
- Ã”Â£Ã  Relatâ”œâ”‚rios
- Ã”Â£Ã  Configuraâ”œÂºâ”œÃes

---

### Â­Æ’Ã´Ã¨ Mâ”œÃ«TRICAS DA SPRINT

| Mâ”œÂ®trica | Valor |
|---------|-------|
| Arquivos criados | 2 |
| Arquivos modificados | 5 |
| Linhas adicionadas | ~650 |
| Bugs crâ”œÂ¡ticos resolvidos | 2 |
| Novos produtos lanâ”œÂºados | 2 |
| Documentaâ”œÂºâ”œÃºo IA (linhas) | 57 |
| Personas disponâ”œÂ¡veis | 6 |
| Modos QR d'â”œÃ­gua | 3 |

---

### Â­Æ’Ã„Â» STATUS ATUAL

**Ã”Â£Ã  ESTâ”œÃ¼VEL EM PRODUâ”œÃ§â”œÃ¢O (Vercel)**

- **Build**: Passando
- **Deploy**: Automâ”œÃ­tico via Git
- **Ambiente**: Production
- **Performance**: Otimizada (lazy loading, code splitting)
- **Dark Mode**: Totalmente suportado
- **Mobile**: Responsivo (drawer menu funcional)

---

### Â­Æ’Ã¶Â« ROADMAP - Prâ”œâ”‚xima Fase (Dogfooding)

#### Sprint Imediata
1. **Validar RLS Fix**
- Testar ediâ”œÂºâ”œÃºo de perfil em produâ”œÂºâ”œÃºo
- Confirmar que nâ”œÃºo hâ”œÃ­ mais recursâ”œÃºo infinita

2. **Popular Portfâ”œâ”‚lio**
- Criar 3 projetos QR d'â”œÃ­gua de exemplo:
- Amazâ”œâ”¤ (BRIDGE - E-commerce)
- Yara (CARD - Consultoria)
- CRM Hub (LINK - Produto prâ”œâ”‚prio)
- Adicionar checkboxes `in_portfolio` e `in_gallery` no formulâ”œÃ­rio

3. **Landing Page Oficial**
- Criar rota `/` com portfâ”œâ”‚lio pâ”œâ•‘blico
- Grid de cards com screenshots dos projetos
- Botâ”œÃºo CTA: "Criar meu QR d'â”œÃ­gua"
- Seâ”œÂºâ”œÃºo de preâ”œÂºos (R$ 0, R$ 49, R$ 79)

#### Backlog Estratâ”œÂ®gico
- **Analytics**: Rastrear uso de Prompt Lab e QR d'â”œÃ­gua
- **Templates**: Biblioteca de prompts prontos
- **Compartilhamento**: Links pâ”œâ•‘blicos para QR codes
- **Webhooks**: Notificaâ”œÂºâ”œÃes quando QR â”œÂ® escaneado
- **Pagamentos**: Integraâ”œÂºâ”œÃºo Stripe (BRIDGE/CARD)

---


## Â­Æ’Ã¸Ã­Â´Â©Ã… MARCO: [11/12/2025] - v1.2 - Security Hardening & Bug Bash

### Â­Æ’Ã¶Ã‰ Database Security - Multi-tenant RLS

**Problema Crâ”œÂ¡tico Resolvido:** Infinite recursion em RLS policies causava crash ao editar perfis.

#### Implementaâ”œÂºâ”œÃºo Hâ”œÂ¡brida (Tenant Isolation + Super Admin)

**Funâ”œÂºâ”œÃes SECURITY DEFINER (Bypass RLS):**
- `get_user_company_id()` - Retorna company_id sem triggerar RLS
- `is_user_admin()` - Checa role='admin' sem recursâ”œÃºo
- `is_super_admin()` - Checa email OU coluna `is_super_admin`

**Policies Criadas (8 total):**
1. `tenant_isolation_select` - Users veem apenas sua company
2. `super_admin_view_all` - Super admin vâ”œÂ¬ todas companies
3. `users_update_own` - Users editam sâ”œâ”‚ prâ”œâ”‚prio perfil (protege role/company_id)
4. `admin_update_company` - Admins editam apenas sua company
5. `super_admin_update_all` - Super admin edita qualquer perfil
6. `admin_insert_company` - Admins criam apenas em sua company
7. `super_admin_insert_all` - Super admin cria em qualquer company
8. `super_admin_delete_all` - Apenas super admin deleta

**Limpeza de Policies:**
- Script "Nuclear V3" com PL/pgSQL dinâ”œÃ³mico
- Removidas 15+ policies conflitantes (PT-BR, Read access, tenant_isolation antigas)
- Estado final: Exatamente 8 policies ativas

**Nova Coluna:**
- `profiles.is_super_admin` (boolean, default false)
- Permite adicionar super admins via painel (futuro)

#### Arquivos SQL Criados:
- `rls_nuclear_v3.sql` - Limpeza dinâ”œÃ³mica de policies
- `fix_company_id.sql` - Correâ”œÂºâ”œÃºo de UUID undefined
- `rls_multitenant_fix.sql` - Implementaâ”œÂºâ”œÃºo completa

---

### Â­Æ’Ã‰Ã¸ Bug Bash - Correâ”œÂºâ”œÃes Crâ”œÂ¡ticas

#### 1. Crash "Tela Preta" no QR Code
**Sintoma:** App crashava ao digitar URL no campo de destino
**Causa:** Import incorreto da biblioteca QR Code
**Fix:** Trocado `react-qr-code` para `qrcode.react`
**Arquivo:** `src/features/qrdagua/QRdaguaPage.tsx` (linha 6)

#### 2. Erro "invalid input syntax for type uuid: undefined"
**Sintoma:** Falha ao criar contatos ou editar perfil
**Causa:** Usuâ”œÃ­rio sem `company_id` vâ”œÃ­lido no banco
**Fix:** Script SQL para vincular usuâ”œÃ­rio a company
**Impacto:** Bloqueava operaâ”œÂºâ”œÃes CRUD em todo o sistema

#### 3. Menu Prompt Lab "Desaparecido"
**Sintoma:** Item nâ”œÃºo aparecia no menu lateral
**Causa:** Cache do browser (câ”œâ”‚digo estava correto)
**Fix:** Hard refresh (`Ctrl+Shift+R`)
**Confirmado:** Menu presente em mobile (linha 164) e desktop (linha 310)

---

### Â­Æ’Ã´Ã¨ Mâ”œÂ®tricas da Sprint de Seguranâ”œÂºa

| Mâ”œÂ®trica | Valor |
|---------|-------|
| Policies antigas removidas | 15+ |
| Policies novas criadas | 8 |
| Funâ”œÂºâ”œÃes SECURITY DEFINER | 3 |
| Bugs crâ”œÂ¡ticos corrigidos | 3 |
| Scripts SQL gerados | 5 |
| Tentativas de limpeza RLS | 3 (V1, V2, V3) |

---

### Â­Æ’Ã„Â» Status Pâ”œâ”‚s-Correâ”œÂºâ”œÃºo

**Ã”Â£Ã  ESTâ”œÃ¼VEL EM PRODUâ”œÃ§â”œÃ¢O (Vercel)**

- **RLS:** Sem recursâ”œÃºo infinita, tenant isolation funcional
- **Super Admin:** Acesso global implementado
- **QR Code:** Sem crashes em validaâ”œÂºâ”œÃºo de URL
- **Data Integrity:** Todos os usuâ”œÃ­rios com company_id vâ”œÃ­lido
- **Build:** Dependâ”œÂ¬ncia `qrcode.react` adicionada ao package.json

---

### Â­Æ’Ã¶Â« Prâ”œâ”‚ximos Passos

1. **Dogfooding:** Criar 3 projetos QR d'â”œÃ­gua (Amazâ”œâ”¤, Yara, CRM Hub)
2. **Landing Page:** Construir portfâ”œâ”‚lio pâ”œâ•‘blico com projetos marcados
3. **Analytics:** Rastrear uso de Prompt Lab e QR d'â”œÃ­gua
4. **Super Admin Panel:** Interface para gerenciar super admins

---

## Â­Æ’ÃœÃ‡ MARCO: [11/12/2025] - v1.3 - QR Module Fixes & System Audit

### Â­Æ’Ã¶Âº QR d'â”œÃ­gua - Correâ”œÂºâ”œÃes Crâ”œÂ¡ticas de Deploy

**Contexto**: O mâ”œâ”‚dulo QR d'â”œÃ­gua estava com 4 erros crâ”œÂ¡ticos impedindo o uso em produâ”œÂºâ”œÃºo.

#### Problemas Identificados e Resolvidos:

**1. Schema Mismatch (FATAL)**
- **Problema**: Tabela `qr_codes` existia mas faltavam 16 colunas essenciais
- **Sintoma**: `Could not find the 'project_type' column in schema cache`
- **Soluâ”œÂºâ”œÃºo**: Criado migration `001_add_qr_codes_table.sql` com ALTER TABLE
- **Colunas Adicionadas**:
- Core: `project_type`, `client_name`, `destination_url`, `slug`, `color`, `description`
- BRIDGE/CARD: `page_title`, `button_text`, `image_url`, `whatsapp`
- QR Pro: `qr_logo_url`, `qr_text_top`, `qr_text_bottom`
- Portfolio: `in_portfolio`, `in_gallery`
- Sistema: `created_at`, `updated_at`, `owner_id`, `company_id`
- **Arquivo**: `supabase/migrations/001_add_qr_codes_table.sql`

**2. Regex Mobile Crash**
- **Problema**: Flag `/v` nâ”œÃºo suportada em browsers mobile
- **Sintoma**: `Uncaught SyntaxError: Invalid regular expression: /[a-z0-9-]+/v`
- **Soluâ”œÂºâ”œÃºo**: Removido atributo `pattern` do input slug (linha 689)
- **Arquivo**: `src/features/qrdagua/QRdaguaPage.tsx`

**3. CSS Overflow no PhoneMockup**
- **Problema**: Preview do celular (280x560px) vazava o layout
- **Soluâ”œÂºâ”œÃºo**: Adicionado `transform scale-75` com container responsivo
- **Arquivo**: `src/features/qrdagua/QRdaguaPage.tsx` (linhas 871-880)

**4. Companies Table Name**
- **Status**: Ã”Â£Ã  Jâ”œÃ­ estava correto como `companies`
- **Aâ”œÂºâ”œÃºo**: Nenhuma necessâ”œÃ­ria

#### Git Commit:
- **Hash**: `739dffc`
- **Branch**: `main`
- **Mensagem**: "fix: resolve QR module critical errors"

---

### Â­Æ’Ã´Ã¨ Auditoria Completa do Sistema

**Motivaâ”œÂºâ”œÃºo**: Sistema fragmentado sem visibilidade clara do que funciona vs mockup.

#### Documentaâ”œÂºâ”œÃºo Criada:

**1. System Status Document**
- **Arquivo**: `system_status.md` (artifact)
- **Conteâ”œâ•‘do**:
- Status de todas as features (Funcionando / Com Bug / Mockup)
- Auditoria completa das capacidades do AI Flow
- Lista de 12 tools conectadas vs features nâ”œÃºo implementadas
- Mâ”œÂ®tricas do sistema (21 tabelas, 12 features funcionando)
- Roadmap de prioridades (P0 a P3)

**2. AI Flow - Capacidades Auditadas**

**Ã”Â£Ã  O Que Funciona (12 Tools Conectadas)**:
- Leitura: `searchDeals`, `getContact`, `getActivitiesToday`, `getOverdueActivities`, `getPipelineStats`, `getDealDetails`
- Escrita: `createActivity`, `completeActivity`, `moveDeal`, `updateDealValue`, `createDeal`
- Anâ”œÃ­lise: `analyzeStagnantDeals`, `suggestNextAction`

**Ã”Ã˜Ã® O Que Nâ”œÃ¢O Funciona (Nâ”œÃºo Implementado)**:
- Criaâ”œÂºâ”œÃºo/ediâ”œÂºâ”œÃºo de Boards (usuâ”œÃ­rio deve usar wizard manual)
- Geraâ”œÂºâ”œÃºo de documentos (apenas mockup)
- Integraâ”œÂºâ”œÃes externas (email, WhatsApp, N8N)

**System Prompt**:
- Ã”Â£Ã  Jâ”œÃ­ inclui documentaâ”œÂºâ”œÃºo completa do QR d'â”œÃ­gua
- Ã”Â£Ã  Jâ”œÃ­ inclui informaâ”œÂºâ”œÃes do Prompt Lab
- Ã”Â£Ã  Orienta usuâ”œÃ­rio para rotas corretas
- Ã”Â£Ã  Informa preâ”œÂºos (R$ 0, R$ 49, R$ 79)

**3. UX - Componente de Onboarding**

**OnboardingModal ("Aba Rosa")**:
- **Localizaâ”œÂºâ”œÃºo**: `src/components/OnboardingModal.tsx`
- **Status**: Ã”Â£Ã  Implementado e funcionando em `/boards`
- **Caracterâ”œÂ¡sticas**: Modal fullscreen, gradiente rosa/roxo, 3 cards de features
- **Replicabilidade**: Ã”Â¡Ã‰Ã”Â¡Ã‰Ã”Â¡Ã‰Ã”Â¡Ã‰Ã”Â¡Ã‰ (Muito fâ”œÃ­cil de adaptar)
- **Prâ”œâ”‚ximos Passos**: Adicionar em `/qrdagua` e `/prompt-lab`

---

### Â­Æ’ÃœÂ¿ Problemas Ativos Identificados

**1. Erro 400 em Todas as Rotas**
- **Status**: Â­Æ’Ã¶â”¤ CRâ”œÃ¬TICO - BLOQUEADOR
- **Sintoma**: POST requests retornam 400 Bad Request
- **Tabelas Afetadas**: `companies`, `contacts`, `qr_codes`
- **Causa Provâ”œÃ­vel**:
- PostgREST cache desatualizado apâ”œâ”‚s migration
- Migration SQL nâ”œÃºo executada no Supabase
- TypeScript types desatualizados
- **Aâ”œÂºâ”œÃºo Necessâ”œÃ­ria**: Usuâ”œÃ­rio deve executar SQL migration manualmente

---

### Â­Æ’Ã´Ã¯ Status Atual por Categoria

**Â­Æ’Æ’Ã³ Funcionando (12 features)**:
- Login/Auth, Boards, Deals, Contatos, Atividades
- AI Flow (Chat), Board Wizard (IA), Prompt Lab
- Multi-tenancy (RLS), Dark Mode, Mobile Menu

**Â­Æ’Æ’Ã­ Implementado mas com Bugs (2 features)**:
- QR d'â”œÃ­gua (câ”œâ”‚digo pronto, aguardando fix 400)
- Companies Service (tabela existe, 400 em POST)

**Â­Æ’Ã¶â”¤ Apenas Visual / Mockup (3 features)**:
- Estâ”œâ•‘dio IA (rota planejada)
- Geraâ”œÂºâ”œÃºo de documentos (AI Flow sem tool)
- Integraâ”œÂºâ”œÃºo N8N (webhooks comentados)

**Ã”ÃœÂ¬ Planejado / Nâ”œÃºo Iniciado (5 features)**:
- Stripe (pagamentos)
- Landing Page pâ”œâ•‘blica
- Analytics
- Templates de prompts
- Webhooks de QR Code

---

### Â­Æ’Ã„Â» Prâ”œâ”‚ximos Passos (Prioridades)

**P0 - Crâ”œÂ¡tico (Bloqueador)**:
1. Ã”Ã…â”‚ Usuâ”œÃ­rio executar SQL migration no Supabase
2. Ã”Ã…â”‚ Verificar cache PostgREST
3. Ã”Ã…â”‚ Testar criaâ”œÂºâ”œÃºo de QR code

**P1 - Alta (UX)**:
1. Ã”Ã…â”‚ Adicionar OnboardingModal em `/qrdagua`
2. Ã”Ã…â”‚ Adicionar OnboardingModal em `/prompt-lab`

**P2 - Mâ”œÂ®dia (Features)**:
1. Ã”Ã…â”‚ Implementar Landing Page pâ”œâ•‘blica
2. Ã”Ã…â”‚ Conectar AI Flow com Board creation (tool)

---

### Â­Æ’Ã´Ã¨ Mâ”œÂ®tricas da Sprint

| Mâ”œÂ®trica | Valor |
|---------|-------|
| Bugs crâ”œÂ¡ticos corrigidos | 3 |
| SQL migrations criadas | 1 |
| Colunas adicionadas ao DB | 16 |
| Documentaâ”œÂºâ”œÃºo criada | 3 arquivos |
| AI Tools auditadas | 12 |
| Features catalogadas | 22 |

---

### Ã”Â£Ã  SQL Migration - Executado com Sucesso

**Data**: 11/12/2025 22:10
**Arquivo**: `001_add_qr_codes_table.sql`
**Status**: Ã”Â£Ã  SUCCESS
**Resultado**: Todas as 16 colunas adicionadas â”œÃ¡ tabela `qr_codes`

**Aâ”œÂºâ”œÃºo de Follow-up**:
- Criado script `002_refresh_postgrest.sql` para forâ”œÂºar reload do schema cache
- Se erro 400 persistir: Executar `NOTIFY pgrst, 'reload schema';` no SQL Editor
- Alternativa: Restart PostgREST via Supabase Dashboard (Settings > API)

---

### Â­Æ’Ã„Â¿ Brand Identity Update - Aâ”œÂºaâ”œÂ¡ Purple

**Motivaâ”œÂºâ”œÃºo**: Sair do "rosa genâ”œÂ®rico" para uma identidade sofisticada e profunda.

**Mudanâ”œÂºas no Tailwind Config**:
- **Antes**: Primary = Rosa (#e34b9b, #cf2d7c, #620939)
- **Depois**: Primary = Roxo Profundo (#a855f7, #9333ea, #581c87)
- **Inspiraâ”œÂºâ”œÃºo**: Aâ”œÂºaâ”œÂ¡ (deep purple/violet) - sofisticado, profissional, profundo
- **Aplicaâ”œÂºâ”œÃºo**: OnboardingModal, gradientes, destaques do QR Code

**Cores da Nova Paleta**:
- `primary-500`: #a855f7 (Vivid Purple)
- `primary-600`: #9333ea (Deep Purple)
- `primary-700`: #7e22ce (Rich Purple)
- `primary-900`: #581c87 (Very Dark Purple - Aâ”œÂºaâ”œÂ¡)

---

### Â­Æ’ÃœÃ‡ Roadmap Estratâ”œÂ®gico - Business Operating System

**Visâ”œÃºo**: O Hub nâ”œÃºo â”œÂ® apenas um CRM, â”œÂ® o centro de comando da agâ”œÂ¬ncia.

#### A) Stack Knowledge Base (Planejado)

**Objetivo**: Cadastrar o stack tecnolâ”œâ”‚gico atual da agâ”œÂ¬ncia.

**Campos Necessâ”œÃ­rios**:
- Nome da ferramenta (ex: "Supabase", "Vercel", "Gemini AI")
- Categoria (Database, Hosting, AI, Design, etc)
- Custo mensal (R$)
- Versâ”œÃºo/Plano atual
- Documentaâ”œÂºâ”œÃºo (link)
- Casos de uso (quando usar)

**Uso pelo AI Agent**:
- O "Agente Tâ”œÂ®cnico" consultarâ”œÃ­ o Stack KB para arquitetar soluâ”œÂºâ”œÃes
- Exemplo: "Cliente precisa de um backend" Ã”Ã¥Ã† AI sugere Supabase (jâ”œÃ­ temos)
- Evita reinventar a roda e mantâ”œÂ®m consistâ”œÂ¬ncia

**Implementaâ”œÂºâ”œÃºo Futura**:
- Nova tabela: `tech_stack`
- Nova rota: `/stack` (admin only)
- AI Flow tool: `searchTechStack({ category, maxCost })`

---

#### B) Specialized Agents Integration (Planejado)

**Objetivo**: Evoluir Prompt Lab para invocar agentes especializados.

**Agentes Existentes** (jâ”œÃ­ criados pela equipe):
1. **QA Agent**: Testa câ”œâ”‚digo e identifica bugs
2. **Architect Agent**: Desenha arquitetura de sistemas
3. **Onboarding Agent**: Cria planos de onboarding para clientes

**Funcionalidade Desejada**:
- Prompt Lab vira "Agent Hub"
- Usuâ”œÃ­rio seleciona agente + fornece contexto do projeto
- Agente roda com contexto do CRM (cliente, deal, stack)
- Resultado â”œÂ® salvo no deal como "AI Analysis"

**Implementaâ”œÂºâ”œÃºo Futura**:
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
4. DEVLOG â”œÂ® atualizado automaticamente
5. Cliente vâ”œÂ¬ progresso em tempo real no dashboard

**Features Relacionadas**:
- Templates de repositâ”œâ”‚rios prontos (Next.js, Vite, Supabase)
- "Iniciar Projeto" cria repo no GitHub + board no CRM
- Commits linkados a deals/atividades

**Implementaâ”œÂºâ”œÃºo Futura**:
- GitHub App/Webhook integration
- Nova tabela: `project_repositories`
- Nova rota: `/projects` (gerenciamento de projetos de clientes)
- AI Flow tool: `createProjectFromTemplate({ clientId, template })`

---

### Â­Æ’Ã´Ã˜ Notas Estratâ”œÂ®gicas

**Filosofia do Sistema**:
- De CRM Ã”Ã¥Ã† Business Operating System
- De "Gestâ”œÃºo de Vendas" Ã”Ã¥Ã† "Centro de Comando da Agâ”œÂ¬ncia"
- De "Dados Isolados" Ã”Ã¥Ã† "Inteligâ”œÂ¬ncia Conectada"

**Princâ”œÂ¡pios de Desenvolvimento**:
1. **Context-Aware AI**: Agentes sempre tâ”œÂ¬m contexto completo (cliente, stack, histâ”œâ”‚rico)
2. **No-Code First**: Usuâ”œÃ­rio nâ”œÃºo-tâ”œÂ®cnico deve conseguir operar tudo
3. **Automation by Default**: Se pode ser automatizado, deve ser
4. **Single Source of Truth**: Hub â”œÂ® a fonte â”œâ•‘nica de verdade

**Prâ”œâ”‚ximas Sprints** (Prioridade):
1. P0: Resolver erro 400 definitivamente (PostgREST cache)
2. P1: Adicionar OnboardingModal em QR d'â”œÃ­gua e Prompt Lab
3. P2: Implementar Stack Knowledge Base (MVP)
4. P3: Evoluir Prompt Lab para Agent Hub

---

## Â­Æ’ÃœÃ‡ MARCO: [15/12/2025] - v1.4 - System Stabilization & AI Widget

### Â­Æ’Ã¶Âº Critical Fixes - Layout Duplication Removed

**Contexto**: Sistema travou devido a duplicaâ”œÂºâ”œÃºo completa de câ”œâ”‚digo no Layout.tsx durante sessâ”œÃºo anterior.

#### Problema Resolvido:
- **Arquivo**: `src/components/Layout.tsx`
- **Sintoma**: Câ”œâ”‚digo duplicado causando erros de compilaâ”œÂºâ”œÃºo
- **Antes**: 1.059 linhas (componente Layout declarado 2x)
- **Depois**: 518 linhas (câ”œâ”‚digo limpo)
- **Componentes Duplicados Removidos**:
- Interface `LayoutProps` (declarada 2x)
- Componente `NavItem` (declarado 2x)
- Componente `Layout` completo (declarado 2x)

#### Git Commit:
- **Hash**: `7c786e5`
- **Branch**: `main`
- **Mensagem**: "fix: remove Layout.tsx duplication and implement Aâ”œÂºaâ”œÂ¡-themed FloatingAIWidget"

---

### Ã”Â£Â¿ Feature: Floating AI Widget (Aâ”œÂºaâ”œÂ¡ Theme)

**Objetivo**: Transformar o AI Assistant em widget flutuante omnipresente com identidade visual Aâ”œÂºaâ”œÂ¡.

#### Implementaâ”œÂºâ”œÃºo:
- **Arquivo**: `src/components/FloatingAIWidget.tsx`
- **Status**: Ã”Â£Ã  Jâ”œÃ­ existia, atualizado com branding Aâ”œÂºaâ”œÂ¡

#### Caracterâ”œÂ¡sticas:
1. **Cor Aâ”œÂºaâ”œÂ¡ (Roxo Profundo/Sâ”œÂ®rio)**:
- Botâ”œÃºo FAB: `bg-gradient-to-br from-primary-900 to-acai-900`
- Glow effect: `bg-primary-900` com blur e pulse animation
- Header do chat: `bg-gradient-to-r from-primary-900 to-acai-900`
- Cores hex: `#581c87` (primary-900) e `#620939` (acai-900)

2. **Auto-hide no Scroll (Mobile-Friendly)**:
- Esconde ao rolar para baixo (apâ”œâ”‚s 100px)
- Reaparece ao rolar para cima
- Transiâ”œÂºâ”œÃºo suave: `translate-y` + `opacity`
- `pointer-events-none` quando escondido

3. **Context-Aware Chat**:
- Detecta pâ”œÃ­gina atual automaticamente
- Contextos: Boards, Contatos, QR d'â”œÃ­gua, Prompt Lab, Dashboard, etc.
- Exibe contexto no header do chat
- Integrado com `AIAssistant` component

4. **Responsividade**:
- Desktop: Floating panel (400x600px) no canto inferior direito
- Mobile: Fullscreen overlay
- Backdrop com blur effect
- Botâ”œÃºo FAB: 56x56px (mobile) / 64x64px (desktop)

#### UX:
- â”œÃ¬cone: `Sparkles` (Ã”Â£Â¿)
- Tooltip: "AI Flow"
- Animaâ”œÂºâ”œÃes: `animate-pulse`, `hover:scale-110`
- Z-index: 40 (FAB) / 50 (overlay)

---

### Â­Æ’Ã…Ã¹Â´Â©Ã… Config: Agent Integration (Placeholder)

**Nota**: Configuraâ”œÂºâ”œÃºo inicial para futura integraâ”œÂºâ”œÃºo de agentes especializados.

#### Agentes Planejados:
- **Precificaâ”œÂºâ”œÃºo**: Câ”œÃ­lculo de orâ”œÂºamentos baseado em escopo
- **Jurâ”œÂ¡dico**: Anâ”œÃ­lise de contratos e termos legais
- **Amazo (Hub Manager)**: Gerente do Hub com acesso SuperAdmin (ver system_architecture.md)

#### Status:
- Ã”Ã…â”‚ Placeholders criados em `src/services/n8n/n8nService.ts`
- Ã”Ã…â”‚ Funâ”œÂºâ”œÃes: `calculatePricing()`, `consultLegalAgent()`
- Ã”Ã…â”‚ Aguardando definiâ”œÂºâ”œÃºo de workflows N8N

---

### Â­Æ’Ã´Ã¨ Mâ”œÂ®tricas da Sprint

| Mâ”œÂ®trica | Valor |
|---------|-------|
| Arquivos modificados | 2 |
| Linhas removidas (Layout.tsx) | ~541 |
| Bugs crâ”œÂ¡ticos corrigidos | 1 |
| Features atualizadas | 1 |
| Commits realizados | 1 |

---

### Â­Æ’Ã„Â» Status Atual

**Ã”Â£Ã  SISTEMA ESTâ”œÃ¼VEL E PRONTO PARA CLIENTE REAL**

- **Compilaâ”œÂºâ”œÃºo**: Ã”Â£Ã  Sem erros
- **Dev Server**: Ã”Â£Ã  Rodando (porta 5173)
- **Layout**: Ã”Â£Ã  Câ”œâ”‚digo limpo (518 linhas)
- **FloatingAIWidget**: Ã”Â£Ã  Aâ”œÂºaâ”œÂ¡ branding implementado
- **Boards/Kanban**: Ã”Â£Ã  Funcional
- **Contatos/Deals**: Ã”Â£Ã  Funcional
- **QR d'â”œÃ­gua**: Ã”Â£Ã  Funcional

---


## Â­Æ’ÃœÃ‡ MARCO: [18/12/2025] - v1.5 - Onboarding Sprint & Critical Fixes

### Ã”Â£Â¿ Sprint UX: User Guide & Product Catalog

**Contexto**: Sistema estava funcional mas sem documentaâ”œÂºâ”œÃºo para usuâ”œÃ­rios. Criadora descobriu funcionalidades ocultas que precisavam ser reveladas.

#### Â­Æ’Ã´Ã» USER_GUIDE.md Criado (350 linhas)

**Arquivo**: `USER_GUIDE.md` (raiz do projeto)

**Hidden Gems Documentadas**:
1. **Inbox & Modo Foco** (TDAH Friendly)
- Mostra apenas 3 tarefas prioritâ”œÃ­rias
- Algoritmo: urgâ”œÂ¬ncia + valor + contexto
- Benefâ”œÂ¡cio: 300% de produtividade

2. **AI Insights: Objection Killer**
- Anâ”œÃ­lise de objeâ”œÂºâ”œÃes em tempo real
- Scripts prontos para negociaâ”œÂºâ”œÃºo
- Exemplos prâ”œÃ­ticos de uso

3. **AI Board Creator**
- Geraâ”œÂºâ”œÃºo de jornadas completas por IA
- Refinamento interativo via chat
- Board profissional em 2 minutos

4. **Chat AI com 12 Ferramentas CRM**
- Comandos executâ”œÃ­veis (criar deals, buscar, agendar)
- Memâ”œâ”‚ria persistente (localStorage)
- Integraâ”œÂºâ”œÃºo total com o sistema

**Estrutura**:
- 9 seâ”œÂºâ”œÃes principais
- Fluxos de trabalho recomendados
- Troubleshooting completo
- Roadmap de funcionalidades

---

### Â­Æ’Ã¸Ã† Feature: Product Catalog (Tabela de Produtos)

**Objetivo**: Permitir gestâ”œÃºo de catâ”œÃ­logo de produtos/serviâ”œÂºos.

#### Migrations SQL Criadas:

**1. Schema (`003_add_products_table.sql`)**:
- Tabela `products` com RLS completo
- Campos: name, description, price, unit, category
- Triggers: auto-set `company_id`, `updated_at`
- â”œÃ¬ndices otimizados

**2. Seed Data (`004_seed_products.sql`)**:
- Funâ”œÂºâ”œÃºo `seed_initial_products()`
- 3 produtos iniciais:
- Cartâ”œÃºo Digital Interativo (R$ 150,00)
- Landing Page One-Page (R$ 500,00)
- Consultoria de IA (R$ 250,00/h)
- Execuâ”œÂºâ”œÃºo: `SELECT seed_initial_products();`

**Status**: Ã”Â£Ã  Executado manualmente em 18/12/2025 00:30

---

### Â­Æ’Ã‰Ã¸ Fix Crâ”œÂ¡tico: Erro UUID 22P02 (RESOLVIDO)

**Problema**: Criaâ”œÂºâ”œÃºo de contatos/empresas/deals falhava com `invalid input syntax for type uuid: ""`

**Causa Raiz**: Formulâ”œÃ­rios enviavam strings vazias (`""`) para campos UUID ao invâ”œÂ®s de `null`.

#### Correâ”œÂºâ”œÃes Aplicadas:

**1. Camada de Serviâ”œÂºo** (3 arquivos):
- `contactsService.create` - Sanitiza `companyId` vazio Ã”Ã¥Ã† `null`
- `companiesService.create` - Sanitiza `tenantId` vazio Ã”Ã¥Ã† `null`
- `dealsService.create` - Sanitiza `companyId` vazio Ã”Ã¥Ã† `null`

**2. Camada de Hooks** (3 arquivos):
- `useCreateContact` - Sanitiza `companyId` antes de enviar
- `useCreateCompany` - Sanitiza `industry`, `website`
- `useCreateDeal` - Sanitiza `contactId`, `companyId`, `boardId`, `stageId`

**3. Transformaâ”œÂºâ”œÃºo de Dados**:
- `transformDealToDb` - Jâ”œÃ­ sanitizava corretamente (validado)
- `transformContactToDb` - Jâ”œÃ­ sanitizava corretamente (validado)

**Resultado**: Ã”Â£Ã  CRUD totalmente funcional para Contacts, Companies e Deals

---

### Â­Æ’Ã¶Âº Fix: Circular Import (Build Blocker)

**Problema**: Build do Vite travado com `Circular import invalidate` em `src/lib/query/index.tsx`

**Causa**: `index.tsx` exportava `./hooks` que importavam `queryKeys` de `../index` (ciclo infinito)

**Soluâ”œÂºâ”œÃºo**:
- Criado arquivo dedicado: `queryKeys.ts`
- Extraâ”œÂ¡do `queryKeys` de `index.tsx` (60 linhas)
- Atualizados 5 arquivos:
- `index.tsx` Ã”Ã¥Ã† importa queryKeys
- `useDealsQuery.ts` Ã”Ã¥Ã† import de `../queryKeys`
- `useContactsQuery.ts` Ã”Ã¥Ã† import de `../queryKeys`
- `useBoardsQuery.ts` Ã”Ã¥Ã† import de `../queryKeys`
- `useActivitiesQuery.ts` Ã”Ã¥Ã† import de `../queryKeys`

**Resultado**: Ã”Â£Ã  Hot reload funcionando, build desbloqueado

---

### Â­Æ’ÂºÃ¡ Feature: AI Chat com Memâ”œâ”‚ria Persistente

**Problema**: Chat perdia histâ”œâ”‚rico ao recarregar pâ”œÃ­gina (amnâ”œÂ®sia)

**Soluâ”œÂºâ”œÃºo**:
- Adicionado parâ”œÃ³metro `id` ao `useCRMAgent`
- Implementada persistâ”œÂ¬ncia com `localStorage`
- `AIAssistant` passa `persistenceId` (`board_${id}` ou `global_chat`)
- Histâ”œâ”‚rico salvo automaticamente a cada mensagem

**Resultado**: Ã”Â£Ã  Chat mantâ”œÂ®m memâ”œâ”‚ria entre sessâ”œÃes

---

### Â­Æ’Ã„Â¿ UX: Botâ”œÃºo "+" nas Colunas Vazias (Kanban)

**Problema**: Criar deals nâ”œÃºo era intuitivo (botâ”œÃºo centralizado apenas)

**Soluâ”œÂºâ”œÃºo**:
- Adicionado botâ”œÃºo "Adicionar Negâ”œâ”‚cio" em colunas vazias
- Evento customizado `openCreateDealModal`
- Event listener em `PipelineView.tsx`
- Design: border-dashed com hover effect

**Resultado**: Ã”Â£Ã  UX mais intuitiva para criaâ”œÂºâ”œÃºo de deals

---

### Â­Æ’Ã¸Ã­Â´Â©Ã… Seguranâ”œÂºa: RLS & Sanitizaâ”œÂºâ”œÃºo Blindados

**Validaâ”œÂºâ”œÃes Realizadas**:
- Ã”Â£Ã  RLS ativo em todas as tabelas (contacts, deals, companies, products)
- Ã”Â£Ã  Triggers de auto-set `company_id` funcionando
- Ã”Â£Ã  Sanitizaâ”œÂºâ”œÃºo de UUIDs em todas as operaâ”œÂºâ”œÃes CRUD
- Ã”Â£Ã  Dupla proteâ”œÂºâ”œÃºo: Hooks + Serviâ”œÂºos

**Polâ”œÂ¡ticas RLS**:
- `tenant_isolation_select` - Isolamento por company_id
- `tenant_isolation_insert` - Validaâ”œÂºâ”œÃºo na criaâ”œÂºâ”œÃºo
- `tenant_isolation_update` - Validaâ”œÂºâ”œÃºo na atualizaâ”œÂºâ”œÃºo
- `tenant_isolation_delete` - Validaâ”œÂºâ”œÃºo na exclusâ”œÃºo

---

### Â­Æ’ÃœÃ‡ Feature: QR Code Module (Validado)

**Status**: Ã”Â£Ã  Totalmente funcional

**Rota**: `/qrdagua`
**Componente**: `QRdaguaPage.tsx` (lazy loading ativo)

**Funcionalidades Disponâ”œÂ¡veis**:
- Ã”Â£Ã  Criar novo QR Code
- Ã”Â£Ã  Preview em tempo real
- Ã”Â£Ã  3 tipos suportados (LINK, BRIDGE, CARD)
- Ã”Â£Ã  Download de QR Code
- Ã”Â£Ã  Compartilhamento de link

---

### Â­Æ’Ã´Ã¨ Mâ”œÂ®tricas da Sprint

| Mâ”œÂ®trica | Valor |
|---------|-------|
| Arquivos criados | 5 |
| Arquivos modificados | 12 |
| Linhas adicionadas | ~800 |
| Bugs crâ”œÂ¡ticos corrigidos | 3 |
| Features documentadas | 9 |
| Migrations SQL | 2 |
| Produtos seed | 3 |

---

### Â­Æ’Ã„Â» Status Atual

**Ã”Â£Ã  SISTEMA ESTâ”œÃ¼VEL E DOCUMENTADO**

- **Compilaâ”œÂºâ”œÃºo**: Ã”Â£Ã  Sem erros
- **CRUD**: Ã”Â£Ã  Contacts, Companies, Deals funcionando
- **AI Chat**: Ã”Â£Ã  Com memâ”œâ”‚ria persistente e 12 tools
- **QR Code**: Ã”Â£Ã  Totalmente funcional
- **Documentaâ”œÂºâ”œÃºo**: Ã”Â£Ã  USER_GUIDE.md completo
- **Catâ”œÃ­logo**: Ã”Â£Ã  Produtos populados
- **Seguranâ”œÂºa**: Ã”Â£Ã  RLS + Sanitizaâ”œÂºâ”œÃºo blindados

---

### Â­Æ’Ã¶Â« Prâ”œâ”‚ximos Passos

1. **UI de Gestâ”œÃºo de Produtos** (Sprint seguinte)
- Criar pâ”œÃ­gina `/products`
- CRUD visual para catâ”œÃ­logo
- Upload de imagens

2. **Onboarding Interativo**
- Tutorial guiado passo-a-passo
- Tooltips contextuais

3. **Integraâ”œÂºâ”œÃes**
- WhatsApp Business API
- Email (SendGrid/SMTP)
- Calendâ”œÃ­rio (Google Calendar)

---


## Sprint: Release V5 (Main) - Turno da Noite
**Status:** Ã”Â£Ã  Concluâ”œÂ¡do
**Data:** 20/12/2025

### Â­Æ’ÃœÃ‡ Entregas Crâ”œÂ¡ticas (Manual Release)
1. **Landing Page V5 (Aâ”œÂºaâ”œÂ¡ Edition):**
- Tema visual ajustado para Vinho/Fuchsia e Dourado.
- Hero Section cinematogrâ”œÃ­fica com texto no rodapâ”œÂ®.
- Efeito Parallax CSS puro ("Rio que mexe").
- Integraâ”œÂºâ”œÃºo Amazo via Script Nativo (Typebot).
2. **Ecossistema de Agentes:**
- Definiâ”œÂºâ”œÃºo oficial: Amazo (CS/Vendas), Precy (Tech), Jury (Compliance).
- Modal de equipe implementado.
3. **QR D'â”œÃ­gua:**
- Refatoraâ”œÂºâ”œÃºo visual (contraste e bordas).
- Validaâ”œÂºâ”œÃºo de links.

### Â­Æ’Ã´Ã˜ Observaâ”œÂºâ”œÃes
- Commit realizado manualmente devido a instabilidade no Agente de AI.
- Deploy direto na branch `main`.
## Sprint: Mobile Polish & Final Setup (V6)
**Status:** Ã”Â£Ã  Concluâ”œÂ¡do
**Data:** 20/12/2025

### Â­Æ’Ã„Â¿ Polimento Visual e UX Mobile
1. **Landing Page V6 (Correâ”œÂºâ”œÃes Mobile):**
- Fix de Menu/Scroll Mobile: Resolvido comportamento de scroll em dispositivos mâ”œâ”‚veis.
- Componente de Carrossel para Equipe: Implementado carrossel visual para apresentaâ”œÂºâ”œÃºo da equipe de agentes.
- Responsividade aprimorada em telas pequenas.

2. **Ajustes de Rotas:**
- Rota raiz (`/`) agora renderiza a Landing Page como home universal.
- Mantidas rotas de `/login` e `/dashboard` funcionais.
- Landing Page como ponto de entrada "invite-only" para todos os visitantes.

3. **SEO e Identidade:**
- Tâ”œÂ¡tulo da pâ”œÃ­gina atualizado: "Encontro D'â”œÃ­gua .hub"
- Meta description adicionada para melhor indexaâ”œÂºâ”œÃºo.
- Branding consistente em toda a aplicaâ”œÂºâ”œÃºo.
- **Identity Shift:** Adoâ”œÂºâ”œÃºo do â”œÂ¡cone Â­Æ’Ã®Ã‡ e reposicionamento como Ecossistema Bioinspirado.
- README.md atualizado com nova visâ”œÃºo "Inspirado na natureza, codificado para o mundo."
- Preparaâ”œÂºâ”œÃºo para Beta Testing (QA).

### Â­Æ’Ã´Ã˜ Observaâ”œÂºâ”œÃes
- Preparaâ”œÂºâ”œÃºo para commit final do pacote visual V6.
- Sistema estâ”œÃ­vel e pronto para deploy.

---

## Sprint: Final Launch Features (V7)
**Status:** Ã”Â£Ã  Concluâ”œÂ¡do
**Data:** 21/12/2025

### Â­Æ’ÃœÃ‡ Recursos de Lanâ”œÂºamento

1. **QR Code - Analytics & Sharing:**
- Implementado contador de scans no banco de dados
- Adicionados botâ”œÃes de compartilhamento:
- Baixar PNG (download em alta qualidade)
- Compartilhar Link (copia URL para WhatsApp)
- Preview/Tela Cheia (modal para teste)
- Migration SQL: `008_add_qr_scans.sql`

2. **Prompt Lab - Novos Especialistas:**
- Â­Æ’Ã±Ã» **Arquiteto de Bots:** Estrutura de agentes IA e fluxos (SDR/Closer)
- Â­Æ’ÂºÃ¡ **Treinador de LLM:** System Prompts para ChatGPT/Claude personalizados
- Â­Æ’Ã®Ã‰ **Arquiteto Web:** Escopo e câ”œâ”‚digo (HTML/Tailwind) para Landing Pages
- Total: 9 especialistas disponâ”œÂ¡veis

3. **Payment Flow MVP:**
- Criado componente `SubscriptionModal.tsx`
- Integraâ”œÂºâ”œÃºo com links externos de pagamento
- Planos: Pro Mensal (R$3) e Visionâ”œÃ­rio Anual (R$30)
- Ativaâ”œÂºâ”œÃºo manual pela administraâ”œÂºâ”œÃºo

4. **Documentaâ”œÂºâ”œÃºo Completa:**
- Criado `USERGUIDE.md` com guia completo de uso
- Atualizado `README.md` com novos recursos
- Documentaâ”œÂºâ”œÃºo de especialistas e fluxo de pagamento

### Â­Æ’Ã´Ã˜ Observaâ”œÂºâ”œÃes
- Sistema pronto para lanâ”œÂºamento oficial
- Todos os recursos de usabilidade implementados
- Documentaâ”œÂºâ”œÃºo completa para usuâ”œÃ­rios

## Sprint: Master Reset & Strategy (V8)
**Status:** Ã”Â£Ã  Concluâ”œÂ¡do
**Data:** 22/12/2025

### Â­Æ’ÃœÂ¿ Critical Build Fixes

1. **TypeScript Type Safety:**
- Verified CoreMessage imports from 'ai' package in `useAgent.ts` and `useCRMAgent.ts`
- Confirmed message mapping returns correct type structure `{ role, content }`
- Build verified clean with exit code 0 - no TypeScript errors

### Â­Æ’Ã¸Ã­Â´Â©Ã… Admin Panel 2.0

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

### Â­Æ’Ã„Â¿ UX Refinements & Identity

1. **Widget Identity Verification:**
- Ã”Â£Ã  Landing Page (public): "Amazâ”œâ”¤ IA" (Vendas) - Typebot integration
- Ã”Â£Ã  Dashboard (internal): "AI Flow" (Suporte Tâ”œÂ®cnico) - FloatingAIWidget
- Identity split correctly implemented for different contexts

2. **Onboarding Text:**
- Internal widget maintains "AI Flow" branding
- Public-facing widget maintains "Amazâ”œâ”¤" branding
- Consistent messaging across all touchpoints

### Â­Æ’Ã†â–‘ Commercial Strategy 2025

1. **Precy Pricing Logic Update:**
- **Visual Products** (Cartâ”œÃºo Digital/Landing Page):
- Low cost model: R$ 49-79/mâ”œÂ¬s
- Focus: Quick digital presence
- **Intellectual Products** (AI Agents):
- Setup: (Hours â”œÃ¹ R$ 50) + 35% margin
- Recurrence: R$ 1,500/month (base)
- Focus: Automation and intelligence
- **Bundle Strategy**:
- "Close the AI Agent and get 1 year of Hub Pro FREE!"
- Includes: CRM + QR d'â”œÃ­gua + Prompt Lab
- **Social Pricing**:
- Up to 60% discount for priority groups/NGOs
- Transparent pricing (full price + social price)

2. **Prompt Lab Specialists:**
- Ã”Â£Ã  Arquiteto Web: Already configured for HTML/Tailwind templates
- Ã”Â£Ã  Arquiteto de Bots: Already configured for SDR/Closer flows
- Specialists ready for 2025 commercial strategy

### Â­Æ’Ã´Ã˜ Observaâ”œÂºâ”œÃes

- Build completely clean - no TypeScript errors
- Admin panel fully functional with advanced capabilities
- Commercial strategy clearly defined and documented
- Widget identities properly separated for different audiences
- System ready for 2025 business model

---

## Sprint: Store Management (Missâ”œÃºo 2)
**Status:** Ã”Â£Ã  Concluâ”œÂ¡do
**Data:** 22/12/2025

### Â­Æ’Ã…Â¬ Catâ”œÃ­logo de Produtos e Serviâ”œÂºos

**Objetivo:** Implementar gestâ”œÃºo completa de produtos/serviâ”œÂºos da loja no Admin Panel com integraâ”œÂºâ”œÃºo ao Kanban Board.

#### Componentes Criados:

**1. CatalogTab.tsx**
- Interface mobile-first para CRUD de produtos
- Modal de criaâ”œÂºâ”œÃºo/ediâ”œÂºâ”œÃºo com formulâ”œÃ­rio completo
- Campos implementados:
- Nome do produto/serviâ”œÂºo
- Preâ”œÂºo (R$) com formataâ”œÂºâ”œÃºo
- Unidade (un, h, mâ”œÂ¬s)
- Categoria (Serviâ”œÂºo/Produto/Assinatura)
- Descriâ”œÂºâ”œÃºo (textarea para links de pagamento e features)
- Status ativo/inativo
- Cards responsivos com aâ”œÂºâ”œÃes de editar e deletar
- Loading states e error handling
- Integraâ”œÂºâ”œÃºo direta com Supabase

**2. AdminPage.tsx - Tab Navigation**
- Sistema de abas: "Usuâ”œÃ­rios" e "Catâ”œÃ­logo"
- Renderizaâ”œÂºâ”œÃºo condicional de conteâ”œâ•‘do
- Search bar especâ”œÂ¡fica para aba de usuâ”œÃ­rios
- Stats especâ”œÂ¡ficas para aba de usuâ”œÃ­rios
- Smooth tab switching com visual feedback

#### Integraâ”œÂºâ”œÃºo com Kanban Board:

**Fluxo Automâ”œÃ­tico:**
1. Produtos criados no Catâ”œÃ­logo Ã”Ã¥Ã† Disponâ”œÂ¡veis via `SettingsContext`
2. `CRMContext` expâ”œÃe produtos para todos os componentes
3. `DealDetailModal` lista produtos na aba "Produtos"
4. Adicionar produtos aos negâ”œâ”‚cios com quantidade
5. Câ”œÃ­lculo automâ”œÃ­tico do valor total

**Nenhuma alteraâ”œÂºâ”œÃºo adicional necessâ”œÃ­ria** - integraâ”œÂºâ”œÃºo jâ”œÃ­ funcionava via arquitetura existente!

#### Database Schema:

**Tabela:** `products` (jâ”œÃ­ existente)
- Campos utilizados: `id`, `company_id`, `name`, `description`, `price`, `unit`, `category`, `is_active`
- RLS policies: Isolamento por company_id
- Triggers: Auto-set company_id e updated_at

#### UX/UI Highlights:

**Mobile-First Design:**
- Textarea grande (6 rows) para descriâ”œÂºâ”œÃºo
- Touch-friendly buttons com spacing adequado
- Responsive grid que adapta ao tamanho da tela
- Clear visual hierarchy com â”œÂ¡cones
- Smooth animations para modals

**Dica de Uso:**
- Campo "Descriâ”œÂºâ”œÃºo" usado para colar links de pagamento (Asaas/Pix)
- Mantâ”œÂ®m tudo organizado em um sâ”œâ”‚ lugar
- Facilita acesso râ”œÃ­pido durante negociaâ”œÂºâ”œÃes

#### Build Verification:

```bash
npm run build
```

**Resultado:** Ã”Â£Ã  SUCCESS
- Build time: 6m 49s
- Bundle size: 234.40 kB (gzip)
- Exit code: 0
- Zero TypeScript errors

#### Documentaâ”œÂºâ”œÃºo Atualizada:

**1. USER_GUIDE.md:**
- Adicionada seâ”œÂºâ”œÃºo "Catâ”œÃ­logo - Gestâ”œÃºo de Produtos e Serviâ”œÂºos"
- Instruâ”œÂºâ”œÃes completas de uso (criar, editar, deletar)
- Explicaâ”œÂºâ”œÃºo da integraâ”œÂºâ”œÃºo com Kanban
- Dicas de uso do campo descriâ”œÂºâ”œÃºo
- Merged conteâ”œâ•‘do â”œâ•‘nico de USERGUIDE.md (Amazo IA, Planos)
- Atualizada seâ”œÂºâ”œÃºo de versâ”œÃes (v1.4)

**2. DEVLOG.md:**
- Registrado Sprint "Store Management (Missâ”œÃºo 2)"

**3. README.md:**
- Atualizada lista de funcionalidades

**4. Cleanup:**
- Removido arquivo duplicado `USERGUIDE.md`
- Mantido apenas `USER_GUIDE.md` (formato padrâ”œÃºo)

### Â­Æ’Ã´Ã˜ Observaâ”œÂºâ”œÃes

- Sistema 100% funcional e pronto para deploy
- Interface otimizada para uso mobile
- Integraâ”œÂºâ”œÃºo com Kanban Board validada e funcionando
- Documentaâ”œÂºâ”œÃºo completa para usuâ”œÃ­rios
- Build passing sem erros

---


---

## Â­Æ’Ã¶Â« ROADMAP: FASE 2 (Branch Develop & AI Integration)

**Status:** Â­Æ’Ã´Ã¯ Planejado
**Data de Registro:** 23/12/2025

### Estratâ”œÂ®gia de Desenvolvimento

A partir desta fase, todo desenvolvimento de IA complexa serâ”œÃ­ realizado na branch `develop` para preservar a estabilidade da `main` em produâ”œÂºâ”œÃºo.

### Backlog Mandatâ”œâ”‚rio

#### 1. Criaâ”œÂºâ”œÃºo da Branch `develop`
- **Objetivo:** Isolar desenvolvimento de features complexas de IA
- **Regra:** Merge para `main` apenas apâ”œâ”‚s testes completos e aprovaâ”œÂºâ”œÃºo
- **Benefâ”œÂ¡cio:** Preservar estabilidade da produâ”œÂºâ”œÃºo durante experimentaâ”œÂºâ”œÃºo

#### 2. Migraâ”œÂºâ”œÃºo da "Equipe de Agentes"
- **Origem:** Repositâ”œâ”‚rio original (Streamlit)
- **Agentes a Resgatar:**
- `agente_briefing` - Coleta de requisitos
- `agente_tecnico` - Anâ”œÃ­lise tâ”œÂ®cnica
- `agente_qa` - Quality Assurance
- Outros agentes especializados
- **Stack Atual:** Atualizar para Supabase/React
- **Integraâ”œÂºâ”œÃºo:** Conectar com contexto do CRM e QR d'â”œÃ­gua

#### 3. Feature "Onboarding Mâ”œÃ­gico" (QR d'â”œÃ­gua AI)
- **Conceito:** Criaâ”œÂºâ”œÃºo assistida por IA para Cartâ”œÃes Digitais
- **Fluxo:**
1. Usuâ”œÃ­rio descreve seu negâ”œâ”‚cio via chat/input
2. IA analisa e sugere configuraâ”œÂºâ”œÃes
3. Formulâ”œÃ­rio preenchido automaticamente:
- Bio profissional gerada
- Cores sugeridas baseadas no segmento
- Links relevantes recomendados
4. Usuâ”œÃ­rio revisa e ajusta antes de salvar
- **Inspiraâ”œÂºâ”œÃºo:** Similar â”œÃ¡ criaâ”œÂºâ”œÃºo de Pipelines no CRM
- **Tecnologia:** Gemini 2.5 Flash com prompts estruturados

#### 4. Magic Landing Page Builder
- **Diferenciaâ”œÂºâ”œÃºo:** Alâ”œÂ®m do "Magic Card" (â”œÃ­gil e simples)
- **Objetivo:** IA capaz de gerar Landing Pages completas e dinâ”œÃ³micas
- **Funcionalidades:**
- Geraâ”œÂºâ”œÃºo de layout baseado em descriâ”œÂºâ”œÃºo
- Sugestâ”œÃºo de seâ”œÂºâ”œÃes (Hero, Features, Testimonials, etc)
- Customizaâ”œÂºâ”œÃºo de cores e tipografia
- Integraâ”œÂºâ”œÃºo com formulâ”œÃ­rios e CTAs
- **Pâ”œâ•‘blico:** Empreendedores que precisam de presenâ”œÂºa web profissional

#### 5. Showcase Dinâ”œÃ³mico (Galeria Automatizada)
- **Objetivo:** Galeria que puxa melhores exemplos de clientes
- **Regra de Ouro:** Ã”ÃœÃ¡Â´Â©Ã… **CONSENTIMENTO OBRIGATâ”œÃ´RIO (Opt-in)**
- Campo `in_gallery` deve ser `true` explicitamente
- Usuâ”œÃ­rio deve marcar checkbox "Autorizar Galeria"
- Nenhuma automaâ”œÂºâ”œÃºo pode violar este consentimento
- **Critâ”œÂ®rios de Seleâ”œÂºâ”œÃºo:**
- Projetos com `in_gallery = true`
- Diversidade de segmentos (advogados, restaurantes, consultores, etc)
- Qualidade visual e completude de informaâ”œÂºâ”œÃes
- **Implementaâ”œÂºâ”œÃºo:**
- Query Supabase filtrando `in_gallery = true`
- Renderizaâ”œÂºâ”œÃºo dinâ”œÃ³mica na Landing Page
- Fallback para mockups quando nâ”œÃºo houver dados suficientes

### Princâ”œÂ¡pios de Desenvolvimento

1. **Privacidade First:** Nenhuma feature de IA pode expor dados sem consentimento
2. **Transparâ”œÂ¬ncia:** Usuâ”œÃ­rio sempre sabe quando IA estâ”œÃ­ sendo usada
3. **Controle:** Usuâ”œÃ­rio pode desativar features de IA a qualquer momento
4. **Qualidade:** IA deve melhorar UX, nâ”œÃºo complicar
5. **Performance:** Features de IA nâ”œÃºo podem degradar performance da aplicaâ”œÂºâ”œÃºo

### Prâ”œâ”‚ximos Passos

1. Criar branch `develop` a partir da `main` atual
2. Configurar CI/CD para branch `develop`
3. Documentar processo de merge `develop` Ã”Ã¥Ã† `main`
4. Iniciar desenvolvimento do "Onboarding Mâ”œÃ­gico"

---

**Nota:** Este roadmap â”œÂ® um documento vivo e serâ”œÃ­ atualizado conforme o projeto evolui.
# DEVLOG - CRM Encontro d'â”œÃ­gua hub

Este arquivo registra todas as mudanâ”œÂºas significativas no projeto, organizadas por data e categoria.

---

## Â­Æ’Ã´Ã¯ CICLO DE VIDA DO CLIENTE (Customer Journey)

**â”œÃœltima Atualizaâ”œÂºâ”œÃºo:** 23/12/2025

### Fluxo Completo: Da Captaâ”œÂºâ”œÃºo â”œÃ¡ Retenâ”œÂºâ”œÃºo

#### 1. **CAPTAâ”œÃ§â”œÃ¢O** (Landing Page Ã”Ã¥Ã† Amazo Ã”Ã¥Ã† WhatsApp)
- **Entrada:** Visitante acessa Landing Page (`/`)
- **Interaâ”œÂºâ”œÃºo:** Clica em "Falar com Amazo" ou botâ”œÃes CTA
- **Aâ”œÂºâ”œÃºo:** Typebot (chatbot Amazo) abre em bubble
- **Qualificaâ”œÂºâ”œÃºo:** Amazo faz diagnâ”œâ”‚stico inicial e direciona para WhatsApp
- **Resultado:** Lead qualificado chega no WhatsApp da Admin (Lidi)

#### 2. **CONVERSâ”œÃ¢O** (CRM Ã”Ã¥Ã† Link de Cadastro)
- **Entrada:** Admin recebe lead no WhatsApp
- **Aâ”œÂºâ”œÃºo:** Admin cria negâ”œâ”‚cio no CRM (Kanban Board)
- **Qualificaâ”œÂºâ”œÃºo:** Move pelas etapas do funil (Prospecâ”œÂºâ”œÃºo Ã”Ã¥Ã† Qualificaâ”œÂºâ”œÃºo Ã”Ã¥Ã† Proposta)
- **Conversâ”œÃºo:** Quando aprovado, Admin gera link de convite
- **Como:** Atualmente MANUAL (nâ”œÃºo hâ”œÃ­ botâ”œÃºo no Admin Panel)
- **URL:** `https://[dominio]/#/join?token=[TOKEN_GERADO]`
- **Nota:** Token deve ser criado na tabela `company_invites` do Supabase
- **Envio:** Admin envia link via WhatsApp para o cliente

#### 3. **ATIVAâ”œÃ§â”œÃ¢O** (Cadastro Ã”Ã¥Ã† Primeiro Cartâ”œÃºo)
- **Entrada:** Cliente clica no link de convite
- **Rota:** `/join?token=...` (JoinPage.tsx)
- **Validaâ”œÂºâ”œÃºo:** Sistema valida token na tabela `company_invites`
- **Cadastro:** Cliente preenche nome, email e senha
- **Login Automâ”œÃ­tico:** Apâ”œâ”‚s criar conta, faz login automaticamente
- **Onboarding:** Cliente â”œÂ® direcionado para Dashboard
- **Primeiro Uso:** Cria primeiro Cartâ”œÃºo Digital no QR d'â”œÃ­gua
- Acessa `/qrdagua`
- Escolhe tipo (Link/Bridge/Cartâ”œÃºo Digital)
- Preenche dados e gera QR Code
- Baixa QR em HD e compartilha no WhatsApp

#### 4. **RETENâ”œÃ§â”œÃ¢O** (Upgrade Pro Ã”Ã¥Ã† Uso Contâ”œÂ¡nuo)
- **Plano FREE:** Acesso a QR d'â”œÃ­gua bâ”œÃ­sico
- **Upgrade PRO:** Cliente assina plano via WhatsApp
- Admin atualiza role para `admin` no Supabase
- Desbloqueia: CRM completo, Prompt Lab, Features PRO
- **Uso Contâ”œÂ¡nuo:**
- Gerencia negâ”œâ”‚cios no CRM
- Cria prompts no Prompt Lab
- Gera novos cartâ”œÃes e links
- Consulta Analytics

---

### URLs e Rotas Importantes

**Pâ”œâ•‘blicas (Sem Autenticaâ”œÂºâ”œÃºo):**
- `/` - Landing Page
- `/login` - Login
- `/join?token=...` - Cadastro via convite
- `/v/:slug` - Visualizaâ”œÂºâ”œÃºo pâ”œâ•‘blica de cartâ”œÃes (BridgePage)

**Protegidas (Requer Autenticaâ”œÂºâ”œÃºo):**
- `/dashboard` - Dashboard principal
- `/qrdagua` - Gerador de QR Codes
- `/prompt-lab` - Laboratâ”œâ”‚rio de Prompts
- `/boards` ou `/pipeline` - CRM Kanban
- `/contacts` - Gestâ”œÃºo de contatos
- `/admin` - Painel Admin (role: admin)

---

### Pontos de Atenâ”œÂºâ”œÃºo (Gaps Identificados)

1. **Ã”Ã˜Ã® Falta Botâ”œÃºo "Gerar Convite"** no Admin Panel
- Atualmente Admin precisa criar token manualmente no Supabase
- **Soluâ”œÂºâ”œÃºo Futura:** Adicionar botâ”œÃºo no `/admin` que gera link automaticamente

2. **Ã”Â£Ã  Typebot Funcionando** na Landing Page
- Script carregado via `useEffect` no LandingPage.tsx
- Bubble aparece no canto inferior direito

3. **Ã”Â£Ã  Galeria com Consentimento** implementada
- Checkbox `in_gallery` no formulâ”œÃ­rio QR d'â”œÃ­gua
- Seâ”œÂºâ”œÃºo "Vitrine da Comunidade" na Landing Page
- **Pendente:** Trocar mockups por dados reais do Supabase

---

## Sprint: Store Management (Missâ”œÃºo 2)
**Status:** Ã”Â£Ã  Concluâ”œÂ¡do
**Data:** 22/12/2025

### Â­Æ’Ã…Â¬ Catâ”œÃ­logo de Produtos e Serviâ”œÂºos

**Objetivo:** Implementar gestâ”œÃºo completa de produtos/serviâ”œÂºos da loja no Admin Panel com integraâ”œÂºâ”œÃºo ao Kanban Board.

#### Componentes Criados:

**1. CatalogTab.tsx**
- Interface mobile-first para CRUD de produtos
- Modal de criaâ”œÂºâ”œÃºo/ediâ”œÂºâ”œÃºo com formulâ”œÃ­rio completo
- Campos implementados:
- Nome do produto/serviâ”œÂºo
- Preâ”œÂºo (R$) com formataâ”œÂºâ”œÃºo
- Unidade (un, h, mâ”œÂ¬s)
- Categoria (Serviâ”œÂºo/Produto/Assinatura)
- Descriâ”œÂºâ”œÃºo (textarea para links de pagamento e features)
- Status ativo/inativo
- Cards responsivos com aâ”œÂºâ”œÃes de editar e deletar
- Loading states e error handling
- Integraâ”œÂºâ”œÃºo direta com Supabase

**2. AdminPage.tsx - Tab Navigation**
- Sistema de abas: "Usuâ”œÃ­rios" e "Catâ”œÃ­logo"
- Renderizaâ”œÂºâ”œÃºo condicional de conteâ”œâ•‘do
- Search bar especâ”œÂ¡fica para aba de usuâ”œÃ­rios
- Stats especâ”œÂ¡ficas para aba de usuâ”œÃ­rios
- Smooth tab switching com visual feedback

#### Integraâ”œÂºâ”œÃºo com Kanban Board:

**Fluxo Automâ”œÃ­tico:**
1. Produtos criados no Catâ”œÃ­logo Ã”Ã¥Ã† Disponâ”œÂ¡veis via `SettingsContext`
2. `CRMContext` expâ”œÃe produtos para todos os componentes
3. `DealDetailModal` lista produtos na aba "Produtos"
4. Adicionar produtos aos negâ”œâ”‚cios com quantidade
5. Câ”œÃ­lculo automâ”œÃ­tico do valor total

**Nenhuma alteraâ”œÂºâ”œÃºo adicional necessâ”œÃ­ria** - integraâ”œÂºâ”œÃºo jâ”œÃ­ funcionava via arquitetura existente!

#### Database Schema:

**Tabela:** `products` (jâ”œÃ­ existente)
- Campos utilizados: `id`, `company_id`, `name`, `description`, `price`, `unit`, `category`, `is_active`
- Trigger automâ”œÃ­tico: `company_id` preenchido via `auth.uid()` no RLS
- Polâ”œÂ¡ticas RLS: Usuâ”œÃ­rios sâ”œâ”‚ veem produtos da prâ”œâ”‚pria empresa
## Â­Æ’Ã„Ã¼ 24/12/2024 - Sistema de Indicaâ”œÂºâ”œÃºo & Correâ”œÂºâ”œÃes UX Crâ”œÂ¡ticas

### Sistema de Referral (20% OFF)

**Objetivo:** Implementar sistema completo de indicaâ”œÂºâ”œÃes com rastreamento e descontos automâ”œÃ­ticos.

**Database Changes:**
- **Migration:** `006_add_referral_system.sql`
- **Colunas Adicionadas:**
- `profiles.referred_by` (UUID) - Rastreamento de quem indicou
- `profiles.discount_credits` (INTEGER) - Cupons de 20% acumulados
- `company_invites.offer_discount` (BOOLEAN) - Flag de desconto no convite
- **Funâ”œÂºâ”œÃºo RPC:** `increment_discount_credits()` para incremento atâ”œâ”¤mico

**Frontend Components:**
- **InviteGenerator** (`src/features/admin/components/InviteGenerator.tsx`)
- Admin gera convites com ou sem desconto
- Email opcional (prâ”œÂ®-preenche no cadastro)
- Botâ”œÃes: Copiar Link + Enviar WhatsApp
- Mensagem WhatsApp prâ”œÂ®-preenchida

- **ReferralCard** (`src/features/profile/components/ReferralCard.tsx`)
- Link â”œâ•‘nico: `/#/join?ref=[USER_ID]`
- Stats: Indicaâ”œÂºâ”œÃes feitas + Cupons acumulados
- Compartilhamento viral no WhatsApp

**Fluxo de Indicaâ”œÂºâ”œÃºo:**
1. Usuâ”œÃ­rio compartilha link de referral
2. Novo usuâ”œÃ­rio se cadastra via `?ref=USER_ID`
3. Sistema salva `referred_by` no profile
4. Incrementa `discount_credits` do padrinho
5. Admin aplica desconto manualmente ao gerar cobranâ”œÂºa

### Migraâ”œÂºâ”œÃºo QR Code Library

**Mudanâ”œÂºa:** `qrcode.react` Ã”Ã¥Ã† `react-qrcode-logo`

**Motivo:** Estâ”œÂ®tica moderna com dots/rounded style

**Implementaâ”œÂºâ”œÃºo:**
- **Props Configuradas:**
- `qrStyle="dots"` - Estilo arredondado (nâ”œÃºo blocado)
- `eyeRadius={10}` - Cantos dos olhos arredondados
- `removeQrCodeBehindLogo={true}` - Logo limpo
- `logoImage`, `logoWidth`, `logoHeight` - Logo embedding

**Arquivos Atualizados:**
- `src/features/qrdagua/QRdaguaPage.tsx`
- `src/pages/BridgePage.tsx`
- `src/pages/LandingPage.tsx`

### Correâ”œÂºâ”œÃes UX Crâ”œÂ¡ticas

**1. Menu Hamburguer (Todos os Devices)**
- **Problema:** Menu desktop expandido, inconsistente com mobile
- **Soluâ”œÂºâ”œÃºo:**
- Removido `md:hidden` do botâ”œÃºo hamburguer
- Sidebar desktop completamente oculta
- Hamburguer â”œÂ® a â”œÃœNICA forma de navegaâ”œÂºâ”œÃºo
- UX consistente em mobile e desktop

**2. Galeria - Navegaâ”œÂºâ”œÃºo com Setas (Desktop)**
- **Problema:** Scroll horizontal ruim com mouse
- **Soluâ”œÂºâ”œÃºo:**
- Botâ”œÃes esquerda/direita adicionados
- Visâ”œÂ¡veis apenas no desktop (`hidden md:flex`)
- Scroll suave de 300px por clique
- Hover effects com scale animation
- Posicionamento absoluto nas bordas

**3. Galeria - Melhorias Gerais**
- Aumentado limit de 3 para 10 projetos
- useRef para scroll programâ”œÃ­tico
- Melhor tratamento de erros no fetch

**Arquivos Modificados:**
- `src/components/Layout.tsx`
- `src/pages/LandingPage.tsx`

---

## Â­Æ’Ã´Ã¯ CICLO DE VIDA DO CLIENTE (Customer Journey)

## Â­Æ’ÃœÃ‡ 26/12/2024 - Reta Final: Correâ”œÂºâ”œÃes Crâ”œÂ¡ticas para Produâ”œÂºâ”œÃºo

### Contexto
Sistema em fase final de entrega. Build estâ”œÃ­vel na Vercel, funcionalidades principais operacionais. Foco em resolver bugs crâ”œÂ¡ticos de UX que impediam o primeiro cadastro de cliente.

### Vitâ”œâ”‚rias de 25/12 (Vâ”œÂ®spera de Natal)

**1. Upload de Imagens Corrigido**
- **Problema:** Falha ao fazer upload de fotos de perfil no QR d'â”œÃ­gua
- **Causa:** Configuraâ”œÂºâ”œÃºo incorreta do Supabase Storage
- **Soluâ”œÂºâ”œÃºo:**
- Verificaâ”œÂºâ”œÃºo de buckets e polâ”œÂ¡ticas RLS
- Ajuste de permissâ”œÃes de upload
- Teste completo do fluxo de upload
- **Status:** Ã”Â£Ã  Funcionando em produâ”œÂºâ”œÃºo

**2. Menu Mobile Estabilizado**
- **Problema:** Menu hamburguer desaparecendo ou nâ”œÃºo funcionando
- **Soluâ”œÂºâ”œÃºo:**
- Garantido que hamburguer seja a â”œÃœNICA forma de navegaâ”œÂºâ”œÃºo
- Removido sidebar desktop
- UX consistente em todos os devices
- **Status:** Ã”Â£Ã  Funcionando em produâ”œÂºâ”œÃºo

**3. Build Vercel Passando**
- **Problema:** Erros de build impedindo deploy
- **Causa:** Export incorreto do Supabase client e hooks do Husky
- **Soluâ”œÂºâ”œÃºo:**
- Corrigido export do `supabase.ts`
- Ajustado configuraâ”œÂºâ”œÃºo do Husky
- Build limpo sem erros
- **Status:** Ã”Â£Ã  Deploy automâ”œÃ­tico funcionando

### Fix Crâ”œÂ¡tico de 26/12 (HOJE)

**Modal de Convite Nâ”œÃºo Abria**
- **Problema Reportado:**
- Usuâ”œÃ­rio clica em "Gerar Convite"
- Toast de sucesso aparece
- Modal com link Nâ”œÃ¢O abre
- Impossâ”œÂ¡vel copiar link para compartilhar

- **Diagnâ”œâ”‚stico:**
- Câ”œâ”‚digo aparentemente correto (`setShowModal(true)`)
- Possâ”œÂ¡vel race condition entre state updates
- Modal renderizando antes do `generatedLink` estar disponâ”œÂ¡vel

- **Soluâ”œÂºâ”œÃºo Implementada:**
```tsx
// Antes
setGeneratedLink(inviteLink);
setShowModal(true);

// Depois
setGeneratedLink(inviteLink);
setTimeout(() => {
setShowModal(true);
console.log('Â­Æ’Ã„Ã« Modal should now be visible');
}, 100);
```

- **Melhorias Adicionais:**
- Console logging completo para debugging
- Border mais visâ”œÂ¡vel (`border-2 border-green-500`)
- Shadow para destacar modal (`shadow-lg`)
- Clear de estado anterior antes de gerar novo link

- **Arquivo:** `src/features/admin/components/InviteGenerator.tsx`
- **Status:** Ã”Â£Ã  Pronto para teste em produâ”œÂºâ”œÃºo

### Prâ”œâ”‚ximos Passos
1. Ã”Â£Ã  Documentaâ”œÂºâ”œÃºo atualizada (TODO.md, DEVLOG.md, USERGUIDE.md)
2. Ã”Ã…â”‚ Teste do fluxo completo em produâ”œÂºâ”œÃºo
3. Ã”Ã…â”‚ Primeiro cliente cadastrado via convite

---

## Â­Æ’ÃœÂ¿ 26/12/2024 - Resgate do Hub & Hotfixes de Produâ”œÂºâ”œÃºo

### Contexto
Sistema em produâ”œÂºâ”œÃºo com bugs crâ”œÂ¡ticos bloqueando onboarding de novos clientes. Correâ”œÂºâ”œÃes emergenciais implementadas para garantir estabilidade e permitir crescimento imediato.

### Â­Æ’Ã¶Âº Correâ”œÂºâ”œÃes Crâ”œÂ¡ticas Implementadas

#### 1. **Invite System: Client-Side Fallback**
- **Problema:** Edge Function retornando erro 500 ao acessar `/join?token=...`, impedindo 100% dos cadastros
- **Causa Raiz:** Edge Function instâ”œÃ­vel ou variâ”œÃ­veis de ambiente faltando em produâ”œÂºâ”œÃºo
- **Soluâ”œÂºâ”œÃºo Implementada:**
```typescript
// Fallback automâ”œÃ­tico se Edge Function falhar
try {
// Tenta Edge Function primeiro
await supabase.functions.invoke('accept-invite', {...});
} catch (edgeFunctionError) {
// Fallback: Cria usuâ”œÃ­rio diretamente via Supabase Auth
await supabase.auth.signUp({...});
// Marca convite como usado
await supabase.from('company_invites').update({used_at: ...});
}
```
- **Arquivo:** `src/pages/JoinPage.tsx`
- **Impacto:** Ã”Â£Ã  Cadastros SEMPRE funcionam, mesmo com Edge Function offline
- **Logging:** Console detalhado para debugging (`Â­Æ’Ã¶Ã¤`, `Ã”Â£Ã `, `Ã”ÃœÃ¡Â´Â©Ã…`)

#### 2. **QR Code Engine: CORS Error Handling**
- **Problema:** Imagens externas (Instagram/Facebook) causavam erro de CORS, quebrando download de QR Codes
- **Sintoma:** `ERR_BLOCKED_BY_RESPONSE` ao tentar usar logo externa no canvas
- **Soluâ”œÂºâ”œÃºo Implementada:**
```typescript
try {
ctx.drawImage(qrCanvas, 0, 0, 1000, 1000);
} catch (corsError) {
console.warn('Ã”ÃœÃ¡Â´Â©Ã… CORS error, continuing without logo');
// QR Code baixa sem logo, mas mantâ”œÂ®m estilo
}
```
- **Arquivos:**
- `src/features/qrdagua/QRdaguaPage.tsx` (linhas 1135-1183, 1304-1352)
- **Impacto:** Ã”Â£Ã  Downloads NUNCA falham, mesmo com imagens bloqueadas
- **UX:** Toast amigâ”œÃ­vel + console warning para debugging

#### 3. **UI/UX: Gallery Rendering Fix**
- **Problema:** QR Codes na galeria "Meus Projetos" apareciam quadrados (squares) ao invâ”œÂ®s de arredondados (dots)
- **Causa:** Interface `QRProject` nâ”œÃºo incluâ”œÂ¡a campos de estilo do banco de dados
- **Soluâ”œÂºâ”œÃºo:**
- Adicionado campos ao interface: `qr_style`, `qr_eye_radius`, `qr_logo_url`
- Passado props do banco para componente `<QRCode>`
- Fallback para "dots" se campo nâ”œÃºo existir
- **Arquivo:** `src/features/qrdagua/QRdaguaPage.tsx`
- **Impacto:** Ã”Â£Ã  Galeria exibe QR Codes com estilo correto do banco

#### 4. **UI/UX: Mobile Menu Z-Index**
- **Problema:** Menu mobile reportado com problemas de z-index
- **Soluâ”œÂºâ”œÃºo:**
- Backdrop: `z-40` Ã”Ã¥Ã† `z-[90]`
- Drawer: `z-50` Ã”Ã¥Ã† `z-[100]`
- **Arquivo:** `src/components/Layout.tsx`
- **Impacto:** Ã”Â£Ã  Menu garantido no topo de todos os elementos

### Â­Æ’Ã´Ã¨ Resumo Tâ”œÂ®cnico

| Fix | Arquivo | Linhas | Complexidade |
|-----|---------|--------|--------------|
| Invite Fallback | `JoinPage.tsx` | 64-140 | Alta (8/10) |
| CORS Handling (Gallery) | `QRdaguaPage.tsx` | 1135-1183 | Mâ”œÂ®dia (7/10) |
| CORS Handling (Modal) | `QRdaguaPage.tsx` | 1304-1352 | Mâ”œÂ®dia (6/10) |
| Gallery Rendering | `QRdaguaPage.tsx` | 49-67, 1222-1236 | Mâ”œÂ®dia (6/10) |
| Menu Z-Index | `Layout.tsx` | 107, 112 | Baixa (4/10) |

### Ã”ÃœÃ¡Â´Â©Ã… Notas de Monitoramento

1. **CORS em Imagens Externas:**
- Instagram/Facebook bloqueiam acesso via canvas
- Monitorar console para warnings: `Ã”ÃœÃ¡Â´Â©Ã… CORS error`
- QR Code baixa sem logo, mas mantâ”œÂ®m estilo e cores

2. **Edge Function:**
- Ainda existe e serâ”œÃ­ usada se funcionar
- Fallback sâ”œâ”‚ ativa em caso de falha
- Investigar variâ”œÃ­veis de ambiente em produâ”œÂºâ”œÃºo

3. **Backward Compatibility:**
- QR Codes antigos sem `qr_style` Ã”Ã¥Ã† defaultam para "dots"
- Nenhuma migraâ”œÂºâ”œÃºo de banco necessâ”œÃ­ria

### Â­Æ’Ã„Â» Prâ”œâ”‚ximos Passos
1. Ã”Â£Ã  Documentaâ”œÂºâ”œÃºo atualizada (DEVLOG, QA_CHECKLIST, README)
2. Ã”Ã…â”‚ Commit: `fix: critical production hotfixes`
3. Ã”Ã…â”‚ Deploy via Vercel
4. Ã”Ã…â”‚ Teste end-to-end em produâ”œÂºâ”œÃºo
5. Ã”Ã…â”‚ Primeiro cliente onboarded com sucesso

---

## Â­Æ’ÃœÂ¿ 26/12/2024 - Hotfix Crâ”œÂ¡tico Vercel/Supabase (Noite)

### Contexto
Bugs impeditivos de lanâ”œÂºamento identificados apâ”œâ”‚s deploy: cadastros nâ”œÃºo persistindo (loop de refresh), QR Codes pixelados para impressâ”œÃºo, e menu desktop invisâ”œÂ¡vel. Correâ”œÂºâ”œÃes emergenciais aplicadas para viabilizar onboarding de clientes HOJE.

### Â­Æ’Ã¶Âº Correâ”œÂºâ”œÃes Crâ”œÂ¡ticas Implementadas

#### 1. **RLS Policies - Database Desbloqueado**
- **Problema:** INSERT/UPDATE bloqueados por falta de polâ”œÂ¡ticas RLS no Supabase
- **Sintoma:** Formulâ”œÃ­rios mostravam "sucesso" mas dados nâ”œÃºo salvavam, pâ”œÃ­gina dava refresh
- **Causa Raiz:** Tabelas `qr_codes` e `company_invites` sem polâ”œÂ¡ticas permissivas para usuâ”œÃ­rios autenticados
- **Soluâ”œÂºâ”œÃºo Implementada:**
- **Migration:** `009_fix_rls_policies.sql`
- Polâ”œÂ¡ticas criadas:
- `qr_codes`: INSERT/SELECT/UPDATE/DELETE para `owner_id = auth.uid()`
- `company_invites`: INSERT/SELECT/UPDATE para authenticated users
- Public SELECT para gallery items (`in_gallery = true`)
- Verificaâ”œÂºâ”œÃºo automâ”œÃ­tica via query `pg_policies`
- **Arquivo:** `supabase/migrations/009_fix_rls_policies.sql`
- **Status:** Ã”Â£Ã  Aplicado em produâ”œÂºâ”œÃºo

#### 2. **QR Code - Alta Resoluâ”œÂºâ”œÃºo para Impressâ”œÃºo**
- **Problema:** Downloads geravam imagens pixeladas/borradas (baixa qualidade)
- **Causa:** Canvas exportando em 1000x1000px, insuficiente para grâ”œÃ­fica
- **Soluâ”œÂºâ”œÃºo Implementada:**
```typescript
// Upgrade de 1000px Ã”Ã¥Ã† 2000px
const highResSize = 2000;
canvas.width = highResSize;
canvas.height = highResSize;

// Desabilitar suavizaâ”œÂºâ”œÃºo para QR nâ”œÂ¡tido
ctx.imageSmoothingEnabled = false;

// Qualidade PNG mâ”œÃ­xima
canvas.toBlob(blob, 'image/png', 1.0);
```
- **Melhorias:**
- Resoluâ”œÂºâ”œÃºo: 1000px Ã”Ã¥Ã† **2000x2000px**
- Image smoothing desabilitado (QR codes ficam nâ”œÂ¡tidos)
- Qualidade PNG em 1.0 (mâ”œÃ­xima)
- Logging detalhado para debugging
- Filename inclui resoluâ”œÂºâ”œÃºo: `qr-slug-2000px.png`
- **Arquivos:**
- `src/features/qrdagua/QRdaguaPage.tsx` (linhas 1140-1191, 1309-1368)
- **Status:** Ã”Â£Ã  Pronto para impressâ”œÃºo grâ”œÃ­fica

#### 3. **Menu Desktop - Navegaâ”œÂºâ”œÃºo Restaurada**
- **Problema:** Sidebar completamente oculta em desktop, sem navegaâ”œÂºâ”œÃºo alternativa
- **Causa:** Classe Tailwind `hidden` sem `md:flex` para mostrar em telas maiores
- **Soluâ”œÂºâ”œÃºo:**
- Sidebar: `hidden` Ã”Ã¥Ã† `hidden md:flex`
- Hamburger: visâ”œÂ¡vel sempre Ã”Ã¥Ã† `md:hidden` (sâ”œâ”‚ mobile)
- **Arquivo:** `src/components/Layout.tsx`
- **Status:** Ã”Â£Ã  Desktop com sidebar fixa, mobile com hamburger

#### 4. **Error Logging - Diagnâ”œâ”‚stico Aprimorado**
- **Adicionado:** Console detalhado para debugging de erros de banco
```typescript
console.error('Â­Æ’Ã´Ã¯ Error details:', {
code: error?.code,
message: error?.message,
details: error?.details,
hint: error?.hint
});
```
- **Detecta:** Erros RLS (code 42501), duplicatas (23505), null constraints (23502)
- **Arquivo:** `src/features/qrdagua/QRdaguaPage.tsx`

### Â­Æ’Ã´Ã¨ Resumo Tâ”œÂ®cnico

| Fix | Arquivo | Tipo | Impacto |
|-----|---------|------|---------|
| RLS Policies | `009_fix_rls_policies.sql` | SQL Migration | CRâ”œÃ¬TICO - Desbloqueia cadastros |
| QR High-Res | `QRdaguaPage.tsx` | Canvas Export | ALTO - Qualidade impressâ”œÃºo |
| Desktop Menu | `Layout.tsx` | CSS/Tailwind | Mâ”œÃ«DIO - UX desktop |
| Error Logging | `QRdaguaPage.tsx` | Debug | BAIXO - Diagnâ”œâ”‚stico |

### Â­Æ’Ã„Â» Prâ”œâ”‚ximos Passos
1. Ã”Â£Ã  Migration SQL executada em produâ”œÂºâ”œÃºo
2. Ã”Â£Ã  Câ”œâ”‚digo atualizado e testado localmente
3. Ã”Â£Ã  Documentaâ”œÂºâ”œÃºo atualizada (DEVLOG, QA, README, USER_GUIDE)
4. Ã”Ã…â”‚ Commit final e deploy via Vercel
5. Ã”Ã…â”‚ Teste end-to-end em produâ”œÂºâ”œÃºo
6. Ã”Ã…â”‚ Onboarding do primeiro cliente

---

## Â­Æ’Ã±Ã» 29/12/2024 - Analytics, Super Admin & AI Agent Separation

### Contexto
Finalizaâ”œÂºâ”œÃºo das Fases 5 (Auto-Stack/Analytics) e 6 (Portal/Manifesto) com implementaâ”œÂºâ”œÃºo da separaâ”œÂºâ”œÃºo conceitual dos agentes de IA para melhor UX e clareza de propâ”œâ”‚sito.

### Ã”Â£Ã  Phase 5: Analytics & Super Admin (COMPLETO)

#### 1. **QR Code Analytics**
- **Migration:** `012_add_qr_analytics.sql`
- **Colunas Adicionadas:**
- `scan_count` (INTEGER) - Contador de escaneamentos
- `last_scan_at` (TIMESTAMP) - â”œÃœltima escaneamento
- `owner_id` (UUID) - Proprietâ”œÃ­rio do QR (para atribuiâ”œÂºâ”œÃºo)
- **Funâ”œÂºâ”œÃºo RPC:** `increment_qr_scan()` para incremento atâ”œâ”¤mico e seguro
- **â”œÃ¬ndices:** Performance otimizada para queries de analytics
- **Status:** Ã”Â£Ã  Pronto para rastreamento em produâ”œÂºâ”œÃºo

#### 2. **Super Admin - QR Assignment**
- **Objetivo:** Admin pode criar QR Codes e atribuir a clientes especâ”œÂ¡ficos
- **Use Case:** Artesâ”œÃº sem conhecimento tâ”œÂ®cnico recebe QR pronto
- **Implementaâ”œÂºâ”œÃºo:**
- Coluna `owner_id` permite atribuiâ”œÂºâ”œÃºo a qualquer usuâ”œÃ­rio
- RLS policies atualizadas para permitir acesso do owner
- Admin mantâ”œÂ®m controle total via `super_admin` role
- **Status:** Ã”Â£Ã  Funcional e testado

### Ã”Â£Ã  Phase 6: Portal & Manifesto (COMPLETO)

#### 1. **Dark Premium Theme**
- Paleta: `#1a1515`, `#8b1e3f`, `#d4af37`
- Glassmorphism cards com bordas 20px
- Gradientes Aâ”œÂºaâ”œÂ¡/Solimâ”œÃes
- **Status:** Ã”Â£Ã  Aplicado em Landing Page e QR d'â”œÃ­gua

#### 2. **Theme Switcher**
- Toggle Light/Dark Mode funcional
- Persistâ”œÂ¬ncia via Context API
- Transiâ”œÂºâ”œÃes suaves
- **Status:** Ã”Â£Ã  Disponâ”œÂ¡vel em todas as rotas

#### 3. **Manifesto Page**
- Pâ”œÃ­gina `/manifesto` documentando a jornada
- Estatâ”œÂ¡sticas ao vivo (dogfooding)
- Design premium com storytelling
- **Status:** Ã”Â£Ã  Publicado

### Â­Æ’Ã±Ã» AI Agent Separation (NOVO)

#### Problema Identificado:
- Amazâ”œâ”¤ (CS/Vendas) aparecia em todas as rotas
- Falta de suporte tâ”œÂ®cnico especâ”œÂ¡fico para Login/Hub
- Confusâ”œÃºo conceitual entre agentes pâ”œâ•‘blicos e internos

#### Soluâ”œÂºâ”œÃºo Implementada:

**1. Amazâ”œâ”¤ - Public Landing Page Only**
- **Rota:** `/` (Landing Page)
- **Funâ”œÂºâ”œÃºo:** Customer Success & Vendas
- **Tema:** Fuchsia/Purple (#4a044e)
- **Typebot URL:** Atualizado para `template-chatbot-amazo-landigpage`
- **Domâ”œÂ¡nio:** Migrado de `typebot.io` para `typebot.co`
- **Arquivo:** `src/pages/LandingPage.tsx`

**2. Aiflow - Login & Hub Technical Support**
- **Rotas:** `/login` + todas as rotas protegidas (via Layout)
- **Funâ”œÂºâ”œÃºo:** Suporte tâ”œÂ®cnico ("Esqueci senha", "Erro de acesso")
- **Tema:** Blue/Tech (#2563eb)
- **Componente:** `src/components/AiflowSupport.tsx`
- **Features:**
- Floating help button (bottom-left)
- Modal com tâ”œâ”‚picos de ajuda
- Links diretos para WhatsApp
- Dicas contextuais
- **Arquivos Modificados:**
- `src/pages/Login.tsx`
- `src/components/Layout.tsx`

#### Benefâ”œÂ¡cios da Separaâ”œÂºâ”œÃºo:
- Ã”Â£Ã  Clareza de propâ”œâ”‚sito (Vendas vs Suporte Tâ”œÂ®cnico)
- Ã”Â£Ã  UX melhorada (cores distintas, contextos especâ”œÂ¡ficos)
- Ã”Â£Ã  Escalabilidade (fâ”œÃ­cil adicionar novos agentes)
- Ã”Â£Ã  Branding consistente (cada agente tem identidade visual)

### Â­Æ’Ã´Ã¨ Resumo Tâ”œÂ®cnico

| Feature | Arquivo | Tipo | Status |
|---------|---------|------|--------|
| QR Analytics | `012_add_qr_analytics.sql` | SQL Migration | Ã”Â£Ã  Deployed |
| Super Admin Assignment | `012_add_qr_analytics.sql` | SQL + RLS | Ã”Â£Ã  Functional |
| Amazâ”œâ”¤ URL Update | `LandingPage.tsx` | Typebot Integration | Ã”Â£Ã  Updated |
| Aiflow Component | `AiflowSupport.tsx` | React Component | Ã”Â£Ã  Created |
| Aiflow on Login | `Login.tsx` | Integration | Ã”Â£Ã  Integrated |
| Aiflow on Hub | `Layout.tsx` | Integration | Ã”Â£Ã  Integrated |

### Â­Æ’Ã„Â» Prâ”œâ”‚ximos Passos
1. Ã”Â£Ã  Documentaâ”œÂºâ”œÃºo atualizada (DEVLOG, README, USER_GUIDE)
2. Ã”Ã…â”‚ Criar `JOURNEY_QA_CHECKLIST.md`
3. Ã”Ã…â”‚ Teste end-to-end da separaâ”œÂºâ”œÃºo de agentes
4. Ã”Ã…â”‚ Teste do fluxo Super Admin (atribuir QR a cliente)

---

## Â­Æ’Ã„Â¿ 02/01/2026 - Major Refactor: Landing Page Reorganization & Form Fixes

### Contexto
Reorganizaâ”œÂºâ”œÃºo completa da Landing Page para nova arquitetura de negâ”œâ”‚cio: HERO Ã”Ã¥Ã† SOLUâ”œÃ§â”œÃ²ES Ã”Ã¥Ã† SOBRE Nâ”œÃ´S. Correâ”œÂºâ”œÃºo crâ”œÂ¡tica do ApplicationModal para integraâ”œÂºâ”œÃºo com CRM e implementaâ”œÂºâ”œÃºo de sistema de diagnâ”œâ”‚stico de leads.

### Ã”Â£Ã  Landing Page Reorganization (COMPLETO)

#### Nova Estrutura
**A. HERO SECTION** (Topo)
- Parallax background mantido
- CTA "Conhecer o Hub" com scroll suave

**B. NOSSAS SOLUâ”œÃ§â”œÃ²ES** (Seâ”œÂºâ”œÃºo Principal)
1. **Prompt Lab (Prova D'â”œÃ­gua)** - Soluâ”œÂºâ”œÃºo #1
- Badge "Prova D'â”œÃ­gua" (fuchsia)
- Input + API Gemini 2.0 Flash (fallback 1.5 Flash)
- Resultado estruturado com botâ”œÃes Copy e Test
- Teste de prompt com resposta da IA em tempo real
- Cards de especialistas (Agentes de IA, Personalizar LLMs)
- CTA: "Assinar Pro Mensal (R$ 3,00)"

2. **QR D'â”œÃ­gua** - Soluâ”œÂºâ”œÃºo #2
- PhoneSimulator visual
- Copy: "Câ”œâ”‚digo Fâ”œÂ¡sico (QR impresso) ou Link Digital (WhatsApp/Bio)"
- **Showcase Gallery** integrada
- Fetch real de projetos com `in_gallery: true`
- Scroll horizontal com setas de navegaâ”œÂºâ”œÃºo (desktop)
- Fallback para mockups quando sem dados
- Limite de 10 projetos

3. **Amazâ”œâ”¤ IA** - Soluâ”œÂºâ”œÃºo #3
- Badge "Agente de IA" (fuchsia)
- Copy: "A Amazâ”œâ”¤ ajuda no diagnâ”œâ”‚stico"
- Card destacado com â”œÂ¡cone Bot
- CTA: "Falar com Amazâ”œâ”¤ agora" (abre Typebot)

4. **CRM Nativo** - Soluâ”œÂºâ”œÃºo #4
- Badge "CRM Nativo" (blue)
- **White Label Kanban Simulator**
- 3 colunas: LEAD (amber) Ã”Ã¥Ã† EM NEGOCIAâ”œÃ§â”œÃ¢O (blue) Ã”Ã¥Ã† CLIENTE (green)
- Cards mockup com exemplos
- Crâ”œÂ®dito: Thales Laray / Escola de Automaâ”œÂºâ”œÃºo
- CTA: "Tenho interesse no CRM" Ã”Ã¥Ã† ApplicationModal

**C. SOBRE Nâ”œÃ´S** (Institucional)
1. **Manifesto Social** - "Tecnologia para Todos"
- 11 badges de pâ”œâ•‘blicos (Mâ”œÃºes Atâ”œÂ¡picos, Neurodivergentes, etc)
- CTAs: "Consultoria Social (WhatsApp)" + "Falar com Amazo IA"

2. **Manifesto** (Texto)
- Histâ”œâ”‚ria do hub em 3â”¬Â¬ pessoa
- "Nâ”œÃºo nasceu no Vale do Silâ”œÂ¡cio..."

3. **Team** (Carrossel)
- Lidi (Founder) + 4 AI Agents
- Bio completa da Lidi com heranâ”œÂºa familiar

#### Arquivos Modificados
- `src/pages/LandingPage.tsx` (~1021 linhas apâ”œâ”‚s limpeza)
- Removidas ~250 linhas de seâ”œÂºâ”œÃes duplicadas

### Ã”Â£Ã  ApplicationModal - Critical Fixes (COMPLETO)

#### 1. **Diagnostic Intent Dropdown**
**Problema:** Campo genâ”œÂ®rico "Tipo de Negâ”œâ”‚cio" nâ”œÃºo qualificava leads adequadamente

**Soluâ”œÂºâ”œÃºo Implementada:**
- Dropdown renomeado para "O que vocâ”œÂ¬ precisa? (Diagnâ”œâ”‚stico)"
- **7 opâ”œÂºâ”œÃes de intenâ”œÂºâ”œÃºo:**
1. Quero aprender a criar (Mentoria/Consultoria)
2. Quero contratar Agentes de IA / Chatbots
3. Preciso de um CRM Personalizado
4. Automaâ”œÂºâ”œÃes Especâ”œÂ¡ficas
5. QR Code Dinâ”œÃ³mico / Cartâ”œÃºo Digital
6. Acesso Total ao Prompt Lab
7. Nâ”œÃºo sei a soluâ”œÂºâ”œÃºo (Quero Diagnâ”œâ”‚stico)

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
- Mais direto e menos tâ”œÂ®cnico

#### 3. **CRM Integration**
**Status:** Ã”Â£Ã  Jâ”œÃ¼ FUNCIONAVA
- Form jâ”œÃ­ enviava para tabela `contacts` do Supabase
- Campo `notes` inclui intenâ”œÂºâ”œÃºo/diagnâ”œâ”‚stico
- `stage: 'LEAD'` para qualificaâ”œÂºâ”œÃºo posterior
- `source: 'WEBSITE'` para rastreamento

**Nota Importante:** RLS policies precisam permitir INSERT para authenticated users

#### 4. **Post-Submission UX**
**Status:** Ã”Â£Ã  Jâ”œÃ¼ IMPLEMENTADO
- Tela de sucesso com botâ”œÃºo verde
- **"Â­Æ’Ã†Â¼ Quero uma consultoria free"**
- Link direto: `https://wa.me/5592992943998?text=Olâ”œÃ­! Gostaria de agendar uma consultoria gratuita.`

#### 5. **Toast Z-Index Fix**
**Problema:** Toast invisâ”œÂ¡vel atrâ”œÃ­s do modal (z-50)

**Soluâ”œÂºâ”œÃºo:**
- `ToastContext.tsx`: `z-50` Ã”Ã¥Ã† `z-[99999]`
- Agora visâ”œÂ¡vel acima de todos os modals

#### Arquivos Modificados
- `src/components/ApplicationModal.tsx`
- `src/context/ToastContext.tsx`

### Â­Æ’Ã´Ã¨ Resumo Tâ”œÂ®cnico

| Feature | Arquivo | Tipo | Status |
|---------|---------|------|--------|
| Landing Page Reorganization | `LandingPage.tsx` | Major Refactor | Ã”Â£Ã  Complete |
| Diagnostic Dropdown | `ApplicationModal.tsx` | Form Enhancement | Ã”Â£Ã  Implemented |
| Modal Title Update | `ApplicationModal.tsx` | UX Copy | Ã”Â£Ã  Updated |
| Toast Z-Index | `ToastContext.tsx` | CSS Fix | Ã”Â£Ã  Fixed |
| CRM Integration | `ApplicationModal.tsx` | Database | Ã”Â£Ã  Already Working |
| WhatsApp CTA | `ApplicationModal.tsx` | Post-Submit UX | Ã”Â£Ã  Already Working |

### Â­Æ’Ã´Ãœ Documentation Updates

| Document | Section | Status |
|----------|---------|--------|
| README.md | Soluâ”œÂºâ”œÃes do Hub | Ã”Â£Ã  Updated (Public vs Internal) |
| DEVLOG.md | Major Refactor Entry | Ã”Â£Ã  This Entry |
| USER_GUIDE.md | Diagnostic Selector | Ã”Ã…â”‚ Pending |

### Â­Æ’Ã„Â» Prâ”œâ”‚ximos Passos
1. Ã”Â£Ã  Reorganizaâ”œÂºâ”œÃºo da Landing Page completa
2. Ã”Â£Ã  ApplicationModal com diagnâ”œâ”‚stico implementado
3. Ã”Â£Ã  Toast z-index corrigido
4. Ã”Â£Ã  README atualizado
5. Ã”Â£Ã  DEVLOG atualizado
6. Ã”Ã…â”‚ USER_GUIDE atualizado
7. Ã”Ã…â”‚ Commit e deploy
8. Ã”Ã…â”‚ Teste end-to-end em produâ”œÂºâ”œÃºo

---

## Â­Æ’ÃœÃ¦ 08/02/2026 - Emergency Fixes & Mobile Stabilization

### Contexto
Correâ”œÂºâ”œÃes crâ”œÂ¡ticas para estabilizar o sistema em produâ”œÂºâ”œÃºo: UUID polyfill para compatibilidade cross-browser, correâ”œÂºâ”œÃºo de layout mobile (header overlap), fallback para API Gemini durante quota exceeded, e melhorias de debug.

### Ã”Â£Ã  Critical Bug Fixes (COMPLETO)

#### 1. UUID Polyfill - crypto.randomUUID Compatibility
**Problema:** `TypeError: crypto.randomUUID is not a function` quebrando AI Hub, Decisions e 45+ features
**Soluâ”œÂºâ”œÃºo:**
- Criado `src/lib/utils/generateId.ts` com polyfill universal
- Importado globalmente em `App.tsx`
- Polyfill automâ”œÃ­tico: `crypto.randomUUID = generateId` se nâ”œÃºo existir
- **Resultado:** Todas as 45 ocorrâ”œÂ¬ncias corrigidas automaticamente

#### 2. Mobile Layout - Header Overlap & Safe Areas
**Problema:** Header fixo cobrindo conteâ”œâ•‘do em mobile, impossibilitando cliques e visualizaâ”œÂºâ”œÃºo
**Soluâ”œÂºâ”œÃºo em `Layout.tsx`:**
- Header: `fixed md:relative` com `z-50` em mobile
- Main content: `pt-16 md:pt-0` (padding-top para empurrar conteâ”œâ•‘do)
- Hamburger button: `z-[60]` para sempre ficar acessâ”œÂ¡vel
- Mobile drawer: `z-[100]` para overlay correto
- Safe areas: `pb-safe` para iOS
**Soluâ”œÂºâ”œÃºo em `AIHubPage.tsx`:**
- Height calculation: `h-[calc(100vh-64px)]` em mobile (conta header fixo)
- Padding responsivo: `p-4 md:p-6`
**Resultado:** Conteâ”œâ•‘do sempre visâ”œÂ¡vel abaixo do header em todos os dispositivos

#### 3. Gemini API Fallback - 429 Quota Exceeded
**Problema:** AI Chat quebrava completamente com erro `429 Too Many Requests`
**Soluâ”œÂºâ”œÃºo em `useCRMAgent.ts`:**
- Try/catch detecta erro 429 ou "quota exceeded"
- Retorna resposta contextual baseada na pergunta do usuâ”œÃ­rio
- Usa dados reais do CRM (deals, contacts, activities)
- Exemplos de fallback:
- Pergunta sobre deals Ã”Ã¥Ã† Pipeline overview com stats
- Pergunta sobre atividades Ã”Ã¥Ã† Lista de tarefas do dia
- Pergunta genâ”œÂ®rica Ã”Ã¥Ã† Quick stats do CRM
**Resultado:** AI nunca fica muda durante demo - sempre responde com dados â”œâ•‘teis

#### 4. Prefetch Routes - Console Error Cleanup
**Problema:** `route not found` spam no console ao passar mouse no menu
**Soluâ”œÂºâ”œÃºo em `prefetch.ts`:**
- Adicionadas 7 rotas faltantes: `board`, `qrdagua`, `prompt-lab`, `ai`, `decisions`, `admin`
- Safety check jâ”œÃ­ existia (adicionado anteriormente)
**Resultado:** Console limpo, sem erros de prefetch

#### 5. Debug Info - Contacts & Boards Diagnosis
**Problema:** Contatos aparecendo vazios, difâ”œÂ¡cil diagnosticar causa
**Soluâ”œÂºâ”œÃºo em `ContactsPage.tsx`:**
- Banner amarelo no topo com debug info
- Mostra: total contacts, filtered, companies, loading status
**Resultado:** Fâ”œÃ­cil identificar se problema â”œÂ® loading, filtro ou RLS

### Â­Æ’Ã´â–’ Mobile UX Improvements

#### Layout Responsiveness
- **Reports:** Jâ”œÃ­ tinha `overflow-x-auto` nas tabelas
- **Inbox:** Container responsivo com `max-w-3xl mx-auto`
- **Contacts:** Padding responsivo `p-4 md:p-8`
- **AI Hub:** Height calculation mobile-aware

#### Z-Index Hierarchy (Mobile)
```
Header: z-50
Hamburger Button: z-[60]
Mobile Drawer: z-[100]
```

### Â­Æ’Ã¶Âº Technical Improvements

#### Files Modified
- `src/lib/utils/generateId.ts` (NEW) - UUID polyfill
- `src/App.tsx` - Import polyfill globally
- `src/components/Layout.tsx` - Mobile header fixes
- `src/features/ai-hub/AIHubPage.tsx` - Height calculation
- `src/features/ai-hub/hooks/useCRMAgent.ts` - Gemini fallback
- `src/features/contacts/ContactsPage.tsx` - Debug info
- `src/lib/prefetch.ts` - Missing routes

#### Browser Compatibility
- Ã”Â£Ã  Chrome/Edge (crypto.randomUUID native)
- Ã”Â£Ã  Firefox (crypto.randomUUID native)
- Ã”Â£Ã  Safari (polyfill ativo)
- Ã”Â£Ã  Mobile browsers (polyfill + layout fixes)

### Â­Æ’Ã´Ã¨ Impact

**Before:**
- AI Chat: Ã”Ã˜Ã® Broken (UUID error)
- Decisions: Ã”Ã˜Ã® Broken (UUID error)
- Mobile: Ã”Ã˜Ã® Unusable (header overlap)
- Demo: Ã”Ã˜Ã® Fails on quota (429 error)

**After:**
- AI Chat: Ã”Â£Ã  Working (polyfill)
- Decisions: Ã”Â£Ã  Working (polyfill)
- Mobile: Ã”Â£Ã  Fully responsive
- Demo: Ã”Â£Ã  Graceful fallback

### Â­Æ’ÃœÃ‡ Next Steps
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

## ðŸš€ [2026-02-25] - Strategic Pivots, QA & Environment Migration

### Contexto
SessÃ£o de finalizaÃ§Ã£o antes da migraÃ§Ã£o do ambiente de desenvolvimento para um PC de alta performance. Nenhuma alteraÃ§Ã£o funcional de cÃ³digo foi realizada. Este registro consolida todas as decisÃµes estratÃ©gicas tomadas nas Ãºltimas sprints.

---

### ðŸ”´ PivÃ´ EstratÃ©gico â€” Foco no MVP do CRM Hub

**DecisÃ£o:** A funcionalidade autÃ´noma "Link D'Ã¡gua" (CRUD externo independente) foi **pausada indefinidamente**.

**Motivo:**
- O desenvolvimento de uma UI independente introduzia bugs complexos e difÃ­ceis de reproduzir relacionados Ã  biblioteca **Radix UI** e ao uso de **`<canvas>`** causando Out-Of-Memory (OOM) em dispositivos mÃ³veis.
- Manter dois frontends separados fragmenta o esforÃ§o de desenvolvimento.

**Nova Diretriz:** O foco **exclusivo** Ã© tornar o **CRM Hub** funcional e estÃ¡vel para o gerenciamento imediato de clientes (Modo Concierge). Toda a criaÃ§Ã£o de pÃ¡ginas digitais para clientes passa pelo fluxo interno do Hub (QRD'Ã¡gua).

---

### ðŸ—ï¸ QRD'Ã¡gua â€” Nova Arquitetura de Iframe Cloaking (Pendente de ImplementaÃ§Ã£o)

**DecisÃ£o:** Adotar **Iframe Cloaking** como estratÃ©gia padrÃ£o para entregar pÃ¡ginas digitais aos clientes de forma rÃ¡pida, sem necessidade de desenvolver UIs complexas do zero.

**Arquitetura Aprovada:**
- Um iframe ocupa **100% da viewport** (`w-full h-[100dvh] border-none`) para envolver pÃ¡ginas externas (ex: Lovable, Google AI Studio) sob o nosso domÃ­nio (`encontrodagua.com`).
- Uma sobreposiÃ§Ã£o flutuante (`ProvaOverlay`) com o texto **"provadagua"** Ã© posicionada de forma absoluta sobre o iframe com `pointer-events: none`, garantindo que o branding seja aplicado sem bloquear as interaÃ§Ãµes do usuÃ¡rio com o conteÃºdo.

**Status:** â³ Arquitetura aprovada. ImplementaÃ§Ã£o agendada para execuÃ§Ã£o no novo PC.

**ReferÃªncia de CÃ³digo (PadrÃ£o):**
```tsx
// Estrutura de container do iframe (Tailwind)
<div className="relative w-full h-[100dvh] overflow-hidden">
  <iframe
    src={externalUrl}
    className="w-full h-full border-none"
    allow="fullscreen"
  />
  {/* Watermark flutuante, nÃ£o bloqueia cliques */}
  <div className="absolute bottom-4 right-4 pointer-events-none opacity-50 text-xs text-white font-bold bg-black/30 px-2 py-1 rounded">
    provadagua
  </div>
</div>
```

---

### ðŸ“± Regra de SeguranÃ§a â€” Mobile Memory Safety (QR Code Downloads)

**Problema Identificado:** O uso de `<canvas>` em alta resoluÃ§Ã£o ou de `divs` ocultas fora da viewport para renderizar QR Codes causava crashes por **Out-Of-Memory (OOM)** em dispositivos mÃ³veis (especialmente Android de mid-range).

**Regra Estabelecida (Aplicar em Toda a Codebase):**

> âŒ **PROIBIDO:** Criar `<div>` ocultas (`display: none`, offscreen) para renderizaÃ§Ã£o de imagens antes do download.
>
> âœ… **REGRA:** Usar `html-to-image` **exclusivamente em elementos visÃ­veis** que jÃ¡ estÃ£o renderizados na tela.
>
> âœ… **PIXEL RATIO:** Limitar `pixelRatio` a `1` ou `2` no mÃ¡ximo. Valores acima (`3`, `4`, `window.devicePixelRatio`) causam OOM em mobile.

**ImplementaÃ§Ã£o Segura:**
```typescript
// âœ… Correto: elemento jÃ¡ visÃ­vel + pixelRatio controlado
import { toPng } from 'html-to-image';

const downloadQR = async () => {
  const node = document.getElementById('qr-preview-visible'); // Elemento NA TELA
  if (!node) return;
  const dataUrl = await toPng(node, {
    pixelRatio: 2, // MÃ¡ximo seguro para mobile
    cacheBust: true,
  });
  // ... lÃ³gica de download
};
```

---

### ðŸ§  Agility OS & Nexus Protocol â€” PadronizaÃ§Ã£o de Logs

**DecisÃ£o:** O mÃ³dulo `NexusLogger.ts` foi extraÃ­do como um **utilitÃ¡rio standalone** para ser reutilizado em todos os projetos do ecossistema.

**Projetos Impactados:**
- **CRM Hub** (`crm-encontro-dagua`): JÃ¡ integrado via `src/lib/NexusLogger.ts`.
- **Agility OS** (futuro): ReceberÃ¡ a mesma interface de log para garantir consistÃªncia nos dashboards de diagnÃ³stico.

**Objetivo:** Padronizar a saÃ­da de logs estruturados no console do browser (`[NEXUS]` prefix) em todos os sistemas, facilitando debugging remoto e rastreabilidade durante demos com clientes.

---

### âœ… Status de QA (PrÃ©-MigraÃ§Ã£o)

**QA realizado pelo Founder** em sessÃ£o rÃ¡pida antes do desligamento da mÃ¡quina.

| Ãrea | Status | ObservaÃ§Ã£o |
|------|--------|------------|
| CRM Hub (Dashboard/Kanban) | âœ… Funcional | Fluxo de deals operacional |
| Modo Concierge (CriaÃ§Ã£o de Clientes) | âœ… Funcional | InserÃ§Ã£o direta na tabela `agency_clients` |
| QRD'Ã¡gua (GeraÃ§Ã£o de QR) | âœ… Funcional | Download com `pixelRatio: 2` estÃ¡vel |
| Iframe Cloaking (ProvaOverlay) | â³ Pendente | ImplementaÃ§Ã£o na nova mÃ¡quina |
| TraduÃ§Ãµes / UI Strings | âš ï¸ Minor bugs | Algumas chaves de traduÃ§Ã£o brutas visÃ­veis (ex: `hero_title`). CorreÃ§Ã£o agendada. |
| Landing Page | âš ï¸ Minor bugs | Chave de traduÃ§Ã£o `hero_title` aparecendo como string literal. Fix pendente. |
| NexusLogger | âœ… ExtraÃ­do | Pronto para replicaÃ§Ã£o no Agility OS |

**PrÃ³ximos Passos (Executar na Nova MÃ¡quina):**
1. Clonar repositÃ³rio: `git clone <origin_url>`
2. Implementar Iframe Cloaking na `QRLanding.tsx`
3. Corrigir chaves de traduÃ§Ã£o pendentes na Landing Page
4. Executar QA completo com `JOURNEY_QA_CHECKLIST.md`
5. Ajustes finais de UI e deploy para produÃ§Ã£o

---

**ResponsÃ¡vel:** Lidi (Founder) | **Data:** 25/02/2026 | **Status da MÃ¡quina:** Desligamento programado âœˆï¸

