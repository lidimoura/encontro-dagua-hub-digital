# Encontro D'água - Hub Digital
## Guia do Usuário

Bem-vindo ao **Encontro D'água - Hub Digital**, a plataforma que une tecnologia e humanidade para potencializar suas conexões de negócios.

---

## 🎯 Visão Geral

O Hub Digital é uma plataforma completa que integra:
- **CRM Inteligente** com IA integrada
- **QR d'água** - Gerador de QR Codes e Cartões Digitais
- **Prompt Lab** - Otimizador de prompts com IA
- **Gestão de Leads** com estratégia Invite-Only

---

## 🚀 Guia Rápido

### Como Convidar Alguém (Admin)

**Pré-requisito:** Você precisa ter acesso de Admin (role: admin) para gerar convites.

#### Passo a Passo Completo:

1. **Acesse o Painel Admin**
   - Navegue para `/admin` ou clique em "Admin" no menu
   - Apenas usuários com email autorizado (lidimfc@gmail.com) têm acesso

2. **Localize o Gerador de Convites**
   - Está no topo da página, logo abaixo do cabeçalho
   - Card roxo com ícone de envelope

3. **Preencha os Dados do Convite**
   - **Email (Opcional):** Se preenchido, será pré-preenchido no cadastro do convidado
   - **Desconto 20% OFF:** Marque se quiser oferecer desconto na 1ª mensalidade
     - Aparece uma mensagem especial no WhatsApp
     - O cupom é aplicado automaticamente no cadastro

4. **Gere o Link**
   - Clique em **"Gerar Link de Convite"**
   - Aguarde alguns segundos (aparece "Gerando...")
   - ✅ Toast de sucesso aparece no topo da tela

5. **Modal com Link Aparece**
   - **IMPORTANTE:** O modal verde aparece logo abaixo do botão
   - Contém o link completo: `https://[dominio]/#/join?token=[TOKEN]`
   - Dois botões disponíveis:
     - **Copiar Link:** Copia para área de transferência
     - **Enviar no WhatsApp:** Abre WhatsApp com mensagem pré-formatada

6. **Compartilhe o Convite**
   - **Via WhatsApp (Recomendado):**
     - Clique em "Enviar no WhatsApp"
     - Escolha o contato
     - Mensagem já vem formatada com instruções
   
   - **Via Copiar Link:**
     - Clique em "Copiar Link"
     - Cole onde preferir (email, SMS, DM, etc.)

#### Formato do Link Gerado:
```
https://[seu-dominio]/#/join?token=abc123-def456-ghi789
```

#### Mensagem WhatsApp (com desconto):
```
Olá! Você foi convidado para o Encontro D'água Hub 
com 20% de desconto na primeira mensalidade! 🎉

Cadastre-se aqui: [LINK]
```

#### Mensagem WhatsApp (sem desconto):
```
Olá! Você foi convidado para o Encontro D'água Hub!

Cadastre-se aqui: [LINK]
```

#### ⚠️ Solução de Problemas:

**Modal não aparece após clicar em "Gerar"?**
- Verifique o console do navegador (F12)
- Procure por logs com emoji 🔑, ✅ ou 🎉
- Se aparecer erro ❌, verifique conexão com Supabase

**Link não funciona?**
- Verifique se o token foi criado na tabela `company_invites`
- Confirme que o link está completo (não foi cortado ao copiar)
- Teste abrindo em aba anônima

**Toast aparece mas modal não?**
- Aguarde 2-3 segundos (pode haver delay de rede)
- Recarregue a página e tente novamente
- Verifique se há erros no console

### Como Navegar na Galeria

**No Mobile (Touch):**
- Deslize horizontalmente para ver mais projetos
- Toque em um card para abrir o projeto em nova aba

**No Desktop (Mouse):**
- Use as **setas esquerda/direita** nas bordas da galeria
- Ou arraste horizontalmente com o mouse
- Clique em um card para abrir o projeto em nova aba

**Dica:** Para aparecer na galeria, marque "Exibir na Galeria" ao criar seu QR Code!

---

## 📋 Módulos Principais

### 1. 🏠 Dashboard
Visão geral de suas métricas, negócios ativos e atividades recentes.

**Funcionalidades:**
- Resumo de negócios por estágio
- Atividades recentes
- Acesso rápido aos módulos

---

### 2. 💼 CRM (Gestão de Negócios)

**Boards Kanban:**
- Arraste e solte negócios entre colunas
- Personalize estágios do funil
- Adicione notas e atualizações

**Contatos:**
- Gerencie clientes e leads
- Histórico de interações
- Campos personalizáveis

**Agentes de IA:**
- **Yara** - Qualificação de leads (10K Methodology)
- **Júlia** - Análise de propostas
- **Vitória** - Suporte em vendas

---

### 3. 🎨 QR d'água - Gerador de QR Codes

Crie QR Codes profissionais com páginas de destino personalizadas.

**Tipos de Projeto:**

#### LINK (Redirecionamento Simples)
- QR Code direto para URL
- Personalize cores
- Adicione logo e textos ao QR

#### BRIDGE (Página Ponte)
- Página intermediária com branding
- Título e descrição personalizados
- Botão de ação customizável
- Imagem de destaque

#### CARD (Cartão Digital - Mini Linktree)
- **Múltiplos links** em uma única página
- Editor visual de links com:
  - Adicionar/remover links
  - Reordenar com setas
  - 7 tipos de link: WhatsApp, Link/Site, Email, Telefone, Instagram, LinkedIn, Personalizado
  - Ícones emoji personalizáveis
  - Ativar/desativar links individualmente

**Recursos PRO:**
- **Direct Redirect** - Pula a página ponte (apenas para admins)
- QR Code com logo central
- Textos acima e abaixo do QR
- Portfolio e Galeria públicos

**Validação de Contraste:**
- Alerta visual quando contraste é insuficiente (< 4.5:1)
- Sugestões de cores seguras
- Conformidade WCAG AA

---

### 4. ✨ Prompt Lab - Otimizador de Prompts com IA

Transforme ideias brutas em prompts perfeitos para LLMs.

**Funcionalidades:**

#### Otimização de Prompts
1. Selecione a **persona** (Engenheiro, Copywriter, Designer, etc.)
2. Digite sua ideia bruta
3. Clique em "✨ Otimizar Prompt"
4. Receba prompt estruturado e otimizado

#### Teste e Feedback
1. Clique em "🧪 Testar Prompt" após otimizar
2. Veja a resposta da IA em tempo real
3. Avalie com 👍 Útil ou 👎 Não Útil
4. Feedback salvo para melhorias contínuas

#### Biblioteca de Prompts
- Salve prompts otimizados com título e tags
- Acesse prompts salvos anteriormente
- Click para carregar prompt salvo no editor
- Organize por tags e personas

**Personas Disponíveis:**
- 👨‍💻 Engenheiro de Software
- ✍️ Copywriter
- 🎨 Designer
- ⚖️ Advogado
- 📈 Profissional de Marketing
- 👩‍🏫 Professor

---

### 5. 🔒 Landing Page Invite-Only

**Estratégia de Crescimento:**
- Acesso por convite ou lista de espera
- Prompt Lab público como lead magnet
- Formulário de waitlist captura:
  - Nome completo
  - WhatsApp (com DDD)
  - Quem indicou (opcional - garante 20% desconto futuro)

**Prompt Lab Público:**
- Teste gratuito do otimizador
- Resultado exibido em modal
- CTA para solicitar acesso completo

### 📝 Formulário de Diagnóstico (Novo!)

**Onde Encontrar:** Botão "Quero ser cliente" na Landing Page

O novo formulário inteligente ajuda a qualificar leads automaticamente através de um sistema de diagnóstico de intenção.

#### Como Funciona:

1. **Acesse o Formulário**
   - Clique em "Quero ser cliente" no header
   - Ou em qualquer CTA da Landing Page

2. **Preencha os Dados Básicos**
   - Nome completo (obrigatório)
   - WhatsApp (obrigatório)
   - Email (opcional)
   - Como conheceu o Hub (opcional)

3. **Selecione sua Intenção/Diagnóstico**
   
   Escolha a opção que melhor descreve sua necessidade:
   
   - **Quero aprender a criar (Mentoria/Consultoria)**
     - Para quem quer aprender a usar IA e automações
     - Consultoria personalizada
   
   - **Quero contratar Agentes de IA / Chatbots**
     - Implementação de chatbots (Typebot, WhatsApp)
     - Agentes de IA para atendimento
   
   - **Preciso de um CRM Personalizado**
     - CRM adaptado ao seu negócio
     - Integração com IA
   
   - **Automações Específicas**
     - Fluxos de trabalho automatizados
     - Integrações entre ferramentas
   
   - **QR Code Dinâmico / Cartão Digital**
     - QR Codes profissionais
     - Cartões digitais (mini linktree)
   
   - **Acesso Total ao Prompt Lab**
     - Plano Pro Mensal (R$ 3,00)
     - Templates de especialistas
   
   - **Não sei a solução (Quero Diagnóstico)**
     - Conversa com Amazô IA
     - Diagnóstico gratuito

4. **Envie o Formulário**
   - Clique em "Enviar Aplicação"
   - Aguarde confirmação de sucesso

5. **Pós-Envio**
   - Tela de sucesso aparece
   - Botão verde: **"💬 Quero uma consultoria free"**
   - Link direto para WhatsApp da Admin
   - Resposta em até 24h

#### Integração Automática com CRM

✅ **Seu lead é salvo automaticamente no CRM!**

- Aparece na coluna "LEAD" do Kanban
- Campo "Notas" inclui sua intenção/diagnóstico
- Admin pode qualificar e mover pelo funil
- Rastreamento completo da origem (Landing Page)

#### Dicas para Preencher:

- **Seja específico** no campo "Como conheceu o Hub"
- **Escolha a intenção correta** para receber proposta adequada
- **Use WhatsApp válido** - é o principal canal de contato
- Se não souber qual solução precisa, escolha "Quero Diagnóstico"

### 🧪 Prompt Lab Público - Teste Grátis

**Onde Encontrar:** Seção "Prompt Lab" na Landing Page (não precisa login!)

#### Como Usar:

1. **Acesse a Landing Page** (`/`)
2. **Role até a seção "Prompt Lab"** (badge roxo "Prova D'água")
3. **Digite sua ideia bruta** no campo de texto
   - Exemplo: "Criar legenda para foto de produto"
4. **Clique em "✨ Otimizar"**
5. **Aguarde o processamento** (API Gemini 2.0 Flash)
6. **Veja o resultado estruturado**
   - Prompt otimizado aparece em card roxo
   - Botões disponíveis:
     - **Copiar**: Copia prompt para área de transferência
     - **🧪 Testar Prompt**: Executa o prompt e mostra resposta da IA
     - **👍/👎**: Avalie a qualidade (feedback)

#### Teste de Prompt em Tempo Real:

1. Após otimizar, clique em **"🧪 Testar Prompt"**
2. Aguarde processamento (pode levar 5-10 segundos)
3. **Resposta da IA aparece em card azul**
4. Botão "Copiar" disponível para salvar resultado

#### Upgrade para Hub Pro:

- Clique em **"Quero Acesso ao Hub Pro"** no resultado
- Formulário de diagnóstico abre
- Escolha "Acesso Total ao Prompt Lab"
- Receba proposta personalizada

#### Limitações da Versão Pública:

- ❌ Não salva prompts (sem biblioteca)
- ❌ Não tem personas especializadas
- ✅ Otimização funcional completa
- ✅ Teste de prompts ilimitado
- ✅ Sem necessidade de login

💡 **Dica:** Use o Prompt Lab público para testar a qualidade antes de assinar o Pro!

---

## 🎨 Temas e Personalização

**Temas Disponíveis:**
- 🌞 Modo Claro
- 🌙 Modo Escuro (padrão)

**Paleta de Cores:**
- **Açaí** - Roxo profundo (#620939)
- **Solimões** - Dourado vibrante (#FFD700)
- **Rio Negro** - Tons escuros para dark mode

---

## 🔐 Planos e Permissões

### FREE (Vendedor)
- Acesso ao CRM básico
- QR Codes com página ponte
- Marca "Powered by Encontro D'água Hub"
- Prompt Lab com personas básicas

### PRO (Admin)
- Direct Redirect (sem página ponte)
- QR Codes com logo e textos
- Sem marca "Powered by"
- Acesso a todas as personas
- Analytics avançado

---

## 📊 Analytics e Métricas

**QR Scans Tracking:**
- Rastreamento automático de escaneamentos
- Dados capturados:
  - Data e hora
  - Tipo de dispositivo (mobile/tablet/desktop)
  - Sistema operacional
  - Navegador
  - Localização (cidade, região, país)

**Prompt Feedback:**
- Histórico de testes de prompts
- Taxa de utilidade (👍/👎)
- Análise de personas mais efetivas

---

## 🚀 Primeiros Passos

### 1. Configuração Inicial
1. Faça login ou solicite acesso via waitlist
2. Complete o Setup Wizard
3. Configure sua empresa

### 2. Crie seu Primeiro QR Code
1. Acesse **QR d'água**
2. Escolha o tipo (LINK, BRIDGE ou CARD)
3. Preencha os dados
4. Veja o preview em tempo real
5. Salve e baixe o QR Code

### 3. Otimize seu Primeiro Prompt
1. Acesse **Prompt Lab**
2. Selecione uma persona
3. Digite sua ideia
4. Clique em "Otimizar"
5. Teste e salve o resultado

### 4. Gerencie Negócios
1. Acesse **Boards**
2. Crie um novo negócio
3. Arraste entre colunas
4. Use agentes de IA para qualificação

---

## 💡 Dicas e Boas Práticas

### QR Codes
- Use cores com bom contraste (mínimo 4.5:1)
- Teste o QR em diferentes dispositivos
- Mantenha URLs curtas e memoráveis
- Para CARD, organize links por prioridade

### Prompt Lab
- Seja específico na ideia bruta
- Mencione contexto e restrições
- Indique formato de saída desejado
- Teste o prompt antes de usar em produção
- Salve prompts bem-sucedidos para reutilização

### CRM
- Atualize negócios regularmente
- Use tags para organização
- Aproveite os agentes de IA para qualificação
- Mantenha histórico de interações

---

## � Catálogo - Gestão de Produtos e Serviços

Gerencie o catálogo de produtos e serviços da sua loja diretamente no Admin Panel.

**Acesso:** Menu Admin → Aba "Catálogo"

### Criando um Novo Produto

1. Acesse **Admin Panel** (disponível apenas para admin)
2. Clique na aba **"Catálogo"**
3. Clique em **"Novo Produto"**
4. Preencha o formulário:
   - **Nome:** Nome do produto/serviço (ex: "Consultoria em IA")
   - **Preço (R$):** Valor em reais (ex: 5000.00)
   - **Unidade:** Unidade de medida (ex: "un", "h", "mês")
   - **Categoria:** Selecione entre Serviço, Produto ou Assinatura
   - **Descrição:** Campo de texto livre para:
     - Features do produto
     - Links de pagamento (Asaas, Pix, etc.)
     - Informações adicionais
   - **Produto Ativo:** Marque para deixar o produto visível
5. Clique em **"Salvar"**

### Editando Produtos

1. Na lista de produtos, clique no ícone **✏️ Editar**
2. Modifique os campos desejados
3. Clique em **"Salvar"**

### Deletando Produtos

1. Clique no ícone **🗑️ Deletar**
2. Confirme a exclusão

### Integração com Kanban

**Importante:** Os produtos criados no Catálogo ficam automaticamente disponíveis no Kanban Board para adicionar aos negócios!

**Fluxo:**
1. Crie produtos no Catálogo
2. Ao editar um negócio no Kanban, os produtos aparecem na aba "Produtos"
3. Adicione produtos ao negócio com quantidade
4. O valor total é calculado automaticamente

💡 **Dica:** Use o campo "Descrição" para colar links de pagamento (Asaas/Pix) e manter tudo organizado em um só lugar!

---

## 🛡️ Super Admin - Atribuir QR Code a Cliente

**Pré-requisito:** Você precisa ter role `super_admin` para esta funcionalidade.

### Caso de Uso: Artesã sem Conhecimento Técnico

Imagine que você tem uma cliente artesã que não sabe criar QR Codes. Como Super Admin, você pode criar o QR Code para ela e atribuir à conta dela.

#### Passo a Passo:

1. **Crie o QR Code Normalmente**
   - Acesse `/qrdagua`
   - Preencha todos os dados como se fosse para você
   - Escolha cores, logo, textos, etc.
   - **NÃO salve ainda!**

2. **Atribua ao Cliente (Via Supabase - Temporário)**
   - Após salvar o QR Code, acesse o Supabase Dashboard
   - Vá em `Table Editor` → `qr_codes`
   - Encontre o QR Code recém-criado
   - Edite a coluna `owner_id`
   - Cole o UUID do usuário cliente (encontre em `profiles`)
   - Salve

3. **Cliente Vê o QR Code**
   - Cliente faz login na conta dela
   - Acessa `/qrdagua`
   - QR Code aparece automaticamente na galeria dela
   - Ela pode baixar, editar e compartilhar

#### 💡 Nota Futura:
Em breve teremos um botão "Atribuir a Cliente" diretamente na interface do Admin Panel, eliminando a necessidade de acessar o Supabase manualmente.

---

## 🤖 Agentes de IA - Quem é Quem?

O Hub conta com múltiplos agentes de IA, cada um com função específica:

### Amazô (Fuchsia/Purple) 💜
- **Onde:** Landing Page pública (`/`)
- **Função:** Customer Success & Vendas
- **Ajuda com:**
  - Qualificação de leads
  - Informações sobre planos
  - Dúvidas pré-venda
  - Direcionamento para WhatsApp
- **Visual:** Botão fuchsia no canto inferior direito
- **Tecnologia:** Typebot integrado

### Aiflow (Blue/Tech) 💙
- **Onde:** Login (`/login`) + Hub protegido (todas as rotas internas)
- **Função:** Suporte Técnico
- **Ajuda com:**
  - "Esqueci minha senha"
  - "Não recebi o email de confirmação"
  - "Erro ao fazer login"
  - Problemas de navegação
  - Suporte direto via WhatsApp
- **Visual:** Botão azul no canto inferior esquerdo
- **Tecnologia:** Componente React nativo

### Diferença Prática:

| Aspecto | Amazô | Aiflow |
|---------|-------|--------|
| **Público** | Visitantes (não logados) | Usuários (logados ou tentando logar) |
| **Foco** | Vendas e conversão | Suporte e troubleshooting |
| **Cor** | Fuchsia (#4a044e) | Blue (#2563eb) |
| **Posição** | Bottom-right | Bottom-left |
| **Tom** | Comercial, persuasivo | Técnico, solucionador |

💡 **Dica:** Se você está na Landing Page e precisa de ajuda técnica, faça login primeiro para acessar o Aiflow!

---

## 🤖 Amazo IA - Assistente 24/7

O Amazo está sempre disponível no canto inferior direito da tela.

**Como usar:**
1. Clique no ícone roxo flutuante
2. Digite sua dúvida ou pedido
3. Amazo responde instantaneamente

**O que Amazo pode fazer:**
- Tirar dúvidas sobre o Hub
- Ajudar com prompts
- Explicar funcionalidades
- Suporte técnico básico

---

## 💳 Planos e Pagamento

### Planos Disponíveis

#### 🆓 Free (Grátis)
- CRM básico
- QR Codes básicos (até 3)
- Prompt Lab público
- Suporte via comunidade

#### ⭐ Pro Mensal (R$ 3/mês)
- Prompt Lab completo
- Templates de especialistas
- Suporte prioritário
- Atualizações contínuas

#### 🚀 Visionário Anual (R$ 30/ano)
- Tudo do Pro Mensal
- **Pague 10, Leve 12 meses**
- 3 QR Codes Dinâmicos Pro
- Prompt Lab ilimitado
- Acesso antecipado a features
- Badge de Early Adopter

### Como Assinar

1. Clique em **"Upgrade to Pro"** ou **"Assinar"**
2. Escolha seu plano (Mensal ou Anual)
3. Clique em **"Assinar Agora"**
4. Complete o pagamento
5. **Aguarde até 24h** para ativação manual

⚠️ **Importante:** Após o pagamento, sua conta será ativada manualmente pela administração em até 24 horas úteis.

---

## 💡 Dicas e Boas Práticas

### QR Codes
- Use cores com bom contraste (mínimo 4.5:1)
- Teste o QR em diferentes dispositivos
- Mantenha URLs curtas e memoráveis
- Para CARD, organize links por prioridade

### Prompt Lab
- Seja específico na ideia bruta
- Mencione contexto e restrições
- Indique formato de saída desejado
- Teste o prompt antes de usar em produção
- Salve prompts bem-sucedidos para reutilização

### Catálogo de Produtos
- Use nomes descritivos e claros
- Mantenha preços atualizados
- Cole links de pagamento na descrição
- Desative produtos temporariamente ao invés de deletar

---

## �🆘 Suporte

**Precisa de Ajuda?**
- Use o chat com IA (canto inferior direito)
- Consulte este guia
- Entre em contato via WhatsApp

**Atualizações:**
- Novas features são anunciadas no dashboard
- Verifique o DEVLOG para histórico de mudanças

---

## 🔄 Atualizações Recentes

### v1.4 - Store Management (Dezembro 2024)
- ✅ Catálogo de Produtos e Serviços no Admin Panel
- ✅ CRUD completo para produtos (criar, editar, deletar)
- ✅ Integração automática com Kanban Board
- ✅ Campo de descrição para links de pagamento
- ✅ Interface mobile-first

### v1.3 - Growth & Feedback (Dezembro 2024)
- ✅ Landing Page Invite-Only com parallax
- ✅ Prompt Lab público como lead magnet
- ✅ Ciclo de feedback (teste + avaliação)
- ✅ Editor visual de múltiplos links (Card Digital)
- ✅ Waitlist com tracking de indicações

### v1.2 - Visual & Security (Dezembro 2024)
- ✅ Validação de contraste WCAG
- ✅ Prompt Lab com save/load
- ✅ Analytics de QR scans
- ✅ Free/Pro tier logic

---

**Encontro D'água - Hub Digital**  
*Conexões que fluem. IA que potencializa pessoas.*
