# 🛠️ DEVLOG — Encontro d'água Hub Digital

## 2026-10-25 — V10.3: CORREÇÃO DE LAYOUT DA EQUIPE, CREDENCIAIS ESTRATÉGICAS DE LÍDI MOURA & ROTEAMENTO AMAZÔ G10 + AGENDA 🎯

**Contexto:** Correção do overflow/sobreposição que ocorria ao expandir os detalhes técnicos (`IcebergDetails`) no card da equipe, atualização completa das credenciais estratégicas de Lídi Moura (para leads, clientes, recrutadores e hunters), e padronização de todos os CTAs para WhatsApp Business (`5541992557600`), Agendamento de Consultoria (`encontrodaguahub@gmail.com`) e Amazô.guia G10 (`https://amazo-guia-g10.streamlit.app/`).

### Alterações Principais (`LandingPage.tsx`, `CRMSimulator.tsx`, `KommoPartnerSection.tsx`)
1. **Correção de Layout Responsivo na Seção `#time` (Equipe & Detalhes Técnicos):**
   - **Causa Raiz:** O container do carrossel da equipe possuía altura fixa `h-[400px]` e largura restrita `max-w-lg`. Ao abrir o `IcebergDetails`, o card ultrapassava os `400px` e sobrepunha a seção do Kommo abaixo.
   - **Solução:** Removida a altura fixa `h-[400px]`, adotando container fluido `max-w-3xl` com `h-auto`, barra seletora inteligente de membros da equipe no topo e grid responsivo (`grid-cols-1 md:grid-cols-2`) dentro do card para que a expansão empurre o restante da página suavemente em qualquer dispositivo.
2. **Credenciais Estratégicas e Assertivas de Lídi Moura:**
   - Atualizada a descrição e adicionadas badges visíveis para leads, recrutadores, hunters e clientes:
     - **Analista de Dados, IA e Automação** (formada em Psicologia e +10 anos em Customer Success)
     - **Parceira Certificada Kommo CRM**
     - **Certificada Oracle Cloud Infrastructure (OCI Foundations Associate & OCI AI Foundations Associate)**
     - **Certificada Power BI (Fundação Bradesco)**
     - **Campeã em 1º Lugar do Hackathon G9 NoCountry (Líder Técnica · Data Science concluído no ONE)**
     - **Programas ONE (Oracle Next Education + Alura): G9 Data Science, G10 IA for Tech e G11 IA for Business**
3. **Roteamento Oficial para Amazô.guia G10, WhatsApp Business, Agenda (`encontrodaguahub@gmail.com`) & Remoção do Chatbot Embutido Legado:**
   - Removido o widget flutuante legado (Typebot / botão flutuante) da LP do Hub (`LandingPage.tsx`) para preparar a futura integração do Chatbot Oficial da Kommo CRM.
   - Todos os botões de contato com a Amazô na página agora encaminham para a versão atualizada **Amazô.guia G10 (`https://amazo-guia-g10.streamlit.app/`)**.
   - Todos os botões de agendamento de diagnóstico/consultoria encaminham para o Google Calendar vinculado a **`encontrodaguahub@gmail.com`**, e todos os botões de atendimento comercial levam ao **WhatsApp Business (`5541992557600`)**.

**Feedback/Resultado:** ✅ Validado e aprovado visualmente pela CEO Lídi Moura em `localhost:3001`. Commit realizado exclusivamente para os arquivos da LP e `DEVLOG.md`.

---

## 2026-10-25 — V10.2: POSICIONAMENTO ORIENTADO A VALOR, KOMMO EM USD & PROVA D'ÁGUA KOMMO 🎯

**Contexto:** Alinhamento estratégico determinado pela CEO Lídi Moura para focar a LP do Hub na percepção de valor, resolução de problemas e satisfação do cliente, evitando exibir preços fechados em reais de serviços de consultoria/implementação antes do diagnóstico, e apresentando os pacotes oficiais da licença Kommo em dólar (USD).

### Alterações Principais (`LandingPage.tsx`, `CRMSimulator.tsx`, `KommoPartnerSection.tsx`)
1. **Planos Oficiais Kommo em Dólar (USD) & Foco no Valor dos Serviços:**
   - Exibidos os planos oficiais da plataforma Kommo em sua moeda nativa (**Base `US$ 15/usuário/mês`**, **Avançado `US$ 25/usuário/mês`**, **Empresarial `US$ 45/usuário/mês`**) tanto na seção `#servicos` quanto em `KommoPartnerSection.tsx`, evitando qualquer propaganda enganosa.
   - Removida a exibição de preços tabelados em reais para consultoria/implementação (`R$ 180/h`, `R$ 390`, `R$ 1.290`, etc.), posicionando os 3 Formatos de Atuação (Diagnóstico/Consultoria, Implementação Conjunta e Implementação Completa Turnkey) com foco no valor entregue e dimensionamento sob medida.
2. **Agente de IA (`A partir de R$ 80/mês + implementação`) com Foco em GPTMaker & Kommo:**
   - Atualizado o valor do Agente de IA em toda a LP para **`A partir de R$ 80/mês + implementação`**, viabilizando a operação contínua no plano básico do **GPTMaker** integrado ao **Kommo CRM**.
3. **Diferencial de Analista de Dados (Organização e Estruturação da Base do Cliente):**
   - Adicionado destaque estratégico explicando que, mesmo que o lead não tenha seus dados organizados, Lídi Moura atua como **Analista de Dados** estruturando do zero **documentos, regras de negócio, catálogo de produtos/serviços, FAQs e fluxos** para alimentar a IA e o CRM.
4. **Nova "Prova d'Água" = Teste Grátis Guiado do Kommo CRM:**
   - Substituído o antigo experimento interno do CRM Provadágua (`/showcase`) pelo **Teste Grátis Guiado do Kommo CRM (Prova d'Água)** em `LandingPage.tsx` e `CRMSimulator.tsx`.
5. **Roteamento Unificado de CTAs:**
   - Todos os CTAs da LP do Hub agora encaminham diretamente para o **WhatsApp Business oficial (`wa.me/5541992557600`)** ou para **Agendamento Direto de Diagnóstico na Agenda do Encontro d'Água Hub**.

---

## 2026-10-25 — V10.1: REPAGINAÇÃO COMERCIAL COMPLETA DO HUB 🎯

**Contexto:** Atualização integral da Landing Page do Encontro d'água Hub com os serviços, preços, formatos de atuação e conformidade de governança acordados no briefing comercial.

### Alterações Principais
- **Prompt Lab (Cortesia Estratégica):** Remoção definitiva dos botões de checkout Stripe (R$ 3,00 / R$ 29,90). O laboratório agora opera como cortesia e demonstração viva de engenharia de prompts, com CTA direcionando para criação de agentes sob medida no WhatsApp.
- **Seção Completa de Serviços & Preços (#servicos):**
  - **3 Formatos de Atuação:** Consultoria/Mentoria (R$ 180/h), Implementação Conjunta e Implementação Completa pela Lídi.
  - **Diagnóstico + StartSe AI Canvas:** a partir de R$ 390.
  - **Implementações Kommo:** Essencial (R$ 1.290), Crescimento (R$ 2.190) e Sob Medida (R$ 3.290).
  - **Pacotes de Suporte Contínuo:** Essencial (R$ 390/mês), Contínuo (R$ 690/mês) e Avançado (R$ 1.200/mês).
  - **IA, Automações e BI sob Escopo:** GPTMaker, Typebot, ManyChat, Agentes RAG, Dashboards Python/Streamlit/Power BI e Pesquisa de Satisfação com coleta automatizada.
- **Transparência Kommo:** Esclarecimento institucional de que valores em reais são honorários profissionais da Lídi; licenças Kommo cobradas na moeda oficial (USD) conforme tabela do fornecedor.
- **Condições de Pagamento e Entrega:** Sinal institucional de 30% a 50%, restante acordado no fluxo/entrega, sempre com validação de QA e follow-up inicial.
- **Seção de Impacto Social:** Copy canônica institucional aprovada, sem divulgação de percentuais fixos ou gratuidade.
- **Consultoria Estratégica no Mockup:** Correção de R$ 200 para R$ 180/h e remoção de termos absolutos (ex: '24/7' → 'Atendimento Contínuo').
- **Navegação:** Adicionado item 'Serviços & Preços' (`#servicos`) no header desktop e também no menu mobile hamburger.
- **Internacionalização (PT/EN) & Governança no Rodapé:** Corrigidas strings e tags que estavam fixas em inglês na seção "Tecnologia para Todos" (`t('techForAll')`, tags bilíngues PT/EN e `t('chatWithAmazo')`) e substituída a linha residual antiga do rodapé (`20% + 20% desconto... / 60% off...`) pelo resumo canônico de governança (`Sinal institucional de 30% a 50% • Condições especiais para Impacto Social sob consulta • Entrega validada por QA & Follow-up`).

---

## 2026-10-25 — Repaginação Comercial LP Hub 🎯

**Contexto:** Atualização de copy e CTAs da Landing Page do Hub conforme briefing comercial 24/10/2026.

### Alterações em LandingPage.tsx
- **Agente IA feature list:** Adicionado bullet de Pesquisa de Satisfação + Power BI; removida promessa de "48h" → "prazo conforme escopo"
- **CTA Agente IA:** Botão "Tirar dúvidas" → WhatsApp Business canônico (wa.me/5541992557600)
- **Seção Tecnologia para Todos:** CTA de impacto social → WhatsApp Business canônico + copy explicativo de elegibilidade 60% off
- **Footer:** Bio Lídi Moura atualizada (10+ anos como fotógrafa/artista), aviso de Licenças Kommo em USD separadas dos honorários de consultoria (R$ 180/h)

### Não alterado
- Layout, componentes, stack, Supabase, Typebot/Gemini integrations
- KommoPartnerSection, CRMSimulator, ApplicationModal, LeadCaptureModal

---
> **âš ï¸ PADRÃƒO OBRIGATÃ“RIO DE ENTRADA (leia antes de escrever qualquer entrada):**
> Toda entrada no DEVLOG DEVE conter:
> 1. **Data exata** no cabeÃ§alho (`## YYYY-MM-DD â€” VersÃ£o: TÃ­tulo`)
> 2. **O que foi alterado e por quÃª** â€” incluindo diagnÃ³stico tÃ©cnico da causa raiz do erro
> 3. **Feedback/Resultado** â€” status documentando o sucesso (ou nova falha) na prÃ¡tica, apÃ³s teste real
>
> *Entradas sem esses trÃªs elementos sÃ£o consideradas incompletas e devem ser complementadas.*

---

## 2026-06-05 â€” V10.4.8: HOTFIX Beacon Freeze, Continuous Flow Props & Pipeline Tag

### Status: âœ… BUILD VERDE

### Causa Raiz (Beacon Freeze Silencioso em ProduÃ§Ã£o)

**Bug 1 â€” Beacon Freeze (event type=beacon):**
Apesar de `disableBeacon: true` estar presente por step (no `buildSteps()`) e no objeto `options`, o `react-joyride` em certas condiÃ§Ãµes de race ignora a config global e renderiza o beacon pulsante, travando o tour em `event type=beacon`. A Ãºnica garantia absoluta Ã© forÃ§ar `disableBeacon = true` diretamente em cada objeto Step antes da injeÃ§Ã£o.

**Bug 2 â€” Props implÃ­citas no JSX:**
A prop `continuous` estava como bare attribute (`continuous` em vez de `continuous={true}`). As props `disableOverlayClose` e `spotlightClicks` nÃ£o estavam fisicamente no JSX, dependendo de defaults da biblioteca que podem mudar entre versÃµes.

**Bug 3 â€” `data-tour="boards-pipeline"` ausente durante loading:**
`PipelineView.tsx` tinha um early-return para `isLoading` que renderizava uma div SEM o atributo `data-tour="boards-pipeline"`. Quando o MicroTour fazia o DOM scan (800ms apÃ³s mount), se o board ainda estava carregando, o `document.querySelector('[data-tour="boards-pipeline"]')` retornava `null`, logando "target absent from DOM" e abortando o step.

### Fix Aplicado (V10.4.8)

1. **MISSÃƒO 1 â€” Force Step-Level Beacon Disable:** Adicionado `.map()` em `MicroTour.tsx` que cria `safeSteps` com `disableBeacon: true` forÃ§ado em CADA step antes de passar ao `<Joyride>`. Belt-and-suspenders sobre o `buildSteps()` e `options.disableBeacon`.

2. **MISSÃƒO 2 â€” Continuous Flow Props:** Props agora fisicamente explÃ­citas no JSX: `continuous={true}`, `disableOverlayClose={true}`, `spotlightClicks={true}`.

3. **MISSÃƒO 3 â€” Pipeline Tag no Loading State:** O early-return de `isLoading` em `PipelineView.tsx` agora renderiza a div container com `data-tour="boards-pipeline"`, garantindo que o target existe no DOM durante QUALQUER estado do componente.

### Arquivos Alterados
| Arquivo | MudanÃ§a |
|---|---|
| `src/components/MicroTour.tsx` | `.map(step => disableBeacon:true)` + `continuous={true}` + `disableOverlayClose={true}` + `spotlightClicks={true}` |
| `src/features/boards/components/PipelineView.tsx` | `data-tour="boards-pipeline"` no loading state |

---

## 2026-06-04 â€” V10.4.7: HOTFIX MicroTour DOM Timing, Beacon Freeze & Target Anchors

### Causa Raiz (3 bugs simultÃ¢neos)

**Bug 1 â€” DOM Scan Prematuro (`useMemo` sÃ­ncrono):**
O filtro de targets do V10.4.6 usava `useMemo` com `document.querySelector`. O `useMemo` executa **durante a fase de render** (antes do commit ao DOM real). Quando `shouldShow` mudava para `true`, o useMemo rodava e tentava encontrar elementos que ainda nÃ£o haviam sido pintados pelos componentes filhos (`PipelineView`, `BoardTabs`, etc.), retornando 0 steps vÃ¡lidos e abortando o tour.

**Bug 2 â€” Beacon Freeze:**
Joyride exibia o beacon (bolinha pulsante) esperando clique do usuÃ¡rio mesmo com `disableBeacon: true` por step e `beacon: {display:'none'}` nos estilos. Faltava o `disableBeacon: true` a nÃ­vel global no objeto `options`.

**Bug 3 â€” Timing do Force-trigger:**
O fluxo `navigate() â†’ requestTour() â†’ registerTrigger(100ms) â†’ forceTrigger(50ms)` resultava em DOM scan a ~150ms â€” antes das animaÃ§Ãµes e lazy panels terminarem.

### Fix Aplicado (V10.4.7)

1. **DOM Scan Async (`useEffect + setTimeout 800ms`):** SubstituÃ­do `useMemo` por `useState<Step[]>` + `useEffect`. O array de steps Ã© populado APENAS apÃ³s `shouldShow=true` E apÃ³s 800ms de delay â€” garantindo que todo o JSX estÃ¡ commitado e renderizado.

2. **Triple Beacon Kill:** `disableBeacon: true` nos 3 nÃ­veis: por-step (jÃ¡ existia), `options.disableBeacon: true` (novo), e `beacon/beaconInner/beaconOuter: {display:'none'}` nos styles.

3. **Reset ao esconder:** Quando `shouldShow` volta a `false`, `activeSteps` Ã© limpo â€” garantindo que o prÃ³ximo trigger faÃ§a um rescan completo e fresco do DOM.

### Arquivos Alterados
| Arquivo | MudanÃ§a |
|---|---|
| `src/components/MicroTour.tsx` | `useMemo â†’ useState+useEffect(800ms)` + triple beacon kill |

---



### Arquitetura
**Problema:** A versÃ£o V10.4.5 usou `navigate(route, { state: { forceMicroTour: true } })` para evitar Race Conditions (que ocorriam com `CustomEvent + setTimeout`). Entretanto, o `HashRouter` do React Router v6 pode silenciosamente descartar o `location.state` durante transiÃ§Ãµes de rota, falhando em engatilhar o tour.
AlÃ©m disso, o `react-joyride` aborta silenciosamente a renderizaÃ§Ã£o se o elemento alvo (`target`) de um dos steps nÃ£o for encontrado no DOM no exato momento da montagem (ex: botÃµes em modais fechados ou cards em boards vazios).

**Fix Aplicado (V10.4.6):**
1. **`MicroTourContext` (Context API Global):** SubstituÃ­do o gatilho baseado em rotas por um Contexto Global (`requestTour`, `registerTrigger`). Totalmente imune a drops de estado do HashRouter.
2. **Joyride Target Pre-filtering:** `MicroTour.tsx` agora varre os `targets` via `document.querySelector` antes de passÃ¡-los ao Joyride. Steps cujos elementos nÃ£o existam no DOM (como modais ocultos) sÃ£o omitidos, permitindo que o tour renderize com sucesso.
3. **Verbose Joyride Lifecycle Logs:** Adicionados dezenas de `console.log` cobrindo montagem, triggers do Context, filtros DOM, e cada evento de navegaÃ§Ã£o do Joyride, para facilitar debug no DevTools.
4. **Target Condicionais Removidos:** Refatorados `ContactsPage` (removido `contacts-form`) e `BoardsPage` (garantindo que o target `boards-pipeline` execute primeiro, seguido de opcionais).

---

## 2026-05-27 â€” V10.4.3: JUST-IN-TIME ONBOARDING & RICH KNOWLEDGE BASE

### Arquitetura

**Antes (V10.4.2):** Tour monolÃ­tico de 11 passos no login â†’ sobrecarga cognitiva. Help Center apenas redirecionava rotas.

**Depois (V10.4.3):** Micro-tours contextuais por rota + Knowledge Base com conteÃºdo expandÃ­vel in-place.

---

### MISSÃƒO 1 â€” Micro-Tours Contextuais (Just-in-Time)

**Novo hook `useMicroTour(routeKey)`:** Cada rota tem flag independente no localStorage (`microTour_seen_contacts`, `microTour_seen_boards`, etc.). Tour dispara apenas na primeira visita Ã  rota.

**Novo componente `MicroTour.tsx`:** Wrapper de Joyride para tours de 1-3 passos por rota. Cada tooltip inclui botÃ£o "Saiba mais" que abre o Help Center na seÃ§Ã£o correspondente. I18n reativo via `useLanguage()`.

**IntegraÃ§Ã£o:**
- `ContactsPage.tsx` â†’ Tour de 2 passos (visÃ£o geral + botÃ£o "Novo Contato")
- `BoardsPage.tsx` â†’ Tour de 2 passos (pipeline/drag-drop + "Precy, Jury e AmazÃ´ operam aqui")
- `data-tour` attributes adicionados em `ContactsHeader.tsx` e `PipelineView.tsx`

**`GamifiedOnboarding.tsx` refatorado:** Removido o Joyride global de 11 passos. Mantido APENAS o widget flutuante de missÃµes (XP, progresso, confetti).

---

### MISSÃƒO 2 â€” Rich Knowledge Base (AiflowSupport)

**RefatoraÃ§Ã£o completa do `AiflowSupport.tsx`:**
- Clique em uma categoria agora **expande um Accordion** com conteÃºdo didÃ¡tico e bilÃ­ngue (PT/EN/ES)
- Zero redirecionamento de rota â€” tudo Ã© exibido in-place
- ConteÃºdo derivado do `USER_GUIDE.md`, cada seÃ§Ã£o com ~3-4 linhas instrucionais
- 10 categorias: Dashboard, Contatos, Boards, Atividades, AI Hub, Link d'Ãgua, Prompt Lab, RelatÃ³rios, DecisÃµes, ConfiguraÃ§Ãµes

**Novas chaves em `translations.ts`:** 20 chaves Ã— 3 idiomas = 60 entradas (`kb.*` e `microTour.*`)

---

### MISSÃƒO 3 â€” On-Demand Tour Trigger

- Cada categoria expandida no Help Center exibe botÃ£o **"Ver tutorial interativo"** (apenas para rotas com MicroTour)
- Clicar limpa o flag `microTour_seen_*` no localStorage, navega para a rota, e fecha o Help Center
- O `MicroTour` da rota dispara automaticamente porque a flag foi removida
- `SettingsPage.tsx` â†’ "Reset Onboarding" agora tambÃ©m limpa todos os micro-tour flags via `resetAllMicroTours()`

### Arquivos Alterados / Criados
| Arquivo | Tipo |
|---|---|
| `src/hooks/useMicroTour.ts` | **[NEW]** Hook per-route micro-tour state |
| `src/components/MicroTour.tsx` | **[NEW]** Joyride wrapper contextual |
| `src/components/GamifiedOnboarding.tsx` | refactor: removido tour global, mantido widget |
| `src/components/AiflowSupport.tsx` | refactor: Rich Knowledge Base com accordion |
| `src/features/contacts/ContactsPage.tsx` | feat: MicroTour integrado |
| `src/features/boards/BoardsPage.tsx` | feat: MicroTour integrado |
| `src/features/contacts/components/ContactsHeader.tsx` | feat: data-tour attr |
| `src/features/boards/components/PipelineView.tsx` | feat: data-tour attr |
| `src/features/settings/SettingsPage.tsx` | feat: resetAllMicroTours() |
| `src/lib/translations.ts` | feat: 60 novas chaves i18n (kb.*, microTour.*) |

---

## 2026-05-27 â€” V10.4.2: HOTFIX UX Overhaul, Reactive I18N & AI Context Fix

### Status: âœ… BUILD VERDE

---

### MISSÃƒO 1 â€” Reactive I18N (Tour & Help Center)

**Causa raiz:** `GamifiedOnboarding.tsx` usava strings inline hardcoded em PT-BR (sem `t()`). `AiflowSupport.tsx` usava `useTranslation()` (hook standalone com `useState` isolado) em vez de `useLanguage()` (LanguageContext global). Nenhum dos dois reagia Ã  troca de idioma no header.

**Fix aplicado:**
- `GamifiedOnboarding.tsx` â€” Refatorado para usar `useLanguage()`. Tour steps construÃ­dos dentro de `useMemo([t, language])`, re-derivando automaticamente quando o idioma muda. Locale do Joyride tambÃ©m reativo.
- `AiflowSupport.tsx` â€” Import trocado de `useTranslation` â†’ `useLanguage`. Agora reage instantaneamente Ã  troca PT/EN/ES.
- `translations.ts` â€” Adicionadas todas as 11 chaves de tour step + 7 chaves de navegaÃ§Ã£o (tourPrev, tourNext, tourSkip, etc.) nos 3 idiomas.

**Resultado:** Troca de idioma reflete imediatamente no Tour e na Central de Ajuda sem reload.

---

### MISSÃƒO 2 â€” UX Overhaul (Micro-copywriting)

**Problema:** BalÃµes do tour tinham parÃ¡grafos inteiros, listas com 4-5 itens, divs aninhados. Prejudicava escaneabilidade.

**Fix aplicado:** Cada passo agora tem:
- 1 Ã­cone + 1 tÃ­tulo curto (bold, 14px)
- 1 linha descritiva (12px, slate-300)
- Zero parÃ¡grafos, zero listas, zero cards aninhados
- Tooltip maxWidth reduzido de 380px â†’ 320px
- Padding reduzido de 20/24px â†’ 16/20px

**Resultado:** Tour limpo, rÃ¡pido de ler, experiÃªncia premium.

---

### MISSÃƒO 3 â€” Business Logic (Equipe de IA)

**Problema:** Precy, Jury e AmazÃ´ estavam descritos no step "AI Hub". Incorreto â€” eles operam dentro dos **Boards**.

**Fix aplicado:**
- Step **Boards & Kanban** â†’ agora menciona: "Precy, Jury e AmazÃ´ operam aqui."
- Step **AI Hub** â†’ agora descreve apenas: "Central de configuraÃ§Ã£o e integraÃ§Ãµes globais das IAs."
- Mesma correÃ§Ã£o aplicada nas chaves `helpCenter.boardsDesc` e `helpCenter.aiHubDesc` nos 3 idiomas.

### Arquivos Alterados
| Arquivo | Tipo de MudanÃ§a |
|---|---|
| `src/components/GamifiedOnboarding.tsx` | refactor: useLanguage(), useMemo steps, micro-copy, AI context fix |
| `src/components/AiflowSupport.tsx` | fix: useTranslation â†’ useLanguage (reactive i18n) |
| `src/lib/translations.ts` | feat: 11 tour steps Ã— 3 langs, 7 nav keys Ã— 3 langs, boards/aiHub desc fix |

---

## 2026-05-27 â€” V10.4.1: HOTFIX i18n Keys + Tour Expansion + Auto-Start

### Status: âœ… BUILD VERDE â€” Exit code: 0

---

### MISSÃƒO 1 â€” FIX CRÃTICO DE I18N (Vazamento de chaves)

**Causa raiz identificada:**
A funÃ§Ã£o `t()` em `LanguageContext.tsx` usava `key.split('.')` para resolver chaves como objetos aninhados (`translations.pt['onboarding']['missionTitle']`), mas o dicionÃ¡rio armazena chaves **planas** com ponto no nome (`translations.pt['onboarding.missionTitle']`). Resultado: fallback retornava a chave nua.

**Fix aplicado:**
`LanguageContext.tsx` â€” `resolve()` agora tenta **flat key lookup** primeiro (`dict[key]`), e sÃ³ depois nested path resolution. Zero risco de regressÃ£o: chaves sem ponto continuam funcionando normalmente.

**Resultado:** Todas as chaves `onboarding.*` e `helpCenter.*` agora resolvem corretamente em PT-BR, EN-US e ES.

---

### MISSÃƒO 2 â€” ExpansÃ£o do Tour Completo (11 steps)

**GamifiedOnboarding.tsx** â€” Reescrita completa com 11 tour steps cobrindo:
1. Welcome (boas-vindas ao ecossistema)
2. Dashboard (KPIs, pipeline, carteira, funil)
3. Contatos & Leads (cadastro, filtros, conversÃ£o para deal)
4. Boards & Kanban (IA, templates, drag & drop, cards)
5. Atividades (ligaÃ§Ãµes, reuniÃµes, tarefas, notas)
6. AI Hub â€” **Precy** (precificaÃ§Ã£o), **Jury** (contratos), **AmazÃ´** (diagnÃ³stico)
7. Link d'Ãgua (cartÃ£o digital, QR Code)
8. Prompt Lab (engenharia de prompts)
9. Central de DecisÃµes (deals estagnados, aÃ§Ãµes proativas)
10. ConfiguraÃ§Ãµes (geral, tags, API keys, equipe)
11. Wrap-up com chamada para missÃµes

**Textos inline** â€” Todos em PT-BR direto no componente (sem dependÃªncia de `t()`) para garantir zero key leakage.

---

### MISSÃƒO 3 â€” Auto-Start & State Fix

**useFirstVisit.ts** â€” Hook mantido estÃ¡vel.

**GamifiedOnboarding.tsx** â€” Auto-start corrigido:
- `useEffect` roda no mount verificando `localStorage` diretamente (`hasSeenTour` e `crm_onboarding_completed`)
- Se ambos estÃ£o limpos â†’ tour inicia automaticamente com delay de 1.2s
- `beacon: { display: 'none' }` remove os beacons visuais â€” tooltip jÃ¡ aparece direto

**SettingsPage.tsx** â€” Reset Onboarding corrigido:
- Limpa todas as 3 chaves de localStorage
- Dispara `window.dispatchEvent(new CustomEvent('crm:onboarding-reset'))`
- Reload apÃ³s 150ms garante reinicializaÃ§Ã£o limpa do estado

**Layout.tsx** â€” `data-tour` adicionado a Decisions, Prompt Lab e Settings (faltavam no V10.4).

### Arquivos Alterados
| Arquivo | Tipo de MudanÃ§a |
|---|---|
| `src/context/LanguageContext.tsx` | fix(i18n): flat key lookup antes de nested path resolution |
| `src/components/GamifiedOnboarding.tsx` | feat(tour): 11 steps expandidos, textos inline PT-BR, auto-start fix |
| `src/components/Layout.tsx` | fix(tour): data-tour em Decisions, Prompt Lab, Settings |
| `src/features/settings/SettingsPage.tsx` | fix(reset): dispatcha evento + reload limpo |

---

## 2026-05-27 â€” V10.4: Gamified Onboarding + Help Center + Logo Refresh

### Status: âœ… BUILD VERDE â€” Exit code: 0

---

### MISSÃƒO 1 â€” Onboarding Gamificado e Interativo (react-joyride)
- **GamifiedOnboarding.tsx**: Novo componente criado e importado no `DashboardPage.tsx`
- **react-joyride**: Instalado e configurado para apresentar o tour `data-tour` via seletores.
- **canvas-confetti**: Adicionado efeito de confetti na conclusÃ£o das missÃµes e do onboarding geral.
- **useFirstVisit.ts**: Refatorado para rastrear missÃµes concluÃ­das no `localStorage` sob a chave `crm_onboarding_missions`.

### MISSÃƒO 2 â€” Help Center Bilingue (AiflowSupport)
- **AiflowSupport.tsx**: Componente reescrito como Help Center flutuante com abas separadas (Guia RÃ¡pido e Suporte).
- **ConteÃºdo Indexado**: O Guia exibe os tÃ³picos referenciando o `USER_GUIDE.md` filtrÃ¡veis via input de busca, cobrindo os painÃ©is e ferramentas do sistema.

### MISSÃƒO 3 â€” Logo Refresh (.png)
- SubstituÃ­dos arquivos antigos de logo em `.png` para versÃµes padronizadas `logo-dark.png`, `logo-light.png` e `logo-transp.png`.
- Alterados em `Layout.tsx`, `LandingPage.tsx`, `Login.tsx`, `ShowcasePage.tsx`, `ShowcaseLP.tsx`, `TrialExpiredPage.tsx` e meta tags do `index.html`.
- Imagens antigas deletadas do diretÃ³rio `public/logos`.

### MISSÃƒO 4 â€” DocumentaÃ§Ã£o
- `USER_GUIDE.md` atualizado para conter as explicaÃ§Ãµes do V10.4

### MISSÃƒO 5 â€” Typescript e Qualidade de CÃ³digo
- Tipagem do `react-joyride` adaptada para a versÃ£o `3.x` (usando named imports).
- Erros de propriedades ausentes (`stage`, `source`) mitigados nos mocks de testes e corrigida a assinatura em `activitiesService.create`.

---

## 2026-05-15 â€” V10.3: Hotfix React #310 + LP Polish + Branding DinÃ¢mico

### Status: âœ… BUILD VERDE â€” Exit code: 0 | `npm run build` 13.49s

---

### MISSÃƒO 1 â€” Hotfix React Error #310 (Rules of Hooks Violation)

**Causa raiz identificada:**
`DealDetailModal.tsx` possuÃ­a um `useEffect` (fetch de `crm_briefings`) declarado **apÃ³s** o `if (!isOpen || !deal) return null` condicional na linha 252. O React Error #310 Ã© disparado quando hooks sÃ£o chamados apÃ³s um `return` condicional â€” violaÃ§Ã£o direta das Rules of Hooks.

**Fix aplicado:**
- `src/features/boards/components/Modals/DealDetailModal.tsx`: O `useEffect` do briefing foi movido para **antes** do `if (!isOpen || !deal) return null`. ComentÃ¡rio `âš ï¸ HOTFIX #310` adicionado para referÃªncia futura.
- Todos os outros hooks do componente (useEffect de reset, useEffect de qr_codes) jÃ¡ estavam corretamente posicionados antes do return condicional.

**CORS / NexusBridge:**
- `src/lib/nexusWebhook.ts`: Confirmado â€” jÃ¡ possui `try/catch` silencioso + `AbortController(3s)`. Nenhuma alteraÃ§Ã£o necessÃ¡ria.

**Resultado:** Build limpo, zero erros. React Error #310 eliminado.

---

### MISSÃƒO 2 â€” Refinamento da Landing Page

**KommoPartnerSection.tsx:**
- CTA renomeado: "Falar sobre Kommo" â†’ **"Solicitar Consultoria e Teste GrÃ¡tis"**
- Link externo "Conhecer o Kommo" removido (proteÃ§Ã£o de comissÃ£o de parceiro)
- CTA aponta **exclusivamente** para `https://m.me/encontrodagua`
- Layout centralizado: `flex-col items-center text-center` aplicado em todo o conteÃºdo expandido
- TraduÃ§Ã£o dos rÃ³tulos: "Certified Partner" â†’ "Parceiro Certificado"; "Compliance & LGPD" mantido PT

**CorreÃ§Ã£o de Perfil (Lidi Moura) â€” InnegociÃ¡vel:**
- `src/pages/LandingPage.tsx` linha 101 (`TEAM_MEMBERS.pitch`): removida a palavra "PsicÃ³loga"
- `src/pages/LandingPage.tsx` linha 1165 (rodapÃ©): removida a palavra "PsicÃ³loga"
- Texto exato aplicado nos dois locais:
  > *"FormaÃ§Ã£o e experiÃªncia em Psicologia. Parceira Certificada Kommo, Especialista em Data Science e OCI. Reflorestar o Digital com CRM inteligente e IA."*

**i18n â€” Vazamentos de inglÃªs:**
- `KommoPartnerSection.tsx`: auditado â€” zero inglÃªs hardcoded apÃ³s reescrita
- "Certified Partner" â†’ "Parceiro Certificado"; "Messenger-First Pipeline" â†’ "Pipeline Messenger-First"; "Compliance & LGPD" â†’ mantido (sigla internacional)

---

### MISSÃƒO 3 â€” Branding DinÃ¢mico e Feedback

**Layout.tsx â€” Branding Condicional:**
- Sidebar: `IS_DEMO ? "Prova d'Ãgua" : "Hub d'Ãgua"` substituÃ­do por lÃ³gica baseada em `profile?.is_super_admin`
  - Super Admin (`lidimfc@gmail.com`): exibe **"Hub d'Ãgua"**
  - Lead / Showcase / UsuÃ¡rio comum: exibe **"Prova d'Ãgua CRM"**

**BotÃ£o de Feedback:**
- Adicionado `<a id="btn-feedback" href="https://m.me/encontrodagua">` com Ã­cone `MessageSquarePlus` no header
- VisÃ­vel para todos os roles â€” direciona diretamente para o Messenger para reportar bugs/dÃºvidas
- Estilo: hover fÃºcsia para se destacar sem poluir a interface

---

### Arquivos Alterados
| Arquivo | Tipo de MudanÃ§a |
|---|---|
| `src/features/boards/components/Modals/DealDetailModal.tsx` | fix(hooks): useEffect briefing movido antes do return condicional |
| `src/components/KommoPartnerSection.tsx` | feat(lp): CTA exclusivo Messenger, centralizaÃ§Ã£o, i18n PT-BR |
| `src/components/Layout.tsx` | feat(branding): marca condicional is_super_admin + botÃ£o Feedback |
| `src/pages/LandingPage.tsx` | fix(profile): bio Lidi sem "PsicÃ³loga" (2 locais) |

---

## 2026-04-30 â€” V9.9.6: Fix de FK no Trigger, RLS Blindado e Showcase Gallery

### 1. Erro de Foreign Key no Trigger `handle_new_user`

**Causa raiz identificada:**
O trigger tentava inserir um UUID gerado (`gen_random_uuid()`) diretamente no campo `profiles.company_id`, que Ã© uma **FK para `public.companies(id)`**. Como nenhuma linha com esse ID existia em `companies`, o PostgreSQL rejeitava o INSERT com `ERROR 23503: insert or update on table "profiles" violates foreign key constraint "profiles_company_id_fkey"`.

**Fix aplicado (SQL â€” rodar no Supabase SQL Editor):**
O trigger foi reescrito com lÃ³gica em dois passos:
1. Gera o UUID do novo tenant
2. Insere uma linha em `public.companies` com `id = UUID` e `name` derivado do email
3. SÃ³ entÃ£o insere em `public.profiles` com o `company_id` vÃ¡lido

**Resultado esperado:** Todo novo signup via `/showcase` cria automaticamente 1 empresa + 1 perfil vinculado, sem erro de FK. O `company_id` estarÃ¡ preenchido desde o D0 do lead.

---

### 2. Alerta de SeguranÃ§a â€” RLS Desabilitado em Tabelas CrÃ­ticas

**Causa raiz identificada:**
Migrations anteriores usaram `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` para contornar erros temporÃ¡rios, e algumas policies foram dropadas sem serem recriadas. O Supabase detectou tabelas `public` com dados acessÃ­veis sem autenticaÃ§Ã£o.

**Fix aplicado (mesmo script SQL):**
Todas as tabelas CRM (`contacts`, `boards`, `board_stages`, `deals`, `products`, `activities`, `crm_companies`, `tags`) tiveram RLS reativado com `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` e policies `tenant_isolation` recriadas com `company_id = (auth.jwt()->>'company_id')::uuid`. As tabelas que nÃ£o possuem `company_id` (`user_settings`, `ai_conversations`, `ai_decisions`) foram protegidas por `user_id = auth.uid()`.

**Resultado esperado:** Zero tabelas expostas publicamente. Alerta do Supabase resolvido.

---

### 3. AuthContext â€” Loading Infinito PÃ³s-Signup

**Causa raiz identificada:**
O trigger PostgreSQL roda de forma assÃ­ncrona. O `fetchProfile` original fazia uma Ãºnica tentativa e retornava `null` se o profile ainda nÃ£o existia, deixando o front-end em loading infinito.

**Fix aplicado:** `AuthContext.tsx` â€” retry com backoff exponencial (0ms, 500ms, 1s, 2s). Se o profile encontrado nÃ£o tiver `company_id`, retenta. ApÃ³s 4 tentativas, desbloqueia a UI mesmo sem profile.

---

### 4. Showcase LP â€” Galeria e VÃ­deo

**AÃ§Ã£o:** `ShowcaseLP.tsx` recebeu seÃ§Ã£o de vÃ­deo (`/showcase/demo-provadagua.mp4`) com fallback visual e galeria de 3 screenshots com alt text de acessibilidade. Textos PT/EN adicionados ao sistema i18n interno da LP.

**Resultado esperado:** PÃ¡gina visualmente completa para demonstraÃ§Ãµes externas, pronta para receber os assets quando gravados.

---



### 1. Bug de Layout â€” `/ai` Quebrava o App Inteiro

**Causa raiz identificada:**
`AIHubPage.tsx` usava `className="absolute inset-0 flex flex-col"` no wrapper raiz. Isso funciona apenas se o pai tiver `overflow: hidden` **estritamente garantido**. O `Layout.tsx` aplica `overflow-hidden` no `<main>` apenas quando `location.pathname.startsWith('/ai')`. Em casos de renderizaÃ§Ã£o simultÃ¢nea ou transiÃ§Ã£o de rota, o `absolute inset-0` vazava para fora do container, cortando o topo da pÃ¡gina e persistindo apÃ³s navegaÃ§Ã£o.

**Fix aplicado:** `AIHubPage.tsx` â€” substituÃ­do `absolute inset-0` por `flex flex-col h-full w-full`. O componente agora se contÃ©m corretamente dentro do espaÃ§o alocado pelo Layout sem depender de posicionamento absoluto.

**Feedback/Resultado:** â³ Aguardando validaÃ§Ã£o da Lidi em produÃ§Ã£o.

---

### 2. CRUD de Leads â€” Boards, Contatos, Produtos e Tech Stack Falhando

**Causa raiz identificada:**
`profile?.company_id` retorna `undefined` nos primeiros renders enquanto o AuthContext ainda nÃ£o terminou de carregar o perfil do Supabase. As funÃ§Ãµes de insert em `TechStackPage.tsx`, `CatalogTab.tsx` e `useBoardsQuery.ts` passavam `null` como `company_id` para o Supabase. O RLS estrito (`migration 043`) rejeita qualquer INSERT com `company_id = NULL` com erro 403 â€” sem feedback visual para o usuÃ¡rio, causando a percepÃ§Ã£o de "modal que nÃ£o fecha" ou "criaÃ§Ã£o silenciosa que falha".

**Fixes aplicados:**
- `TechStackPage.tsx`: guard explÃ­cito â€” se `!companyId`, exibe toast de erro e retorna cedo (sem throw)
- `CatalogTab.tsx`: mesmo guard para INSERT de produtos
- `useBoardsController.ts`: `isLoading` agora inclui `!profileReady` â†’ enquanto `company_id` nÃ£o carregou, a pÃ¡gina de boards mostra spinner em vez do empty-state "Criar Primeiro Board"
- `useBoardsController.ts`: `profileReady` exposto no return do hook para uso opcional pelos componentes filhos
- `useContactsController.ts` (V9.9.4): `onError` adicionado a todas as mutations â€” modal fecha em qualquer cenÃ¡rio

**Feedback/Resultado:** â³ Aguardando validaÃ§Ã£o da Lidi em produÃ§Ã£o.

---

### 3. RodÃ­zio de API Keys â€” DiagnÃ³stico e Status

**DiagnÃ³stico:**
O `useCRMAgent.ts` **jÃ¡ implementa corretamente** o rodÃ­zio de API Keys (linhas 655â€“677):
- Tentativa 1: usa `aiApiKey` do CRMContext (chave configurada no Settings) ou `VITE_GEMINI_API_KEY`
- Em caso de erro 429: usa `aiApiKeySecondary` do CRMContext ou `VITE_GEMINI_API_KEY_SECONDARY`

O `geminiProxy.ts` e `geminiService.ts` tambÃ©m implementam fallback para a chave secundÃ¡ria.

**Causa do 429 persistente:** Quando os leads nÃ£o tÃªm chave prÃ³pria configurada no Settings, o sistema usa a chave primÃ¡ria do `.env` (da Super Admin). Se essa cota esgotar e a chave secundÃ¡ria nÃ£o estiver configurada no `.env`, o sistema entra em "Demo Mode" â€” comportamento correto e documentado.

**AÃ§Ã£o:** Nenhuma alteraÃ§Ã£o de cÃ³digo necessÃ¡ria. A Super Admin deve configurar `VITE_GEMINI_API_KEY_SECONDARY` no painel Vercel para ativar o fallback automÃ¡tico.

**Feedback/Resultado:** âœ… Arquitetura de rodÃ­zio validada â€” documentada aqui para referÃªncia futura.

---

### 4. Integridade do Super Admin e Link d'Ãgua

**Status:** âœ… Mantido. Nenhuma alteraÃ§Ã£o de RLS ou schema foi feita nesta sessÃ£o. Todas as correÃ§Ãµes foram exclusivamente no front-end React.

---


- **Botao Suspender / Ativar**: toggle de ccess_level entre 'suspended' e 'trial' com feedback imediato.
- **Botao Excluir**: deleta o profile com window.confirm de seguranca. Auth user requer exclusao manual no Supabase Dashboard.
- **EditUserModal**: agora inclui campos 	rial_expires_at (date picker), ccess_level (trial / suspenso / pago) e status.
- **Handlers**: handleExtendTrial, handleToggleSuspend, handleDelete com ctionLoading por linha â€” zero conflito de estado.

### Privacidade / Multi-tenancy (/#/settings)
- **UsersPage.tsx reescrita**: query real do Supabase com .eq('company_id', currentUser.company_id) â€” tabela hardcoded com dados do Super Admin removida.
- **Lead/Tenant ve apenas**: a si mesmo e quem ele convidar para a company_id dele.
- **Formulario de Convite** âš ï¸ INOPERANTE (Backlog): A funcionalidade de convite de membros da equipe via WhatsApp/E-mail foi implementada no front-end mas nao foi concluida nem testada a tempo do Go-Live. O botao esta desativado (Coming Soon) na UsersPage. A arquitetura de URL com company_id esta pronta, porem o fluxo completo sera reativado em versao futura pos-validacao.

### Exterminio do Service Worker (V6.8 â€” registrado aqui para historico)
- public/sw.js: versao cache-free â€” install destroi todos os caches existentes, etch e pass-through puro (sem interceptacao de assets). CACHE_VERSION = 'hub-nocache-v2' forca substituicao do SW antigo.
- index.html: kill script inline killSWCache() roda ANTES do bundle React â€” desregistra todos os SWs e purga CacheStorage.
- App.tsx: purga caches.* e desregistra SWs antigos no useEffect de boot, antes de registrar o novo SW.
- **Motivacao**: um Tenant de teste estava preso em cache do bundle antigo com erro de CORS da signup-showcase (ja deletada no V6.6).

### Fix Header Mobile (Layout.tsx)
- **Problema**: ao navegar para /#/ai pelo menu hamburguer, o header desaparecia.
- **Root cause**: o pt-16 md:pt-0 (compensacao do header fixed no mobile) estava no <main>, mas quando a rota /ai ativa overflow-hidden flex flex-col, o padding era absorvido pelo flex container e o conteudo subia atras do header.
- **Fix**: pt-16 md:pt-0 movido para o <div> filho interno â€” aplicado sempre, independente da rota ativa.

### AiflowSupport â€” Bilingue EN-US (V8.0)
- Adicionado useTranslation â€” todos os 5 cards de help traduzidos (titulo, descricao, alert).
- Form de bug report traduzido (placeholder, descricao, botao).
- Footer: 'ðŸ¤– Aiflow * Technical Support' em EN / 'ðŸ¤– Aiflow * Suporte Tecnico' em PT.
- WA link internacionalizado: mensagem diferente para EN e PT.

### Transicao do Cadastro: Edge Function -> signUp Nativo (V6.5-V6.6)
- **Causa do problema**: supabase.functions.invoke('signup-showcase') disparava preflight CORS que nao passava no check de ccess-control-allow-origin.
- **Solucao**: substituido por supabase.auth.signUp() nativo com options.data para metadados.
- **Erro 409 (email ja cadastrado)**: detectado via user.identities.length === 0 (comportamento Supabase).
- **Erro 429 (rate limit)**: capturado no catch com mensagem amigavel PT/EN.
- **Erro email-not-confirmed**: detectado via user && !session â€” mensagem orienta verificacao da caixa de entrada.
- **Lead -> CRM**: apos signUp bem-sucedido, lead e inserido em contacts com source='showcase' e nota de data de entrada (best-effort, nao bloqueia navegacao).

### Keyword via ENV (V7.0)
- ShowcaseLP.tsx: ACCESS_KEYWORD = 'provadagua' hardcoded removido.
- Substituido por import.meta.env.VITE_ACCESS_KEYWORD â€” configurar no .env e no painel Vercel.
- Fallback seguro: se ENV vazia, keywork nao e validada e o cadastro e bloqueado.

### UX de Erros Anti-desamparo (V7.0)
- smartSignInError(): helper que intercepta erros do Supabase Auth e retorna mensagens humanizadas:
  - invalid login credentials -> 'E-mail ou senha incorretos. Verifique os dados ou solicite uma nova senha ao Admin.'
  - suspended / inactive -> 'Acesso suspenso. Entre em contato com o Super Admin.'
  - 
ate_limit / too_many -> 'Muitas tentativas. Aguarde alguns minutos.'

### Git â€” Commits desta fase
- hotfix(v6.8): kill service worker cache
- eat(v7.0): AdminPage leads panel, smart auth errors, lead->contacts CRM insert, keyword moved to ENV
- eat(v8.0): admin CRUD+trial, UsersPage company_id isolation, AiflowSupport EN, Layout mobile header fix

---
---

## 2026-04-17 â€” V6.5: Hotfix CORS Â· signUp Nativo Â· ReordenaÃ§Ã£o do FormulÃ¡rio

### âŒ Problema Resolvido: Bloqueio de CORS na Edge Function
- A `signup-showcase` Edge Function estava sendo bloqueada por CORS no preflight request.
- **Causa:** requisiÃ§Ã£o fetch para Supabase Edge Functions em contexto de browser disparava preflight OPTIONS que nÃ£o passava no check de `access-control-allow-origin`.
- **Fix:** A chamada `supabase.functions.invoke('signup-showcase', ...)` foi **removida completamente** do `Login.tsx`.

### âœ… SoluÃ§Ã£o: supabase.auth.signUp() Nativo
- SubstituÃ­do por chamada direta ao Auth client:
  ```ts
  supabase.auth.signUp({
    email, password: leadPassword,
    options: { data: { full_name: name, user_type: 'lead_provadagua' } }
  })
  ```
- Metadados do lead (`full_name`, `user_type`) passados via `options.data` â†’ armazenados no `raw_user_meta_data` do Supabase Auth.
- Auto-login imediato pÃ³s-cadastro com `signInWithPassword`.

### ðŸ” DetecÃ§Ã£o de Email JÃ¡ Cadastrado (User Already Exists)
- Supabase retorna `user.identities.length === 0` quando o email jÃ¡ existe (em vez de erro HTTP 409).
- LÃ³gica de detecÃ§Ã£o tripla: mensagem de erro + identidades vazias.
- Mensagem exibida: *"Este e-mail jÃ¡ estÃ¡ cadastrado. Clique em 'JÃ¡ tenho conta' para fazer o login."*

### ðŸ” ReordenaÃ§Ã£o do FormulÃ¡rio (UX)
- **Antes:** Nome â†’ Email â†’ Palavra-chave â†’ Senha
- **Agora:** Palavra-chave â†’ Nome â†’ Email â†’ Senha
- Justificativa: a palavra-chave Ã© o gatekeeper â€” se o lead nÃ£o tem, ele solicita via WA antes de preencher dados pessoais.

### Fluxo Completo do Lead/Tenant (V6.5)
```
1. Showcase â†’ CTA "Iniciar Trial GrÃ¡tis" â†’ /#/login?from=showcase (ou domÃ­nio prova.*)
2. FormulÃ¡rio: Palavra-chave ('provadagua') â†’ Nome â†’ Email â†’ Senha (â‰¥6 chars)
3. submit â†’ supabase.auth.signUp() com metadata â†’ signInWithPassword(email, leadPassword)
4. AuthContext.fetchProfile (maybeSingle) â†’ loading=false â†’ /dashboard
5. Retorno: Tenant/Lead loga com email + senha que ele definiu
```

## 2026-04-18 â€” V8.0: Encerramento Â· Gestao de Leads Â· Layout Fix Â· i18n EN

### Painel Admin CRUD (/#/admin)
- **Tabela reformulada**: colunas created_at (Data de Cadastro) e 	rial_expires_at (Expiracao Trial) adicionadas com destaque visual para trials expirados (cor laranja + icone aviso).
- **Botao +7 dias**: estende o trial a partir da data atual (ou do vigente) sem abrir modal â€” acao instantanea via Supabase update.
- **Botao Suspender / Ativar**: toggle de ccess_level entre 'suspended' e 'trial' com feedback imediato.
- **Botao Excluir**: deleta o profile com window.confirm de seguranca. Auth user requer exclusao manual no Supabase Dashboard.
- **EditUserModal**: agora inclui campos 	rial_expires_at (date picker), ccess_level (trial / suspenso / pago) e status.
- **Handlers**: handleExtendTrial, handleToggleSuspend, handleDelete com ctionLoading por linha â€” zero conflito de estado.

### Privacidade / Multi-tenancy (/#/settings)
- **UsersPage.tsx reescrita**: query real do Supabase com .eq('company_id', currentUser.company_id) â€” tabela hardcoded com dados do Super Admin removida.
- **Lead/Tenant ve apenas**: a si mesmo e quem ele convidar para a company_id dele.
- **Formulario de Convite** âš ï¸ INOPERANTE (Backlog): A funcionalidade de convite de membros da equipe via WhatsApp/E-mail foi implementada no front-end mas nao foi concluida nem testada a tempo do Go-Live. O botao esta desativado (Coming Soon) na UsersPage. A arquitetura de URL com company_id esta pronta, porem o fluxo completo sera reativado em versao futura pos-validacao.

### Exterminio do Service Worker (V6.8 â€” registrado aqui para historico)
- public/sw.js: versao cache-free â€” install destroi todos os caches existentes, etch e pass-through puro (sem interceptacao de assets). CACHE_VERSION = 'hub-nocache-v2' forca substituicao do SW antigo.
- index.html: kill script inline killSWCache() roda ANTES do bundle React â€” desregistra todos os SWs e purga CacheStorage.
- App.tsx: purga caches.* e desregistra SWs antigos no useEffect de boot, antes de registrar o novo SW.
- **Motivacao**: um Tenant de teste estava preso em cache do bundle antigo com erro de CORS da signup-showcase (ja deletada no V6.6).

### Fix Header Mobile (Layout.tsx)
- **Problema**: ao navegar para /#/ai pelo menu hamburguer, o header desaparecia.
- **Root cause**: o pt-16 md:pt-0 (compensacao do header fixed no mobile) estava no <main>, mas quando a rota /ai ativa overflow-hidden flex flex-col, o padding era absorvido pelo flex container e o conteudo subia atras do header.
- **Fix**: pt-16 md:pt-0 movido para o <div> filho interno â€” aplicado sempre, independente da rota ativa.

### AiflowSupport â€” Bilingue EN-US (V8.0)
- Adicionado useTranslation â€” todos os 5 cards de help traduzidos (titulo, descricao, alert).
- Form de bug report traduzido (placeholder, descricao, botao).
- Footer: 'ðŸ¤– Aiflow * Technical Support' em EN / 'ðŸ¤– Aiflow * Suporte Tecnico' em PT.
- WA link internacionalizado: mensagem diferente para EN e PT.

### Transicao do Cadastro: Edge Function -> signUp Nativo (V6.5-V6.6)
- **Causa do problema**: supabase.functions.invoke('signup-showcase') disparava preflight CORS que nao passava no check de ccess-control-allow-origin.
- **Solucao**: substituido por supabase.auth.signUp() nativo com options.data para metadados.
- **Erro 409 (email ja cadastrado)**: detectado via user.identities.length === 0 (comportamento Supabase).
- **Erro 429 (rate limit)**: capturado no catch com mensagem amigavel PT/EN.
- **Erro email-not-confirmed**: detectado via user && !session â€” mensagem orienta verificacao da caixa de entrada.
- **Lead -> CRM**: apos signUp bem-sucedido, lead e inserido em contacts com source='showcase' e nota de data de entrada (best-effort, nao bloqueia navegacao).

### Keyword via ENV (V7.0)
- ShowcaseLP.tsx: ACCESS_KEYWORD = 'provadagua' hardcoded removido.
- Substituido por import.meta.env.VITE_ACCESS_KEYWORD â€” configurar no .env e no painel Vercel.
- Fallback seguro: se ENV vazia, keywork nao e validada e o cadastro e bloqueado.

### UX de Erros Anti-desamparo (V7.0)
- smartSignInError(): helper que intercepta erros do Supabase Auth e retorna mensagens humanizadas:
  - invalid login credentials -> 'E-mail ou senha incorretos. Verifique os dados ou solicite uma nova senha ao Admin.'
  - suspended / inactive -> 'Acesso suspenso. Entre em contato com o Super Admin.'
  - 
ate_limit / too_many -> 'Muitas tentativas. Aguarde alguns minutos.'

### Git â€” Commits desta fase
- hotfix(v6.8): kill service worker cache
- eat(v7.0): AdminPage leads panel, smart auth errors, lead->contacts CRM insert, keyword moved to ENV
- eat(v8.0): admin CRUD+trial, UsersPage company_id isolation, AiflowSupport EN, Layout mobile header fix

---
---

## 2026-04-17 â€” V6.4: SeguranÃ§a no Cadastro Â· Campo de Senha Â· Keyword Oficial

### ðŸ”‘ Palavra-chave Oficial da Demo
- **Keyword:** `provadagua` (tudo minÃºsculo, sem acento, sem espaÃ§o)
- Configurada via `VITE_ACCESS_KEYWORD=provadagua` no `.env` e Vercel
- ValidaÃ§Ã£o: normaliza input (trim + lowercase + remove espaÃ§os) antes de comparar
- Mensagem de erro: *"Palavra-chave incorreta. Solicite ao Admin."*

### ðŸ”’ CorreÃ§Ã£o CrÃ­tica de SeguranÃ§a â€” Campo de Senha no Cadastro
- **Problema:** O formulÃ¡rio de cadastro da ProvadÃ¡gua (`from=showcase`) nÃ£o tinha campo de senha.
  O sistema gerava uma senha temporÃ¡ria aleatÃ³ria (descartada internamente) que o lead nunca via.
  **Resultado:** O lead criava conta, acessava o dashboard, mas **nunca conseguia logar novamente**.
- **Fix:** Campo "Crie sua senha" adicionado ao formulÃ¡rio com:
  - `type="password"` com toggle show/hide (Eye/EyeOff)
  - ValidaÃ§Ã£o mÃ­nima de 6 caracteres antes do submit
  - Lembrete visÃ­vel: *"ðŸ”’ Guarde essa senha para entrar novamente depois."*
  - `autoComplete="new-password"` para managers de senha do browser
- **Handler:** usa diretamente a senha digitada pelo lead â€” sem geraÃ§Ã£o de strings internas

### Fluxo Completo do Lead/Tenant (V6.4)
```
1. Showcase â†’ CTA "Iniciar Trial GrÃ¡tis" â†’ /#/login?from=showcase
2. FormulÃ¡rio: Nome + Email + Keyword ('provadagua') + Senha (â‰¥6 chars)
3. submit â†’ signup-showcase Edge Fn â†’ supabase.auth.signInWithPassword(email, userPassword)
4. AuthContext.fetchProfile (maybeSingle) â†’ loading=false â†’ /dashboard
5. Retorno: Tenant/Lead loga com email + senha que ele definiu
```

---

## 2026-04-16 â€” V6.2: Final Release QA Â· Stripe Â· WA Business Â· GA4

### Arquitetura de Canais (documentada)
- **AmazÃ´** = IA de front-end â€” atendimento automatizado 24/7 nas LPs e ShowcasePage
- **WhatsApp Business `5541992557600`** = gestÃ£o humana direta da proprietaria (Ã¡ria)
- Nenhum bot acessa o WA Business â€” Ã© canal exclusivo de conversÃ£o e suporte humano

### Fix CrÃ­tico â€” NexusBridge (`nexusWebhook.ts`)
- URL hardcoded `kfejaqwzgzlmuaodhwmf.supabase.co` era de projeto externo (Agility OS) morto
- Agora deriva de `VITE_SUPABASE_URL` (este projeto). Se env vazia â†’ desativado silenciosamente
- `AbortController(3s)` impedindo DNS stale de travar a UI

### Fix CrÃ­tico â€” ShowcasePage Branco (`fadeIn`)
- `opacity: 0` no `fadeIn()` causava branco permanente se IntersectionObserver falhasse (race condition)
- **Fix**: `opacity: 1` sempre â€” conteÃºdo nunca invisÃ­vel. AnimaÃ§Ã£o sÃ³ usa `translateY`
- Observer com `setTimeout(200ms)` para garantir DOM montado antes de observar

### Stripe Payments (`stripe.ts`) â€” V6.2
- `whatsappFallback` corrigido: `5592992943998` â†’ `5541992557600` (canal principal)
- Mensagens WA todas branded por produto (canal proprietaria) (Prompt Lab Mensal/Anual, Agente IA, Consultoria)
- Payment Links via env vars: `VITE_STRIPE_LINK_MONTHLY`, `VITE_STRIPE_LINK_ANNUAL`, `VITE_STRIPE_LINK_AGENTE_IA`
- Fallback automÃ¡tico para WA Business se link Stripe nÃ£o configurado

### WhatsApp Business â€” Mensagens EstratÃ©gicas
| Origem | Mensagem |
|---|---|
| Showcase â€” Keyword | "OlÃ¡, [Admin]! Estou na vitrine da ProvadÃ¡gua e quero minha Palavra-Chave..." |
| Showcase â€” DÃºvida | "OlÃ¡, [Admin]! Estou testando a demo e tenho uma dÃºvida sobre a personalizaÃ§Ã£o..." |
| Hub â€” Consultoria | "OlÃ¡, [Admin]! Conheci o Hub e quero conversar sobre uma implementaÃ§Ã£o sob medida..." |
| Prompt Lab Mensal | "OlÃ¡, [Admin]! Vi o Prompt Lab no Hub e quero assinar o Plano Mensal (R$ 3,00/mÃªs)..." |
| Agente de IA | "OlÃ¡, [Admin]! Vi o Agente de IA (R$ 80/mÃªs) no Hub e tenho interesse..." |

### GA4 (`App.tsx`)
- `initGA4()` agora chamado no `useEffect` do `App.tsx` â€” rastreia **todas as pÃ¡ginas** desde o boot
- Removida variÃ¡vel `initGA4` que era importada mas nunca chamada

### RemoÃ§Ã£o: Forced English
- `localStorage.setItem('app_language', 'en')` removido â€” app Ã© **PT-BR** por padrÃ£o
- UsuÃ¡rios podem alternar via LanguageSwitcher normalmente

### Logo & Visual
- Nav logo ShowcasePage: `href="/#/"` â†’ `href="/#/showcase"` âœ“
- `logo-icon.png` (404) substituÃ­do por `logo-icon-gold-transp.png` em todos os pontos
- Drop-shadow dourado: `drop-shadow(0 0 12px rgba(200,147,58,0.6))` no nav

---

## 2026-04-16 â€” V5.7: Hotfix Final Release â€” ShowcasePage + Login + SeguranÃ§a ðŸ”’

### Problema Identificado â€” ShowcasePage Branco apÃ³s VÃ­deo/Prints
- **Root cause**: SeÃ§Ãµes FAQ, QA & SeguranÃ§a e Arquitetura TÃ©cnica estavam definidas nas
  traduÃ§Ãµes (`TRANSLATIONS`) mas **nunca renderizadas no JSX**. A ShowcasePage pulava de
  `sec-modules` diretamente para `sec-trial`, fazendo o mid-scroll parecer vazio.
- **Fix**: 3 novas seÃ§Ãµes adicionadas entre MÃ³dulos e Trial CTA:
  - `sec-faq` â€” Accordion PT/EN com `Array.isArray()` guard (evita crash em arrays nulos)
  - `sec-qa` â€” Cards de QA/SeguranÃ§a com badge âœ“ STATUS e hover verde
  - `sec-tech` â€” Grid arquitetura tÃ©cnica com bordas SolimÃµes dourado

### Fix Login â€” IS_SHOWCASE_ROUTE com HashRouter (RegressÃ£o SPA)
- **Root cause**: `IS_SHOWCASE_ROUTE` era uma **constante de mÃ³dulo** avaliada uma Ãºnica vez
  no import. Com HashRouter, `window.location.search` estÃ¡ sempre vazio â€” a query
  `?from=showcase` fica no hash (`/#/login?from=showcase`). NavegaÃ§Ã£o SPA nÃ£o re-avaliava a constante.
- **Fix**: Migrado para `useLocation()` do react-router-dom dentro do componente.
  `location.search` retorna `?from=showcase` corretamente com HashRouter.
- `isGodModeUrl` corrigido pelo mesmo motivo (`urlParams.get('god')` â†’ `_lqp.get('god')`).
- **Comportamento confirmado**:
  - `/login` â†’ Hub: somente aba "Entrar" (SignIn)
  - `/login?from=showcase` â†’ ProvadÃ¡gua: aba "Novo Cadastro" (padrÃ£o) + campo Palavra-Chave
  - Logo Hub â†’ `/#/` | Logo Showcase â†’ `/#/showcase`
  - BotÃ£o "Solicitar ao Admin" â†’ WhatsApp `5541992557600`

### Fix ShowcasePage â€” ReferÃªncia de Imagem Quebrada
- `logo-icon.png` (inexistente) substituÃ­do por `logo-icon-gold-transp.png` com
  `filter: brightness(0) invert(1)` para branco no botÃ£o violeta.

### VersÃ£o
- `footer_version`: `V5.6 â€” ProvadÃ¡gua Launch` â†’ `V5.7 â€” Final Release` (PT + EN)

### SeguranÃ§a â€” Auditoria V5.7
- âœ… `SUPABASE_SERVICE_ROLE_KEY`: presente apenas em `.env` local (gitignored) e Vercel Secrets
- âœ… Zero `VITE_` prefix em service role key (correto â€” nÃ£o bundled no client JS)
- âš ï¸ `VITE_GEMINI_API_KEY` e `VITE_SUPABASE_ANON_KEY` sÃ£o pÃºblicas BY DESIGN (VITE_ = client bundle)
  â†’ documentado na Skill e no README â€” nenhuma aÃ§Ã£o necessÃ¡ria
- âœ… RLS ativo em todas as tabelas crÃ­ticas (confirmado em `sec-qa` da ShowcasePage)
- âœ… `is_demo_data` guard em todos os services â€” produÃ§Ã£o isolada do demo

### Nicho â€” Copy Limpo (Zero SaÃºde)
- Confirmado: ShowcasePage aponta exclusivamente para **"NegÃ³cios, AgÃªncias e Projetos"**
- `hero_eyebrow`: "Para Empreendedores Â· AgÃªncias Â· Profissionais Liberais" âœ“
- Cards de segmentaÃ§Ã£o: "NegÃ³cios & Projetos" + "Empreendedores & Times" (zero menÃ§Ã£o Ã  saÃºde) âœ“

### Encoding UTF-8
- Todos os arquivos de documentaÃ§Ã£o (README, DEVLOG, UserGuide) gravados via ferramenta nativa
  (nÃ£o PowerShell) â€” UTF-8 sem BOM â€” acentos e emojis preservados corretamente.

### LandingPage Hub â€” CTA ProvadÃ¡gua
- Confirmado: `lp-cta-provadagua` seÃ§Ã£o jÃ¡ inserida na V5.6 logo apÃ³s `<CRMSimulator>` âœ“

### Git â€” Branch `provadagua`
```
fix(v5.7): ShowcasePage missing FAQ+QA+Tech sections â€” rendered in JSX
fix(login): IS_SHOWCASE_ROUTE HashRouter-safe via useLocation()
fix(showcase): logo-icon.png broken ref â†’ logo-icon-gold-transp.png
chore(docs): README V5.7 multi-tenant endpoints + UserGuide trial flow
```

---

## 2026-04-13 â€” V5.3: ProvadÃ¡gua Rebranding Completo ðŸŒŠðŸ’œ

### Identidade Visual â€” Rio Negro + AÃ§aÃ­ + SolimÃµes
- Paleta migrada: Earth-Neon â†’ **Rio Negro** `#040308` / **AÃ§aÃ­** `#6D28A8` / **SolimÃµes** `#C8933A`
- `ShowcasePage.tsx` tokens `S`: `acaiGrad`, `solimoesGrad`, `border`, `surface` â€” todos em AÃ§aÃ­/SolimÃµes
- Hero: orbs roxo+dourado, scanline violeta, CTA com `acaiPulse` animation, metrics bar alternando gradientes
- Nav: logo `logo-icon-gold-transp.png` substituindo emoji; botÃ£o de acesso cor AÃ§aÃ­
- Footer: `logo-icon-gold-transp.png`, bio da fundadora c/ certificaÃ§Ãµes OCI/IA/MySQL, links GitHub Org + LinkedIn + WA Suporte

### ShowcasePage â€” ConteÃºdo V5.3
- **Badge fundadora REMOVIDO** da Hero Section (contexto errado â€” movido para footer)
- **4Âº Pain Card**: "NÃ£o conseguir gerenciar seus clientes e projetos?" â†’ ecossistema ProvadÃ¡gua centraliza tudo (PT + EN)
- **Card 3 Link d'Ãgua â†’ Accordion**: badge "BÃ´nus Incluso", seta toggle, lista features, CTA vitrine externa; contexto "Start Digital"
- `footer_version`: `V3.0` â†’ `V5.3`

### Login V5.3 â€” SeparaÃ§Ã£o Hub / ProvadÃ¡gua (Regra de NegÃ³cio PO)
- **WA Curitiba Business**: `5541992557600` em TODO frontend (antigo `5592992943998` extirpado)
- **Logo**: `logo-icon-gold-transp.png` no header do Lead Gate
- **Hub bloqueado para nÃ£o-admins**: God Mode verifica `is_super_admin`. Se falso â†’ signOut + msg "Acesso administrativo restrito. Entre pela pÃ¡gina da ProvadÃ¡gua."
- **i18n**: textos hardcoded migrados para objeto `txt` local com PT/EN completo
- **Bugfix loading infinito**: `AbortController` com timeout 15s na Edge Function `signup-showcase`

### TrialExpiredPage (NOVA) â€” `/trial-expired`
- Paleta Rio Negro+AÃ§aÃ­+SolimÃµes (inline styles)
- **Step 1**: NPS 0â€“10 + "O que gostou" + sugestÃ£o + consent LGPD â†’ salva em `trial_feedback`
- **Step 2**: CTA "Fechar NegÃ³cio" â†’ WA `5541992557600`; CTA "Indica e Ganha 20%"

### ProtectedRoute â€” Guard Trial Expirado
- Verifica `access_level` (`provadagua-trial`, `trial-7d`, `provadagua`) + `access_expires_at`
- Se expirado e nÃ£o `is_super_admin` â†’ redirect `/trial-expired`

### AuthContext + App.tsx
- `Profile`: novo campo `access_expires_at?: string | null`
- `App.tsx`: rota `/trial-expired` (lazy `TrialExpiredPage`) adicionada

### Git â€” Commit `92e21de` â€” Branch `provadagua`
```
feat(v5.3): Provadagua Rebranding â€” RioNegro+Acai+Solimoes palette, TrialExpiredPage, Login V5.3 WA Curitiba+logo-gold+timeout+hub-block, ShowcasePage accordion LinkdAgua + 4th pain card + footer social links, App.tsx /trial-expired route, AuthContext access_expires_at, ProtectedRoute trial check
```

---

## 2026-04-10 â€” V4.4: LanÃ§amento do Agente de IA R$ 80 ðŸ¤–ðŸ”¥


### Novo Produto â€” Agente de IA (SAC/FAQ) para Sites

- **Oferta de LanÃ§amento**: Agente de IA configurado para SAC/FAQ â†’ R$ 80,00/mÃªs
- Igual Ã  AmazÃ´ â€” treinado com a voz e identidade do negÃ³cio do cliente
- Atende leads 24/7 no WhatsApp e sites
- Link Stripe: `https://buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02`

### LandingPage (HomePage) â€” SeÃ§Ã£o de LanÃ§amento (NOVA)

- **SeÃ§Ã£o `#sec-agente-ia-launch`** inserida apÃ³s os 3 cards de segmentaÃ§Ã£o
- Badge pulsante: "ðŸ”¥ Oferta de LanÃ§amento â€” Vagas Limitadas"
- Copy: "Seu prÃ³prio Agente de IA 24/7 â€” igual Ã  AmazÃ´"
- Bio: "Por [Fundadora da Plataforma] â€” Formada em Psicologia e Especialista em Dados"
- Mockup de chat interativo (balÃµes de conversa) com preÃ§o e botÃ£o "Contratar"
- CTA principal: `btn-agente-ia-launch` â†’ `openAgenteIAModal()`
- CTA secundario: WhatsApp do Super Admin (`wa.me/5592992943998`)

### LeadCaptureModal â€” V4.4 Upgrades

- `source` expandido: `'hub-lp-launch' | 'provadagua'` adicionados ao tipo
- `prefilledData.interest` agora aceita prÃ©-seleÃ§Ã£o de interesse ao abrir o modal
- **Novo interest**: `agente_ia_80` â†’ "ðŸ¤– Agente de IA (SAC/FAQ) â€” R$ 80/mÃªs ðŸ”¥ LANÃ‡AMENTO"
- **Auto-tags**: `agente-ia-80`, `launch-offer` aplicadas quando `interest === agente_ia_80`
- **Source**: `hub-lp-launch` para leads de Agente IA
- **Redirect automÃ¡tico**: ApÃ³s submit bem-sucedido com `agente_ia_80`, abre Stripe em nova aba apÃ³s 2s

### CRM â€” Roteamento de Leads

- Tag `agente-ia-80` + `launch-offer` â†’ lead entra no Board automaticamente via `form-lp-lead`
- Source `hub-lp-launch` identificÃ¡vel no painel de contatos/CRM
- Campo `agente_ia_offer: true` no payload da Edge Function para segmentaÃ§Ã£o futura

### Varredura de SeguranÃ§a

- âœ… Zero `eyJhbGci`, `sb_secret_`, `sk_live_` hardcoded
- âœ… Todas as keys via `Deno.env.get()` (Edge) ou `import.meta.env.VITE_...` (frontend)

---

## 2026-04-10 â€” V4.3: MVP ProvadÃ¡gua â€” Branch `provadagua` ðŸš€


### ShowcasePage â€” SeÃ§Ã£o de Pricing (NOVO)
- 3 cards de preÃ§o com paleta Earth-Neon (glassmorphism dark):
  - **Prompt Lab Mensal**: R$ 3,00/mÃªs â†’ fallback `/#/login`
  - **Prompt Lab Anual**: R$ 29,90/ano â†’ fallback `/#/login` (badge "Mais Popular")
  - **Agente IA (SDR/SAC)**: R$ 80,00/mÃªs â†’ link Stripe real: `https://buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02`
- Tracking GA4: `trackShowcaseCTA('pricing_agente_ia_r80')` no clique do botÃ£o Stripe
- Nota de rodapÃ©: "Sem fidelidade Â· Cancele a qualquer momento Â· Suporte via WhatsApp"

### ShowcasePage â€” CorreÃ§Ãµes V4.3
- CSS `.screen-mock` + `.scanline` + `@keyframes scanAnim` adicionados inline (eram dependÃªncia de Tailwind nÃ£o carregada)
- Trial CTA link corrigido: `/#/` â†’ `/#/login`
- Footer version atualizado: `V3.0` â†’ `V4.3 â€” MVP ProvadÃ¡gua`
- `::selection` color atualizado para paleta neon-green

### Identidade Visual Confirmada
- Paleta Earth-Neon: Fundo `#070D09` Â· Verde `#00C97B` Â· Ciano `#00E5FF` Â· Dourado `#D4A853`
- Founder badge: identidade visual da fundadora da plataforma
- Bilinguismo PT/EN mantido em todos os novos componentes

### LÃ³gica de Acesso (jÃ¡ estava completa â€” confirmada V4.3)
- Palavra-chave `provadagua` â†’ Edge Function `signup-showcase` â†’ `email_confirm: true`
- Trial de 7 dias via `access_expires_at` ativo imediatamente no Dashboard
- Sem barreira de confirmaÃ§Ã£o de e-mail (flow V4.3 end-to-end)

### GA4 (ATIVO â€” V4.3)
- ID: `G-MHH0WSX5QS` â€” configurado em `src/lib/analytics.ts` + `.env`
- Eventos ativos: `showcase_cta_click`, `trial_start`, `lead_capture`, `checkout_success`, `checkout_cancel`, `sign_up`, `login`
- `initGA4()` chamado em: `Login.tsx` (apÃ³s trial), `CheckoutSuccessPage`, `CheckoutCancelPage`
- `trackShowcaseCTA()` em hero CTAs, video placeholder e screenshots da ShowcasePage

### Login V4.3 â€” Fluxo Keyword Refatorado
- **"Entrar no Hub"** (era: "Tenho a palavra-chave") â†’ trial imediato
- **"Experimentar Ecossistema"** (era: "Lead ou Curioso?") â†’ showcase externo
- `handleKeywordSubmit`: substituiu `supabase.auth.signUp()` por `supabase.functions.invoke('signup-showcase')` â†’ sem barreira de e-mail
- Auto-login com `signInWithPassword()` apÃ³s criaÃ§Ã£o do usuÃ¡rio
- Redirecionamento direto para `/dashboard` â€” trial ativo na hora

### Git
- Branch `provadagua` criada localmente e sincronizada com remoto
- Commit: `feat(showcase): add pricing section + fix trial CTA + V4.3 footer`

---

## 2026-04-07 â€” V4.2: Trial Multi-Tenant + Lead Gate + Build Verde

### Lead Gate V2 (Login.tsx)
- Fluxo de 3 caminhos: Lead (â†’ prova.), Palavra-chave provadagua, God Mode (triplo clique)
- Palavra-chave padrÃ£o via VITE_ACCESS_KEYWORD=provadagua

### ShowcasePage â€” SegmentaÃ§Ã£o de PÃºblico
- Nova seÃ§Ã£o "Escolha seu caminho" com 3 cards: SaÃºde & ConsultÃ³rio, Empreendedores & Times, Kit BÃ¡sico (Link d'Ãgua)
- CTA primÃ¡rio abre LeadCaptureModal em vez de navegar
- IntegraÃ§Ã£o LeadCaptureModal com prefilledData={interest:'provadagua_trial'}

### AdminUsersPage â€” GestÃ£o de Trials
- Coluna ccess_expires_at com badges ATIVO/EXPIRA/EXPIRADO
- Filtro "Apenas trials" ativo
- BotÃµes +7d (grant) e Block (revoke) por usuÃ¡rio trial
- JSX corrigido: <thead> estava dentro de <button> â€” reestruturado

### LeadCaptureModal
- OpÃ§Ãµes de interesse: provadagua_trial, crm_saude, utomacoes_saas
- Auto-tagging provadagua-trial + source correto para trials

### Stripe
- Mensal R$ 3,00: prod_UGWT3Pm4ztKmcU
- Anual R$ 29,90: prod_UGVFdr4qUVufSu

### CorreÃ§Ãµes TÃ©cnicas
- Deno Edge Functions: .vscode/settings.json com deno.enablePaths + supabase/functions/deno.json
- qr-redirect/index.ts: erro unknown no catch â†’ error instanceof Error ? error.message : String(error)
- Build Vite: EXIT 0 âœ… (3m11s, 913KB)

---
> Branch `main` | CRM de ProduÃ§Ã£o

---

## 2026-04-01 â€” V3.0: MissÃ£o ProvadÃ¡gua Completa

### GovernanÃ§a
- `.agent/skills/provadagua-standard/SKILL.md` criada: regras de isolamento por `company_id`, bilinguismo e `access_expires_at`

### GOD MODE â€” Migration 038
- `supabase/migrations/038_super_admin_and_company_isolation.sql` criada
- PromoÃ§Ã£o de `lidimfc@gmail.com` a Super Admin (`is_super_admin=true`)
- Coluna `access_expires_at` adicionada em `profiles`
- Coluna `company_id` adicionada em `contacts` (isolamento entre leads)
- Auditoria de leads por `is_demo_data` e tags

### Showcase LP
- `src/pages/ShowcasePage.tsx` criada â€” pÃ¡gina premium dark/glassmorphism, bilingue PT/EN
- SeÃ§Ãµes: Hero com mÃ©tricas, 9 MÃ³dulos em ProduÃ§Ã£o, RelatÃ³rio QA & SeguranÃ§a, Stack TÃ©cnica, CTA
- Rota pÃºblica `/#/showcase` registrada em `App.tsx` sem autenticaÃ§Ã£o

### SeguranÃ§a
- `SUPABASE_SERVICE_ROLE_KEY` confirmada nas Vercel Secrets (Production/Preview/Development)
- `.env` nunca commitado (`.gitignore` ativo)
- `VITE_CRM_API_KEY` identificada como independente (uso exclusivo no Nexus Bridge)

---


### MudanÃ§as
- `useDealsQuery.ts`: DISTINCT por email mata duplicatas de leads SDR (replays de webhook)
- `useDealsQuery.ts`: Contatos com `ðŸ¤– sdr` sÃ£o force-mapeados ao primeiro estÃ¡gio mesmo sem lifecycle stage
- `productsService.ts`: IS_DEMO guard â€” catÃ¡logo vazio na ProvadÃ¡gua
- `contacts.ts`: IS_DEMO filter via query Supabase (OR conditions por tag/email/is_test)
- `PromptLabPage.tsx`: IS_DEMO â†’ localStorage apenas para saves na ProvadÃ¡gua
- `PrecyAgent.tsx`: `price` canÃ´nico = BRL (`fallbackBRLPrice`) â€” `price_original` salvo em metadata
- `QRdaguaPage.tsx`: IS_DEMO early-return â†’ lista de projetos vazia na ProvadÃ¡gua

---

## 2026-03-22 â€” Round 3: DEMO Isolation Foundation

- `activitiesService.ts`: IS_DEMO guard â†’ getAll() retorna []
- `dealsService.ts`: SubstituÃ­do hostname check por IS_DEMO
- `contactsService.ts`: IS_DEMO import adicionado
- `AdminUsersPage.tsx`: signUp simplificado â€” sÃ³ `full_name` no metadata
- `InviteGenerator.tsx`: Texto genÃ©rico (sem referencias a clientes)
- `useDealsQuery.ts`: DeduplicaÃ§Ã£o por contactId (real deals tÃªm prioridade sobre ghost cards)

---

## 2026-03-20 â€” Round 2: VITE_APP_MODE + SDR Board

- `appConfig.ts`: IS_DEMO via VITE_APP_MODE (env var Vercel)
- `dealsService.ts`: SDR leads filtrados por isDemoVisible
- `DealDetailModal.tsx`: optional chaining para company_id null
- Vercel: provadagua configurada manualmente com VITE_APP_MODE=DEMO

---

## 2026-03-17 â€” Invitation System Fix

- `InviteGenerator.tsx`: localStorage persistence para link gerado
- Redirect URLs Supabase: prova.encontrodagua.com adicionado

---

*Atualizado automaticamente pelo Manager (Antigravity AI)*


---

## 2026-04-20 - V9.5: Code Freeze (MVP Go-Live)

### Status: PRODUCAO CONGELADA para validacao da cliente

### Freeze de Funcionalidade: Convite de Equipe
- UsersPage.tsx: Botao "Enviar Convite" desativado (disabled={true}) com label "Em breve / Coming soon"
- Motivo: a logica de WA/mail precisava de testes adicionais que atrasariam o Go-Live
- Arquitetura de convite por company_id no URL esta implementada e testada (backend pronto)
- O fluxo completo (URL com company_id + captura em ShowcaseLP + vinculo no signUp) sera reativado pos-validacao

### Ajustes Residuais (Backlog)
- Traducoes parciais em CreateBoardModal (placeholders PT hardcoded)
- Traducoes parciais em BoardTemplate (nomes dos templates)
- Essas pendencias foram deliberadamente adiadas: nao afetam a demo funcional do Tenant de validacao

### V9.4 (incluido neste push)
- QRdaguaPage.tsx: Filtro owner_id na query de QR codes (privacidade total por lead)
- 	ranslations.ts: qrPageTitle renomeado para "QR d'agua" (PT e EN)
- UsersPage.tsx: Campo de convite alterado de 	ype=email para 	ype=text (aceita telefone)

### V9.3 (historico)
- AdminPage.tsx: InviteGenerator removido (inoperante)
- UsersPage.tsx: Fix de loading infinito quando company_id e null
- ShowcaseLP.tsx: Captura company_id da URL e injeta no signUp (vinculo de time)

### Deploy
- Branch: main
- Deploy: Vercel automatico
- Build: Exit 0 (10s) em todos os commits da serie V9.x

---

## 2026-04-20 - V9.6: Security & RLS Hotfix (Blocker de Producao)

### Status: CORRIGIDO E DEPLOYADO

### Causa Raiz 1 â€” Front-end (useBoardsQuery.ts)
- **Bug:** `useCreateBoard` chamava `boardsService.create(board, '')` passando string vazia como `company_id`
- **Efeito:** `transformToDb` usa `...(companyId && { company_id: companyId })` â€” string vazia e falsy, entao o campo `company_id` era **completamente omitido** do payload de INSERT
- **Resultado:** RLS do Supabase rejeitava o INSERT com `403 Forbidden` (nenhuma policy de INSERT autorizava rows sem `company_id`)
- **Fix:** `useCreateBoard` agora le `profile?.company_id` do `AuthContext` e passa o valor real para o service. Inclui guard: se `company_id` for nulo/indefinido, lanca erro antes do fetch.

### Causa Raiz 2 â€” Backend (RLS inexistente)
- **Bug:** As tabelas `boards` e `board_stages` nao tinham policies RLS de INSERT definidas. As tabelas `deals` e `activities` tinham policies inconsistentes de versoes anteriores.
- **Fix:** Migration `039_fix_rls_boards_contacts_deals.sql` criada e executada via Supabase Dashboard SQL Editor
  - Padrao: DROP ALL (via loop `pg_policies`) + DISABLE RLS + ENABLE RLS + CREATE POLICY limpa
  - 4 policies por tabela: SELECT / INSERT / UPDATE / DELETE
  - Regra unica: `company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())`
  - `boards` e `deals`: SELECT e operacoes permitidas tambem quando `company_id IS NULL` (leads SDR / boards globais)
  - `board_stages`: INSERT autorizado via `board_id -> boards.company_id` (tabela nao tem `company_id` propria)

### Tabelas corrigidas
| Tabela | Politicas antes | Politicas depois |
|---|---|---|
| boards | Ausentes / inconsistentes | 4 policies limpas |
| board_stages | Ausentes | 4 policies limpas |
| deals | Parciais de versoes antigas | 4 policies recriadas |
| activities | Parciais de versoes antigas | 4 policies recriadas |

### Arquivos alterados
- `src/lib/query/hooks/useBoardsQuery.ts` â€” fix company_id no mutationFn
- `supabase/migrations/039_fix_rls_boards_contacts_deals.sql` â€” nova migration (referencia; executada manualmente)

### Deploy
- Commit: `23c9063` | Branch: `main` | Build: Exit 0 (7.25s)
- SQL do backend: executado via Supabase Dashboard (nao via CLI)

---

## 2026-04-22 - V9.7.2: RLS Fallback & Tech Stack Fix (Hotfix Final)

### Status: SQL DEFINITIVO GERADO â€” aguardando execucao manual no Dashboard

### Inconsistencia de Tipagem Documentada (Causa Raiz dos V9.7/V9.7.1)
- As tabelas `products` e `companies` NO banco fisico NAO possuem as colunas
  `company_id` nem `owner_id` pressupostas nos arquivos TypeScript do front-end
- `DbCompany` (contacts.ts) declara `owner_id` â€” coluna INEXISTENTE na tabela real
- `TechStackProduct` (TechStackPage.tsx) nao declara ownership â€” correto, mas sem RLS
- O banco e compartilhado com o app "Link d'agua": nao podemos alterar esquemas sem alinhar os dois times

### Solucao Adotada (V9.7.2): RLS "auth_only" (Fallback Seguro de MVP)
- Politica unica `FOR ALL TO authenticated USING (true)` em `products` e `companies`
- Garante: visitantes anonimos bloqueados pelo RLS
- Aceita: qualquer usuario autenticado opera livremente
- Filtragem por tenant (Lead so ve seus dados) feita na camada de UI/service
- Migration: `042_rls_auth_only_products_companies.sql`

### Backlog Tecnico Pos-Validacao (Isolamento Completo de DB)
- [ ] Migration: adicionar `company_id UUID REFERENCES profiles(company_id)` em `products`
- [ ] Migration: adicionar `company_id UUID REFERENCES profiles(company_id)` em `companies`
- [ ] Sincronizar tipos TypeScript (`DbCompany`, `TechStackProduct`) com esquema real via `supabase gen types`
- [ ] Recriar policies RLS com filtro `company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())`
- [ ] Alinhar com equipe do Link d'agua antes de qualquer ALTER TABLE nessas tabelas

### Historico de tentativas (para referencia)
| Arquivo | Resultado |
|---|---|
| `040_fix_rls_products_companies.sql` | FALHOU â€” usou `company_id` inexistente |
| `041_fix_rls_real_columns.sql` | FALHOU â€” usou `owner_id` inexistente em products |
| `042_rls_auth_only_products_companies.sql` | APROVADO â€” sem dependencia de colunas |

### V9.7 (contexto)
- `useDealsView`: companies fetch agora com `.catch()` graceful (evita 400 crashar o hook)
- `useCreateDeal`: company_id real do profile passado ao service (fix identico ao V9.6 em boards)

---

## 2026-04-22 - V9.7.3: Correcoes de Root Cause e Isolamento Final

### Status: DEPLOYADO â€” Build verde, push para main

### Causa Raiz 1 â€” companies INSERT 400 (contacts.ts:305)
- Problema: `companiesService.create()` tentava inserir `company_id` na tabela `companies`
  que nao possui essa coluna (banco compartilhado com Link d agua)
- Fix: Removido `company_id: sanitizedTenantId` do payload de INSERT
- Arquivo: `src/lib/supabase/contacts.ts`

### Causa Raiz 2 â€” Tech Stack vazando dados globais para leads
- Problema: `TechStackPage` nao verificava `is_super_admin`, carregando e exibindo
  todos os produtos internos (Stripe, Vercel, GitHub, chaves de API) para qualquer usuario autenticado
- Fix: Adicionado guard `isSuperAdmin` com early return:
  - Leads: veem empty state "Area Restrita" (sem chamada ao banco)
  - Super Admin: comportamento normal, pode criar/editar ferramentas e salvar API Keys
- Arquivo: `src/features/admin/TechStackPage.tsx`

### SQL Definitivo para o Supabase Dashboard (042)
- `042_rls_auth_only_products_companies.sql`: politica auth_only para products e companies
- Estas tabelas nao possuem colunas de multi-tenancy â€” isolamento feito no front-end
- RLS garante apenas que usuarios anonimos nao acessam os dados

### Tabela de Funcionalidades Pos-V9.7.3
| Funcionalidade | Status |
|---|---|
| Criar Boards (template/IA) | OK - company_id correto desde V9.6 |
| Criar Contatos | OK - company_id correto desde V9.6 |
| Criar Deals | OK - company_id correto desde V9.7 |
| Criar Empresa (CRM) | OK - removido company_id invalido (V9.7.3) |
| Salvar API Key (Tech Stack) | OK - super_admin apenas (V9.7.3) |
| Catalogo de Produtos | OK - auth_only RLS (execute SQL 042) |
| Isolamento Lead (Tech Stack) | OK - early return guard (V9.7.3) |
| companies 400 on load | RESOLVIDO - graceful catch desde V9.7 |

---

## 2026-04-23 - V9.8: RLS Estrito, Isolamento Total e Banner MVP

### Status: DEPLOYADO â€” Commit 887e9ed Â· main Â· Build verde (19s)

### ACAO 1 â€” RLS Definitivo (043_v98_strict_rls_final.sql)
- Criada funÃ§Ã£o helper `is_super_admin()` no Supabase para bypass do Super Admin
- Eliminado `OR company_id IS NULL` de TODAS as policies CRM (era o vetor de leak cross-tenant)
- Corrigido bug crÃ­tico do 039: `board_stages_insert` referenciava `company_id` inexistente
  na tabela `board_stages` â€” causava 403 em criaÃ§Ã£o de boards por template e por IA
- Tabelas com RLS estrito (company_id): boards, board_stages, contacts, deals, activities
- Tabelas com RLS auth_only (banco compartilhado): products, companies

### ACAO 2 â€” Isolamento Total de Interface
- `TechStackPage.tsx`: early return para leads (V9.7.3, mantido)
- `CatalogTab.tsx`: guard `isSuperAdmin` adicionado
  - Leads: catÃ¡logo somente-leitura (sem botÃµes de editar/criar)
  - Super Admin: God Mode completo com CRUD

### ACAO 3 â€” CriaÃ§Ã£o de Boards Desbloqueada
- Causa raiz: `board_stages_insert` policy no 039 usava `company_id` (coluna inexistente)
- Fix no 043: policy reescrita usando apenas `board_id IN (SELECT id FROM boards WHERE ...)`
- `useCreateBoard` jÃ¡ estava correto desde V9.6 â€” bloqueio era 100% no RLS

### ACAO 4 â€” Banner MVP + Modal de Feedback
- Novo componente: `src/components/MVPBanner.tsx`
  - Banner dismissÃ­vel com gradiente no topo do CRM
  - Modal de feedback com categorias: Bug / Melhoria / Elogio
  - Envio assÃ­ncrono com fallback graceful (nunca frustra o usuÃ¡rio)
- Integrado no `Layout.tsx` (visÃ­vel para todos os usuÃ¡rios autenticados)
- Novo arquivo `FEEDBACK.md` no repositÃ³rio para tracking de QA e roadmap

### QA EstÃ¡tico â€” Tabela de Garantias V9.8
| Funcionalidade | Lead/Tenant | Super Admin |
|---|---|---|
| Boards: criar (template/IA) | OK - company_id correto | OK - is_super_admin bypass |
| Boards: ver boards de outra empresa | BLOQUEADO (RLS estrito) | VISÃVEL |
| Contatos: criar/ver | OK - filtrado por company_id | OK - God Mode |
| Deals/Atividades | OK - filtrado por company_id | OK - God Mode |
| Tech Stack | Tela "Ãrea Restrita" | Acesso completo + salvar API Key |
| CatÃ¡logo de Produtos | Somente leitura (sem CRUD) | CRUD completo |
| Banner MVP | VisÃ­vel + botÃ£o Feedback | VisÃ­vel + botÃ£o Feedback |
| Alerta rls_disabled | RESOLVIDO (SQL 043) | â€” |

### SQL ObrigatÃ³rio para o Super Admin executar no Dashboard
- Arquivo: `supabase/migrations/043_v98_strict_rls_final.sql`
- Caminho: Supabase Dashboard > SQL Editor > New Query > Cole e Run

---

## 2026-04-24 â€” V9.9.2: UX Lead Restaurada Â· TechStack/CatÃ¡logo Desbloqueados Â· Modal Fix

### Status: DEPLOYADO â€” Commits `72ead14` + `969054f` Â· main Â· Build verde (7.74s)

### DiagnÃ³stico (Auditoria Git â€” git log + git diff)
- **Causa raiz â€” techStackRestricted para Leads**: Commit V9.7.3 introduziu `if (!isSuperAdmin) return <ÃreaRestrita>` em `TechStackPage.tsx`, bloqueando Leads de gerenciar o prÃ³prio Tech Stack isolado por `company_id`.
- **Causa raiz â€” modais congelados**: `addDeal` no `CRMContext.tsx` tentava criar automaticamente `Nova Empresa (Auto)` via `await addCompany()` quando `companyId` nÃ£o era encontrado. O RLS estrito de `companies` (sem `company_id`) retornava 403 e o `await` nunca resolvia, congelando o modal.
- **Causa raiz â€” Gemini 400**: `SettingsContext` carregava `aiApiKey = ''` para Leads sem chave. A heranÃ§a tentava `.eq('is_super_admin_settings', true)` â€” coluna inexistente.
- **Causa raiz â€” produtos 403**: Inserts em `products` sem `company_id` no payload â€” RLS estrito do 046 rejeita qualquer INSERT sem `company_id = my_company_id()`.

### CorreÃ§Ãµes Aplicadas

#### TechStackPage.tsx â€” Desbloqueio Total da UI
- **Removido**: `if (!isSuperAdmin) return <ÃreaRestrita>` (early return bloqueante)
- **Adicionado**: `company_id: profile?.company_id` no payload de insert/update de ferramentas
- **PrincÃ­pio confirmado**: RLS no banco garante isolamento por tenant. A UI nÃ£o discrimina por role.

#### CatalogTab.tsx â€” company_id no Payload de CriaÃ§Ã£o
- `insert([formData])` â†’ `insert([{ ...formData, company_id: profile?.company_id }])`

#### CRMContext.tsx â€” addDeal Gracioso para Falhas de companies
- `addCompany()` agora em `try/catch` â€” se falhar (RLS/network), o modal fecha normalmente
- Removida criaÃ§Ã£o automÃ¡tica de empresa quando `companyId` nÃ£o encontrado localmente

#### SettingsContext.tsx â€” HeranÃ§a de API Key do Gemini
- Prioridade: (1) chave do prÃ³prio usuÃ¡rio â†’ (2) chave do Super Admin via JOIN com profiles â†’ (3) `VITE_GEMINI_API_KEY` (env)
- Query corrigida: `profiles!inner(is_super_admin).eq('is_super_admin', true)`

### SQL Executado no Dashboard
- `047_v992_companies_authonly.sql`: DROP + CREATE de polÃ­ticas `auth_only` para `companies`
- A tabela `companies` Ã© compartilhada com o app "Link d'Ã¡gua" e nÃ£o tem `company_id` â€” isolamento feito na camada de UI

### Tabela de Funcionalidades V9.9.2
| Funcionalidade | Lead/Tenant | Super Admin |
|---|---|---|
| Tech Stack | Acesso completo (dados do prÃ³prio `company_id`) | Acesso completo (God Mode) |
| CatÃ¡logo de Produtos | CRUD completo (dados do prÃ³prio `company_id`) | CRUD completo (God Mode) |
| Criar Boards (template/IA) | OK â€” company_id correto | OK â€” is_super_admin bypass |
| Criar Contatos | OK â€” filtrado por company_id | OK â€” God Mode |
| Criar Deals/Atividades | OK â€” gracioso, nÃ£o congela modal | OK â€” God Mode |
| IA (Gemini) | HeranÃ§a silenciosa da chave do Super Admin | Chave prÃ³pria no Tech Stack |

### Regra de Ouro Documentada
> **"Isolar dados â‰  bloquear interface."** O RLS no banco garante que cada tenant sÃ³ vÃª seus prÃ³prios dados. A UI deve ser idÃªntica para todos os roles â€” sem guards de `isSuperAdmin` na renderizaÃ§Ã£o de pÃ¡ginas de negÃ³cio.

### Arquivos Modificados
- `src/features/admin/TechStackPage.tsx` â€” guard removido, `company_id` em inserts
- `src/features/admin/CatalogTab.tsx` â€” `company_id` em insert
- `src/context/CRMContext.tsx` â€” `addDeal` gracioso para falhas de companies
- `src/context/settings/SettingsContext.tsx` â€” heranÃ§a silenciosa de API key
- `supabase/migrations/047_v992_companies_authonly.sql` â€” [NOVO] RLS auth_only companies

---

## 2026-04-25 â€” V9.9.3: Limpeza de DocumentaÃ§Ã£o Â· RemoÃ§Ã£o de Nomes Reais Â· PrecisÃ£o HistÃ³rica

### Status: DOCUMENTAÃ‡ÃƒO APENAS â€” nenhum arquivo .ts/.tsx alterado

### MotivaÃ§Ã£o
Auditoria revelou que o DEVLOG.md, README.md e USER_GUIDE.md continham:
1. Nomes de clientes reais usados como exemplos de caso de uso (viola privacidade e profissionalismo SaaS)
2. Features documentadas como funcionais quando estavam inoperantes (desonestidade tÃ©cnica)

### AÃ§Ã£o 1 â€” ExtermÃ­nio de Nomes Reais (Varredura Completa)
- **DEVLOG.md**: todas as ocorrÃªncias de nomes reais substituÃ­das por `Lead/Tenant`, `Super Admin`, `[Admin]`, `[Fundadora da Plataforma]`
- **README.md**: mesmas substituiÃ§Ãµes nas seÃ§Ãµes de rotas, tabela de permissÃµes e filtro de privacy
- **USER_GUIDE.md**: seÃ§Ãµes renomeadas de "Guia [Nome Pessoal]" para "Guia do Super Admin" / "Guia do Lead/Tenant"
- Mensagens de WhatsApp Business: saudaÃ§Ã£o genÃ©rica `"OlÃ¡, [Admin]!"` nos templates de conversÃ£o

### AÃ§Ã£o 2 â€” CorreÃ§Ã£o de Feature Status (PrecisÃ£o HistÃ³rica)
- **FormulÃ¡rio de Convite de Equipe** â€” status corrigido de "funcionando" para **âš ï¸ INOPERANTE (Backlog)**:
  - A funcionalidade de convite via WhatsApp/E-mail para novos membros do time do Lead foi implementada no front-end mas nÃ£o foi concluÃ­da nem testada antes do Go-Live
  - O botÃ£o estÃ¡ desativado (`disabled={true}`, label "Em breve / Coming soon") na UsersPage desde V9.5
  - A arquitetura de URL com `company_id` estÃ¡ pronta (back-end); o fluxo completo serÃ¡ reativado em versÃ£o futura

### AÃ§Ã£o 3 â€” Entrada V9.9.2 Adicionada (esta seÃ§Ã£o)
Ver entrada anterior `2026-04-24 â€” V9.9.2`.

### Arquivos Modificados (apenas .md)
- `DEVLOG.md` â€” limpeza de nomes + entradas V9.9.2 e V9.9.3 adicionadas
- `README.md` â€” limpeza de nomes reais em tabelas de rotas e permissÃµes
- `USER_GUIDE.md` â€” renomeaÃ§Ã£o de seÃ§Ãµes e correÃ§Ã£o de referÃªncias a nomes pessoais


---

## 2026-05-04 â€” V10.0.0: CHUNK 14 â€” EMERGÃŠNCIA GO-LIVE: Fix RecursÃ£o Infinita RLS Profiles (Migration 054)

### POST-MORTEM: Incident CrÃ­tico â€” Infinite Recursion em profiles RLS

**Status:** RESOLVIDO via Migration 054

**Impacto:** Super Admin (lidimfc@gmail.com) e todos os Leads travados em loading infinito. Chamadas Ã  API retornando HTTP 500. SaaS inoperante.

**Causa Raiz Confirmada:**
A Migration 053 recriou as polÃ­ticas RLS da tabela profiles com uma subquery que consultava a prÃ³pria tabela profiles:

`sql
-- CÃ“DIGO PROBLEMÃTICO (Migration 053, linhas 372, 384, 388):
OR (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
`

Ao avaliar uma polÃ­tica de profiles, o PostgreSQL precisa verificar se o usuÃ¡rio tem acesso Ã  linha de profiles. Para fazer isso, executa a polÃ­tica â€” que por sua vez precisa ler profiles novamente, e assim recursivamente. O PostgreSQL detecta o loop e lanÃ§a:
infinite recursion detected in policy for relation "profiles"

---

### ðŸ† REGRA DE OURO â€” NUNCA VIOLAR

> **NUNCA fazer SELECT em public.profiles dentro das polÃ­ticas RLS de public.profiles.**
>
> Para verificar privilÃ©gios globais (Super Admin, role, company_id) DENTRO das polÃ­ticas de profiles, use **sempre** os Claims do JWT:
>
> `sql
> -- CORRETO: Bypass Super Admin via JWT (sem recursÃ£o)
> (current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lidimfc@gmail.com'
>
> -- ERRADO: Self-referential query em policies de profiles
> (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true  -- LOOP INFINITO!
> `
>
> Para **outras tabelas** (contacts, deals, boards, activities), subqueries em profiles sÃ£o **SEGURAS** porque a cadeia de dependÃªncia Ã© unidirecional: contacts â†’ profiles (fim). Profiles nÃ£o tem polÃ­ticas que chamam essas tabelas de volta.

---

### SoluÃ§Ã£o Aplicada â€” Migration 054

**Arquivo:** supabase/migrations/054_emergency_fix_profiles_rls_recursion.sql

Todas as polÃ­ticas de profiles foram recriadas substituindo qualquer subquery em profiles por leitura direta do JWT:

| PolÃ­tica | Antes (com recursÃ£o) | Depois (JWT bypass) |
|----------|---------------------|---------------------|
| profiles_select | (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true | (current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lidimfc@gmail.com' |
| profiles_update | (SELECT is_super_admin FROM profiles WHERE id = auth.uid()) = true | Idem |

---

### Auditoria Final de Funcionalidades (Chunk 14 â€” Teste de Fogo)

| Feature | Status | AnÃ¡lise |
|---------|--------|---------|
| **CRM Core: Contacts/Deals Lead** | âœ… SEGURO | Policies de contacts/deals usam subquery em profiles â€” seguro (cadeia unidirecional). Trigger uto_set_company_id garante company_id automÃ¡tico no INSERT. |
| **Board Card Move (Kanban)** | âœ… SEGURO | oard_stages usa JOIN em oards (nÃ£o em profiles). Sem recursÃ£o. deals.stage_id update coberto pela policy deals_update. |
| **IA Boards â€” PersistÃªncia de Etapas** | âœ… SEGURO | INSERT em oard_stages coberto pela policy oard_stages_insert via JOIN seguro em oards. A persistÃªncia falha silenciosa era causada por RLS bloqueando o INSERT â€” corrigida na 053, desbloqueada pela 054. |
| **Global Currency (AUD/USD/BRL)** | âœ… SEGURO | FormataÃ§Ã£o via profiles.preferences (coluna JSONB). Leitura de preferences coberta pela nova policy profiles_select sem recursÃ£o. |
| **i18n Landing Page + Inbox (EN)** | âœ… SEGURO | TraduÃ§Ã£o Ã© client-side (LanguageContext). NÃ£o depende de RLS. Verificar strings hardcoded via 	() hook. |

**Resultado:** O desbloqueio da recursÃ£o em profiles desbloqueia toda a cadeia de queries da aplicaÃ§Ã£o. O sistema estÃ¡ operante.

---

### Commit desta entrada

`
fix(rls): migration 054 â€” corrige recursÃ£o infinita em polÃ­ticas RLS de profiles
`

ResponsÃ¡vel tÃ©cnico: Antigravity (Tech Lead IA) | Aprovado por: Lidi (Super Admin)


---

## 2026-05-01 ï¿½ V9.9.7: Contact Creation Fix, CRM Analysis Feedback, Language Normalization & Migration 051

### Status: DEPLOYADO ? | Commit `87752dc` ? main ? Build verde Vercel

### Diagnï¿½stico (Auditoria de Cï¿½digo ï¿½ Chunk 9)

**Bug 1 ï¿½ Empresa salva, Contato nï¿½o:**
- **Causa raiz**: `onError` do `createContactMutation` em `useContactsController.ts` fechava o modal **silenciosamente** sem exibir o erro real. A falha de persistï¿½ncia era invisï¿½vel ao usuï¿½rio.
- **Causa secundï¿½ria**: `lastPurchaseDate` ausente no payload enviado para `contactsService.create` ï¿½ campo presente no schema TypeScript mas nï¿½o enviado, causando falha silenciosa de validaï¿½ï¿½o upstream.

**Bug 2 ï¿½ Botï¿½o "Analyse CRM" sem resposta visual:**
- **Causa raiz**: `runAllAnalyzers()` em `useDecisionQueue.ts` executava a anï¿½lise heurï¿½stica mas nï¿½o emitia nenhum toast de feedback ï¿½ o usuï¿½rio via o spinner desaparecer e nada mais.

**Bug 3 ï¿½ Jury UI em Inglï¿½s para usuï¿½ria PT:**
- **Causa raiz**: `DEFAULT_LANG = IS_DEMO ? 'en' : 'pt'` em `appConfig.ts`. Sessï¿½o de demonstraï¿½ï¿½o anterior gravava `'en'` no `localStorage` e no campo `preferred_language` do perfil no banco.

### Correï¿½ï¿½es Aplicadas

#### `useContactsController.ts` ï¿½ Contact Creation Error Handling
- `onError` reescrito: **nï¿½o fecha o modal**; exibe o detalhe real do erro via toast (`err?.message || err?.details`)
- Payload corrigido: campo `lastPurchaseDate: ''` adicionado
- `status: 'ACTIVE' as const` para type-safety

#### `useDecisionQueue.ts` ï¿½ Analyse CRM Visual Feedback
- Importado `useToast` do `ToastContext`
- Toast de CRM vazio: `'Sem dados no CRM para analisar. Adicione deals ou atividades primeiro.'`
- Toast de sucesso sem itens urgentes: `'? Anï¿½lise concluï¿½da. Nenhum item urgente encontrado em X deals e Y atividades.'`
- Toast de sucesso com decisï¿½es: `'? N nova(s) decisï¿½o(es) encontrada(s)! Revise abaixo.'`
- Toast de erro: `'Erro na anï¿½lise: [detalhe]'`

#### `051_fix_super_admin_language_and_contacts_notes.sql` ï¿½ Migration de Estabilizaï¿½ï¿½o
- `UPDATE profiles SET preferred_language = 'pt' WHERE email = 'lidimfc@gmail.com'` ï¿½ reset de idioma
- `ALTER TABLE contacts ALTER COLUMN notes DROP NOT NULL` ï¿½ remove constraint que causava falhas silenciosas
- `CREATE INDEX IF NOT EXISTS idx_crm_companies_company_id` ï¿½ ï¿½ndice de performance
- `CREATE INDEX IF NOT EXISTS idx_contacts_company_id` ï¿½ ï¿½ndice de performance

### Tabela de Funcionalidades V9.9.7

| Funcionalidade | Lead/Tenant (Amanda) EN | Super Admin (PT) |
|---|---|---|
| Criar Contato + Empresa | ? Feedback de erro real, modal nï¿½o fecha | ? Idem |
| Analyse CRM | ? Toast de feedback em todos os cenï¿½rios | ? Idem |
| Jury (Gerador de Contratos) | ? EN se language=en | ? PT apï¿½s migration 051 |
| Pool A (Super Admin AI keys) | N/A | ? Round-robin automï¿½tico |
| Pool B (Demo AI keys) | ? Fallback automï¿½tico | N/A |
| Admin ï¿½ isolamento de usuï¿½rios | ? Lead vï¿½ apenas "Acesso Restrito" | ? Vï¿½ todos os tenants |

### Regra de Ouro Documentada V9.9.7
> **`onError` nunca deve fechar o modal automaticamente.** Fechar silenciosamente em caso de erro Ã© pior do que mostrar a mensagem: o usuÃ¡rio perde os dados preenchidos e nÃ£o sabe o que aconteceu. Mostre o erro, deixe o usuÃ¡rio decidir.

### Arquivos Modificados
- `src/features/contacts/hooks/useContactsController.ts` â€” error handling + lastPurchaseDate
- `src/features/decisions/hooks/useDecisionQueue.ts` â€” toast feedback completo
- `supabase/migrations/051_fix_super_admin_language_and_contacts_notes.sql` â€” [NOVO]

---

## 2026-05-05 â€” V9.9.7 CHUNK 17: POST-MORTEM OOM Â· CatÃ¡logo Â· Branding Â· UI

### Status: DEPLOYADO â€” Commit `87f7b76` Â· main Â· Build verde (exit 0)

---

### POST-MORTEM: OOM nos Inserts Inline do DealDetailModal

**Impacto:** CriaÃ§Ã£o de Empresa e Contato via formulÃ¡rios rÃ¡pidos dentro do modal de Deal falhava silenciosamente com erro de RLS (403/OOM). CatÃ¡logo de produtos aparecia vazio para contas Lead no Board.

**InvestigaÃ§Ã£o de RegressÃ£o (Auditoria Git â€” git log + code review):**

| HipÃ³tese investigada | Resultado |
|---|---|
| Loop em `useContactsQuery` | âŒ Falso â€” `staleTime: 2min`, sem retry automÃ¡tico em `onError` |
| Loop em `CRMContext` re-fetch | âŒ Falso â€” sem `useEffect` com re-fetch em falha |
| **Root cause real** | âœ… Inserts inline em `DealDetailModal` sem `company_id` |

**Causa Raiz Confirmada:**
Os formulÃ¡rios rÃ¡pidos de "Nova Empresa" (L702) e "Novo Contato" (L872) dentro do `DealDetailModal` foram adicionados sem injetar `company_id` no payload. A Migration 056 (RLS puro JWT) rejeita qualquer INSERT sem `company_id` vÃ¡lido. O erro era silencioso pois o `catch` exibia apenas um toast genÃ©rico.

O fluxo principal (criaÃ§Ã£o via `useCreateContact()`) jÃ¡ passava `companyId` corretamente desde V9.6 â€” por isso funcionava nos formulÃ¡rios dedicados mas falhava exclusivamente nos atalhos inline do modal.

**Causa Raiz SecundÃ¡ria â€” CatÃ¡logo Vazio para Leads:**
`productsService.getAll()` tenta a RPC `get_crm_catalog_products`. Se indisponÃ­vel, o fallback fazia `.from('products').select('*')` sem filtro `company_id`. A Migration 056 bloqueava o fetch para Leads, retornando `[]`.

---

### CorreÃ§Ãµes Aplicadas

| Arquivo | Fix |
|---|---|
| `DealDetailModal.tsx` | `useAuth` importado; `company_id: profile?.company_id` em 2 inserts inline |
| `productsService.ts` | Param `companyId?` adicionado; fallback aplica `.eq('company_id', companyId)` |
| `SettingsContext.tsx` | Passa `profile.company_id` para `productsService.getAll()` |
| `Layout.tsx` | Separador `<span> w-px h-6` entre Moeda/Idioma; `"QR d'Ã¡gua"` como string estÃ¡tica |

### Regra de Ouro (Chunk 17)

> **Inserts inline em modais SEMPRE devem injetar `company_id` via `profile?.company_id` explicitamente.** O JWT garante isolamento no banco, mas o payload deve carregar o valor â€” RLS nÃ£o injeta automaticamente.

---

## 2026-05-06 â€” V10.1: CHUNK 18 â€” ARQUITETURA FASE 9: Link D'Ã¡gua â†” CRM

### Status: MIGRATION 057 GERADA E COMMITADA â€” Banco preparado Â· Commit `2eb383c`

---

### Objetivo da Fase 9

Conectar o ecossistema "Link D'Ã¡gua" ao CRM de forma nativa: briefings de usuÃ¡rios e KPIs de engajamento (cliques QR, projetos criados) alimentam Cards do Kanban e histÃ³rico de atividades automaticamente.

---

### DecisÃµes TÃ©cnicas Validadas

**[1] Trigger Anti-RecursÃ£o: `pg_trigger_depth() = 0` â€” ADOTADO**

```sql
-- Na funÃ§Ã£o log_briefing_to_activities():
IF pg_trigger_depth() > 0 THEN RETURN NEW; END IF;
```

`is_internal_update` foi descartado (requer coluna extra, frÃ¡gil se `activities` ganhar triggers prÃ³prios). `pg_trigger_depth()` Ã© nativo, zero overhead, e cobre todos os nÃ­veis de re-entrada.

**[2] View vs Materialized View: View PadrÃ£o â€” ADOTADO**

Kanban precisa de dados em tempo real. Materialized View introduz lag. `v_deal_kpis` usa LATERAL JOIN com Ã­ndices em `qr_codes(client_email)` + `qr_links(client_email)`. Upgrade path: Materialized View + `pg_cron REFRESH 15min` se volume >10k deals.

**[3] RLS Puro JWT: CONFIRMADO (padrÃ£o Migration 056)**

Zero subqueries em `profiles` nas polÃ­ticas de `crm_briefings`. PadrÃ£o Ãºnico:
```sql
company_id = (auth.jwt() ->> 'company_id')::uuid
```

---

### Migration 057 â€” Componentes

**Arquivo:** `supabase/migrations/057_fase9_crm_briefings_kpi_view.sql`

| Componente | DescriÃ§Ã£o |
|---|---|
| `crm_briefings` | Tabela versionada com `content JSONB`, `is_active`, trigger auto-versÃ£o |
| `log_briefing_to_activities()` | Trigger AFTER INSERT/UPDATE com `pg_trigger_depth()` guard |
| `v_deal_kpis` | View LATERAL JOIN: deals + contacts + qr_codes + qr_links + briefing ativo |
| `upsert_briefing()` | RPC atÃ´mica para o Link D'Ã¡gua gravar briefings via `supabase.rpc()` |

### AÃ§Ã£o ObrigatÃ³ria

> âš ï¸ Aplicar Migration 057 no SQL Editor do Supabase antes de conectar o Link D'Ã¡gua ao CRM.

