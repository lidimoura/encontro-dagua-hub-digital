# 🧪 QA Checklist - Protocolo de Testes

## Objetivo
Este documento define o protocolo obrigatório de testes para todas as entregas do projeto.

---

## 📋 Template de Testes

**TODA entrega DEVE incluir uma seção "COMO TESTAR" com passos específicos.**

### Formato Padrão:

```markdown
## ✅ COMO TESTAR

### Pré-requisitos
- [ ] Servidor dev rodando (`npm run dev`)
- [ ] Usuário logado (se necessário)
- [ ] Banco de dados atualizado

### Passos de Teste

1. **[Nome da Feature]**
   - Vá para a rota: `/caminho`
   - Verifique se: [elemento X] aparece
   - Clique em: [botão Y]
   - Resultado esperado: [comportamento Z]

2. **[Próxima Feature]**
   - ...

### Critérios de Sucesso
- [ ] Todos os elementos visuais aparecem
- [ ] Todas as interações funcionam
- [ ] Sem erros no console
- [ ] Responsivo em mobile
```

---

## 🔍 Checklist Atual - Sprint V7

### 1. Admin Panel Access

**COMO TESTAR:**

1. **Login como Admin:**
   - Vá para: `/#/login`
   - Faça login com: `lidimfc@gmail.com`
   - Navegue para: `/#/admin`

2. **Verificar Debugger:**
   - Verifique se aparece o box amarelo com:
     - "🔍 DEBUG: Logado como: [seu-email]"
     - "Admin esperado: lidimfc@gmail.com"
   
3. **Resultado Esperado:**
   - ✅ Se emails coincidem: Painel admin carrega normalmente
   - ❌ Se emails diferentes: Redireciona para `/dashboard`
   - 🔍 Box de debug sempre visível para diagnóstico

**Critérios de Sucesso:**
- [ ] Debug box aparece
- [ ] Email do usuário é exibido corretamente
- [ ] Redirecionamento funciona se não for admin

---

### 2. Prompt Lab - Novos Especialistas

**COMO TESTAR:**

1. **Acessar Prompt Lab:**
   - Vá para: `/#/prompt-lab`
   
2. **Verificar Dropdown:**
   - Clique no dropdown "Área de Atuação"
   - Verifique se aparecem os 9 especialistas:
     - 👨‍💻 Engenheiro de Software
     - 📊 Product Manager
     - 📈 Cientista de Dados
     - 🎨 Designer
     - 📈 Profissional de Marketing
     - 👩‍🏫 Professor
     - 🤖 **Arquiteto de Bots** (NOVO)
     - 🧠 **Treinador de LLM** (NOVO)
     - 🌐 **Arquiteto Web** (NOVO)

3. **Testar Especialista:**
   - Selecione: "🤖 Arquiteto de Bots"
   - Digite ideia: "criar bot de vendas"
   - Clique: "Otimizar Prompt"
   - Resultado esperado: Prompt estruturado para bot

**Critérios de Sucesso:**
- [ ] 9 especialistas aparecem no dropdown
- [ ] Novos especialistas têm ícones corretos
- [ ] Otimização funciona para cada especialista

---

### 3. Subscription Modal

**COMO TESTAR:**

1. **Abrir Modal:**
   - (Adicionar botão "Upgrade" no Dashboard)
   - Clique em: "Upgrade to Pro"

2. **Verificar Planos:**
   - Plano Mensal: R$ 3,00/mês
   - Plano Anual: R$ 30,00/ano
   - Badge "RECOMENDADO" no anual

3. **Testar Pagamento:**
   - Clique: "Assinar Agora"
   - Resultado: Nova aba abre com link de pagamento
   - Aviso: "Ativação Manual: Após o pagamento..."

**Critérios de Sucesso:**
- [ ] Modal abre corretamente
- [ ] Preços estão corretos
- [ ] Link abre em nova aba
- [ ] Aviso de ativação manual aparece

---

### 4. QR Code Analytics (SQL Migration)

**COMO TESTAR:**

1. **Executar Migration:**
   - Abra Supabase SQL Editor
   - Execute: `supabase/migrations/008_add_qr_scans.sql`
   - Verifique: Coluna `scans` criada

2. **Verificar Estrutura:**
   ```sql
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'qr_codes' AND column_name = 'scans';
   ```

3. **Resultado Esperado:**
   - Coluna `scans` tipo INTEGER
   - Default: 0
   - Index criado: `idx_qr_codes_scans`

**Critérios de Sucesso:**
- [ ] Migration executa sem erros
- [ ] Coluna `scans` existe
- [ ] Default value é 0
- [ ] Index criado

---

### 5. User Guide Documentation

**COMO TESTAR:**

1. **Abrir Arquivo:**
   - Navegue para: `USERGUIDE.md`

2. **Verificar Seções:**
   - [ ] QR D'água - Gerenciamento
   - [ ] Prompt Lab - 9 Especialistas
   - [ ] Detalhes dos 3 novos especialistas
   - [ ] Planos e Pagamento
   - [ ] Amazo IA
   - [ ] Suporte

3. **Validar Conteúdo:**
   - Exemplos de uso dos especialistas
   - Instruções de pagamento
   - Links para ferramentas (CodePen, etc)

**Critérios de Sucesso:**
- [ ] Todas as seções presentes
- [ ] Exemplos claros e práticos
- [ ] Links funcionais
- [ ] Formatação correta

---

### 6. Landing Page Reorganization & Diagnostic Form [DONE]

**COMO TESTAR:**

1. **Verificar Nova Estrutura da Landing Page:**
   - Vá para: `/#/`
   - Verifique ordem das seções:
     - [ ] HERO (topo com parallax)
     - [ ] SOLUÇÕES (Prompt Lab → QR D'água → Amazô IA → CRM)
     - [ ] SOBRE NÓS (Manifesto Social → Manifesto → Team)

2. **Testar Prompt Lab Público:**
   - Role até seção "Prompt Lab" (badge roxo "Prova D'água")
   - Digite: "criar legenda para produto"
   - Clique: "✨ Otimizar"
   - [ ] Resultado estruturado aparece
   - [ ] Botão "Copiar" funciona
   - [ ] Botão "🧪 Testar Prompt" funciona
   - [ ] Resposta da IA aparece em card azul

3. **Testar Formulário de Diagnóstico:**
   - Clique: "Quero ser cliente" (header ou CTAs)
   - Preencha dados básicos
   - [ ] Dropdown "O que você precisa?" tem 7 opções
   - [ ] Opções corretas: Mentoria, Agentes IA, CRM, Automações, QR Code, Prompt Lab, Diagnóstico
   - Envie formulário
   - [ ] Toast de sucesso aparece (z-index correto, visível)
   - [ ] Tela de sucesso com botão verde "💬 Quero uma consultoria free"
   - [ ] Botão abre WhatsApp com mensagem pré-formatada

4. **Verificar Integração CRM:**
   - Login como admin
   - Acesse: `/#/boards` ou `/#/contacts`
   - [ ] Lead aparece na coluna "LEAD"
   - [ ] Campo "Notas" inclui intenção/diagnóstico selecionado
   - [ ] Source: "WEBSITE"

**Critérios de Sucesso:**
- [x] Landing Page reorganizada na ordem correta
- [x] Prompt Lab público funcional com API Gemini
- [x] Formulário com 7 opções de diagnóstico
- [x] Toast visível acima do modal (z-index 99999)
- [x] WhatsApp CTA pós-envio funcional
- [ ] Lead aparece automaticamente no CRM (TESTAR EM PRODUÇÃO)

---

## 🚨 Checklist Pendente - Próxima Fase

### 6. Botão "Falar com Amazô" (CRÍTICO)

**COMO TESTAR:**
- [ ] TODO: Implementar botão na Navbar
- [ ] TODO: Verificar se abre chat Typebot
- [ ] TODO: Testar em mobile e desktop

### 7. QR Code Sharing Buttons (CRÍTICO)

**COMO TESTAR:**
- [ ] TODO: Botão "Download PNG"
- [ ] TODO: Botão "Copiar Link"
- [ ] TODO: Botão "Preview/Tela Cheia"

---

## 📝 Notas Importantes

1. **Sempre limpar cache** antes de testar mudanças visuais
2. **Testar em modo incógnito** para evitar cache
3. **Verificar console** para erros JavaScript
4. **Testar em mobile** (responsividade)
5. **Documentar bugs** encontrados com screenshots

---

**Última Atualização:** 2025-12-26 (Hotfixes de Produção)  
**Responsável:** Equipe de Desenvolvimento
