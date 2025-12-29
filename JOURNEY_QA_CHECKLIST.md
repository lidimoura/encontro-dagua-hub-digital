# Journey QA Checklist - Encontro D'água Hub

**Objetivo:** Validar a separação dos agentes de IA e o fluxo completo do usuário, desde visitante até cliente ativo.

**Data:** 29/12/2024  
**Versão:** 1.0 - Agent Separation Release

---

## 🎯 Cenários de Teste

### Cenário 1: Visitante na Landing Page (Amazô)

**Objetivo:** Validar que Amazô aparece APENAS na Landing Page e funciona corretamente.

#### Passos:

1. **Acesse a Landing Page**
   - [ ] Abra o navegador em modo anônimo
   - [ ] Navegue para `https://[dominio]/` ou `https://[dominio]/#/`
   - [ ] Aguarde o carregamento completo da página

2. **Verifique a Presença do Amazô**
   - [ ] Botão fuchsia/roxo aparece no canto inferior direito
   - [ ] Ícone do Amazô está visível
   - [ ] Botão tem efeito hover (scale/glow)

3. **Interaja com Amazô**
   - [ ] Clique no botão do Amazô
   - [ ] Typebot abre em bubble/overlay
   - [ ] Chat está funcional (consegue digitar e enviar mensagens)
   - [ ] Amazô responde adequadamente

4. **Verifique Ausência de Aiflow**
   - [ ] NÃO há botão azul no canto inferior esquerdo
   - [ ] Apenas Amazô está presente

#### ✅ Critérios de Sucesso:
- Amazô aparece e funciona perfeitamente
- Aiflow NÃO aparece na Landing Page
- Typebot carrega com URL correta: `template-chatbot-amazo-landigpage`

---

### Cenário 2: Usuário no Login (Aiflow)

**Objetivo:** Validar que Aiflow aparece na tela de Login e Amazô NÃO aparece.

#### Passos:

1. **Acesse a Página de Login**
   - [ ] Navegue para `https://[dominio]/#/login`
   - [ ] Aguarde o carregamento completo

2. **Verifique a Presença do Aiflow**
   - [ ] Botão azul aparece no canto inferior esquerdo
   - [ ] Ícone de HelpCircle está visível
   - [ ] Botão tem efeito hover

3. **Interaja com Aiflow**
   - [ ] Clique no botão do Aiflow
   - [ ] Modal/painel de ajuda abre
   - [ ] 4 tópicos de ajuda estão visíveis:
     - [ ] "Esqueci minha senha"
     - [ ] "Não recebi o email"
     - [ ] "Erro de acesso"
     - [ ] "Suporte direto"

4. **Teste Funcionalidades do Aiflow**
   - [ ] Clique em "Esqueci minha senha" → Alert com dica aparece
   - [ ] Clique em "Não recebi o email" → Alert com dica aparece
   - [ ] Clique em "Erro de acesso" → Alert com dica aparece
   - [ ] Clique em "Suporte direto" → WhatsApp abre em nova aba

5. **Verifique Ausência de Amazô**
   - [ ] NÃO há botão fuchsia no canto inferior direito
   - [ ] Apenas Aiflow está presente

#### ✅ Critérios de Sucesso:
- Aiflow aparece e funciona perfeitamente
- Amazô NÃO aparece na página de Login
- Todas as 4 opções de ajuda funcionam

---

### Cenário 3: Usuário Logado no Hub (Aiflow)

**Objetivo:** Validar que Aiflow aparece em todas as rotas protegidas do Hub.

#### Passos:

1. **Faça Login**
   - [ ] Acesse `/login`
   - [ ] Faça login com credenciais válidas
   - [ ] Aguarde redirecionamento para `/dashboard`

2. **Verifique Aiflow no Dashboard**
   - [ ] Botão azul do Aiflow está presente (bottom-left)
   - [ ] Clique e verifique que modal abre corretamente

3. **Navegue por Rotas Protegidas**
   - [ ] Acesse `/qrdagua` → Aiflow presente
   - [ ] Acesse `/prompt-lab` → Aiflow presente
   - [ ] Acesse `/boards` → Aiflow presente
   - [ ] Acesse `/contacts` → Aiflow presente
   - [ ] Acesse `/admin` (se admin) → Aiflow presente

4. **Verifique Ausência de Amazô**
   - [ ] Em NENHUMA rota protegida há botão fuchsia do Amazô
   - [ ] Apenas Aiflow está presente

#### ✅ Critérios de Sucesso:
- Aiflow presente em TODAS as rotas protegidas
- Amazô NÃO aparece em nenhuma rota protegida
- Aiflow funciona consistentemente em todas as páginas

---

### Cenário 4: Super Admin - Atribuir QR Code a Cliente (Caso Artesã)

**Objetivo:** Validar que Super Admin pode criar QR Code e atribuir a outro usuário.

#### Pré-requisitos:
- [ ] Ter conta Super Admin (`role = 'super_admin'`)
- [ ] Ter conta de cliente teste criada

#### Passos:

1. **Admin Cria QR Code**
   - [ ] Login como Super Admin
   - [ ] Acesse `/qrdagua`
   - [ ] Crie um novo QR Code (tipo CARD)
   - [ ] Preencha: nome "Artesã Teste", bio, links, cores
   - [ ] Salve o QR Code
   - [ ] Anote o `id` do QR Code criado

2. **Admin Atribui QR Code ao Cliente**
   - [ ] Acesse Supabase Dashboard
   - [ ] Vá em `Table Editor` → `qr_codes`
   - [ ] Encontre o QR Code pelo `id` anotado
   - [ ] Copie o `id` (UUID) do usuário cliente da tabela `profiles`
   - [ ] Edite a coluna `owner_id` do QR Code
   - [ ] Cole o UUID do cliente
   - [ ] Salve

3. **Cliente Vê o QR Code**
   - [ ] Faça logout da conta Admin
   - [ ] Faça login com a conta do cliente
   - [ ] Acesse `/qrdagua`
   - [ ] QR Code "Artesã Teste" aparece na galeria do cliente
   - [ ] Cliente consegue baixar o QR Code
   - [ ] Cliente consegue editar o QR Code (se necessário)

4. **Verifique Analytics Zerado**
   - [ ] No card do QR Code, verifique que `scan_count` está em 0
   - [ ] Escaneie o QR Code com celular
   - [ ] Recarregue a página `/qrdagua`
   - [ ] Verifique que `scan_count` incrementou para 1

#### ✅ Critérios de Sucesso:
- QR Code criado pelo Admin aparece na conta do cliente
- Cliente tem acesso total ao QR Code
- Analytics funciona corretamente (contador de scans)
- `owner_id` permite acesso via RLS policies

---

## 🎨 Validação Visual

### Cores e Temas

- [ ] **Amazô (Landing Page):**
  - Cor: Fuchsia/Purple (#4a044e)
  - Posição: Bottom-right
  - Ícone: Typebot custom icon

- [ ] **Aiflow (Login/Hub):**
  - Cor: Blue (#2563eb)
  - Posição: Bottom-left
  - Ícone: HelpCircle (Lucide)

- [ ] **Contraste:**
  - Ambos os botões têm contraste adequado com background
  - Hover effects são visíveis e suaves
  - Animações não causam lag

---

## 📱 Responsividade

### Mobile (< 768px)

- [ ] Amazô na Landing Page não sobrepõe conteúdo
- [ ] Aiflow no Login/Hub não sobrepõe formulários
- [ ] Modais/painéis se ajustam à largura da tela
- [ ] Botões são facilmente clicáveis (min 44x44px)

### Desktop (>= 768px)

- [ ] Botões flutuantes não interferem com sidebar
- [ ] Modais centralizados ou bem posicionados
- [ ] Setas de navegação (galeria) não conflitam com agentes

---

## 🔒 Segurança e Privacidade

- [ ] Amazô não tem acesso a dados de usuários logados
- [ ] Aiflow não expõe informações sensíveis em alerts
- [ ] RLS policies impedem acesso não autorizado a QR Codes
- [ ] `owner_id` permite acesso apenas ao owner e admins

---

## 📊 Métricas de Sucesso

### Quantitativas:
- [ ] 100% das rotas com agente correto (Amazô OU Aiflow, nunca ambos)
- [ ] 0 erros de console relacionados a Typebot ou Aiflow
- [ ] Tempo de carregamento do Typebot < 2s
- [ ] Modal do Aiflow abre em < 300ms

### Qualitativas:
- [ ] Usuários entendem a diferença entre Amazô e Aiflow
- [ ] Fluxo de "Esqueci senha" é intuitivo via Aiflow
- [ ] Admin consegue atribuir QR Code sem dificuldade
- [ ] Cliente recebe QR Code pronto sem confusão

---

## 🐛 Bugs Conhecidos / Limitações

1. **Atribuição de QR Code:**
   - Atualmente requer acesso manual ao Supabase
   - Futura feature: Botão "Atribuir a Cliente" no Admin Panel

2. **Typebot Delay:**
   - Pode levar 1-2s para carregar em conexões lentas
   - Não há loading state visível

3. **Aiflow Offline:**
   - Se usuário estiver offline, Aiflow não funciona
   - Não há fallback para modo offline

---

## ✅ Checklist Final

Antes de considerar o release aprovado:

- [ ] Todos os cenários de teste passaram
- [ ] Validação visual aprovada
- [ ] Responsividade testada em mobile e desktop
- [ ] Segurança e privacidade validadas
- [ ] Métricas de sucesso atingidas
- [ ] Documentação atualizada (DEVLOG, README, USER_GUIDE)
- [ ] Commit final com mensagem descritiva
- [ ] Deploy em produção
- [ ] Teste end-to-end em produção

---

**Testado por:** _____________  
**Data:** ___/___/______  
**Versão:** 1.0  
**Status:** [ ] Aprovado [ ] Reprovado [ ] Pendente

---

*Encontro D'água Hub - Tecnologia que flui, IA que potencializa pessoas.*
