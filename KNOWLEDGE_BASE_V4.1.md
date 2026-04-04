# KNOWLEDGE BASE — Encontro D'Água Hub Digital V4.1
### Base de Conhecimento Bilíngue (PT-BR / EN) — Para NotebookLM & Treinamento IA

---

## 1. IDENTIDADE E FILOSOFIA / IDENTITY & PHILOSOPHY

### PT-BR
**Encontro D'Água Hub Digital** é uma plataforma SaaS fundada por **Lidi Moura**, Manauara, Psicóloga e Dev Fullstack Lowcode, Especialista em Dados (ONE Alura/Oracle — em estudos para certificações OCI e IA).

A filosofia central é **"Reflorestar o Digital"**: criar tecnologia acessível, ética e com impacto social real — especialmente para profissionais de saúde mental, empreendedores independentes e criadores de conteúdo.

O Hub nasceu da própria dor da fundadora: ela foi sua primeira cliente. Tudo aqui foi validado resolvendo problemas reais antes de ser oferecido a outros.

### EN
**Encontro D'Água Hub Digital** is a SaaS platform founded by **Lidi Moura**, a psychologist and Fullstack Lowcode Developer from Manaus, Brazil — Data Specialist (ONE Alura/Oracle), currently studying for OCI and AI certifications.

The core philosophy is **"Reforest the Digital"**: building accessible, ethical technology with real social impact — especially for mental health professionals, independent entrepreneurs, and content creators.

The Hub was born from the founder's own pain points. She was her first client. Everything here was validated by solving real problems before being offered to others.

---

## 2. PARA QUEM É / WHO IS IT FOR

### 3 Segmentos Principais / 3 Core Segments

| Segmento | Dor Principal | Solução no Hub |
|----------|---------------|----------------|
| 🩺 **Psicólogos & Saúde** | Perder encaminhamentos, falta de sistema | CRM com funil ético, automação de follow-up |
| 💼 **Empreendedores** | Dados espalhados, sem pipeline | Board visual, IA que escreve propostas, relatórios |
| 🔗 **Link d'Água** | Precisam de presença digital rápida | Mini-site / cartão digital + QR Code personalizado |

---

## 3. MÓDULOS DO PRODUTO / PRODUCT MODULES

### 3.1 CRM com IA (Hub Principal)
- Pipeline visual no estilo Kanban (Board SDR + Boards customizáveis)
- Cards de negócio com: título, valor, probabilidade, prioridade, tags, origem, contato vinculado
- Criação automática de card ao capturar lead (Edge Function `form-lp-lead`)
- IA Precy integrada para análise de dados e sugestões
- Chatbot Amazô para atendimento e SDR
- Atividades, histórico e anotações por contato
- Multi-tenant com isolamento total por `company_id` (RLS PostgreSQL)

### 3.2 Prompt Lab
- Interface para criar e otimizar prompts para IA
- Motor: Google Gemini 2.5 Flash Lite
- Funções: Otimizar prompt, Testar resultado, Copiar
- Disponível como feature standalone (plano Mensal R$ 3,00)

### 3.3 Link d'Água (Bio Link / Mini-Site)
- Cartão digital com foto, bio, links organizados e QR Code personalizado
- Vitrine online em `link.encontrodagua.com/vitrine`
- QR Code dinâmico em `qrdagua.com`
- Ideal para psicólogos, coaches e autônomos

### 3.4 AI Hub / Amazô Chatbot
- Amazô: SDR inteligente via Typebot
- Capta leads, qualifica interesse, salva no CRM automaticamente
- Notifica Lidi via push notification ao capturar novo lead

### 3.5 Relatórios & Dashboard
- Métricas em tempo real: leads capturados, pipeline, conversão
- Gráfico de tendência de receita
- Filtros por período, fonte, status

---

## 4. TECNOLOGIA / TECHNOLOGY STACK

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 7 |
| **Estilização** | TailwindCSS v4 |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime + Edge Functions) |
| **Infra** | Oracle Cloud Infrastructure (OCI) |
| **Segurança** | RLS ativo em todas as tabelas, isolamento por `company_id` |
| **IA** | Google Gemini API (2.5 Flash Lite) |
| **Chatbot** | Typebot (hosted) |
| **Pagamentos** | Stripe Checkout |
| **Analytics** | GA4 (G-MHH0WSX5QS) |
| **CDN/Deploy** | Vercel |
| **Automações** | n8n (Briefing + WhatsApp trigger) |

---

## 5. SEGURANÇA E PRIVACIDADE / SECURITY & PRIVACY

### Row Level Security (RLS)
- Todas as tabelas têm RLS ativo
- Política: cada usuário só acessa dados da própria `company_id`
- Nenhum dado de um tenant vaza para outro — multi-tenant por design
- Chaves rotacionadas por ambiente
- LGPD-ready por design

---

## 6. PLANOS E PREÇOS / PLANS & PRICING

| Plano | Preço | Stripe Product ID |
|-------|-------|-------------------|
| **Pro Mensal** | R$ 3,00/mês | `prod_UGWT3Pm4ztKmcU` |
| **Pro Anual** ⭐ | R$ 29,90/ano | `prod_UGVFdr4qUVufSu` |

- 20% de desconto por indicação (acumulável, máx 50%)
- 60% off para projetos de Impacto Social
- Pagamento 100% upfront ou 50/50 para projetos consultivos

---

## 7. FLUXO DE CAPTURA DE LEADS

```
Visitante na LP
    ↓ Clica em CTA
ApplicationModal (nome, email, WhatsApp, interesse)
    ↓ POST
Edge Function: form-lp-lead
    ├── Upsert em contacts (idempotente por phone)
    ├── Insert em deals no Board SDR (col. Novo/Lead)
    ├── Insert em waitlist
    ├── Trigger n8n — Briefing IA + WhatsApp (não-bloqueante)
    └── Push Notification → Lidi (o "apito")
```

**Tags por origem:**
- `Hub-lp` — formulário da LP principal
- `amazo-sdr` — capturado pela Amazô
- `linkdagua` + `🤖 sdr` — via Link d'Água / QR d'Água

---

## 8. LEAD GATE

- **Tela padrão**: campo de palavra-chave + nome + email
- **Palavra-chave**: `ReflorestarDigital`
- **God Mode**: triplo clique no logo ou `?god=true` na URL
- **Sem a chave**: direto para WhatsApp

---

## 9. EQUIPE

| Nome | Papel | Tipo |
|------|-------|------|
| **Lidi Moura** | Fundadora, Dev, CEO | Humana |
| **Precy** | Tech Lead IA | IA |
| **Amazô** | Customer Success / SDR | IA |
| **Antigravity** | Dev IA (par programador) | IA |

---

## 10. URLs

| Destino | URL |
|---------|-----|
| Landing Page | `prova.encontrodagua.com` |
| Hub (login) | `prova.encontrodagua.com/#/login` |
| Link d'Água | `link.encontrodagua.com/vitrine` |
| QR d'Água | `qrdagua.com` |
| WhatsApp | `wa.me/5592992943998` |

---

## 11. GLOSSÁRIO

| Termo | Significado |
|-------|------------|
| Hub | A plataforma completa (CRM + IA + Link d'Água) |
| Board SDR | Kanban principal de captura e qualificação de leads |
| Deal/Card | Oportunidade de negócio no pipeline |
| Lead Gate | Login com palavra-chave — filtra leads quentes |
| God Mode | Acesso direto ao login real (admin) |
| company_id | Identificador do tenant — isolamento de dados |
| RLS | Row Level Security — política PostgreSQL |
| OCI | Oracle Cloud Infrastructure |
| Iceberg | Seção técnica oculta na LP, revelada via acordeão |
| Amazô | Chatbot SDR (Typebot) |
| Reflorestar | Devolver à tecnologia sua função social |
| form-lp-lead | Edge Function que unifica captura de leads + auto-card |

---
*Versão Hub Digital: V4.1 | Gerado em: 2026-04-04*
