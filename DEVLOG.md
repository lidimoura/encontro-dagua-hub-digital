# DEVLOG - CRM Encontro d'água hub

Este arquivo registra todas as mudanças significativas no projeto, organizadas por data e categoria.

---

## [10/12/2025] - v1.0 - Lançamento Módulo Concierge QR

### 🎯 Feature: QR d'água - Construtor de Microsites

Transformação completa do gerador de QR Codes em um construtor visual de microsites com IA integrada.

#### 🚀 Principais Features:

- **QR Code Pro**: 
  - Logo personalizado no centro do QR Code
  - Texto customizável acima do QR (ex: "Escaneie e ganhe 10% de desconto")
  - Texto customizável abaixo do QR (ex: "Válido até 31/12/2025")
  - Cores totalmente personalizáveis

- **Site Builder - Modo Bridge (Página Ponte)**:
  - Logo/imagem circular no topo
  - Título da página gerado por IA
  - Descrição vendedora
  - Botão call-to-action customizável
  - Preview em tempo real no PhoneMockup

- **Site Builder - Modo Card Digital**:
  - Foto de perfil profissional
  - Nome e bio do cliente
  - Links para website e WhatsApp
  - Design responsivo tipo "link in bio"

- **IA Co-piloto (Gemini 2.5 Flash Lite)**:
  - Geração automática de títulos impactantes (5-7 palavras)
  - Geração de copy vendedor para bio/descrição (2-3 frases)
  - Fallback automático para Gemini 1.5 Flash
  - Botões "✨ Gerar com IA" integrados ao formulário

- **Segurança - Controle de Acesso Admin**:
  - Role-based access control usando `profile.role` do Supabase
  - Modos BRIDGE e CARD exclusivos para admin
  - Usuários regulares limitados ao modo LINK
  - Visual feedback com ícone 🔒 para features bloqueadas

- **Infraestrutura**:
  - CRUD completo direto no Supabase (Create, Read, Update, Delete)
  - Remoção da dependência N8N para storage de QR Codes
  - Novos campos no schema: `qr_logo_url`, `qr_text_top`, `qr_text_bottom`
  - Crash protection total com optional chaining e error handlers

- **UX/UI**:
  - PhoneMockup realista (280x560px) com notch e status bar
  - Preview em tempo real - atualiza ao digitar
  - Estados de loading em todas as operações assíncronas
  - Suporte completo a dark mode
  - Design responsivo mobile-first

#### 📦 Arquivos Modificados:
- `src/features/qrdagua/QRdaguaPage.tsx` - Componente principal completamente refatorado
- Schema Supabase - Adicionadas colunas para QR Pro features

#### 🔧 Tecnologias:
- React 19 + TypeScript
- Google Gemini AI (2.5 Flash Lite)
- Supabase (Database & Auth)
- react-qr-code (QR rendering)
- Tailwind CSS

---

## [09/12/2025] - Mobile UX (IMPLEMENTADO)

- **✅ Menu Mobile Drawer Completo**: Implementado drawer mobile com animações suaves
- **Botão Hambúrguer**: Visível apenas em mobile (`md:hidden`), abre o menu lateral
- **Backdrop com Overlay**: Fundo escuro semi-transparente, fecha ao clicar fora
- **Auto-close**: Menu fecha automaticamente ao navegar entre páginas
- **Prevenção de Scroll**: Body scroll bloqueado quando menu está aberto
- **Navegação Completa**: Todos os itens do menu desktop disponíveis no mobile
- **User Card**: Perfil do usuário e opções de logout no rodapé do drawer
- **Acessibilidade**: `aria-label` nos botões, animações com `animate-in`

## [02/12/2025] - Mobile UX (PLANEJADO - NÃO IMPLEMENTADO)

- **~~Implementado botão Hambúrguer~~**: ❌ Entrada incorreta no DEVLOG
- **~~Estado isMobileMenuOpen~~**: ❌ Não estava implementado até 09/12/2025


## [02/12/2024] - Bug Fix / IA

- **Corrigido bug de parsing JSON**: Resolvido problema de interpretação de JSON no componente AIAssistant.tsx
- **Melhorias na estabilidade**: Chat IA agora processa respostas de forma mais confiável

## [02/12/2025] - UX / Componentes

- **Criado NotificationsPopover.tsx**: Novo componente para exibição de notificações em popover
- **Melhorias na experiência do usuário**: Interface mais intuitiva para acompanhamento de notificações

## [02/12/2025] - Branding

- **Atualização de marca**: Projeto renomeado para "Encontro D'Água Hub"
- **Identidade visual**: Ajustes de branding em toda a aplicação

## [04/12/2025] - DevOps / Infraestrutura

- **Criado DEVLOG.md**: Arquivo de registro de mudanças do projeto
- **Integração N8N**: Implementado serviço de webhooks para automações externas
- **n8nService.ts**: Função genérica `sendToN8nWebhook` para integração com workflows N8N
- **Funções preparadas**: `calculatePricing` e `consultLegalAgent` para futuras integrações
- **Tipos TypeScript**: Criado `vite-env.d.ts` com definições de ambiente
- **Variáveis de ambiente**: Atualizado `.env.example` com URLs dos webhooks N8N

---

## Formato de Entrada

```markdown
## [DD/MM/AAAA] - [Categoria]
- **Título da mudança**: Descrição detalhada
```

### Categorias Sugeridas:
- Feature (Nova funcionalidade)
- Bug Fix (Correção de bugs)
- UX (Melhorias de experiência do usuário)
- Performance (Otimizações)
- Refactor (Refatoração de código)
- DevOps (Infraestrutura e deploy)
- Documentation (Documentação)
- Security (Segurança)
- Mobile (Mobile específico)
- IA (Inteligência Artificial)
- Branding (Marca e identidade visual)
