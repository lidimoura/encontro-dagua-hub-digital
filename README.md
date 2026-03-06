# 🌀 Encontro D'água Hub

> **Tecnologia acessível, resultados reais.**
> _Sustainable technology, real results._

O **Encontro D'água Hub** é um SaaS Enterprise Bilíngue que integra Estratégia Humana com Eficiência de IA.
Mais do que um CRM, é um **Nexus** — o ponto central onde Leads, Negócios e Agentes de IA se encontram.

[![Status](https://img.shields.io/badge/Status-Lançamento%20Beta-brightgreen)](HUB_SHOWCASE.md)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20Gemini-blue)](package.json)
[![Idioma Principal](https://img.shields.io/badge/Idioma-PT--BR-yellow)](src/context/LanguageContext.tsx)

## 🏆 Créditos & Evolução

- **Arquitetura CRM Core:** Fornecida por **Thales Laray** (Escola de Automação - Acesso Vitalício).
- **Evoluída por:** **Lidi Moura** (Nexus Protocol, Agentes de IA, integração Link d'Água).
- **Powered by:** **Deepmind Antigravity Agent**.

## 📖 A Jornada

Do laptop Celeron rodando Streamlit a um Sistema Enterprise cloud-native.
👉 **[Leia a Jornada da Fundadora (HUB_SHOWCASE.md)](HUB_SHOWCASE.md)** para entender nossa estratégia de "Dogfooding" e a evolução dos Agentes de IA.

---

## 🚀 Principais Funcionalidades

### 1. Link d'Água — A Vitrine Digital (Produto Principal)
Uma poderosa "Link in Bio" e geradora de QR Codes que alimenta diretamente o CRM.
- **Links Inteligentes:** Bridge Pages que capturam a intenção do lead.
- **Integração Profunda:** Scans viram Leads instantaneamente no Kanban.
- **QR Codes SVG:** Vetoriais, nítidos em qualquer tela, prontos para impressão profissional.

### 2. O Esquadrão de IA (O Motor)
- **Amazô (CS Externo):** Agente de vendas/suporte 24/7 na Landing Page.
- **Mazô (CS Interno):** Monitora saúde dos clientes e deals "apodrecendo".
- **Jury (Jurídico):** Gera contratos bilíngues (PT/EN) com consciência de jurisdição.
- **Precy (Financeiro):** Precificação multicurrency e cálculo de ROI.

### 3. CRM Enterprise (O Core)
- **Kanban Board:** Gestão drag-and-drop com indicadores de "Rotting".
- **Briefing do Lead:** `briefing_json` do SDR exibido na aba Produtos (serviços de interesse), Timeline (nota automática do bot) e sidebar (botão WhatsApp direto).
- **WhatsApp + IA:** Botão que gera mensagem personalizada via Gemini e abre `wa.me?text=` pré-preenchida — editável antes de enviar.
- **Proteção Ghost Deal:** Verificações robustas de integridade de dados.
- **Interface Bilíngue:** PT-BR como idioma principal, EN como alternativa.


---

## 🛠️ Stack & Arquitetura

- **Frontend:** React 18, TypeScript, TailwindCSS.
- **Backend:** Supabase (PostgreSQL, Auth, RLS Multitenant).
- **IA:** Google Gemini 2.5 Flash Lite (via `geminiService.ts`).
- **I18n:** Hook customizado `useTranslation` — PT-BR padrão, fallback automático.

### Instalação

```bash
# 1. Clone & Instale
git clone [repo-url]
npm install

# 2. Variáveis de Ambiente
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=...

# 3. Rode
npm run dev
```

## 🔒 Segurança & Acesso
Repositório **Privado** e SaaS **Somente por Convite**.
Acesso gerenciado via "Nexus Protocol" (Role-Based Access Control com RLS Supabase).

---

*Construído com ❤️ por Lidi Moura.*
*Powered by Deepmind Antigravity.*
