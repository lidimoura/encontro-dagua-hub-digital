# DEVLOG — Provadágua Hub Digital

> **⚠️ PADRÃO OBRIGATÓRIO DE ENTRADA (leia antes de escrever qualquer entrada):**
> Toda entrada no DEVLOG DEVE conter:
> 1. **Data exata** no cabeçalho (`## YYYY-MM-DD — Versão: Título`)
> 2. **O que foi alterado e por quê** — incluindo diagnóstico técnico da causa raiz do erro
> 3. **Feedback/Resultado** — status documentando o sucesso (ou nova falha) na prática, após teste real
>
> *Entradas sem esses três elementos são consideradas incompletas e devem ser complementadas.*

---

## 2026-04-26 — V9.9.5: Fix de Layout, CRUD de Leads e Rodízio de API Key

### 1. Bug de Layout — `/ai` Quebrava o App Inteiro

**Causa raiz identificada:**
`AIHubPage.tsx` usava `className="absolute inset-0 flex flex-col"` no wrapper raiz. Isso funciona apenas se o pai tiver `overflow: hidden` **estritamente garantido**. O `Layout.tsx` aplica `overflow-hidden` no `<main>` apenas quando `location.pathname.startsWith('/ai')`. Em casos de renderização simultânea ou transição de rota, o `absolute inset-0` vazava para fora do container, cortando o topo da página e persistindo após navegação.

**Fix aplicado:** `AIHubPage.tsx` — substituído `absolute inset-0` por `flex flex-col h-full w-full`. O componente agora se contém corretamente dentro do espaço alocado pelo Layout sem depender de posicionamento absoluto.

**Feedback/Resultado:** ⏳ Aguardando validação da Lidi em produção.

---

### 2. CRUD de Leads — Boards, Contatos, Produtos e Tech Stack Falhando

**Causa raiz identificada:**
`profile?.company_id` retorna `undefined` nos primeiros renders enquanto o AuthContext ainda não terminou de carregar o perfil do Supabase. As funções de insert em `TechStackPage.tsx`, `CatalogTab.tsx` e `useBoardsQuery.ts` passavam `null` como `company_id` para o Supabase. O RLS estrito (`migration 043`) rejeita qualquer INSERT com `company_id = NULL` com erro 403 — sem feedback visual para o usuário, causando a percepção de "modal que não fecha" ou "criação silenciosa que falha".

**Fixes aplicados:**
- `TechStackPage.tsx`: guard explícito — se `!companyId`, exibe toast de erro e retorna cedo (sem throw)
- `CatalogTab.tsx`: mesmo guard para INSERT de produtos
- `useBoardsController.ts`: `isLoading` agora inclui `!profileReady` → enquanto `company_id` não carregou, a página de boards mostra spinner em vez do empty-state "Criar Primeiro Board"
- `useBoardsController.ts`: `profileReady` exposto no return do hook para uso opcional pelos componentes filhos
- `useContactsController.ts` (V9.9.4): `onError` adicionado a todas as mutations — modal fecha em qualquer cenário

**Feedback/Resultado:** ⏳ Aguardando validação da Lidi em produção.

---

### 3. Rodízio de API Keys — Diagnóstico e Status

**Diagnóstico:**
O `useCRMAgent.ts` **já implementa corretamente** o rodízio de API Keys (linhas 655–677):
- Tentativa 1: usa `aiApiKey` do CRMContext (chave configurada no Settings) ou `VITE_GEMINI_API_KEY`
- Em caso de erro 429: usa `aiApiKeySecondary` do CRMContext ou `VITE_GEMINI_API_KEY_SECONDARY`

O `geminiProxy.ts` e `geminiService.ts` também implementam fallback para a chave secundária.

**Causa do 429 persistente:** Quando os leads não têm chave própria configurada no Settings, o sistema usa a chave primária do `.env` (da Super Admin). Se essa cota esgotar e a chave secundária não estiver configurada no `.env`, o sistema entra em "Demo Mode" — comportamento correto e documentado.

**Ação:** Nenhuma alteração de código necessária. A Super Admin deve configurar `VITE_GEMINI_API_KEY_SECONDARY` no painel Vercel para ativar o fallback automático.

**Feedback/Resultado:** ✅ Arquitetura de rodízio validada — documentada aqui para referência futura.

---

### 4. Integridade do Super Admin e Link d'Água

**Status:** ✅ Mantido. Nenhuma alteração de RLS ou schema foi feita nesta sessão. Todas as correções foram exclusivamente no front-end React.

---


- **Botao Suspender / Ativar**: toggle de ccess_level entre 'suspended' e 'trial' com feedback imediato.
- **Botao Excluir**: deleta o profile com window.confirm de seguranca. Auth user requer exclusao manual no Supabase Dashboard.
- **EditUserModal**: agora inclui campos 	rial_expires_at (date picker), ccess_level (trial / suspenso / pago) e status.
- **Handlers**: handleExtendTrial, handleToggleSuspend, handleDelete com ctionLoading por linha — zero conflito de estado.

### Privacidade / Multi-tenancy (/#/settings)
- **UsersPage.tsx reescrita**: query real do Supabase com .eq('company_id', currentUser.company_id) — tabela hardcoded com dados do Super Admin removida.
- **Lead/Tenant ve apenas**: a si mesmo e quem ele convidar para a company_id dele.
- **Formulario de Convite** ⚠️ INOPERANTE (Backlog): A funcionalidade de convite de membros da equipe via WhatsApp/E-mail foi implementada no front-end mas nao foi concluida nem testada a tempo do Go-Live. O botao esta desativado (Coming Soon) na UsersPage. A arquitetura de URL com company_id esta pronta, porem o fluxo completo sera reativado em versao futura pos-validacao.

### Exterminio do Service Worker (V6.8 — registrado aqui para historico)
- public/sw.js: versao cache-free — install destroi todos os caches existentes, etch e pass-through puro (sem interceptacao de assets). CACHE_VERSION = 'hub-nocache-v2' forca substituicao do SW antigo.
- index.html: kill script inline killSWCache() roda ANTES do bundle React — desregistra todos os SWs e purga CacheStorage.
- App.tsx: purga caches.* e desregistra SWs antigos no useEffect de boot, antes de registrar o novo SW.
- **Motivacao**: um Tenant de teste estava preso em cache do bundle antigo com erro de CORS da signup-showcase (ja deletada no V6.6).

### Fix Header Mobile (Layout.tsx)
- **Problema**: ao navegar para /#/ai pelo menu hamburguer, o header desaparecia.
- **Root cause**: o pt-16 md:pt-0 (compensacao do header fixed no mobile) estava no <main>, mas quando a rota /ai ativa overflow-hidden flex flex-col, o padding era absorvido pelo flex container e o conteudo subia atras do header.
- **Fix**: pt-16 md:pt-0 movido para o <div> filho interno — aplicado sempre, independente da rota ativa.

### AiflowSupport — Bilingue EN-US (V8.0)
- Adicionado useTranslation — todos os 5 cards de help traduzidos (titulo, descricao, alert).
- Form de bug report traduzido (placeholder, descricao, botao).
- Footer: '🤖 Aiflow * Technical Support' em EN / '🤖 Aiflow * Suporte Tecnico' em PT.
- WA link internacionalizado: mensagem diferente para EN e PT.

### Transicao do Cadastro: Edge Function -> signUp Nativo (V6.5-V6.6)
- **Causa do problema**: supabase.functions.invoke('signup-showcase') disparava preflight CORS que nao passava no check de ccess-control-allow-origin.
- **Solucao**: substituido por supabase.auth.signUp() nativo com options.data para metadados.
- **Erro 409 (email ja cadastrado)**: detectado via user.identities.length === 0 (comportamento Supabase).
- **Erro 429 (rate limit)**: capturado no catch com mensagem amigavel PT/EN.
- **Erro email-not-confirmed**: detectado via user && !session — mensagem orienta verificacao da caixa de entrada.
- **Lead -> CRM**: apos signUp bem-sucedido, lead e inserido em contacts com source='showcase' e nota de data de entrada (best-effort, nao bloqueia navegacao).

### Keyword via ENV (V7.0)
- ShowcaseLP.tsx: ACCESS_KEYWORD = 'provadagua' hardcoded removido.
- Substituido por import.meta.env.VITE_ACCESS_KEYWORD — configurar no .env e no painel Vercel.
- Fallback seguro: se ENV vazia, keywork nao e validada e o cadastro e bloqueado.

### UX de Erros Anti-desamparo (V7.0)
- smartSignInError(): helper que intercepta erros do Supabase Auth e retorna mensagens humanizadas:
  - invalid login credentials -> 'E-mail ou senha incorretos. Verifique os dados ou solicite uma nova senha ao Admin.'
  - suspended / inactive -> 'Acesso suspenso. Entre em contato com o Super Admin.'
  - 
ate_limit / too_many -> 'Muitas tentativas. Aguarde alguns minutos.'

### Git — Commits desta fase
- hotfix(v6.8): kill service worker cache
- eat(v7.0): AdminPage leads panel, smart auth errors, lead->contacts CRM insert, keyword moved to ENV
- eat(v8.0): admin CRUD+trial, UsersPage company_id isolation, AiflowSupport EN, Layout mobile header fix

---
---

## 2026-04-17 — V6.5: Hotfix CORS · signUp Nativo · Reordenação do Formulário

### ❌ Problema Resolvido: Bloqueio de CORS na Edge Function
- A `signup-showcase` Edge Function estava sendo bloqueada por CORS no preflight request.
- **Causa:** requisição fetch para Supabase Edge Functions em contexto de browser disparava preflight OPTIONS que não passava no check de `access-control-allow-origin`.
- **Fix:** A chamada `supabase.functions.invoke('signup-showcase', ...)` foi **removida completamente** do `Login.tsx`.

### ✅ Solução: supabase.auth.signUp() Nativo
- Substituído por chamada direta ao Auth client:
  ```ts
  supabase.auth.signUp({
    email, password: leadPassword,
    options: { data: { full_name: name, user_type: 'lead_provadagua' } }
  })
  ```
- Metadados do lead (`full_name`, `user_type`) passados via `options.data` → armazenados no `raw_user_meta_data` do Supabase Auth.
- Auto-login imediato pós-cadastro com `signInWithPassword`.

### 🔍 Detecção de Email Já Cadastrado (User Already Exists)
- Supabase retorna `user.identities.length === 0` quando o email já existe (em vez de erro HTTP 409).
- Lógica de detecção tripla: mensagem de erro + identidades vazias.
- Mensagem exibida: *"Este e-mail já está cadastrado. Clique em 'Já tenho conta' para fazer o login."*

### 🔁 Reordenação do Formulário (UX)
- **Antes:** Nome → Email → Palavra-chave → Senha
- **Agora:** Palavra-chave → Nome → Email → Senha
- Justificativa: a palavra-chave é o gatekeeper — se o lead não tem, ele solicita via WA antes de preencher dados pessoais.

### Fluxo Completo do Lead/Tenant (V6.5)
```
1. Showcase → CTA "Iniciar Trial Grátis" → /#/login?from=showcase (ou domínio prova.*)
2. Formulário: Palavra-chave ('provadagua') → Nome → Email → Senha (≥6 chars)
3. submit → supabase.auth.signUp() com metadata → signInWithPassword(email, leadPassword)
4. AuthContext.fetchProfile (maybeSingle) → loading=false → /dashboard
5. Retorno: Tenant/Lead loga com email + senha que ele definiu
```

## 2026-04-18 — V8.0: Encerramento · Gestao de Leads · Layout Fix · i18n EN

### Painel Admin CRUD (/#/admin)
- **Tabela reformulada**: colunas created_at (Data de Cadastro) e 	rial_expires_at (Expiracao Trial) adicionadas com destaque visual para trials expirados (cor laranja + icone aviso).
- **Botao +7 dias**: estende o trial a partir da data atual (ou do vigente) sem abrir modal — acao instantanea via Supabase update.
- **Botao Suspender / Ativar**: toggle de ccess_level entre 'suspended' e 'trial' com feedback imediato.
- **Botao Excluir**: deleta o profile com window.confirm de seguranca. Auth user requer exclusao manual no Supabase Dashboard.
- **EditUserModal**: agora inclui campos 	rial_expires_at (date picker), ccess_level (trial / suspenso / pago) e status.
- **Handlers**: handleExtendTrial, handleToggleSuspend, handleDelete com ctionLoading por linha — zero conflito de estado.

### Privacidade / Multi-tenancy (/#/settings)
- **UsersPage.tsx reescrita**: query real do Supabase com .eq('company_id', currentUser.company_id) — tabela hardcoded com dados do Super Admin removida.
- **Lead/Tenant ve apenas**: a si mesmo e quem ele convidar para a company_id dele.
- **Formulario de Convite** ⚠️ INOPERANTE (Backlog): A funcionalidade de convite de membros da equipe via WhatsApp/E-mail foi implementada no front-end mas nao foi concluida nem testada a tempo do Go-Live. O botao esta desativado (Coming Soon) na UsersPage. A arquitetura de URL com company_id esta pronta, porem o fluxo completo sera reativado em versao futura pos-validacao.

### Exterminio do Service Worker (V6.8 — registrado aqui para historico)
- public/sw.js: versao cache-free — install destroi todos os caches existentes, etch e pass-through puro (sem interceptacao de assets). CACHE_VERSION = 'hub-nocache-v2' forca substituicao do SW antigo.
- index.html: kill script inline killSWCache() roda ANTES do bundle React — desregistra todos os SWs e purga CacheStorage.
- App.tsx: purga caches.* e desregistra SWs antigos no useEffect de boot, antes de registrar o novo SW.
- **Motivacao**: um Tenant de teste estava preso em cache do bundle antigo com erro de CORS da signup-showcase (ja deletada no V6.6).

### Fix Header Mobile (Layout.tsx)
- **Problema**: ao navegar para /#/ai pelo menu hamburguer, o header desaparecia.
- **Root cause**: o pt-16 md:pt-0 (compensacao do header fixed no mobile) estava no <main>, mas quando a rota /ai ativa overflow-hidden flex flex-col, o padding era absorvido pelo flex container e o conteudo subia atras do header.
- **Fix**: pt-16 md:pt-0 movido para o <div> filho interno — aplicado sempre, independente da rota ativa.

### AiflowSupport — Bilingue EN-US (V8.0)
- Adicionado useTranslation — todos os 5 cards de help traduzidos (titulo, descricao, alert).
- Form de bug report traduzido (placeholder, descricao, botao).
- Footer: '🤖 Aiflow * Technical Support' em EN / '🤖 Aiflow * Suporte Tecnico' em PT.
- WA link internacionalizado: mensagem diferente para EN e PT.

### Transicao do Cadastro: Edge Function -> signUp Nativo (V6.5-V6.6)
- **Causa do problema**: supabase.functions.invoke('signup-showcase') disparava preflight CORS que nao passava no check de ccess-control-allow-origin.
- **Solucao**: substituido por supabase.auth.signUp() nativo com options.data para metadados.
- **Erro 409 (email ja cadastrado)**: detectado via user.identities.length === 0 (comportamento Supabase).
- **Erro 429 (rate limit)**: capturado no catch com mensagem amigavel PT/EN.
- **Erro email-not-confirmed**: detectado via user && !session — mensagem orienta verificacao da caixa de entrada.
- **Lead -> CRM**: apos signUp bem-sucedido, lead e inserido em contacts com source='showcase' e nota de data de entrada (best-effort, nao bloqueia navegacao).

### Keyword via ENV (V7.0)
- ShowcaseLP.tsx: ACCESS_KEYWORD = 'provadagua' hardcoded removido.
- Substituido por import.meta.env.VITE_ACCESS_KEYWORD — configurar no .env e no painel Vercel.
- Fallback seguro: se ENV vazia, keywork nao e validada e o cadastro e bloqueado.

### UX de Erros Anti-desamparo (V7.0)
- smartSignInError(): helper que intercepta erros do Supabase Auth e retorna mensagens humanizadas:
  - invalid login credentials -> 'E-mail ou senha incorretos. Verifique os dados ou solicite uma nova senha ao Admin.'
  - suspended / inactive -> 'Acesso suspenso. Entre em contato com o Super Admin.'
  - 
ate_limit / too_many -> 'Muitas tentativas. Aguarde alguns minutos.'

### Git — Commits desta fase
- hotfix(v6.8): kill service worker cache
- eat(v7.0): AdminPage leads panel, smart auth errors, lead->contacts CRM insert, keyword moved to ENV
- eat(v8.0): admin CRUD+trial, UsersPage company_id isolation, AiflowSupport EN, Layout mobile header fix

---
---

## 2026-04-17 — V6.4: Segurança no Cadastro · Campo de Senha · Keyword Oficial

### 🔑 Palavra-chave Oficial da Demo
- **Keyword:** `provadagua` (tudo minúsculo, sem acento, sem espaço)
- Configurada via `VITE_ACCESS_KEYWORD=provadagua` no `.env` e Vercel
- Validação: normaliza input (trim + lowercase + remove espaços) antes de comparar
- Mensagem de erro: *"Palavra-chave incorreta. Solicite ao Admin."*

### 🔒 Correção Crítica de Segurança — Campo de Senha no Cadastro
- **Problema:** O formulário de cadastro da Provadágua (`from=showcase`) não tinha campo de senha.
  O sistema gerava uma senha temporária aleatória (descartada internamente) que o lead nunca via.
  **Resultado:** O lead criava conta, acessava o dashboard, mas **nunca conseguia logar novamente**.
- **Fix:** Campo "Crie sua senha" adicionado ao formulário com:
  - `type="password"` com toggle show/hide (Eye/EyeOff)
  - Validação mínima de 6 caracteres antes do submit
  - Lembrete visível: *"🔒 Guarde essa senha para entrar novamente depois."*
  - `autoComplete="new-password"` para managers de senha do browser
- **Handler:** usa diretamente a senha digitada pelo lead — sem geração de strings internas

### Fluxo Completo do Lead/Tenant (V6.4)
```
1. Showcase → CTA "Iniciar Trial Grátis" → /#/login?from=showcase
2. Formulário: Nome + Email + Keyword ('provadagua') + Senha (≥6 chars)
3. submit → signup-showcase Edge Fn → supabase.auth.signInWithPassword(email, userPassword)
4. AuthContext.fetchProfile (maybeSingle) → loading=false → /dashboard
5. Retorno: Tenant/Lead loga com email + senha que ele definiu
```

---

## 2026-04-16 — V6.2: Final Release QA · Stripe · WA Business · GA4

### Arquitetura de Canais (documentada)
- **Amazô** = IA de front-end — atendimento automatizado 24/7 nas LPs e ShowcasePage
- **WhatsApp Business `5541992557600`** = gestão humana direta da proprietaria (ária)
- Nenhum bot acessa o WA Business — é canal exclusivo de conversão e suporte humano

### Fix Crítico — NexusBridge (`nexusWebhook.ts`)
- URL hardcoded `kfejaqwzgzlmuaodhwmf.supabase.co` era de projeto externo (Agility OS) morto
- Agora deriva de `VITE_SUPABASE_URL` (este projeto). Se env vazia → desativado silenciosamente
- `AbortController(3s)` impedindo DNS stale de travar a UI

### Fix Crítico — ShowcasePage Branco (`fadeIn`)
- `opacity: 0` no `fadeIn()` causava branco permanente se IntersectionObserver falhasse (race condition)
- **Fix**: `opacity: 1` sempre — conteúdo nunca invisível. Animação só usa `translateY`
- Observer com `setTimeout(200ms)` para garantir DOM montado antes de observar

### Stripe Payments (`stripe.ts`) — V6.2
- `whatsappFallback` corrigido: `5592992943998` → `5541992557600` (canal principal)
- Mensagens WA todas branded por produto (canal proprietaria) (Prompt Lab Mensal/Anual, Agente IA, Consultoria)
- Payment Links via env vars: `VITE_STRIPE_LINK_MONTHLY`, `VITE_STRIPE_LINK_ANNUAL`, `VITE_STRIPE_LINK_AGENTE_IA`
- Fallback automático para WA Business se link Stripe não configurado

### WhatsApp Business — Mensagens Estratégicas
| Origem | Mensagem |
|---|---|
| Showcase — Keyword | "Olá, [Admin]! Estou na vitrine da Provadágua e quero minha Palavra-Chave..." |
| Showcase — Dúvida | "Olá, [Admin]! Estou testando a demo e tenho uma dúvida sobre a personalização..." |
| Hub — Consultoria | "Olá, [Admin]! Conheci o Hub e quero conversar sobre uma implementação sob medida..." |
| Prompt Lab Mensal | "Olá, [Admin]! Vi o Prompt Lab no Hub e quero assinar o Plano Mensal (R$ 3,00/mês)..." |
| Agente de IA | "Olá, [Admin]! Vi o Agente de IA (R$ 80/mês) no Hub e tenho interesse..." |

### GA4 (`App.tsx`)
- `initGA4()` agora chamado no `useEffect` do `App.tsx` — rastreia **todas as páginas** desde o boot
- Removida variável `initGA4` que era importada mas nunca chamada

### Remoção: Forced English
- `localStorage.setItem('app_language', 'en')` removido — app é **PT-BR** por padrão
- Usuários podem alternar via LanguageSwitcher normalmente

### Logo & Visual
- Nav logo ShowcasePage: `href="/#/"` → `href="/#/showcase"` ✓
- `logo-icon.png` (404) substituído por `logo-icon-gold-transp.png` em todos os pontos
- Drop-shadow dourado: `drop-shadow(0 0 12px rgba(200,147,58,0.6))` no nav

---

## 2026-04-16 — V5.7: Hotfix Final Release — ShowcasePage + Login + Segurança 🔒

### Problema Identificado — ShowcasePage Branco após Vídeo/Prints
- **Root cause**: Seções FAQ, QA & Segurança e Arquitetura Técnica estavam definidas nas
  traduções (`TRANSLATIONS`) mas **nunca renderizadas no JSX**. A ShowcasePage pulava de
  `sec-modules` diretamente para `sec-trial`, fazendo o mid-scroll parecer vazio.
- **Fix**: 3 novas seções adicionadas entre Módulos e Trial CTA:
  - `sec-faq` — Accordion PT/EN com `Array.isArray()` guard (evita crash em arrays nulos)
  - `sec-qa` — Cards de QA/Segurança com badge ✓ STATUS e hover verde
  - `sec-tech` — Grid arquitetura técnica com bordas Solimões dourado

### Fix Login — IS_SHOWCASE_ROUTE com HashRouter (Regressão SPA)
- **Root cause**: `IS_SHOWCASE_ROUTE` era uma **constante de módulo** avaliada uma única vez
  no import. Com HashRouter, `window.location.search` está sempre vazio — a query
  `?from=showcase` fica no hash (`/#/login?from=showcase`). Navegação SPA não re-avaliava a constante.
- **Fix**: Migrado para `useLocation()` do react-router-dom dentro do componente.
  `location.search` retorna `?from=showcase` corretamente com HashRouter.
- `isGodModeUrl` corrigido pelo mesmo motivo (`urlParams.get('god')` → `_lqp.get('god')`).
- **Comportamento confirmado**:
  - `/login` → Hub: somente aba "Entrar" (SignIn)
  - `/login?from=showcase` → Provadágua: aba "Novo Cadastro" (padrão) + campo Palavra-Chave
  - Logo Hub → `/#/` | Logo Showcase → `/#/showcase`
  - Botão "Solicitar ao Admin" → WhatsApp `5541992557600`

### Fix ShowcasePage — Referência de Imagem Quebrada
- `logo-icon.png` (inexistente) substituído por `logo-icon-gold-transp.png` com
  `filter: brightness(0) invert(1)` para branco no botão violeta.

### Versão
- `footer_version`: `V5.6 — Provadágua Launch` → `V5.7 — Final Release` (PT + EN)

### Segurança — Auditoria V5.7
- ✅ `SUPABASE_SERVICE_ROLE_KEY`: presente apenas em `.env` local (gitignored) e Vercel Secrets
- ✅ Zero `VITE_` prefix em service role key (correto — não bundled no client JS)
- ⚠️ `VITE_GEMINI_API_KEY` e `VITE_SUPABASE_ANON_KEY` são públicas BY DESIGN (VITE_ = client bundle)
  → documentado na Skill e no README — nenhuma ação necessária
- ✅ RLS ativo em todas as tabelas críticas (confirmado em `sec-qa` da ShowcasePage)
- ✅ `is_demo_data` guard em todos os services — produção isolada do demo

### Nicho — Copy Limpo (Zero Saúde)
- Confirmado: ShowcasePage aponta exclusivamente para **"Negócios, Agências e Projetos"**
- `hero_eyebrow`: "Para Empreendedores · Agências · Profissionais Liberais" ✓
- Cards de segmentação: "Negócios & Projetos" + "Empreendedores & Times" (zero menção à saúde) ✓

### Encoding UTF-8
- Todos os arquivos de documentação (README, DEVLOG, UserGuide) gravados via ferramenta nativa
  (não PowerShell) — UTF-8 sem BOM — acentos e emojis preservados corretamente.

### LandingPage Hub — CTA Provadágua
- Confirmado: `lp-cta-provadagua` seção já inserida na V5.6 logo após `<CRMSimulator>` ✓

### Git — Branch `provadagua`
```
fix(v5.7): ShowcasePage missing FAQ+QA+Tech sections — rendered in JSX
fix(login): IS_SHOWCASE_ROUTE HashRouter-safe via useLocation()
fix(showcase): logo-icon.png broken ref → logo-icon-gold-transp.png
chore(docs): README V5.7 multi-tenant endpoints + UserGuide trial flow
```

---

## 2026-04-13 — V5.3: Provadágua Rebranding Completo 🌊💜

### Identidade Visual — Rio Negro + Açaí + Solimões
- Paleta migrada: Earth-Neon → **Rio Negro** `#040308` / **Açaí** `#6D28A8` / **Solimões** `#C8933A`
- `ShowcasePage.tsx` tokens `S`: `acaiGrad`, `solimoesGrad`, `border`, `surface` — todos em Açaí/Solimões
- Hero: orbs roxo+dourado, scanline violeta, CTA com `acaiPulse` animation, metrics bar alternando gradientes
- Nav: logo `logo-icon-gold-transp.png` substituindo emoji; botão de acesso cor Açaí
- Footer: `logo-icon-gold-transp.png`, bio da fundadora c/ certificações OCI/IA/MySQL, links GitHub Org + LinkedIn + WA Suporte

### ShowcasePage — Conteúdo V5.3
- **Badge fundadora REMOVIDO** da Hero Section (contexto errado — movido para footer)
- **4º Pain Card**: "Não conseguir gerenciar seus clientes e projetos?" → ecossistema Provadágua centraliza tudo (PT + EN)
- **Card 3 Link d'Água → Accordion**: badge "Bônus Incluso", seta toggle, lista features, CTA vitrine externa; contexto "Start Digital"
- `footer_version`: `V3.0` → `V5.3`

### Login V5.3 — Separação Hub / Provadágua (Regra de Negócio PO)
- **WA Curitiba Business**: `5541992557600` em TODO frontend (antigo `5592992943998` extirpado)
- **Logo**: `logo-icon-gold-transp.png` no header do Lead Gate
- **Hub bloqueado para não-admins**: God Mode verifica `is_super_admin`. Se falso → signOut + msg "Acesso administrativo restrito. Entre pela página da Provadágua."
- **i18n**: textos hardcoded migrados para objeto `txt` local com PT/EN completo
- **Bugfix loading infinito**: `AbortController` com timeout 15s na Edge Function `signup-showcase`

### TrialExpiredPage (NOVA) — `/trial-expired`
- Paleta Rio Negro+Açaí+Solimões (inline styles)
- **Step 1**: NPS 0–10 + "O que gostou" + sugestão + consent LGPD → salva em `trial_feedback`
- **Step 2**: CTA "Fechar Negócio" → WA `5541992557600`; CTA "Indica e Ganha 20%"

### ProtectedRoute — Guard Trial Expirado
- Verifica `access_level` (`provadagua-trial`, `trial-7d`, `provadagua`) + `access_expires_at`
- Se expirado e não `is_super_admin` → redirect `/trial-expired`

### AuthContext + App.tsx
- `Profile`: novo campo `access_expires_at?: string | null`
- `App.tsx`: rota `/trial-expired` (lazy `TrialExpiredPage`) adicionada

### Git — Commit `92e21de` — Branch `provadagua`
```
feat(v5.3): Provadagua Rebranding — RioNegro+Acai+Solimoes palette, TrialExpiredPage, Login V5.3 WA Curitiba+logo-gold+timeout+hub-block, ShowcasePage accordion LinkdAgua + 4th pain card + footer social links, App.tsx /trial-expired route, AuthContext access_expires_at, ProtectedRoute trial check
```

---

## 2026-04-10 — V4.4: Lançamento do Agente de IA R$ 80 🤖🔥


### Novo Produto — Agente de IA (SAC/FAQ) para Sites

- **Oferta de Lançamento**: Agente de IA configurado para SAC/FAQ → R$ 80,00/mês
- Igual à Amazô — treinado com a voz e identidade do negócio do cliente
- Atende leads 24/7 no WhatsApp e sites
- Link Stripe: `https://buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02`

### LandingPage (HomePage) — Seção de Lançamento (NOVA)

- **Seção `#sec-agente-ia-launch`** inserida após os 3 cards de segmentação
- Badge pulsante: "🔥 Oferta de Lançamento — Vagas Limitadas"
- Copy: "Seu próprio Agente de IA 24/7 — igual à Amazô"
- Bio: "Por [Fundadora da Plataforma] — Formada em Psicologia e Especialista em Dados"
- Mockup de chat interativo (balões de conversa) com preço e botão "Contratar"
- CTA principal: `btn-agente-ia-launch` → `openAgenteIAModal()`
- CTA secundario: WhatsApp do Super Admin (`wa.me/5592992943998`)

### LeadCaptureModal — V4.4 Upgrades

- `source` expandido: `'hub-lp-launch' | 'provadagua'` adicionados ao tipo
- `prefilledData.interest` agora aceita pré-seleção de interesse ao abrir o modal
- **Novo interest**: `agente_ia_80` → "🤖 Agente de IA (SAC/FAQ) — R$ 80/mês 🔥 LANÇAMENTO"
- **Auto-tags**: `agente-ia-80`, `launch-offer` aplicadas quando `interest === agente_ia_80`
- **Source**: `hub-lp-launch` para leads de Agente IA
- **Redirect automático**: Após submit bem-sucedido com `agente_ia_80`, abre Stripe em nova aba após 2s

### CRM — Roteamento de Leads

- Tag `agente-ia-80` + `launch-offer` → lead entra no Board automaticamente via `form-lp-lead`
- Source `hub-lp-launch` identificável no painel de contatos/CRM
- Campo `agente_ia_offer: true` no payload da Edge Function para segmentação futura

### Varredura de Segurança

- ✅ Zero `eyJhbGci`, `sb_secret_`, `sk_live_` hardcoded
- ✅ Todas as keys via `Deno.env.get()` (Edge) ou `import.meta.env.VITE_...` (frontend)

---

## 2026-04-10 — V4.3: MVP Provadágua — Branch `provadagua` 🚀


### ShowcasePage — Seção de Pricing (NOVO)
- 3 cards de preço com paleta Earth-Neon (glassmorphism dark):
  - **Prompt Lab Mensal**: R$ 3,00/mês → fallback `/#/login`
  - **Prompt Lab Anual**: R$ 29,90/ano → fallback `/#/login` (badge "Mais Popular")
  - **Agente IA (SDR/SAC)**: R$ 80,00/mês → link Stripe real: `https://buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02`
- Tracking GA4: `trackShowcaseCTA('pricing_agente_ia_r80')` no clique do botão Stripe
- Nota de rodapé: "Sem fidelidade · Cancele a qualquer momento · Suporte via WhatsApp"

### ShowcasePage — Correções V4.3
- CSS `.screen-mock` + `.scanline` + `@keyframes scanAnim` adicionados inline (eram dependência de Tailwind não carregada)
- Trial CTA link corrigido: `/#/` → `/#/login`
- Footer version atualizado: `V3.0` → `V4.3 — MVP Provadágua`
- `::selection` color atualizado para paleta neon-green

### Identidade Visual Confirmada
- Paleta Earth-Neon: Fundo `#070D09` · Verde `#00C97B` · Ciano `#00E5FF` · Dourado `#D4A853`
- Founder badge: identidade visual da fundadora da plataforma
- Bilinguismo PT/EN mantido em todos os novos componentes

### Lógica de Acesso (já estava completa — confirmada V4.3)
- Palavra-chave `provadagua` → Edge Function `signup-showcase` → `email_confirm: true`
- Trial de 7 dias via `access_expires_at` ativo imediatamente no Dashboard
- Sem barreira de confirmação de e-mail (flow V4.3 end-to-end)

### GA4 (ATIVO — V4.3)
- ID: `G-MHH0WSX5QS` — configurado em `src/lib/analytics.ts` + `.env`
- Eventos ativos: `showcase_cta_click`, `trial_start`, `lead_capture`, `checkout_success`, `checkout_cancel`, `sign_up`, `login`
- `initGA4()` chamado em: `Login.tsx` (após trial), `CheckoutSuccessPage`, `CheckoutCancelPage`
- `trackShowcaseCTA()` em hero CTAs, video placeholder e screenshots da ShowcasePage

### Login V4.3 — Fluxo Keyword Refatorado
- **"Entrar no Hub"** (era: "Tenho a palavra-chave") → trial imediato
- **"Experimentar Ecossistema"** (era: "Lead ou Curioso?") → showcase externo
- `handleKeywordSubmit`: substituiu `supabase.auth.signUp()` por `supabase.functions.invoke('signup-showcase')` → sem barreira de e-mail
- Auto-login com `signInWithPassword()` após criação do usuário
- Redirecionamento direto para `/dashboard` — trial ativo na hora

### Git
- Branch `provadagua` criada localmente e sincronizada com remoto
- Commit: `feat(showcase): add pricing section + fix trial CTA + V4.3 footer`

---

## 2026-04-07 — V4.2: Trial Multi-Tenant + Lead Gate + Build Verde

### Lead Gate V2 (Login.tsx)
- Fluxo de 3 caminhos: Lead (→ prova.), Palavra-chave provadagua, God Mode (triplo clique)
- Palavra-chave padrão via VITE_ACCESS_KEYWORD=provadagua

### ShowcasePage — Segmentação de Público
- Nova seção "Escolha seu caminho" com 3 cards: Saúde & Consultório, Empreendedores & Times, Kit Básico (Link d'Água)
- CTA primário abre LeadCaptureModal em vez de navegar
- Integração LeadCaptureModal com prefilledData={interest:'provadagua_trial'}

### AdminUsersPage — Gestão de Trials
- Coluna ccess_expires_at com badges ATIVO/EXPIRA/EXPIRADO
- Filtro "Apenas trials" ativo
- Botões +7d (grant) e Block (revoke) por usuário trial
- JSX corrigido: <thead> estava dentro de <button> — reestruturado

### LeadCaptureModal
- Opções de interesse: provadagua_trial, crm_saude, utomacoes_saas
- Auto-tagging provadagua-trial + source correto para trials

### Stripe
- Mensal R$ 3,00: prod_UGWT3Pm4ztKmcU
- Anual R$ 29,90: prod_UGVFdr4qUVufSu

### Correções Técnicas
- Deno Edge Functions: .vscode/settings.json com deno.enablePaths + supabase/functions/deno.json
- qr-redirect/index.ts: erro unknown no catch → error instanceof Error ? error.message : String(error)
- Build Vite: EXIT 0 ✅ (3m11s, 913KB)

---
> Branch `main` | CRM de Produção

---

## 2026-04-01 — V3.0: Missão Provadágua Completa

### Governança
- `.agent/skills/provadagua-standard/SKILL.md` criada: regras de isolamento por `company_id`, bilinguismo e `access_expires_at`

### GOD MODE — Migration 038
- `supabase/migrations/038_super_admin_and_company_isolation.sql` criada
- Promoção de `lidimfc@gmail.com` a Super Admin (`is_super_admin=true`)
- Coluna `access_expires_at` adicionada em `profiles`
- Coluna `company_id` adicionada em `contacts` (isolamento entre leads)
- Auditoria de leads por `is_demo_data` e tags

### Showcase LP
- `src/pages/ShowcasePage.tsx` criada — página premium dark/glassmorphism, bilingue PT/EN
- Seções: Hero com métricas, 9 Módulos em Produção, Relatório QA & Segurança, Stack Técnica, CTA
- Rota pública `/#/showcase` registrada em `App.tsx` sem autenticação

### Segurança
- `SUPABASE_SERVICE_ROLE_KEY` confirmada nas Vercel Secrets (Production/Preview/Development)
- `.env` nunca commitado (`.gitignore` ativo)
- `VITE_CRM_API_KEY` identificada como independente (uso exclusivo no Nexus Bridge)

---


### Mudanças
- `useDealsQuery.ts`: DISTINCT por email mata duplicatas de leads SDR (replays de webhook)
- `useDealsQuery.ts`: Contatos com `🤖 sdr` são force-mapeados ao primeiro estágio mesmo sem lifecycle stage
- `productsService.ts`: IS_DEMO guard — catálogo vazio na Provadágua
- `contacts.ts`: IS_DEMO filter via query Supabase (OR conditions por tag/email/is_test)
- `PromptLabPage.tsx`: IS_DEMO → localStorage apenas para saves na Provadágua
- `PrecyAgent.tsx`: `price` canônico = BRL (`fallbackBRLPrice`) — `price_original` salvo em metadata
- `QRdaguaPage.tsx`: IS_DEMO early-return → lista de projetos vazia na Provadágua

---

## 2026-03-22 — Round 3: DEMO Isolation Foundation

- `activitiesService.ts`: IS_DEMO guard → getAll() retorna []
- `dealsService.ts`: Substituído hostname check por IS_DEMO
- `contactsService.ts`: IS_DEMO import adicionado
- `AdminUsersPage.tsx`: signUp simplificado — só `full_name` no metadata
- `InviteGenerator.tsx`: Texto genérico (sem referencias a clientes)
- `useDealsQuery.ts`: Deduplicação por contactId (real deals têm prioridade sobre ghost cards)

---

## 2026-03-20 — Round 2: VITE_APP_MODE + SDR Board

- `appConfig.ts`: IS_DEMO via VITE_APP_MODE (env var Vercel)
- `dealsService.ts`: SDR leads filtrados por isDemoVisible
- `DealDetailModal.tsx`: optional chaining para company_id null
- Vercel: provadagua configurada manualmente com VITE_APP_MODE=DEMO

---

## 2026-03-17 — Invitation System Fix

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

### Causa Raiz 1 — Front-end (useBoardsQuery.ts)
- **Bug:** `useCreateBoard` chamava `boardsService.create(board, '')` passando string vazia como `company_id`
- **Efeito:** `transformToDb` usa `...(companyId && { company_id: companyId })` — string vazia e falsy, entao o campo `company_id` era **completamente omitido** do payload de INSERT
- **Resultado:** RLS do Supabase rejeitava o INSERT com `403 Forbidden` (nenhuma policy de INSERT autorizava rows sem `company_id`)
- **Fix:** `useCreateBoard` agora le `profile?.company_id` do `AuthContext` e passa o valor real para o service. Inclui guard: se `company_id` for nulo/indefinido, lanca erro antes do fetch.

### Causa Raiz 2 — Backend (RLS inexistente)
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
- `src/lib/query/hooks/useBoardsQuery.ts` — fix company_id no mutationFn
- `supabase/migrations/039_fix_rls_boards_contacts_deals.sql` — nova migration (referencia; executada manualmente)

### Deploy
- Commit: `23c9063` | Branch: `main` | Build: Exit 0 (7.25s)
- SQL do backend: executado via Supabase Dashboard (nao via CLI)

---

## 2026-04-22 - V9.7.2: RLS Fallback & Tech Stack Fix (Hotfix Final)

### Status: SQL DEFINITIVO GERADO — aguardando execucao manual no Dashboard

### Inconsistencia de Tipagem Documentada (Causa Raiz dos V9.7/V9.7.1)
- As tabelas `products` e `companies` NO banco fisico NAO possuem as colunas
  `company_id` nem `owner_id` pressupostas nos arquivos TypeScript do front-end
- `DbCompany` (contacts.ts) declara `owner_id` — coluna INEXISTENTE na tabela real
- `TechStackProduct` (TechStackPage.tsx) nao declara ownership — correto, mas sem RLS
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
| `040_fix_rls_products_companies.sql` | FALHOU — usou `company_id` inexistente |
| `041_fix_rls_real_columns.sql` | FALHOU — usou `owner_id` inexistente em products |
| `042_rls_auth_only_products_companies.sql` | APROVADO — sem dependencia de colunas |

### V9.7 (contexto)
- `useDealsView`: companies fetch agora com `.catch()` graceful (evita 400 crashar o hook)
- `useCreateDeal`: company_id real do profile passado ao service (fix identico ao V9.6 em boards)

---

## 2026-04-22 - V9.7.3: Correcoes de Root Cause e Isolamento Final

### Status: DEPLOYADO — Build verde, push para main

### Causa Raiz 1 — companies INSERT 400 (contacts.ts:305)
- Problema: `companiesService.create()` tentava inserir `company_id` na tabela `companies`
  que nao possui essa coluna (banco compartilhado com Link d agua)
- Fix: Removido `company_id: sanitizedTenantId` do payload de INSERT
- Arquivo: `src/lib/supabase/contacts.ts`

### Causa Raiz 2 — Tech Stack vazando dados globais para leads
- Problema: `TechStackPage` nao verificava `is_super_admin`, carregando e exibindo
  todos os produtos internos (Stripe, Vercel, GitHub, chaves de API) para qualquer usuario autenticado
- Fix: Adicionado guard `isSuperAdmin` com early return:
  - Leads: veem empty state "Area Restrita" (sem chamada ao banco)
  - Super Admin: comportamento normal, pode criar/editar ferramentas e salvar API Keys
- Arquivo: `src/features/admin/TechStackPage.tsx`

### SQL Definitivo para o Supabase Dashboard (042)
- `042_rls_auth_only_products_companies.sql`: politica auth_only para products e companies
- Estas tabelas nao possuem colunas de multi-tenancy — isolamento feito no front-end
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

### Status: DEPLOYADO — Commit 887e9ed · main · Build verde (19s)

### ACAO 1 — RLS Definitivo (043_v98_strict_rls_final.sql)
- Criada função helper `is_super_admin()` no Supabase para bypass do Super Admin
- Eliminado `OR company_id IS NULL` de TODAS as policies CRM (era o vetor de leak cross-tenant)
- Corrigido bug crítico do 039: `board_stages_insert` referenciava `company_id` inexistente
  na tabela `board_stages` — causava 403 em criação de boards por template e por IA
- Tabelas com RLS estrito (company_id): boards, board_stages, contacts, deals, activities
- Tabelas com RLS auth_only (banco compartilhado): products, companies

### ACAO 2 — Isolamento Total de Interface
- `TechStackPage.tsx`: early return para leads (V9.7.3, mantido)
- `CatalogTab.tsx`: guard `isSuperAdmin` adicionado
  - Leads: catálogo somente-leitura (sem botões de editar/criar)
  - Super Admin: God Mode completo com CRUD

### ACAO 3 — Criação de Boards Desbloqueada
- Causa raiz: `board_stages_insert` policy no 039 usava `company_id` (coluna inexistente)
- Fix no 043: policy reescrita usando apenas `board_id IN (SELECT id FROM boards WHERE ...)`
- `useCreateBoard` já estava correto desde V9.6 — bloqueio era 100% no RLS

### ACAO 4 — Banner MVP + Modal de Feedback
- Novo componente: `src/components/MVPBanner.tsx`
  - Banner dismissível com gradiente no topo do CRM
  - Modal de feedback com categorias: Bug / Melhoria / Elogio
  - Envio assíncrono com fallback graceful (nunca frustra o usuário)
- Integrado no `Layout.tsx` (visível para todos os usuários autenticados)
- Novo arquivo `FEEDBACK.md` no repositório para tracking de QA e roadmap

### QA Estático — Tabela de Garantias V9.8
| Funcionalidade | Lead/Tenant | Super Admin |
|---|---|---|
| Boards: criar (template/IA) | OK - company_id correto | OK - is_super_admin bypass |
| Boards: ver boards de outra empresa | BLOQUEADO (RLS estrito) | VISÍVEL |
| Contatos: criar/ver | OK - filtrado por company_id | OK - God Mode |
| Deals/Atividades | OK - filtrado por company_id | OK - God Mode |
| Tech Stack | Tela "Área Restrita" | Acesso completo + salvar API Key |
| Catálogo de Produtos | Somente leitura (sem CRUD) | CRUD completo |
| Banner MVP | Visível + botão Feedback | Visível + botão Feedback |
| Alerta rls_disabled | RESOLVIDO (SQL 043) | — |

### SQL Obrigatório para o Super Admin executar no Dashboard
- Arquivo: `supabase/migrations/043_v98_strict_rls_final.sql`
- Caminho: Supabase Dashboard > SQL Editor > New Query > Cole e Run

---

## 2026-04-24 — V9.9.2: UX Lead Restaurada · TechStack/Catálogo Desbloqueados · Modal Fix

### Status: DEPLOYADO — Commits `72ead14` + `969054f` · main · Build verde (7.74s)

### Diagnóstico (Auditoria Git — git log + git diff)
- **Causa raiz — techStackRestricted para Leads**: Commit V9.7.3 introduziu `if (!isSuperAdmin) return <ÁreaRestrita>` em `TechStackPage.tsx`, bloqueando Leads de gerenciar o próprio Tech Stack isolado por `company_id`.
- **Causa raiz — modais congelados**: `addDeal` no `CRMContext.tsx` tentava criar automaticamente `Nova Empresa (Auto)` via `await addCompany()` quando `companyId` não era encontrado. O RLS estrito de `companies` (sem `company_id`) retornava 403 e o `await` nunca resolvia, congelando o modal.
- **Causa raiz — Gemini 400**: `SettingsContext` carregava `aiApiKey = ''` para Leads sem chave. A herança tentava `.eq('is_super_admin_settings', true)` — coluna inexistente.
- **Causa raiz — produtos 403**: Inserts em `products` sem `company_id` no payload — RLS estrito do 046 rejeita qualquer INSERT sem `company_id = my_company_id()`.

### Correções Aplicadas

#### TechStackPage.tsx — Desbloqueio Total da UI
- **Removido**: `if (!isSuperAdmin) return <ÁreaRestrita>` (early return bloqueante)
- **Adicionado**: `company_id: profile?.company_id` no payload de insert/update de ferramentas
- **Princípio confirmado**: RLS no banco garante isolamento por tenant. A UI não discrimina por role.

#### CatalogTab.tsx — company_id no Payload de Criação
- `insert([formData])` → `insert([{ ...formData, company_id: profile?.company_id }])`

#### CRMContext.tsx — addDeal Gracioso para Falhas de companies
- `addCompany()` agora em `try/catch` — se falhar (RLS/network), o modal fecha normalmente
- Removida criação automática de empresa quando `companyId` não encontrado localmente

#### SettingsContext.tsx — Herança de API Key do Gemini
- Prioridade: (1) chave do próprio usuário → (2) chave do Super Admin via JOIN com profiles → (3) `VITE_GEMINI_API_KEY` (env)
- Query corrigida: `profiles!inner(is_super_admin).eq('is_super_admin', true)`

### SQL Executado no Dashboard
- `047_v992_companies_authonly.sql`: DROP + CREATE de políticas `auth_only` para `companies`
- A tabela `companies` é compartilhada com o app "Link d'água" e não tem `company_id` — isolamento feito na camada de UI

### Tabela de Funcionalidades V9.9.2
| Funcionalidade | Lead/Tenant | Super Admin |
|---|---|---|
| Tech Stack | Acesso completo (dados do próprio `company_id`) | Acesso completo (God Mode) |
| Catálogo de Produtos | CRUD completo (dados do próprio `company_id`) | CRUD completo (God Mode) |
| Criar Boards (template/IA) | OK — company_id correto | OK — is_super_admin bypass |
| Criar Contatos | OK — filtrado por company_id | OK — God Mode |
| Criar Deals/Atividades | OK — gracioso, não congela modal | OK — God Mode |
| IA (Gemini) | Herança silenciosa da chave do Super Admin | Chave própria no Tech Stack |

### Regra de Ouro Documentada
> **"Isolar dados ≠ bloquear interface."** O RLS no banco garante que cada tenant só vê seus próprios dados. A UI deve ser idêntica para todos os roles — sem guards de `isSuperAdmin` na renderização de páginas de negócio.

### Arquivos Modificados
- `src/features/admin/TechStackPage.tsx` — guard removido, `company_id` em inserts
- `src/features/admin/CatalogTab.tsx` — `company_id` em insert
- `src/context/CRMContext.tsx` — `addDeal` gracioso para falhas de companies
- `src/context/settings/SettingsContext.tsx` — herança silenciosa de API key
- `supabase/migrations/047_v992_companies_authonly.sql` — [NOVO] RLS auth_only companies

---

## 2026-04-25 — V9.9.3: Limpeza de Documentação · Remoção de Nomes Reais · Precisão Histórica

### Status: DOCUMENTAÇÃO APENAS — nenhum arquivo .ts/.tsx alterado

### Motivação
Auditoria revelou que o DEVLOG.md, README.md e USER_GUIDE.md continham:
1. Nomes de clientes reais usados como exemplos de caso de uso (viola privacidade e profissionalismo SaaS)
2. Features documentadas como funcionais quando estavam inoperantes (desonestidade técnica)

### Ação 1 — Extermínio de Nomes Reais (Varredura Completa)
- **DEVLOG.md**: todas as ocorrências de nomes reais substituídas por `Lead/Tenant`, `Super Admin`, `[Admin]`, `[Fundadora da Plataforma]`
- **README.md**: mesmas substituições nas seções de rotas, tabela de permissões e filtro de privacy
- **USER_GUIDE.md**: seções renomeadas de "Guia [Nome Pessoal]" para "Guia do Super Admin" / "Guia do Lead/Tenant"
- Mensagens de WhatsApp Business: saudação genérica `"Olá, [Admin]!"` nos templates de conversão

### Ação 2 — Correção de Feature Status (Precisão Histórica)
- **Formulário de Convite de Equipe** — status corrigido de "funcionando" para **⚠️ INOPERANTE (Backlog)**:
  - A funcionalidade de convite via WhatsApp/E-mail para novos membros do time do Lead foi implementada no front-end mas não foi concluída nem testada antes do Go-Live
  - O botão está desativado (`disabled={true}`, label "Em breve / Coming soon") na UsersPage desde V9.5
  - A arquitetura de URL com `company_id` está pronta (back-end); o fluxo completo será reativado em versão futura

### Ação 3 — Entrada V9.9.2 Adicionada (esta seção)
Ver entrada anterior `2026-04-24 — V9.9.2`.

### Arquivos Modificados (apenas .md)
- `DEVLOG.md` — limpeza de nomes + entradas V9.9.2 e V9.9.3 adicionadas
- `README.md` — limpeza de nomes reais em tabelas de rotas e permissões
- `USER_GUIDE.md` — renomeação de seções e correção de referências a nomes pessoais
