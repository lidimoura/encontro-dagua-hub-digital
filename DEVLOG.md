# DEVLOG — Encontro d'Água Hub

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

### Fluxo Completo do Lead Amanda (V6.5)
```
1. Showcase → CTA "Iniciar Trial Grátis" → /#/login?from=showcase (ou domínio prova.*)
2. Formulário: Palavra-chave ('provadagua') → Nome → Email → Senha (≥6 chars)
3. submit → supabase.auth.signUp() com metadata → signInWithPassword(email, leadPassword)
4. AuthContext.fetchProfile (maybeSingle) → loading=false → /dashboard
5. Retorno: Amanda loga com email + senha que ela definiu
```

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

### Fluxo Completo do Lead Amanda (V6.4)
```
1. Showcase → CTA "Iniciar Trial Grátis" → /#/login?from=showcase
2. Formulário: Nome + Email + Keyword ('provadagua') + Senha (≥6 chars)
3. submit → signup-showcase Edge Fn → supabase.auth.signInWithPassword(email, userPassword)
4. AuthContext.fetchProfile (maybeSingle) → loading=false → /dashboard
5. Retorno: Amanda loga com email + senha que ela definiu
```

---

## 2026-04-16 — V6.2: Final Release QA · Stripe · WA Business Lidi · GA4

### Arquitetura de Canais (documentada)
- **Amazô** = IA de front-end — atendimento automatizado 24/7 nas LPs e ShowcasePage
- **WhatsApp Business `5541992557600`** = gestão humana direta da **Lidi Moura** (proprietária)
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
- `whatsappFallback` corrigido: `5592992943998` → `5541992557600` (Lidi)
- Mensagens WA todas Lidi-branded por produto (Prompt Lab Mensal/Anual, Agente IA, Consultoria)
- Payment Links via env vars: `VITE_STRIPE_LINK_MONTHLY`, `VITE_STRIPE_LINK_ANNUAL`, `VITE_STRIPE_LINK_AGENTE_IA`
- Fallback automático para WA Business se link Stripe não configurado

### WhatsApp Business — Mensagens Estratégicas
| Origem | Mensagem |
|---|---|
| Showcase — Keyword | "Olá, Lidi! Estou na vitrine da Provadágua e quero minha Palavra-Chave..." |
| Showcase — Dúvida | "Olá, Lidi! Estou testando a demo e tenho uma dúvida sobre a personalização..." |
| Hub — Consultoria | "Olá, Lidi! Conheci o Hub e quero conversar sobre uma implementação sob medida..." |
| Prompt Lab Mensal | "Olá, Lidi! Vi o Prompt Lab no Hub e quero assinar o Plano Mensal (R$ 3,00/mês)..." |
| Agente de IA | "Olá, Lidi! Vi o Agente de IA (R$ 80/mês) no Hub e tenho interesse..." |

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
- Footer: `logo-icon-gold-transp.png`, bio Lidi c/ certificações OCI/IA/MySQL, links GitHub Org + LinkedIn + WA Suporte

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
- Bio: "Por Lidi Moura — Formada em Psicologia e Especialista em Dados"
- Mockup de chat interativo (balões de conversa) com preço e botão "Contratar"
- CTA principal: `btn-agente-ia-launch` → `openAgenteIAModal()`
- CTA secundário: WhatsApp Lidi (`wa.me/5592992943998`)

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
- Founder badge: "Lidi Moura: Formada em Psicologia e Especialista em Dados"
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
- `InviteGenerator.tsx`: Texto genérico (sem "Amanda")
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

