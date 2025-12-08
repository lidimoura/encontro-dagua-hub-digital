# DEVLOG - CRM Encontro d'água hub

Este arquivo registra todas as mudanças significativas no projeto, organizadas por data e categoria.

---

## [02/12/2025] - Mobile UX

- **Implementado botão Hambúrguer**: Adicionado menu mobile responsivo no Layout.tsx
- **Estado isMobileMenuOpen**: Gerenciamento de estado para controle do menu mobile

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
