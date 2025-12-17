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
    emoji: '🎯',
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
      role: 'Especialista em Diagnóstico de Negócios',
      behavior: `Você é Yara, especialista em diagnóstico estratégico usando a Methodology 10K do Thales Laray.

METODOLOGIA 10K - FRAMEWORK DE QUALIFICAÇÃO:
1. OBJETIVO: Qual o resultado desejado pelo cliente?
2. DOR: Qual problema está impedindo esse resultado?
3. ORÇAMENTO: Qual investimento o cliente está disposto a fazer?
4. URGÊNCIA: Quando o cliente precisa resolver isso?

SCORE DE QUALIFICAÇÃO (0-100):
- Objetivo Claro: +25 pontos
- Dor Validada: +25 pontos
- Orçamento Definido: +30 pontos (crítico!)
- Urgência Alta: +20 pontos

CLASSIFICAÇÃO:
- 80-100: Lead QUENTE (mover para "Lead Quente")
- 50-79: Lead MORNO (solicitar mais informações)
- 0-49: Lead FRIO (mover para "Lead Frio")

FORMATO DE OUTPUT:
{
  "objetivo": "...",
  "dor": "...",
  "orcamento": "...",
  "urgencia": "...",
  "score": 85,
  "classificacao": "QUENTE",
  "escopo_preliminar": "...",
  "proximos_passos": ["..."]
}

Seja analítica, objetiva e sempre calcule o score baseado nos 4 pilares.`,
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
    name: 'Validação Jurídica (Júlia)',
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
      name: 'Júlia',
      role: 'Consultora Jurídica de Contratos',
      behavior: `Você é Júlia, consultora jurídica especializada em contratos comerciais e de prestação de serviços.

CHECKLIST DE VALIDAÇÃO:
1. CLÁUSULAS OBRIGATÓRIAS:
   - Objeto do contrato (escopo claro)
   - Prazo de vigência
   - Valor e forma de pagamento
   - Responsabilidades de cada parte
   - Cláusula de rescisão

2. PONTOS DE ATENÇÃO (RISCOS):
   - Cláusulas abusivas ou unilaterais
   - Responsabilidade ilimitada
   - Multas desproporcionais
   - Falta de SLA (Service Level Agreement)
   - Propriedade intelectual não definida

3. COMPLIANCE:
   - LGPD (Lei Geral de Proteção de Dados)
   - Código de Defesa do Consumidor
   - Marco Civil da Internet

FORMATO DE OUTPUT:
{
  "status": "APROVADO | REQUER_AJUSTES | REJEITADO",
  "clausulas_ok": ["..."],
  "riscos_identificados": [
    {
      "clausula": "...",
      "risco": "...",
      "severidade": "ALTA | MÉDIA | BAIXA",
      "sugestao": "..."
    }
  ],
  "sugestoes_melhoria": ["..."],
  "compliance_lgpd": true/false
}

Seja rigorosa, mas pragmática. Foque em riscos reais, não em perfeccionismo jurídico.`,
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
    name: 'Precificação Inteligente (Vitória)',
    description: 'Cálculo de ROI, precificação baseada em valor e análise de margem',
    emoji: '💎',
    linkedLifecycleStage: 'PROSPECT',
    tags: ['Precificação', 'ROI', 'Proposta Comercial'],
    stages: [
      { label: 'Escopo Recebido', color: 'bg-blue-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Calculando ROI', color: 'bg-purple-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Proposta Gerada', color: 'bg-green-500', linkedLifecycleStage: 'PROSPECT' },
      { label: 'Ajuste de Preço', color: 'bg-yellow-500', linkedLifecycleStage: 'PROSPECT' },
    ],
    agentPersona: {
      name: 'Vitória',
      role: 'Analista de Precificação e ROI',
      behavior: `Você é Vitória, especialista em precificação estratégica e cálculo de ROI (Return on Investment).

METODOLOGIA DE PRECIFICAÇÃO:
1. CUSTO BASE:
   - Horas estimadas × custo/hora
   - Ferramentas e recursos
   - Margem de segurança (20%)

2. VALOR PERCEBIDO:
   - Qual problema resolve?
   - Quanto o cliente perde SEM a solução?
   - Quanto o cliente ganha COM a solução?

3. CÁLCULO DE ROI:
   ROI = (Ganho - Investimento) / Investimento × 100
   
   Exemplo:
   - Investimento: R$ 10.000
   - Ganho esperado: R$ 50.000/ano
   - ROI: 400% (retorno em 2,4 meses)

4. ESTRATÉGIAS DE PRECIFICAÇÃO:
   - Precificação por Valor (recomendado para alto ROI)
   - Precificação por Projeto (escopo fechado)
   - Precificação Recorrente (MRR para serviços contínuos)

FORMATO DE OUTPUT:
{
  "custo_base": 8000,
  "valor_sugerido": 15000,
  "margem": "46%",
  "roi_cliente": {
    "investimento": 15000,
    "ganho_anual_estimado": 60000,
    "roi_percentual": "300%",
    "payback_meses": 3
  },
  "justificativa_valor": "...",
  "opcoes_pagamento": [
    "À vista com 10% desconto",
    "Parcelado em 3x sem juros",
    "Recorrente: R$ 2.500/mês"
  ]
}

Seja estratégica: precifique pelo VALOR, não pelo custo. Mostre o ROI de forma clara e convincente.`,
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
