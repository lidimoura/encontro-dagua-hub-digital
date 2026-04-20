# Guia do Usuário — Encontro D'água Hub

## Visão Geral
Bem-vindo ao **Encontro D'água Hub** — CRM e Ecossistema Digital projetado para empreendedores das comunidades amazônicas e além. Este guia cobre as funcionalidades essenciais, incluindo os Agentes de IA e o suporte bilíngue.

> **Idioma Principal:** Português do Brasil (PT-BR). O inglês está disponível como alternativa via toggle 🇧🇷/🇺🇸 no cabeçalho.

---

## Funcionalidades Principais

### 1. Link d'Água — Sua Vitrine Digital (Produto Principal)
O **Link d'Água** é o ponto de entrada da sua presença digital:
- **Link único** para WhatsApp, Instagram, portfólio e agendamento.
- **Vitrine de produtos e serviços** com fotos.
- **Analytics de cliques** em tempo real.
- **QR Code vetorial (SVG)** gerado automaticamente — nítido na tela e em impressão profissional.
- **Sem precisar de site** — funciona em qualquer celular.

### 1.5. Equipe de IA (AI Team)
- **Jury (Legal)**: Generates contracts adaptable to **Brazil** and **Australia**. Can be accessed directly inside the Deal Modal for concurrent contract drafting and CRM data viewing.
    - **Clean Contracts**: Generates standardized, variable-free contracts ready for printing.
    - **Refinement Chat**: Use the chat below the contract preview to ask for specific clause changes (e.g., "Add a confidentiality clause").
    - **Timeline Export**: Save generated contracts directly to the Deal Timeline.
- **Precy (Finance)**: Calculates pricing and ROI with multi-currency support (**BRL, USD, AUD**).
    - **Social Pricing**: Toggle "Social Impact" to apply automatic discounts for non-profits.
- **Amazô (CS/Sales - External)**: 24/7 diagnostic agent available on the Landing Page and via WhatsApp.
- **Mazô (CS/Sales - Internal)**: Customer Success Strategist within the CRM. Monitors client health scores and suggests retention actions. Replaces the generic "Flow AI".

### 1.6. CRM Features
- **Boards**: Kanban-style project management. Access the **Equipe de IA** tab for strategic insights.
- **Contacts**: Centralized contact management with RLS security (Admins see all).
- **Prompt Lab**: Create and optimize AI prompts in English or Portuguese.
- **QR D'água**: Generate dynamic QR codes, Bridge Pages, and Digital Cards with locked-down Iframe viewing capabilities.

Para acessar: clique em "Ver Vitrine" na Landing Page ou acesse `/qrdagua` no painel.

### 2. Navegação & Suporte Bilíngue
- **Toggle de Idioma**: Alterne entre Português (🇧🇷) e Inglês (🇺🇸) instantaneamente no cabeçalho.
- **Padrão:** PT-BR. A preferência é salva automaticamente.
- **Contexto Global:** Todos os Agentes de IA (Jury, Precy, Amazô) adaptam-se ao idioma selecionado.

### 3. Agentes de IA (O "Board of Directors")
- **Amazô (CS/Vendas — Externo)**: Agente 24/7 na Landing Page e via WhatsApp. Qualifica leads e os encaminha para o CRM.
- **Mazô (CS/Vendas — Interno)**: Estrategista de Customer Success dentro do CRM. Monitora health scores e sugere ações de retenção.
- **Jury (Jurídico)**: Gera contratos adaptáveis ao **Brasil** e internacionais (Common Law).
    - **Contratos Limpos**: Padronizados, sem variáveis expostas, prontos para impressão.
    - **Chat de Refinamento**: Peça alterações específicas de cláusulas via chat.
- **Precy (Financeiro)**: Calcula precificação e ROI com suporte multicurrency (**BRL, USD, AUD**).
    - **Precificação Social**: Ative "Impacto Social" para descontos automáticos em ONGs.

### 4. CRM — Trabalhando com Leads do Amazô SDR

Quando o Amazô captura um lead, o CRM recebe um `briefing_json` com todos os dados do contato.
Abra o card do lead no Kanban e você verá:

#### Aba Produtos
Um bloco **"Interesse declarado pelo Lead"** mostra, como badges coloridos, os serviços que o lead pediu
(ex: "Link d'Água", "QR Code", "Consultoria"). Use isso para adicionar os produtos corretos abaixo.

#### Aba Timeline
Um card **"Briefing Automático — Amazô SDR"** aparece no topo com a mensagem original que o lead digitou
no chatbot, incluindo data/hora de captura e canal de entrada.

#### WhatsApp + IA (Sidebar — Contato Principal)
1. Clique em **"📲 WhatsApp + Msg IA"** na sidebar do card.
2. Aguarde 3-5 segundos — a IA (Gemini) gera uma mensagem personalizada com nome, serviços e contexto do lead.
3. Revise/edite o texto no campo que aparecer.
4. Clique em **"Abrir no WhatsApp"** — o WhatsApp Web abre com a mensagem já inserida, pronta para enviar.
5. Se quiser uma versão diferente, clique em **"refazer"**.

> 💡 **Dica**: Você sempre pode editar a mensagem antes de enviar. A IA oferece um ponto de partida excelente, mas o toque humano final é seu.

### 5. Ferramentas Admin

- **Tech Stack**: Gerencie custos e assinaturas de ferramentas.
- **Biblioteca**: Gerencie templates de contratos e assets.
- **Decisões**: Insights de IA sobre deals estagnados.

### 6. Provadágua (CRM Customizado — Trial)
- **Conceito**: Sandbox realista para testar o ecossistema CRM da Lidi Moura ("O seu software deveria trabalhar para você, não o contrário").
- **Como Acessar**: Inserir palavra-chave `provadagua` na página de Login. Acesso de 7 dias liberado imediatamente.
- **Isolamento de Dados**: Leads de trial caem em um `company_id` próprio. Eles nunca verão os dados do Hub administrativo.
- **Pós-Trial (V5.3)**: Quando o tempo acaba (`access_expires_at`), o acesso é bloqueado e o sistema força o roteamento para a tela `/trial-expired`, contendo NPS, consentimento LGPD e fluxo de Upsell focado em vendas via WhatsApp.

---

## Como Começar
1. **Login**: Acesse sua conta em `/login`.
2. **Crie um Board**: Use o modal "Estratégia com IA" para definir seus objetivos.
3. **Convide sua Equipe**: Adicione membros via painel Admin.
4. **Explore os Agentes**: Abra um card de Deal e clique na aba "Agentes" para interagir com Jury e Precy.
5. **Configure seu Link d'Água**: Acesse `/qrdagua` e crie sua vitrine digital.

## Suporte e Contato
Para suporte técnico, feedback ou encerramento de trial, entre em contato exclusivo pelo **WhatsApp Business (Administrativo Hub e Provadágua)**: `+55 (41) 99255-7600`.
---

## 7. Acesso, God Mode e Upsell (V5.3)

### Hub vs Provadágua — Separação Estrita
A nova estrutura divide o acesso:
- **Hub (Admin)**: Somente `is_super_admin` consegue acesso. Qualquer tentativa de lead entrar no Hub resulta em logout automático e bloqueio com a mensagem "Acesso administrativo restrito".
- **God Mode**: Para login administrativo, é exigido dar triplo clique no logotipo (na tela de `/login`). Isso libera o botão de acesso admin bypassando o formulário Provadágua.

### Trial Keyword — Acesso Imediato Leads Provadágua
- **Keyword:** `provadagua` (configurada em `VITE_ACCESS_KEYWORD` no painel Vercel)
- Inserida pelo Lead. Flow: **Palavra-chave → Nome → E-mail → Senha** → `supabase.auth.signUp()` nativo → Dashboard imediato
- **7 dias de acesso** via `trial_expires_at` no Profile
- Dados isolados por empresa (`company_id` único por lead)
- Lead **inserido automaticamente** em `contacts` com `source='showcase'` e data de entrada

### Planos Disponíveis

| Plano | Valor | Ação |
|---|---|---|
| Prompt Lab Mensal | R$ 3,00/mês | Entrar via `/#/login` |
| Prompt Lab Anual | R$ 29,90/ano | Entrar via `/#/login` (≈ R$2,49/mês) |
| **Agente IA (SDR/SAC)** | **R$ 80,00/mês** | **[buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02](https://buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02)** |

> **Fallback Stripe:** Se o checkout falhar, redirecionar para WhatsApp: `https://wa.me/5592992943998`

### Gerenciar Trials (SuperAdmin — Lidi)

> Ver seção completa **“Guia da Lidi: Painel Admin”** abaixo.

1. Acesse `/#/admin` → aba **Usuários**
2. Veja as colunas **Data de Cadastro** e **Expiração Trial**
3. Leads com trial expirado aparecem em **laranja + ⚠️**
4. Use os botões de ação: **+7d** / **Suspender** / **Editar** / **Excluir**
5. O campo `trial_expires_at` controla o vencimento automaticamente

---

## 8. MVP V4.3 — Lançamento Provadágua

> *Atualizado: 12 Abril 2026 · Build V4.3*

### Identidade da Fundadora
- **Nome:** Lidi Moura
- **Formação:** Formada em Psicologia e Especialista em Dados
- **Público-alvo:** Profissionais de Saúde e Empreendedores

### Fluxo de Acesso pela Palavra-Chave (CHAVE: `provadagua`)

| Etapa | Ação |
|---|---|
| 1 | Usuário acessa `/#/login` e clica **"Entrar no Hub"** |
| 2 | Preenche nome, e-mail e digita `provadagua` |
| 3 | Clique em **"Entrar no Hub — Acesso Imediato"** |
| 4 | Edge Function `signup-showcase` cria conta com `email_confirm: true` |
| 5 | Sistema seta `access_expires_at = now() + 7 dias` automaticamente |
| 6 | Auto-login com `signInWithPassword()` — sem confirmação de e-mail |
| 7 | Redirecionamento direto para `/dashboard` — trial ativo |
| 8 | Lead cai nos Contatos e Boards do CRM com tags `provadagua`, `provadagua-trial`, `trial-7d` |

> **Zero barreiras de aprovação manual** para quem tem a palavra-chave.

### CTAs do Login (V4.3)

| Botão | Ação |
|---|---|
| **Experimentar Ecossistema** | Abre vitrine da Provadágua (`prova.encontrodagua.com`) em nova aba |
| **Entrar no Hub** | Abre formulário de palavra-chave → trial imediato |

### Identidade Visual — Paleta Earth-Neon

| Token | Cor | Uso |
|---|---|---|
| `earthNeon` | `#00C97B → #00E5FF` | CTAs, gradientes principais |
| `gold` | `#D4A853` | Título accent, badges fundadora |
| `obsidian` | `#070D09` | Background principal |
| `neonGreen` | `#00C97B` | Pills, bordas hover |
| `neonCyan` | `#00E5FF` | Eyebrow, acentos |

### Showcase LP (`/#/showcase`)

Nova Hero Section com:
- Badge fundadora: *"Lidi Moura · Formada em Psicologia e Especialista em Dados"*
- Copy: *"O CRM Personalizado que Cresce com Você"*
- Placeholder de vídeo demo interativo
- Grid de 3 screenshots mockup do CRM (Kanban · Contatos IA · Dashboard)

### Link d'Água — Vitrine Externa
- Card "Kit Básico" na ShowcasePage → `https://link.encontrodagua.com/vitrine`

### Google Analytics 4
- **ID:** `G-MHH0WSX5QS`
- Helper: `src/lib/analytics.ts`
- Eventos rastreados: `showcase_cta_click`, `trial_start`, `lead_capture`, `checkout_success`, `checkout_cancel`, `sign_up`, `login`

### Stripe — Planos
| Plano | Valor | Product ID |
|---|---|---|
| Mensal | R$ 3,00/mês | `prod_UGWT3Pm4ztKmcU` |
| Anual | R$ 29,90/ano | `prod_UGVFdr4qUVufSu` |
| Agente IA | R$ 80,00/mês | Link Stripe direto |

### Deploy
- Branch de produção: `provadagua`
- Domínio: `prova.encontrodagua.com`
- Hub principal: `hub.encontrodagua.com`
---

## 8. Checklist de Backup — Acer Go (Novo Hardware)

> Use este checklist sempre que configurar um novo ambiente de desenvolvimento.

### Ambiente de Dev
- [ ] Node.js v20+ instalado (`node -v`)
- [ ] NPM v10+ instalado (`npm -v`)
- [ ] Git configurado (`git config --global user.email`)
- [ ] Repositório clonado: `git clone [repo-url] c:\PROJETOS\encontro-dagua-hub-digital`
- [ ] `npm install` executado na pasta do projeto
- [ ] `.env` copiado do Vercel Dashboard ou do backup seguro
- [ ] Build verde: `npm run build` (EXIT 0)

### Env Vars Essenciais (.env)
```env
VITE_APP_MODE=PRODUCTION
VITE_SUPABASE_URL=https://[projeto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GEMINI_API_KEY=AIza...
VITE_GA4_MEASUREMENT_ID=YOUR_GA4_ID_HERE
VITE_ACCESS_KEYWORD=provadagua
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Nunca commitar!
```

### Verificação Pós-Setup
- [ ] `npm run dev` inicia em `localhost:5173`
- [ ] `/#/login` carrega Lead Gate
- [ ] Keyword `provadagua` redireciona para Dashboard
- [ ] `/#/showcase` carrega ShowcasePage com Pricing
- [ ] GA4 ativo no Network tab (googletagmanager.com)
- [ ] Stripe link do Agente IA abre: `https://buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02`

---

## 9. Gerenciando Leads da Oferta Agente IA (V4.4)

### Como chegam esses leads

Leads captados via **botão "Quero meu Agente IA"** na HomePage entram no CRM com:
- **Source:** `hub-lp-launch`
- **Tags:** `agente-ia-80`, `launch-offer`, `Hub-lp`
- **Campo:** `agente_ia_offer: true` no `briefing_json`
- Após o cadastro: Stripe abre automaticamente em nova aba para o lead finalizar o checkout

### Identificando no Board

1. Acesse **Boards → primeiro estágio**
2. Filtrar por tag `agente-ia-80` ou `launch-offer`
3. Leads com badge `🤖 Agente IA` ou source `hub-lp-launch` são da oferta de lançamento

### Consulta SQL rápida (Supabase SQL Editor)

```sql
SELECT name, email, source, tags, created_at
FROM contacts
WHERE 'agente-ia-80' = ANY(tags)
ORDER BY created_at DESC;
```

### Follow-up recomendado

| Situação | Ação |
|---|---|
| Lead cadastrou mas não pagou | Enviar WhatsApp em até 2h com link Stripe |
| Lead pagou no Stripe | Iniciar onboarding (Typebot ou direto) |
| Lead tirou dúvida via WhatsApp | Direcionar para `buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02` |

> **Prazo de onboarding**: Agente configurado em até 48h úteis após pagamento confirmado.

---

## 10. Guia da Lidi: Painel de Gestão Global (V8.0)

> **URL:** `/#/admin` — Acesso exclusivo `role = admin`

### Visão Geral da Tabela

| Coluna | O que mostra |
|---|---|
| **Usuário** | E-mail, nome completo, badge LEAD (leads Provadágua) |
| **Role / Plano** | `user / admin / vendedor` · `FREE / MONTHLY / ANNUAL` · badge 🔴 SUSP |
| **Cadastro** | Data de criação do usuário (`created_at`) |
| **Expiração Trial** | `trial_expires_at` — exibição em laranja + ⚠️ se expirado |
| **Ações** | WA · +7d · Suspender/Ativar · Editar · Excluir |

### Como Renovar o Trial (+7 dias)

1. Localize o lead pela barra de busca (e-mail ou nome)
2. Clique em **"+ 7d"** na linha do lead
3. O sistema calcula: *se o trial ainda está vigente*, estende a partir da data atual; *se já expirou*, conta 7 dias a partir de hoje
4. Toast de confirm: `✅ Trial de amanda@... renovado +7 dias`
5. A coluna **Expiração Trial** atualiza imediatamente

### Como Suspender / Reativar Acesso

1. Clique em **"Suspender"** na linha do lead
2. O `access_level` muda para `'suspended'` — lead não consegue fazer login
3. Para reativar: clique em **"Ativar"** (botão fica verde quando suspenso)

### Como Editar Detalhes do Lead (Modal)

1. Clique em **"Editar"** na linha
2. No modal, você pode ajustar:
   - **Plano**: Free / Monthly / Annual
   - **Status**: Active / Inactive / Suspended
   - **Acesso (Lead)**: Trial Ativo / Suspenso / Pago
   - **Expiração do Trial**: campo de data (date picker)
   - **Telefone**: campo livre
3. Clique em **"Salvar"** — alterações são instantaneas no banco

### Como Excluir um Lead Permanentemente

> ⚠️ Esta ação **não pode ser desfeita**.

1. Clique em **"Excluir"** (botao vermelho 🗑️)
2. O navegador pede confirmação: *"Excluir PERMANENTEMENTE ...? "*
3. O registro de `profiles` é deletado
4. Para remover também o usuário de Auth: acesse o **Supabase Dashboard → Authentication → Users**

### Como Contatar um Lead via WhatsApp

- Clique no botão **💬 WA** na linha do lead
- Abre o WhatsApp Web com mensagem pré-preenchida: *"Oi Lidi! Lead: amanda@..."*
- Use como ponto de partida para a conversa de vendas

---

## 11. Guia da Amanda (Lead/Owner): Gestão do Time e CRM em Inglês (V8.0)

### Convidar Sócias para a Empresa (`/#/settings`)

> A Amanda vê **apenas** os usuários da empresa dela (`company_id`). Nunca vê dados da Lidi.

1. Acesse **Settings → Team Members** (ou `/#/settings`)
2. No topo, preencha o campo **"Invite a Teammate"** com o e-mail da sócia
3. Clique em **"Send Invite"**
4. O sistema abre o WhatsApp com mensagem de convite em inglês: *"Hi! You've been invited..."*
5. A sócia deve se cadastrar usando o link enviado e a keyword da empresa
6. Assim que cadastrada, ela aparece automaticamente na lista

### Usando o CRM em Inglês (EN-US)

1. No canto superior direito, clique no botão de idioma 🇧🇷 / 🇺🇸 / 🇪🇸
2. Alterne para 🇺🇸 **English (US)**
3. Todos os menus, labels, botões e mensagens do sistema mudam para EN
4. O widget de suporte azul (**Aiflow**) também muda: título, cards e formulário ficam em inglês
5. A preferência salva automaticamente no `localStorage`

### Usando o Suporte Aiflow

1. Clique no botão azul ❓ no canto inferior esquerdo
2. Escolha o tema de suporte:
   - **Forgot password** — instruções de recuperação
   - **Didn't receive the email** — dica sobre spam
   - **Access error** — troubleshoot de login
   - **Report Bug / Feedback** — abre formulário que notifica a Lidi
   - **Direct support** — abre WhatsApp com a equipe
3. O idioma do painel Aiflow segue o idioma selecionado no sistema

---

*Atualizado automaticamente pelo Manager (Antigravity AI) — V8.0 Go-Live Provadágua*

---

## Nota para o Lead / Amanda: Convidar S�cias para o Time

A funcionalidade de **convidar s�cias e colaboradoras** diretamente pela aba **Team Members** (/#/settings/team) est� temporariamente em manuten��o.

> **Status: ?? Em breve � previsto para a pr�xima atualiza��o p�s-valida��o.**

### O que j� funciona:
- Visualizar os membros da sua equipe (filtrado pela sua empresa)
- Ver roles (Admin, Membro, Sales Rep)

### O que est� em desenvolvimento:
- Envio de convite por WhatsApp ou E-mail com link direto para a sua �rea
- Integra��o autom�tica do convidado ao seu time (via company_id)

### Alternativa Manual (Enquanto aguarda):
Pe�a para a Lidi criar o acesso da sua s�cia diretamente no painel administrativo, informando o nome e e-mail. Ela configurar� o v�nculo correto com a sua empresa.

---
