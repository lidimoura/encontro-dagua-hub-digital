import { useState, useCallback, useRef, useEffect } from 'react';
import { streamText, tool, CoreMessage, stepCountIs } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { useCRM } from '@/context/CRMContext';
import { Activity, Deal } from '@/types';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: Array<{
    toolName: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
}

interface UseCRMAgentOptions {
  onToolCall?: (toolName: string, args: Record<string, unknown>) => void;
  id?: string; // Persistence ID for chat history
}

export function useCRMAgent(options: UseCRMAgentOptions = {}) {
  const {
    deals,
    contacts,
    activities,
    addActivity,
    updateActivity,
    updateDeal,
    addDeal,
    activeBoard,
    aiApiKey,
  } = useCRM();

  // Load messages from localStorage if id is provided
  const [messages, setMessages] = useState<AgentMessage[]>(() => {
    if (options.id) {
      const saved = localStorage.getItem(`crm_chat_${options.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse chat history', e);
        }
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (options.id && messages.length > 0) {
      localStorage.setItem(`crm_chat_${options.id}`, JSON.stringify(messages));
    }
  }, [messages, options.id]);

  // Cria o modelo Google com Gemini 2.5 Flash
  const getModel = useCallback(() => {
    const apiKey = aiApiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key não configurada. Vá em Configurações para adicionar.');
    }
    const google = createGoogleGenerativeAI({ apiKey });
    return google('gemini-2.5-flash');
  }, [aiApiKey]);

  // ============================================
  // EXECUTORES DAS TOOLS (conectam com o CRM)
  // ============================================

  const toolExecutors = {
    // LEITURA
    searchDeals: async ({ query, status, minValue, maxValue, limit = 10 }: {
      query?: string;
      status?: string;
      minValue?: number;
      maxValue?: number;
      limit?: number;
    }) => {
      let filtered = [...deals];

      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(d =>
          d.title.toLowerCase().includes(q) ||
          d.companyName?.toLowerCase().includes(q)
        );
      }
      if (status) {
        filtered = filtered.filter(d => d.status === status);
      }
      if (minValue !== undefined) {
        filtered = filtered.filter(d => d.value >= minValue);
      }
      if (maxValue !== undefined) {
        filtered = filtered.filter(d => d.value <= maxValue);
      }

      const results = filtered.slice(0, limit).map(d => ({
        id: d.id,
        title: d.title,
        value: d.value,
        status: d.status,
        company: d.companyName,
        probability: d.probability,
      }));

      return {
        count: results.length,
        totalValue: results.reduce((sum, d) => sum + d.value, 0),
        deals: results,
      };
    },

    getContact: async ({ query }: { query: string }) => {
      const q = query.toLowerCase();
      const found = contacts.find(c =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );

      if (!found) {
        return { found: false, message: `Contato "${query}" não encontrado.` };
      }

      return {
        found: true,
        contact: {
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone,
          companyId: found.companyId,
          status: found.status,
          stage: found.stage,
        },
      };
    },

    getActivitiesToday: async ({ includeCompleted = false }: { includeCompleted?: boolean }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let filtered = activities.filter(a => {
        const actDate = new Date(a.date);
        return actDate >= today && actDate < tomorrow;
      });

      if (!includeCompleted) {
        filtered = filtered.filter(a => !a.completed);
      }

      return {
        count: filtered.length,
        activities: filtered.map(a => ({
          id: a.id,
          title: a.title,
          type: a.type,
          time: new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          completed: a.completed,
          deal: a.dealTitle,
        })),
      };
    },

    getOverdueActivities: async ({ limit = 5 }: { limit?: number }) => {
      const now = new Date();
      const overdue = activities
        .filter(a => !a.completed && new Date(a.date) < now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, limit);

      return {
        count: overdue.length,
        activities: overdue.map(a => ({
          id: a.id,
          title: a.title,
          type: a.type,
          daysOverdue: Math.floor((now.getTime() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24)),
          deal: a.dealTitle,
        })),
      };
    },

    getPipelineStats: async () => {
      const activeDeals = deals.filter(d => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.status));
      const wonDeals = deals.filter(d => d.status === 'CLOSED_WON');
      const lostDeals = deals.filter(d => d.status === 'CLOSED_LOST');

      return {
        totalDeals: deals.length,
        activeDeals: activeDeals.length,
        pipelineValue: activeDeals.reduce((sum, d) => sum + d.value, 0),
        wonDeals: wonDeals.length,
        wonValue: wonDeals.reduce((sum, d) => sum + d.value, 0),
        lostDeals: lostDeals.length,
        winRate: deals.length > 0
          ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length || 1)) * 100)
          : 0,
      };
    },

    getDealDetails: async ({ dealId }: { dealId: string }) => {
      const deal = deals.find(d => d.id === dealId);
      if (!deal) {
        return { found: false, message: 'Deal não encontrado.' };
      }

      const dealActivities = activities.filter(a => a.dealId === dealId);

      return {
        found: true,
        deal: {
          id: deal.id,
          title: deal.title,
          value: deal.value,
          status: deal.status,
          probability: deal.probability,
          company: deal.companyName,
          contact: deal.contactName,
          createdAt: deal.createdAt,
          updatedAt: deal.updatedAt,
          activities: dealActivities.length,
          tags: deal.tags,
        },
      };
    },

    // ESCRITA
    createActivity: async ({ title, type, date, description, contactName, dealTitle }: {
      title: string;
      type: 'MEETING' | 'CALL' | 'TASK' | 'EMAIL';
      date: string;
      description?: string;
      contactName?: string;
      dealTitle?: string;
    }) => {
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        dealId: '',
        dealTitle: dealTitle || '',
        title,
        type,
        description: description || '',
        date,
        user: { name: 'Eu', avatar: '' },
        completed: false,
      };

      addActivity(newActivity);

      return {
        success: true,
        message: `Atividade "${title}" criada para ${new Date(date).toLocaleDateString('pt-BR')}`,
        activity: { id: newActivity.id, title, type, date },
      };
    },

    completeActivity: async ({ activityId }: { activityId: string }) => {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) {
        return { success: false, message: 'Atividade não encontrada.' };
      }

      updateActivity(activityId, { completed: true });

      return {
        success: true,
        message: `Atividade "${activity.title}" marcada como concluída!`,
      };
    },

    moveDeal: async ({ dealId, newStatus }: { dealId: string; newStatus: string }) => {
      const deal = deals.find(d => d.id === dealId);
      if (!deal) {
        return { success: false, message: 'Deal não encontrado.' };
      }

      updateDeal(dealId, { status: newStatus as Deal['status'] });

      return {
        success: true,
        message: `Deal "${deal.title}" movido para ${newStatus}`,
        previousStatus: deal.status,
        newStatus,
      };
    },

    updateDealValue: async ({ dealId, newValue }: { dealId: string; newValue: number }) => {
      const deal = deals.find(d => d.id === dealId);
      if (!deal) {
        return { success: false, message: 'Deal não encontrado.' };
      }

      const oldValue = deal.value;
      updateDeal(dealId, { value: newValue });

      return {
        success: true,
        message: `Valor do deal "${deal.title}" atualizado de R$${oldValue.toLocaleString()} para R$${newValue.toLocaleString()}`,
      };
    },

    createDeal: async ({ title, value, contactName, companyName, description }: {
      title: string;
      value: number;
      contactName?: string;
      companyName?: string;
      description?: string;
    }) => {
      // Buscar contato e empresa pelos nomes (se fornecidos)
      let contactId = '';
      let companyId = '';

      if (contactName) {
        const found = contacts.find(c =>
          c.name.toLowerCase().includes(contactName.toLowerCase())
        );
        if (found) {
          contactId = found.id;
          companyId = found.companyId;
        }
      }

      const newDeal: Deal = {
        id: crypto.randomUUID(),
        boardId: activeBoard?.id || '',
        title,
        value,
        items: [],
        status: activeBoard?.stages[0]?.id || 'LEAD',
        priority: 'medium',
        probability: 20,
        contactId,
        companyId,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: { name: 'Eu', avatar: '' },
      };

      addDeal(newDeal);

      return {
        success: true,
        message: `Deal "${title}" criado com valor de R$${value.toLocaleString()}`,
        deal: { id: newDeal.id, title, value, status: newDeal.status },
      };
    },

    // ANÁLISE
    analyzeStagnantDeals: async ({ daysStagnant = 7 }: { daysStagnant?: number }) => {
      const now = new Date();
      const threshold = new Date(now.getTime() - daysStagnant * 24 * 60 * 60 * 1000);

      const stagnant = deals
        .filter(d => {
          if (['CLOSED_WON', 'CLOSED_LOST'].includes(d.status)) return false;
          const updated = new Date(d.updatedAt);
          return updated < threshold;
        })
        .sort((a, b) => b.value - a.value);

      return {
        count: stagnant.length,
        totalValueAtRisk: stagnant.reduce((sum, d) => sum + d.value, 0),
        deals: stagnant.slice(0, 5).map(d => ({
          id: d.id,
          title: d.title,
          value: d.value,
          status: d.status,
          daysSinceUpdate: Math.floor((now.getTime() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
        })),
      };
    },

    suggestNextAction: async ({ dealId }: { dealId: string }) => {
      const deal = deals.find(d => d.id === dealId);
      if (!deal) {
        return { success: false, message: 'Deal não encontrado.' };
      }

      const dealActivities = activities.filter(a => a.dealId === dealId);
      const lastActivity = dealActivities.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      let suggestion = '';
      let priority = 'medium';

      if (!lastActivity) {
        suggestion = 'Fazer primeiro contato - agendar reunião de descoberta';
        priority = 'high';
      } else {
        const daysSinceContact = Math.floor(
          (Date.now() - new Date(lastActivity.date).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceContact > 7) {
          suggestion = `Fazer follow-up - último contato foi há ${daysSinceContact} dias`;
          priority = 'high';
        } else if (deal.status === 'PROPOSAL') {
          suggestion = 'Verificar se o cliente revisou a proposta e agendar call de fechamento';
        } else if (deal.status === 'NEGOTIATION') {
          suggestion = 'Preparar contra-proposta ou agendar reunião para resolver objeções';
        } else {
          suggestion = 'Continuar nurturing com conteúdo relevante';
        }
      }

      return {
        deal: deal.title,
        suggestion,
        priority,
        context: {
          currentStatus: deal.status,
          value: deal.value,
          lastActivity: lastActivity?.title || 'Nenhuma',
        },
      };
    },
  };

  // ============================================
  // FUNÇÃO PRINCIPAL DE ENVIO
  // ============================================

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Abort controller para cancelar se necessário
    abortControllerRef.current = new AbortController();

    try {
      const model = getModel();

      // Converte mensagens para o formato do SDK
      const coreMessages: CoreMessage[] = [
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content },
      ];

      // Define as tools com execute
      const tools = {
        searchDeals: tool({
          description: 'Busca deals/oportunidades no CRM',
          inputSchema: z.object({
            query: z.string().optional(),
            status: z.string().optional(),
            minValue: z.number().optional(),
            maxValue: z.number().optional(),
            limit: z.number().default(10),
          }),
          execute: toolExecutors.searchDeals,
        }),
        getContact: tool({
          description: 'Busca informações de um contato',
          inputSchema: z.object({
            query: z.string(),
          }),
          execute: toolExecutors.getContact,
        }),
        getActivitiesToday: tool({
          description: 'Retorna atividades de hoje',
          inputSchema: z.object({
            includeCompleted: z.boolean().default(false),
          }),
          execute: toolExecutors.getActivitiesToday,
        }),
        getOverdueActivities: tool({
          description: 'Retorna atividades atrasadas',
          inputSchema: z.object({
            limit: z.number().default(5),
          }),
          execute: toolExecutors.getOverdueActivities,
        }),
        getPipelineStats: tool({
          description: 'Estatísticas do pipeline',
          inputSchema: z.object({}),
          execute: toolExecutors.getPipelineStats,
        }),
        getDealDetails: tool({
          description: 'Detalhes de um deal',
          inputSchema: z.object({
            dealId: z.string(),
          }),
          execute: toolExecutors.getDealDetails,
        }),
        createActivity: tool({
          description: 'Cria uma nova atividade',
          inputSchema: z.object({
            title: z.string(),
            type: z.enum(['MEETING', 'CALL', 'TASK', 'EMAIL']),
            date: z.string(),
            description: z.string().optional(),
            contactName: z.string().optional(),
            dealTitle: z.string().optional(),
          }),
          execute: toolExecutors.createActivity,
        }),
        completeActivity: tool({
          description: 'Marca atividade como concluída',
          inputSchema: z.object({
            activityId: z.string(),
          }),
          execute: toolExecutors.completeActivity,
        }),
        moveDeal: tool({
          description: 'Move deal para outro estágio',
          inputSchema: z.object({
            dealId: z.string(),
            newStatus: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
          }),
          execute: toolExecutors.moveDeal,
        }),
        updateDealValue: tool({
          description: 'Atualiza valor do deal',
          inputSchema: z.object({
            dealId: z.string(),
            newValue: z.number(),
          }),
          execute: toolExecutors.updateDealValue,
        }),
        createDeal: tool({
          description: 'Cria novo deal',
          inputSchema: z.object({
            title: z.string(),
            value: z.number(),
            contactName: z.string().optional(),
            companyName: z.string().optional(),
            description: z.string().optional(),
          }),
          execute: toolExecutors.createDeal,
        }),
        analyzeStagnantDeals: tool({
          description: 'Analisa deals parados',
          inputSchema: z.object({
            daysStagnant: z.number().default(7),
          }),
          execute: toolExecutors.analyzeStagnantDeals,
        }),
        suggestNextAction: tool({
          description: 'Sugere próxima ação para deal',
          inputSchema: z.object({
            dealId: z.string(),
          }),
          execute: toolExecutors.suggestNextAction,
        }),
      };

      const result = streamText({
        model,
        system: `Você é o Flow AI, o co-piloto operacional do 'Encontro D'Água Hub'.

SUA IDENTIDADE:
Você é técnico, proativo e direto. Você ajuda a operar a máquina, não apenas conversar.

SEUS PODERES ATUAIS:
- Gestão completa do CRM (Deals, Contatos, Atividades)
- Buscar e analisar deals, contatos e atividades
- Criar novas atividades, deals e tarefas
- Mover deals entre estágios do pipeline
- Analisar riscos e sugerir próximas ações

NOVOS PRODUTOS DO ECOSSISTEMA:
1. QR d'água: Gerador de Links, Páginas Ponte e Cartões Digitais (Rota: /qrdagua)
2. Estúdio IA: Criação de sites via imagem (Rota: /estudio)

MÓDULO QR D'ÁGUA - DOCUMENTAÇÃO COMPLETA:

VISÃO GERAL:
O QR d'água é um Construtor de Sites/Concierge que permite criar 3 tipos de projetos:
1. LINK - QR Code simples que redireciona para URL
2. BRIDGE - Página Ponte com título, descrição, imagem e botão CTA
3. CARD - Cartão Digital de visita com perfil, links e WhatsApp

PERMISSÕES:
- LINK: Disponível para todos os usuários
- BRIDGE e CARD: Exclusivo para Admins (role='admin')

FUNCIONALIDADES:

1. QR Code LINK:
   - URL de destino obrigatória
   - Cor personalizável (hex)
   - Slug único para identificação
   - QR Code Pro (opcional):
     * Logo no centro do QR
     * Texto acima do QR
     * Texto abaixo do QR

2. Página BRIDGE (Admin):
   - Título da página (pode ser gerado por IA)
   - Descrição/Bio (pode ser gerada por IA)
   - Imagem de capa (URL)
   - Botão CTA com texto customizável
   - WhatsApp integrado
   - Preview em tempo real no formato mobile

3. Cartão Digital CARD (Admin):
   - Foto de perfil
   - Nome e bio profissional
   - Link para website
   - Botão de WhatsApp direto
   - Design responsivo tipo vCard

GERAÇÃO DE CONTEÚDO IA:
- Usa Gemini 2.5 Flash Lite (fallback: 1.5 Flash)
- Gera títulos impactantes (5-7 palavras)
- Gera bios vendedoras (2-3 frases)
- Botões "✨ Gerar" disponíveis na interface

PREÇOS (INFORMAR AO USUÁRIO):
- LINK: Gratuito para todos
- BRIDGE: R$ 49/mês (requer Admin)
- CARD: R$ 79/mês (requer Admin)
- QR Pro (logo + textos): +R$ 19/mês

COMO ORIENTAR O USUÁRIO:
1. Se pedir QR simples → "Acesse /qrdagua e escolha tipo LINK"
2. Se pedir página de vendas → "Acesse /qrdagua e escolha BRIDGE (requer permissão Admin)"
3. Se pedir cartão digital → "Acesse /qrdagua e escolha CARD (requer permissão Admin)"
4. Se não for Admin e pedir BRIDGE/CARD → "Solicite ao administrador para criar BRIDGE/CARD ou para elevar suas permissões"
5. Se perguntar sobre preços → Informe a tabela acima

REGRA DE OURO:
Se o usuário pedir para criar um site ou QR code, oriente-o a usar a rota específica (/qrdagua ou /estudio) ou use suas ferramentas se disponíveis.

REGRAS OPERACIONAIS:
1. Sempre use as ferramentas disponíveis para buscar dados reais antes de responder
2. Seja conciso e direto nas respostas
3. Quando criar algo, confirme o que foi criado
4. Quando analisar, forneça insights acionáveis
5. Use valores em Reais (R$) formatados
6. Datas em formato brasileiro (dd/mm/aaaa)

Você é proativo - se perceber oportunidades ou riscos, mencione-os.`,

        messages: coreMessages,
        tools,
        stopWhen: stepCountIs(5), // Permite multi-step automático
        abortSignal: abortControllerRef.current.signal,
      });

      // Streaming da resposta
      let fullText = '';

      for await (const chunk of result.textStream) {
        fullText += chunk;
        // Atualiza a mensagem em tempo real
        setMessages(prev => {
          const existing = prev.find(m => m.id === 'streaming');
          if (existing) {
            return prev.map(m =>
              m.id === 'streaming' ? { ...m, content: fullText } : m
            );
          }
          return [...prev, {
            id: 'streaming',
            role: 'assistant' as const,
            content: fullText,
          }];
        });
      }

      // Finaliza a mensagem
      setMessages(prev =>
        prev.map(m =>
          m.id === 'streaming'
            ? { ...m, id: crypto.randomUUID() }
            : m
        )
      );

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignorar abort
        return;
      }

      // FALLBACK FOR GEMINI 429 (Quota Exceeded) - DEMO MODE
      if (err instanceof Error && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('Too Many Requests'))) {
        console.warn('⚠️ Gemini API Quota Exceeded - Using Fallback Mode');

        // Generate contextual fallback based on user query
        let fallbackResponse = '⚠️ **[Demo Mode - API Limit Reached]**\n\n';

        const query = content.toLowerCase();
        if (query.includes('deal') || query.includes('pipeline') || query.includes('oportunidade')) {
          const activeDeals = deals.filter(d => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.status));
          const totalValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
          fallbackResponse += `Based on your CRM data:\n\n`;
          fallbackResponse += `📊 **Pipeline Overview:**\n`;
          fallbackResponse += `- Active Deals: ${activeDeals.length}\n`;
          fallbackResponse += `- Total Pipeline Value: R$ ${totalValue.toLocaleString()}\n\n`;
          fallbackResponse += `💡 **Strategic Insight:** Focus on closing high-value deals in the Negotiation stage. Consider following up with stagnant opportunities.`;
        } else if (query.includes('atividade') || query.includes('activity') || query.includes('hoje') || query.includes('today')) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const todayActivities = activities.filter(a => {
            const actDate = new Date(a.date);
            return actDate >= today && actDate < tomorrow && !a.completed;
          });
          fallbackResponse += `Based on your schedule:\n\n`;
          fallbackResponse += `📅 **Today's Activities:** ${todayActivities.length} pending\n\n`;
          if (todayActivities.length > 0) {
            fallbackResponse += `Top priorities:\n`;
            todayActivities.slice(0, 3).forEach((a, i) => {
              fallbackResponse += `${i + 1}. ${a.title} (${a.type})\n`;
            });
          }
          fallbackResponse += `\n💡 **Tip:** Complete high-priority tasks first to maintain momentum.`;
        } else {
          fallbackResponse += `I'm currently in demo mode due to API limits, but I can still help you navigate the CRM.\n\n`;
          fallbackResponse += `📊 **Quick Stats:**\n`;
          fallbackResponse += `- Total Deals: ${deals.length}\n`;
          fallbackResponse += `- Total Contacts: ${contacts.length}\n`;
          fallbackResponse += `- Pending Activities: ${activities.filter(a => !a.completed).length}\n\n`;
          fallbackResponse += `💡 Try asking about specific deals, activities, or use the navigation menu to explore your CRM data.`;
        }

        const fallbackMessage: AgentMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fallbackResponse,
        };

        setMessages(prev => [...prev, fallbackMessage]);
        setIsLoading(false);
        return;
      }

      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      console.error('CRM Agent Error:', err);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, getModel, deals, contacts, activities, addActivity, updateActivity, updateDeal, addDeal, activeBoard]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stopGeneration,
  };
}
