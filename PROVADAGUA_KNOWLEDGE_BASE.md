# PROVADÁGUA KNOWLEDGE BASE
## Manual de Valor — Hub Digital para Profissionais de Saúde e Bem-Estar
### Encontro D'Água · V3.0 · Abril 2026

---

> **Para o NotebookLM:** Este documento é a fonte primária de conhecimento do produto Provadágua / Encontro D'Água Hub. Use-o para gerar materiais de marketing, roteiros de vendas, respostas a perguntas frequentes e conteúdo educativo para profissionais da saúde.

---

# PARTE 1 — VISÃO GERAL DO PRODUTO
# PART 1 — PRODUCT OVERVIEW

---

## O que é o Encontro D'Água Hub? / What is Encontro D'Água Hub?

**PT-BR:**
O Encontro D'Água Hub é um sistema operacional de gestão de relacionamentos (CRM) desenvolvido especificamente para empreendedores amazônicos e profissionais de saúde que operam em mercados nacionais e internacionais. Diferente dos CRMs genéricos disponíveis no mercado, o Hub foi construído com três pilares inegociáveis: **privacidade por design**, **inteligência artificial embarcada** e **isolamento total de dados por empresa** (multi-tenancy).

**EN:**
Encontro D'Água Hub is a Customer Relationship Management (CRM) operating system built specifically for Amazonian entrepreneurs and healthcare professionals operating in domestic and international markets. Unlike generic CRMs, the Hub was built on three non-negotiable pillars: **privacy by design**, **embedded artificial intelligence**, and **complete per-company data isolation** (multi-tenancy).

---

## Para quem é o Hub? / Who is the Hub for?

**PT-BR:**
O Hub foi desenhado para:
- **Médicos** que querem digitalizar sua captação de pacientes sem comprometer a privacidade
- **Fisioterapeutas** que gerenciam múltiplos pacientes e precisam de follow-ups automatizados
- **Psicólogos** que precisam de sigilo absoluto no tratamento de informações dos pacientes
- **Nutricionistas e Dentistas** que desejam automatizar agendamentos e campanhas de retenção
- **Clínicas e consultórios** de qualquer porte que precisam de um sistema robusto, seguro e bilíngue

**EN:**
The Hub was designed for:
- **Physicians** who want to digitize patient acquisition without compromising privacy
- **Physiotherapists** managing multiple patients who need automated follow-ups
- **Psychologists** requiring absolute confidentiality in patient information handling
- **Nutritionists and Dentists** who want to automate scheduling and retention campaigns
- **Clinics and practices** of any size needing a robust, secure, and bilingual system

---

## Por que o Hub é diferente? / Why is the Hub different?

**PT-BR:**

| Característica | CRMs Genéricos | Encontro D'Água Hub |
|---|---|---|
| Dados isolados por empresa | ❌ Dados compartilhados | ✅ `company_id` RLS |
| IA embarcada | ❌ Add-ons pagos | ✅ 4 agentes nativos |
| Bilinguismo PT/EN | ❌ Raro | ✅ Nativo |
| Conformidade LGPD | ⚠️ Parcial | ✅ Arquitetado |
| Validade de acesso | ❌ Não existe | ✅ `access_expires_at` |
| SDR automatizado 24/7 | ❌ Manual | ✅ Integrado |

**EN:**

| Feature | Generic CRMs | Encontro D'Água Hub |
|---|---|---|
| Per-company data isolation | ❌ Shared data | ✅ `company_id` RLS |
| Embedded AI | ❌ Paid add-ons | ✅ 4 native agents |
| PT/EN bilingualism | ❌ Rare | ✅ Native |
| LGPD/GDPR compliance | ⚠️ Partial | ✅ Architected |
| Access expiry control | ❌ Non-existent | ✅ `access_expires_at` |
| Automated SDR 24/7 | ❌ Manual | ✅ Integrated |

---

# PARTE 2 — PILARES TÉCNICOS EXPLICADOS PARA NÃO-TÉCNICOS
# PART 2 — TECHNICAL PILLARS EXPLAINED FOR NON-TECHNICALS

---

## 2.1 Multi-Tenancy e Isolamento de Dados / Multi-Tenancy and Data Isolation

**PT-BR:**
Imagine que o Hub é um prédio de escritórios. Cada empresa (clínica, consultório) é um andar diferente. O isolamento multi-tenant garante que o andar 5 (sua clínica) nunca pode ver nem acessar os dados do andar 3 (outra clínica). Isso é feito através de uma tecnologia chamada **Row Level Security (RLS)** no banco de dados, que usa um identificador único (`company_id`) para separar todos os dados no nível mais fundamental do sistema.

**O que isso significa na prática para um profissional de saúde?**
- Seus dados de pacientes são **seus**, e somente seus
- Nenhum funcionário de outra clínica no mesmo sistema pode ver seus leads
- Se a Dra. Amanda usa o Hub, e a Dra. Maria também usa, os dados delas são completamente separados automaticamente — sem configuração adicional

**EN:**
Think of the Hub as an office building. Each company (clinic, practice) is a different floor. Multi-tenant isolation ensures that floor 5 (your clinic) can never see or access data from floor 3 (another clinic). This is done through a technology called **Row Level Security (RLS)** in the database, using a unique identifier (`company_id`) to separate all data at the most fundamental level of the system.

**What does this mean in practice for a healthcare professional?**
- Your patient data is **yours**, and yours alone
- No employee from another clinic on the same system can see your leads
- If Dr. Amanda uses the Hub, and Dr. Maria also uses it, their data is completely separated automatically — no additional configuration needed

---

## 2.2 Inteligência Artificial Embarcada / Embedded Artificial Intelligence

**PT-BR:**
O Hub integra **4 agentes de IA nativos**, todos alimentados pelo Google Gemini — o modelo de linguagem mais avançado do mercado:

1. **Mazô (Inbox Agent)** — Agente de Customer Success que responde mensagens de pacientes automaticamente, seguindo seu protocolo de atendimento personalizado
2. **SDR Automatizado** — Qualifica leads chegando pela landing page ou QR Code, agenda reuniões e envia propostas sem intervenção humana
3. **Prompt Lab** — Ferramenta de experimentação de IA multi-persona para criação de materiais clínicos, scripts de atendimento e conteúdo de marketing
4. **Nexus Bridge** — Monitor proativo que alerta sobre anomalias no sistema e no pipeline de vendas

**EN:**
The Hub integrates **4 native AI agents**, all powered by Google Gemini — the most advanced language model on the market:

1. **Mazô (Inbox Agent)** — Customer Success agent that responds to patient messages automatically, following your custom service protocol
2. **Automated SDR** — Qualifies leads arriving via landing page or QR Code, schedules meetings and sends proposals without human intervention
3. **Prompt Lab** — Multi-persona AI experimentation tool for creating clinical materials, service scripts, and marketing content
4. **Nexus Bridge** — Proactive monitor that alerts about system anomalies and pipeline irregularities

---

## 2.3 Controle de Validade de Acesso / Access Expiry Control

**PT-BR:**
O Hub permite que você conceda acesso **temporário** ao sistema. Um paciente VIP pode ter acesso ao portal por 30 dias. Um estagiário pode ter acesso à plataforma por 3 meses. Quando o prazo expira, o acesso é removido **automaticamente** — sem precisar lembrar de fazer isso manualmente.

Tecnicamente, isso é controlado pela coluna `access_expires_at` no perfil de cada usuário. O Super Admin (você) pode estender, revogar ou monitorar todos os acessos em tempo real.

**EN:**
The Hub allows you to grant **temporary** system access. A VIP patient can access the portal for 30 days. An intern can have platform access for 3 months. When the deadline expires, access is revoked **automatically** — no need to remember to do it manually.

Technically, this is controlled by the `access_expires_at` column in each user's profile. The Super Admin (you) can extend, revoke, or monitor all access in real time.

---

## 2.4 Super Admin e God Mode / Super Admin and God Mode

**PT-BR:**
O Super Admin é o usuário com o maior nível de controle do sistema. Enquanto usuários regulares veem apenas os dados de sua empresa (`company_id`), o Super Admin tem visibilidade **cross-tenant** — pode ver e operar em múltiplas empresas simultaneamente.

Isso é especialmente útil para:
- Consultores de saúde que gerenciam múltiplas clínicas
- Empreendedores que possuem redes de consultórios
- Equipes de TI que prestam suporte a múltiplos clientes

**EN:**
The Super Admin is the user with the highest level of system control. While regular users only see their company's data (`company_id`), the Super Admin has **cross-tenant** visibility — capable of seeing and operating across multiple companies simultaneously.

This is especially useful for:
- Healthcare consultants managing multiple clinics
- Entrepreneurs owning networks of practices
- IT teams providing support to multiple clients

---

# PARTE 3 — MÓDULOS EM PRODUÇÃO
# PART 3 — PRODUCTION MODULES

---

**PT-BR:** Todos os módulos abaixo estão operacionais em `hub.encontrodagua.com` — produção real, não demonstração.

**EN:** All modules below are live at `hub.encontrodagua.com` — real production, not a demo.

| Módulo / Module | Função / Function | Público-alvo / Target |
|---|---|---|
| **Board Kanban** | Gestão visual de pipeline de pacientes | Todas as especialidades |
| **Contatos** | Base de dados de pacientes com campos customizáveis | Todas as especialidades |
| **Inbox / Mazô** | Mensageria com IA integrada | Clínicas com alto volume de mensagens |
| **Jury** | Geração de contratos BR e Common Law | Profissionais que atendem internacionalmente |
| **Precy** | Precificação em BRL, USD e EUR | Consultas internacionais |
| **QR D'água** | QR Codes rastreáveis para materiais físicos | Marketing em clínicas físicas |
| **Reports** | Dashboard de Win/Loss e taxas de conversão | Gestores de clínica |
| **Prompt Lab** | Criação de conteúdo com IA multi-persona | Marketing e educação em saúde |
| **Admin** | Gestão de usuários, permissões e configurações | Admin da clínica |

---

# PARTE 4 — PRIVACIDADE E CONFORMIDADE LGPD/GDPR
# PART 4 — PRIVACY AND LGPD/GDPR COMPLIANCE

---

## 4.1 O que é a LGPD e por que ela importa para sua clínica? / What is LGPD and why does it matter for your clinic?

**PT-BR:**
A Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018) é a regulamentação brasileira equivalente ao GDPR europeu. Para profissionais de saúde, ela é especialmente rigorosa porque dados de saúde são classificados como **dados sensíveis** — uma categoria de proteção máxima.

**Penalidades por violação podem chegar a 2% do faturamento anual da empresa, com teto de R$ 50 milhões por infração.**

O Hub foi arquitetado com LGPD em mente desde a primeira linha de código:
- **Isolamento de dados por empresa** via RLS
- **Consentimento implícito** no fluxo de captação de leads
- **Direito ao esquecimento** — usuários podem ser deletados de forma completa
- **Logs de acesso** — rastreabilidade total das operações

**EN:**
The Brazilian General Data Protection Law (LGPD, Law No. 13,709/2018) is Brazil's equivalent to the European GDPR. For healthcare professionals, it is especially strict because health data is classified as **sensitive data** — a maximum protection category.

**Penalties for violations can reach 2% of annual company revenue, up to R$ 50 million per infraction.**

The Hub was architected with LGPD in mind from the first line of code:
- **Per-company data isolation** via RLS
- **Implicit consent** in the lead capture flow
- **Right to be forgotten** — users can be completely deleted
- **Access logs** — full traceability of operations

---

## 4.2 Relatório de QA e Segurança — Auditoria V3.0 / QA & Security Report — V3.0 Audit

**PT-BR:** Resultado da auditoria técnica interna de abril de 2026:

| Item | Status | Detalhes |
|---|---|---|
| Isolamento Multi-Tenant | ✅ APROVADO | `company_id` RLS ativo em todas as tabelas críticas |
| Rotação de Chaves de API | ✅ APROVADO | `SERVICE_ROLE_KEY` rotacionada, armazenada em Vercel Secrets |
| Super Admin (Migration 038) | ✅ APROVADO | `is_super_admin=true` com bypass de RLS controlado |
| Bilinguismo PT/EN | ✅ APROVADO | Toggle nativo, LanguageContext em todos os módulos |
| Validade de Acesso | ✅ APROVADO | `access_expires_at` com expiração automática |
| Isolamento de Dados Demo | ✅ APROVADO | `is_demo_data` guard em todos os services |

**EN:** Results of the internal technical audit, April 2026:

| Item | Status | Details |
|---|---|---|
| Multi-Tenant Isolation | ✅ PASSED | `company_id` RLS active on all critical tables |
| API Key Rotation | ✅ PASSED | `SERVICE_ROLE_KEY` rotated, stored in Vercel Secrets |
| Super Admin (Migration 038) | ✅ PASSED | `is_super_admin=true` with controlled RLS bypass |
| PT/EN Bilingualism | ✅ PASSED | Native toggle, LanguageContext across all modules |
| Access Expiry | ✅ PASSED | `access_expires_at` with automatic expiration |
| Demo Data Isolation | ✅ PASSED | `is_demo_data` guard in all services |

---

# PARTE 5 — FLUXO DE ONBOARDING PARA NOVOS PROFISSIONAIS
# PART 5 — ONBOARDING FLOW FOR NEW PROFESSIONALS

---

**PT-BR:**

### Passo 1: Solicitação de Acesso
O profissional acessa `hub.encontrodagua.com/#/showcase` e clica em **"Experimente por 7 dias grátis"**. O formulário de captação registra o lead no sistema com a tag `provadagua` e inicia o fluxo de qualificação pelo SDR automatizado.

### Passo 2: Convite Personalizado
O Admin envia um link de convite único gerado pelo Hub (`/#/join?token=...`). O link tem validade configurável e é vinculado ao `company_id` da clínica do profissional.

### Passo 3: Setup do Ambiente
No primeiro acesso, o Hub direciona para o **Setup Wizard** — um assistente de configuração que personaliza:
- Nome da clínica e domínio
- Especialidade e fluxo de captação
- Preferências de idioma (PT/EN)
- Módulos ativos

### Passo 4: Treinamento com IA
O **Prompt Lab** oferece templates prontos para profissionais de saúde: scripts de atendimento, materiais educativos e campanhas de retenção.

### Passo 5: Go-Live
Com dados migrados e equipe treinada, a clínica entra em produção. O Super Admin monitora o onboarding via painel Admin.

**EN:**

### Step 1: Access Request
The professional accesses `hub.encontrodagua.com/#/showcase` and clicks **"Try free for 7 days"**. The capture form registers the lead in the system with the `provadagua` tag and initiates the qualification flow through the automated SDR.

### Step 2: Personalized Invitation
The Admin sends a unique invitation link generated by the Hub (`/#/join?token=...`). The link has configurable validity and is linked to the professional's clinic's `company_id`.

### Step 3: Environment Setup
On first access, the Hub directs to the **Setup Wizard** — a configuration assistant that personalizes:
- Clinic name and domain
- Specialty and capture flow
- Language preferences (PT/EN)
- Active modules

### Step 4: AI Training
The **Prompt Lab** offers ready-made templates for healthcare professionals: service scripts, educational materials, and retention campaigns.

### Step 5: Go-Live
With data migrated and team trained, the clinic goes into production. The Super Admin monitors onboarding via the Admin panel.

---

# PARTE 6 — PROPOSTA DE VALOR POR ESPECIALIDADE
# PART 6 — VALUE PROPOSITION BY SPECIALTY

---

## Médicos / Physicians

**PT-BR:**
Um médico com consultório particular perde em média **3-5 horas por semana** em tarefas administrativas que poderiam ser automatizadas: retorno de exames, confirmação de consultas, follow-up de pacientes que abandonaram o tratamento. O Hub automatiza 80% dessas tarefas através do SDR + Inbox Agent (Mazô), liberando tempo clínico para o que importa: o paciente.

**EN:**
A physician with a private practice loses on average **3-5 hours per week** on administrative tasks that could be automated: exam returns, appointment confirmations, follow-up with patients who abandoned treatment. The Hub automates 80% of these tasks through the SDR + Inbox Agent (Mazô), freeing clinical time for what matters: the patient.

---

## Fisioterapeutas / Physiotherapists

**PT-BR:**
A fisioterapia tem uma particularidade: **alta rotatividade de pacientes** e necessidade de acompanhamento contínuo. O Board Kanban do Hub permite mapear visualmente cada paciente em sua jornada de recuperação, com alertas automáticos para sessões perdidas e follow-ups de reengajamento.

**EN:**
Physiotherapy has a unique characteristic: **high patient turnover** and need for continuous monitoring. The Hub's Kanban Board allows visually mapping each patient through their recovery journey, with automatic alerts for missed sessions and re-engagement follow-ups.

---

## Psicólogos / Psychologists

**PT-BR:**
Para psicólogos, o sigilo é ético e legal. O Hub garante que **nenhum dado de paciente é compartilhado** entre profissionais no mesmo sistema. O `company_id` RLS isola completamente os dados de cada psicólogo. Além disso, o acesso temporário (`access_expires_at`) permite sessões de grupo com data de encerramento definida.

**EN:**
For psychologists, confidentiality is both ethical and legal. The Hub ensures that **no patient data is shared** between professionals on the same system. The `company_id` RLS completely isolates each psychologist's data. Additionally, temporary access (`access_expires_at`) allows group sessions with a defined end date.

---

# PARTE 7 — GLOSSÁRIO BILÍNGUE
# PART 7 — BILINGUAL GLOSSARY

---

| Termo (PT) | Term (EN) | Definição (PT) | Definition (EN) |
|---|---|---|---|
| **Multi-tenancy** | Multi-tenancy | Arquitetura onde múltiplas empresas usam o mesmo sistema com dados completamente isolados | Architecture where multiple companies use the same system with completely isolated data |
| **RLS** | RLS | Row Level Security — regra no banco de dados que filtra quais linhas cada usuário pode ver | Row Level Security — database rule that filters which rows each user can see |
| **company_id** | company_id | Identificador único da empresa/clínica, usado para isolar todos os dados | Unique identifier of the company/clinic, used to isolate all data |
| **SDR** | SDR | Sales Development Representative — agente de qualificação de leads | Sales Development Representative — lead qualification agent |
| **is_super_admin** | is_super_admin | Flag que dá ao usuário visibilidade e controle sobre todas as empresas | Flag that gives the user visibility and control over all companies |
| **access_expires_at** | access_expires_at | Data e hora em que o acesso de um usuário expira automaticamente | Date and time when a user's access expires automatically |
| **is_demo_data** | is_demo_data | Marcador que separa dados de demonstração de dados de produção reais | Flag that separates demo data from real production data |
| **LGPD** | LGPD/GDPR | Lei Geral de Proteção de Dados (Brasil) — equivalente ao GDPR europeu | Brazil's General Data Protection Law — equivalent to European GDPR |
| **Edge Function** | Edge Function | Função serverless executada na borda da rede, próxima ao usuário final | Serverless function executed at the network edge, close to the end user |
| **Webhook** | Webhook | Notificação automática enviada entre sistemas quando um evento ocorre | Automatic notification sent between systems when an event occurs |
| **Pipeline** | Pipeline | Funil de vendas/atendimento com etapas visuais | Sales/service funnel with visual stages |
| **Kanban** | Kanban | Método de gestão visual de tarefas/leads por colunas de status | Visual management method for tasks/leads organized in status columns |

---

# PARTE 8 — PERGUNTAS FREQUENTES (FAQ)
# PART 8 — FREQUENTLY ASKED QUESTIONS (FAQ)

---

**PT: Meus dados de pacientes ficam no Brasil?**
EN: Do my patient data stay in Brazil?

PT: Sim. O banco de dados do Hub roda no Supabase com data center configurado para compliance com a LGPD. Os dados não saem da infraestrutura contratada.

EN: Yes. The Hub's database runs on Supabase with data centers configured for LGPD compliance. Data does not leave the contracted infrastructure.

---

**PT: Quanto tempo leva para minha clínica estar operacional no Hub?**
EN: How long does it take for my clinic to be operational on the Hub?

PT: O Setup Wizard foi desenhado para que uma clínica esteja operacional em **menos de 5 minutos** após receber o convite. A migração de dados de sistemas legados pode levar de 1 a 3 dias, dependendo do volume.

EN: The Setup Wizard was designed so that a clinic is operational in **less than 5 minutes** after receiving the invitation. Migration of data from legacy systems may take 1 to 3 days, depending on volume.

---

**PT: Posso dar acesso ao sistema para minha secretária sem ela ver dados de pacientes?**
EN: Can I give my receptionist access without them seeing patient data?

PT: Sim. O sistema tem papéis (roles) granulares: `admin`, `vendedor`, e `cliente`. Você pode restringir quais módulos e quais dados cada membro da equipe pode acessar.

EN: Yes. The system has granular roles: `admin`, `vendedor` (sales), and `cliente` (client). You can restrict which modules and which data each team member can access.

---

**PT: O Hub funciona em inglês para atender pacientes internacionais?**
EN: Does the Hub work in English for international patients?

PT: Sim. O Hub é nativamente bilíngue (PT/EN). O toggle de idioma está disponível em todas as páginas públicas e no painel administrativo.

EN: Yes. The Hub is natively bilingual (PT/EN). The language toggle is available on all public pages and in the admin panel.

---

**PT: O que acontece se eu cancelar? Posso exportar meus dados?**
EN: What happens if I cancel? Can I export my data?

PT: Sim. Você pode exportar todos os dados da sua empresa em formato CSV ou JSON a qualquer momento. Após o cancelamento, seus dados ficam disponíveis por 90 dias para export antes da exclusão permanente.

EN: Yes. You can export all your company's data in CSV or JSON format at any time. After cancellation, your data remains available for 90 days for export before permanent deletion.

---

*Documento gerado em 02/04/2026 · Versão 3.0 · Encontro D'Água Hub*
*Generated on 04/02/2026 · Version 3.0 · Encontro D'Água Hub*
