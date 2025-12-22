import { BoardStage, AgentPersona, BoardGoal } from './types';

export type BoardTemplateType = 'PRE_SALES' | 'SALES' | 'ONBOARDING' | 'CS' | 'YARA' | 'JURIDICO' | 'PRECIFICACAO' | 'CUSTOM';

// Template vazio para boards customizados (não usa template)
export const CUSTOM_TEMPLATE: BoardTemplate = {
  name: 'Personalizado',
  description: 'Board personalizado sem template',
  emoji: '⚙️',
  stages: [],
  tags: [],
};

export interface BoardTemplate {
  name: string;
  description: string;
  emoji: string;
  linkedLifecycleStage?: string;
  stages: Omit<BoardStage, 'id'>[];
  tags: string[];
  // Strategy Fields
  agentPersona?: AgentPersona;
  goal?: BoardGoal;
  entryTrigger?: string;
}

export const BOARD_TEMPLATES: Record<BoardTemplateType, BoardTemplate> = {
  PRE_SALES: {
    name: 'Pré-venda',
    description: 'Qualificação de leads até tornarem-se MQL',
    emoji: '🎯',
    linkedLifecycleStage: 'LEAD',
    tags: ['SDR', 'Qualificação', 'Outbound'],
    stages: [
      { label: 'Novos Leads', color: 'bg-blue-500', linkedLifecycleStage: 'LEAD' },
      { label: 'Contatado', color: 'bg-yellow-500', linkedLifecycleStage: 'LEAD' },
      { label: 'Qualificando', color: 'bg-purple-500', linkedLifecycleStage: 'LEAD' },
      { label: 'Qualificado (MQL)', color: 'bg-green-500', linkedLifecycleStage: 'MQL' },
    ],
    agentPersona: {
      name: 'SDR Bot',
      role: 'Pré-vendas e Qualificação',
      behavior:
        'Seja rápido e objetivo. Seu foco é qualificar o lead fazendo perguntas chave sobre orçamento, autoridade, necessidade e tempo (BANT). Se o lead for qualificado, mova para MQL.',
    },
    goal: {
      description: 'Qualificar leads frios e identificar oportunidades reais.',
      kpi: 'Leads Qualificados (MQL)',
      targetValue: '50',
      type: 'number',
    },
    entryTrigger: 'Novos leads capturados via formulário do site ou LinkedIn.',
  },

  SALES: {
    name: 'Pipeline de Vendas',
    description: 'MQL até fechamento ou perda',
    emoji: '💰',
    linkedLifecycleStage: 'MQL',
    tags: ['Vendas', 'CRM', 'Fechamento'],
    stages: [
      { label: 'Descoberta', color: 'bg-blue-500', linkedLifecycleStage: 'MQL' },
      { label: 'Proposta', color: 'bg-purple-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Negociação', color: 'bg-orange-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Ganho', color: 'bg-green-500', linkedLifecycleStage: 'CUSTOMER' },
      { label: 'Perdido', color: 'bg-red-500', linkedLifecycleStage: 'OTHER' },
    ],
    agentPersona: {
      name: 'Closer Bot',
      role: 'Executivo de Vendas',
      behavior:
        'Atue como um consultor experiente. Foque em entender a dor do cliente, apresentar a solução de valor e negociar termos. Use gatilhos mentais de urgência e escassez quando apropriado.',
    },
    goal: {
      description: 'Maximizar a receita recorrente mensal (MRR).',
      kpi: 'Receita Nova (MRR)',
      targetValue: '50000',
      type: 'currency',
    },
    entryTrigger: 'Leads qualificados (MQL) vindos da Pré-venda.',
  },

  ONBOARDING: {
    name: 'Onboarding de Clientes',
    description: 'Ativação e implementação de novos clientes',
    emoji: '🚀',
    linkedLifecycleStage: 'CUSTOMER',
    tags: ['CS', 'Implementação', 'Sucesso'],
    stages: [
      { label: 'Kickoff', color: 'bg-blue-500', linkedLifecycleStage: 'CUSTOMER' },
      { label: 'Implementação', color: 'bg-purple-500', linkedLifecycleStage: 'CUSTOMER' },
      { label: 'Treinamento', color: 'bg-yellow-500', linkedLifecycleStage: 'CUSTOMER' },
      { label: 'Go Live', color: 'bg-green-500', linkedLifecycleStage: 'CUSTOMER' },
    ],
    agentPersona: {
      name: 'CS Manager',
      role: 'Gerente de Sucesso do Cliente',
      behavior:
        'Seja acolhedor e didático. Guie o cliente passo a passo na configuração da ferramenta. Garanta que ele veja valor rápido (First Value).',
    },
    goal: {
      description: 'Garantir que o cliente complete a configuração inicial em até 7 dias.',
      kpi: 'Clientes Ativados',
      targetValue: '20',
      type: 'number',
    },
    entryTrigger: 'Novos clientes com contrato assinado (Ganho em Vendas).',
  },

  CS: {
    name: 'CS & Upsell',
    description: 'Gestão de clientes ativos e oportunidades de expansão',
    emoji: '❤️',
    linkedLifecycleStage: 'CUSTOMER',
    tags: ['Retenção', 'Upsell', 'Relacionamento'],
    stages: [
      { label: 'Saudável', color: 'bg-green-500', linkedLifecycleStage: 'CUSTOMER' },
      { label: 'Oportunidade Upsell', color: 'bg-blue-500', linkedLifecycleStage: 'CUSTOMER' },
      { label: 'Em Risco', color: 'bg-yellow-500', linkedLifecycleStage: 'CUSTOMER' },
      { label: 'Churn', color: 'bg-red-500', linkedLifecycleStage: 'OTHER' },
    ],
    agentPersona: {
      name: 'Account Manager',
      role: 'Gerente de Contas',
      behavior:
        'Monitore a saúde da conta. Identifique oportunidades de expansão (Upsell/Cross-sell) e aja proativamente para evitar cancelamentos (Churn).',
    },
    goal: {
      description: 'Aumentar a receita da base (Expansion MRR) e reduzir Churn.',
      kpi: 'Expansion MRR',
      targetValue: '10000',
      type: 'currency',
    },
    entryTrigger: 'Clientes ativos após o período de Onboarding.',
  },

  YARA: {
    name: 'Diagnóstico Estratégico (Yara)',
    description: 'Análise de reuniões usando Methodology 10K com score de qualificação',
    emoji: '🩺',
    linkedLifecycleStage: 'LEAD',
    tags: ['Diagnóstico', 'Qualificação', 'Methodology 10K'],
    stages: [
      { label: 'Transcrição Recebida', color: 'bg-blue-500', linkedLifecycleStage: 'LEAD' },
      { label: 'Analisando', color: 'bg-purple-500', linkedLifecycleStage: 'LEAD' },
      { label: 'Lead Quente', color: 'bg-green-500', linkedLifecycleStage: 'MQL' },
      { label: 'Lead Frio', color: 'bg-slate-500', linkedLifecycleStage: 'OTHER' },
    ],
    agentPersona: {
      name: 'Yara',
      role: 'Gerente de Diagnóstico e Estratégia',
      behavior: `Você é a Yara. Sua base de conhecimento é o arquivo 'src/lib/knowledge-base/methodologies/thales-10k.md'.
Ao analisar uma transcrição:
1. Identifique os 4 Pilares: Objetivo, Dor, Orçamento (Crítico) e Urgência.
2. Calcule o SCORE (0-100) do lead.
3. Se Score < 50, avise que é um Lead Frio.
4. Ao gerar o escopo, verifique se a solução proposta é acessível tecnicamente para o nível digital do cliente.
5. Gere um JSON com o resumo do diagnóstico.`,
    },
    goal: {
      description: 'Transformar reunião de descoberta em escopo validado com score de qualificação',
      kpi: 'Tempo de Diagnóstico',
      targetValue: '15',
      type: 'number',
    },
    entryTrigger: 'Upload de transcrição de reunião ou notas de descoberta',
  },

  JURIDICO: {
    name: 'Validação Jurídica (Jury)',
    description: 'Revisão de contratos e identificação de riscos legais',
    emoji: '⚖️',
    linkedLifecycleStage: 'PROSPECT',
    tags: ['Jurídico', 'Contratos', 'Compliance'],
    stages: [
      { label: 'Minuta Recebida', color: 'bg-blue-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Revisando', color: 'bg-purple-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Aprovado', color: 'bg-green-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Requer Ajustes', color: 'bg-yellow-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Rejeitado', color: 'bg-red-500', linkedLifecycleStage: 'OTHER' },
    ],
    agentPersona: {
      name: 'Jury',
      role: 'Analista de Compliance e Risco',
      behavior: `Você é o Jury.
Sua função é blindar a empresa.
Analise contratos comparando com o 'src/lib/knowledge-base/templates/contract-template.md'.
Verifique: Cláusula de LGPD, Uso de Imagem e Pagamento (50/50).`,
    },
    goal: {
      description: 'Validar contratos antes do envio ao cliente, garantindo compliance',
      kpi: 'Contratos sem Revisão Jurídica',
      targetValue: '0',
      type: 'percentage',
    },
    entryTrigger: 'Upload de minuta de contrato ou proposta comercial',
  },

  PRECIFICACAO: {
    name: 'Precificação Inteligente (Precy)',
    description: 'Cálculo de ROI, precificação baseada em valor e análise de margem',
    emoji: '💰',
    linkedLifecycleStage: 'PROSPECT',
    tags: ['Precificação', 'ROI', 'Proposta Comercial'],
    stages: [
      { label: 'Escopo Recebido', color: 'bg-blue-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Calculando ROI', color: 'bg-purple-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Proposta Gerada', color: 'bg-green-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Ajuste de Preço', color: 'bg-yellow-500', linkedLifecycleStage: 'PROSPECT' },
    ],
    agentPersona: {
      name: 'Precy',
      role: 'Engenheira de Precificação e ROI',
      behavior: `Você é a Precy (Precificação Inteligente).

ESTRATÉGIA COMERCIAL 2025:

**PRODUTOS VISUAIS** (Cartão Digital / Landing Page):
- Baixo custo (trabalho visual/design)
- Preço sugerido: R$ 49-79/mês
- Foco: Presença digital rápida

**PRODUTOS INTELECTUAIS** (Agente de IA):
- Setup: (Horas x R$ 50) + Margem 35%
- Recorrência: R$ 1.500/mês (Base) ou ajuste conforme complexidade
- Foco: Automação e inteligência

**BUNDLE ESTRATÉGICO**:
"Feche o Agente de IA e ganhe 1 ano de Hub Pro (CRM + QR d'água + Prompt Lab) GRÁTIS!"

**PRECIFICAÇÃO SOCIAL**:
Se o cliente for de grupo prioritário/ONG, aplique desconto de até 60%.
Calcule o preço cheio e o preço social.

Use o template em 'src/lib/knowledge-base/templates/proposal-template.md' para gerar a proposta final com ROI.`,
    },
    goal: {
      description: 'Gerar propostas comerciais com ROI claro e precificação estratégica',
      kpi: 'Taxa de Conversão de Propostas',
      targetValue: '40',
      type: 'percentage',
    },
    entryTrigger: 'Escopo aprovado + dados do cliente (orçamento, dor, urgência)',
  },

  CUSTOM: CUSTOM_TEMPLATE,
};
