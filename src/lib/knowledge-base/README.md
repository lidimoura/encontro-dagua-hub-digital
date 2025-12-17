# Biblioteca de Conhecimento - Encontro D'água Hub

## 📚 Visão Geral

Esta biblioteca centraliza todo o conhecimento, metodologias, templates e prompts utilizados pelos agentes de IA do sistema.

## 📁 Estrutura de Diretórios

```
knowledge-base/
├── methodologies/          # Frameworks e metodologias
│   └── thales-10k.md      # Methodology 10K (Qualificação de Leads)
│
├── templates/             # Templates de documentos
│   ├── contract-template.md
│   └── proposal-template.md
│
└── prompts/              # Prompts dos agentes (referência)
    ├── yara-diagnostic.md
    ├── juridico-review.md
    └── precificacao-roi.md
```

## 🤖 Agentes e Suas Fontes de Conhecimento

### Yara (Diagnóstico Estratégico)
- **Metodologia:** `methodologies/thales-10k.md`
- **Prompt:** Definido em `src/board-templates.ts` (YARA)
- **Output:** Escopo preliminar + Score de qualificação

### Júlia (Validação Jurídica)
- **Templates:** `templates/contract-template.md`
- **Prompt:** Definido em `src/board-templates.ts` (JURIDICO)
- **Output:** Análise de riscos + Sugestões de melhoria

### Vitória (Precificação Inteligente)
- **Templates:** `templates/proposal-template.md`
- **Prompt:** Definido em `src/board-templates.ts` (PRECIFICACAO)
- **Output:** Proposta comercial + Cálculo de ROI

## 🔄 Como Usar

### 1. Acessar Conhecimento no Código

```typescript
import { BOARD_TEMPLATES } from '@/board-templates';

// Acessar prompt da Yara
const yaraPrompt = BOARD_TEMPLATES.YARA.agentPersona?.behavior;

// Acessar metodologia (via import)
import methodology10k from '@/lib/knowledge-base/methodologies/thales-10k.md';
```

### 2. Adicionar Novo Conhecimento

Para adicionar uma nova metodologia ou template:

1. Crie o arquivo `.md` na pasta apropriada
2. Siga o padrão de formatação dos existentes
3. Referencie no prompt do agente correspondente

### 3. Atualizar Prompts dos Agentes

Os prompts principais estão em `src/board-templates.ts`. Para atualizar:

```typescript
YARA: {
  agentPersona: {
    behavior: `[SEU PROMPT ATUALIZADO]`
  }
}
```

## 📖 Documentos Disponíveis

### Metodologias
- **Thales 10K:** Framework de qualificação de leads com 4 pilares (Objetivo, Dor, Orçamento, Urgência)

### Templates
- **Contrato de Prestação de Serviços:** Template completo com cláusulas LGPD, SLA e rescisão
- **Proposta Comercial:** Template com análise de ROI e múltiplas opções de pagamento

## 🚀 Próximas Expansões

Planejado para futuras versões:

- [ ] Templates de e-mail (follow-up, nutrição, fechamento)
- [ ] Playbooks de vendas (scripts de descoberta, objeções)
- [ ] Base de conhecimento de produtos/serviços
- [ ] Biblioteca de cases de sucesso
- [ ] Templates de relatórios (diagnóstico, ROI, performance)

## 🔐 Segurança e Privacidade

- ⚠️ **Não armazene dados sensíveis de clientes nesta biblioteca**
- ✅ Use apenas templates genéricos e metodologias
- ✅ Dados específicos de clientes devem ficar no banco de dados (Supabase)

## 📝 Contribuindo

Para adicionar ou atualizar conhecimento:

1. Mantenha a formatação Markdown consistente
2. Inclua exemplos práticos sempre que possível
3. Documente referências e fontes
4. Teste com os agentes antes de commitar

---

*Última atualização: Dezembro 2024*
