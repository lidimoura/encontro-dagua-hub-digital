# TODO - Encontro D'água Hub

## 📋 Pendências para Hoje (02/01/2026)

### 🎯 DEPLOY EM PRODUÇÃO - MONITORAMENTO

#### ✅ CONCLUÍDO HOJE (02/01/2026)

- [x] **MAJOR REFACTOR: Landing Page Reorganization**
  - Reorganizada estrutura: HERO → SOLUÇÕES → SOBRE NÓS
  - Prompt Lab público com API Gemini integrado
  - QR D'água com PhoneSimulator e Gallery
  - Amazô IA e CRM Simulator destacados
  - ~250 linhas de código duplicado removidas

- [x] **ApplicationModal - Correções Críticas**
  - Dropdown de diagnóstico com 7 opções de intenção
  - Título atualizado: "Quero ser cliente"
  - Toast z-index corrigido (z-[99999])
  - WhatsApp CTA pós-envio confirmado funcional
  - Integração CRM confirmada (já funcionava)

- [x] **Documentação Completa**
  - README.md atualizado (Soluções Públicas vs Internas)
  - DEVLOG.md com entrada detalhada do refactor
  - USER_GUIDE.md com 2 novas seções (Diagnóstico + Prompt Lab Público)
  - QA_CHECKLIST.md atualizado
  - JOURNEY_QA_CHECKLIST.md com novo cenário

- [x] **Deploy para Produção**
  - Commit: `5ec4e87` - "feat: major refactor - landing page reorganization & diagnostic form"
  - Push para `main` bem-sucedido
  - Deploy Vercel iniciado automaticamente

#### 🔄 EM MONITORAMENTO

- [ ] **Verificar Deploy Vercel**
  - Aguardar conclusão do build
  - Confirmar deploy sem erros
  - Testar URL de produção

- [ ] **Teste End-to-End em Produção**
  - Enviar formulário de diagnóstico real
  - Verificar se lead aparece no CRM
  - Testar Prompt Lab público
  - Validar todos os CTAs e links

- [ ] **Monitorar Leads no CRM**
  - Verificar se novos leads chegam via formulário
  - Confirmar campo "Notas" com diagnóstico
  - Validar `source: 'WEBSITE'`

---

## 📊 Status do Sistema (Última Verificação: 02/01/2026)

### ✅ Funcionalidades Estáveis
- Landing Page reorganizada (nova arquitetura)
- Prompt Lab público com API Gemini
- Formulário de diagnóstico (7 opções)
- Toast notifications (z-index corrigido)
- Upload de Imagens (Supabase Storage)
- Menu Mobile (Hamburguer em todos os devices)
- Build Vercel (Passando sem erros)
- Sistema de Referral (20% OFF)
- Catálogo de Produtos (Admin Panel)
- QR d'água (Gerador completo)

### ⚠️ Pendências de Teste
- [ ] RLS policies para tabela `contacts` (INSERT para authenticated users)
- [ ] Teste de formulário em produção
- [ ] Validar analytics de leads no CRM

---

## 🔮 Backlog (Próximas Sprints)

### Features
- [ ] Analytics Dashboard para QR Codes
- [ ] Integração WhatsApp Business API
- [ ] Templates de Prompts (Biblioteca)
- [ ] Sistema de Notificações
- [ ] Onboarding/Tour no Dashboard
- [ ] Botão "Atribuir QR Code a Cliente" no Admin Panel

### Melhorias
- [ ] Otimização de performance (Lighthouse)
- [ ] Testes automatizados (Vitest)
- [ ] Documentação de API
- [ ] Internacionalização (i18n)

---

**Última Atualização:** 02/01/2026 13:45
