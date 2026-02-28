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

### 6. Prova D'água (Demo Gratuito)
- **Conceito**: Ambiente seguro para testar o poder do Hub sem compromisso.
- **Como Acessar**: Clique em "Quero o meu" na Landing Page.
- **Funcionalidades**:
    - **Prompt Lab**: Teste suas ideias com persona "Engenheiro" ou "Especialista em Marketing".
    - **Kanban Demo**: Mova cards em um fluxo simulado de negociação.
- **Privacidade**: Nenhum dado é salvo permanentemente no modo Demo.

---

## Como Começar
1. **Login**: Acesse sua conta em `/login`.
2. **Crie um Board**: Use o modal "Estratégia com IA" para definir seus objetivos.
3. **Convide sua Equipe**: Adicione membros via painel Admin.
4. **Explore os Agentes**: Abra um card de Deal e clique na aba "Agentes" para interagir com Jury e Precy.
5. **Configure seu Link d'Água**: Acesse `/qrdagua` e crie sua vitrine digital.

## Suporte
Para suporte técnico, feedback ou reportar bugs, use o botão azul **"Ajuda"** no canto inferior esquerdo. Selecione **"Reportar Bug / Feedback"** para enviar uma mensagem direta à nossa equipe de engenharia.
