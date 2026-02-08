# 🌀 Encontro D'água .hub

> **Tecnologia sustentável, resultados reais.**

O **Encontro D'água** é um ecossistema digital que se inspira na natureza como maior tecnologia fluida para integrar estratégias humanas com a eficiência da IA.

## 📊 Status: Stable Beta - Mobile Ready

**Última Atualização:** 08/02/2026  
**Build:** ✅ Passing  
**Produção:** ✅ Stable with full mobile support, AI Hub & Decisions active

## 🔐 Acesso: Invite-Only

Este projeto é **privado e exclusivo**. O acesso é concedido apenas via convite gerado pela Admin. Não há cadastro público.

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS + Custom Design System (Açaí/Solimões)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** Google Gemini 2.0 Flash
- **QR Codes:** react-qrcode-logo (dots/rounded style)
- **State:** React Context API
- **Routing:** React Router v6 (HashRouter)
- **i18n:** Custom translation hook (PT/EN)

## 🚀 Setup Local

```bash
# 1. Clone o repositório
git clone [repo-url]
cd crm-encontro-dagua

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente (.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key

# 4. Execute migrations no Supabase
# Acesse Supabase Dashboard > SQL Editor
# Execute os arquivos em supabase/migrations/ em ordem

# 5. Rode o projeto
npm run dev

# 6. Build para produção
npm run build
```

## 🎯 Soluções do Hub

### Públicas (Landing Page)
- **🧠 Prompt Lab (Prova D'água):** Engenharia de ideias com IA. Transforme intenções brutas em prompts estruturados usando Gemini API. Teste prompts gratuitamente e veja resultados em tempo real.
- **📱 QR D'água:** Conexão instantânea. QR Codes dinâmicos, cartões digitais e links que resolvem problemas reais. Galeria pública com projetos da comunidade.
- **🤖 Amazo IA:** Atendimento 24/7 via Typebot. Agente de IA para diagnóstico, CS e Vendas direto no WhatsApp.
- **💼 CRM Simulator (White Label):** Preview do sistema Kanban (LEAD → EM NEGOCIAÇÃO → CLIENTE). Demonstração visual da gestão de leads.
- **📝 Diagnóstico de Leads:** Formulário inteligente com 7 opções de intenção (Mentoria, Agentes IA, CRM, Automações, QR Code, Prompt Lab, Diagnóstico). Integração automática com CRM.

### Internas (Hub Pro)
- **🏪 Catálogo:** Gestão de produtos e serviços. CRUD completo integrado ao CRM.
- **💼 CRM Nativo:** Gestão completa de leads com IA integrada e automações.
- **🎁 Sistema de Indicação:** Referral com 20% OFF para indicador e indicado.

## 👩‍💻 Inteligência Híbrida (Equipe)

- **Lidi (Founder):** Estratégia e Visão.
- **Amazô (IA - Fuchsia):** Customer Success & Vendas (Landing Page pública).
- **Aiflow (IA - Blue):** Suporte Técnico (Login & Hub).
- **Precy (IA):** Tech Lead.
- **Jury (IA):** Compliance.

## 🏗️ Arquitetura

**Mobile First:** Interface otimizada para dispositivos móveis com menu hamburguer universal.

**AI Agent Separation:**
- **Amazô** → Landing Page pública (vendas, qualificação de leads)
- **Aiflow** → Login + Hub protegido (suporte técnico, recuperação de senha)
- Cada agente tem identidade visual distinta (cores, ícones, posicionamento)

**Database:**
- Supabase PostgreSQL com RLS policies granulares
- Analytics de QR Codes (`scan_count`, `last_scan_at`)
- Super Admin: Atribuição de QR Codes a clientes via `owner_id`

## 📋 Features Principais

### Sistema de Convites
- Admin gera links únicos com ou sem desconto (20% OFF)
- Usuários podem compartilhar link de referral
- Rastreamento automático de indicações
- Acúmulo de créditos de desconto

### QR D'água
- 3 tipos: Link Direto, Página Ponte, Cartão Digital
- QR Codes com estilo dots/arredondado
- Logo embedding
- Galeria pública (opt-in)
- Preview em tempo real

### CRM & Boards
- Kanban personalizado
- IA integrada para qualificação
- Campos customizáveis
- Automações

## 🌍 Internacionalização / Demo Mode

O sistema possui suporte completo para **Português (PT)** e **Inglês (EN)**.

### Como Alternar Idiomas

**Via URL:**
```
# Português (padrão)
https://seu-dominio.com/

# Inglês
https://seu-dominio.com/?lang=en
```

**Persistência:**
- A preferência de idioma é salva automaticamente no `localStorage`
- Permanece ativa durante toda a sessão e em futuras visitas
- Sincroniza com o parâmetro URL para compartilhamento fácil

### Componentes Traduzidos

✅ **Core CRM:** Kanban Board, Deal Cards, Mazo Agent, Mobile View, Board Selector  
✅ **Landing Page:** Navegação, Hero Section, Títulos, Footer  
✅ **Navegação Global:** Menu principal, Botões de ação

### Para Desenvolvedores

```typescript
import { useTranslation } from '@/hooks/useTranslation';

const { t, switchLanguage } = useTranslation();
// Uso: <h1>{t('heroTitle')}</h1>
```

**Dicionário:** `src/lib/translations.ts` (100+ keys)

---

*Inspirado na natureza, codificado para o mundo.*
