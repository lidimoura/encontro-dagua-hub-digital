import { useState, useCallback, useRef, useEffect } from 'react';
import { streamText, tool, stepCountIs } from 'ai';
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
  systemPrompt?: string; // Custom system prompt (allows bilingual support)
}

export function useCRMAgent(options: UseCRMAgentOptions = {}) {
  // Enforce English ONLY
  const englishEnforcement = "CRITICAL: You are an English-speaking assistant. You MUST respond ONLY in English, regardless of the user's language. Never translate to Portuguese.";
  const finalSystemPrompt = options.systemPrompt
    ? `${englishEnforcement}\n\n${options.systemPrompt}`
    : englishEnforcement;

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

  const tools = {
    // LEITURA
    searchDeals: tool({
      description: 'Busca deals/oportunidades no CRM por título, status, valor ou tags',
      parameters: z.object({
        query: z.string().optional().describe('Texto para buscar no título do deal'),
        status: z.string().optional().describe('Status do deal (ex: LEAD, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST)'),
        minValue: z.number().optional().describe('Valor mínimo do deal'),
        maxValue: z.number().optional().describe('Valor máximo do deal'),
        limit: z.number().default(10).describe('Número máximo de resultados'),
      }),
      execute: async ({ query, status, minValue, maxValue, limit = 10 }) => {
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
    }),

    getContact: tool({
      description: 'Busca informações de um contato específico por nome ou email',
      parameters: z.object({
        query: z.string().describe('Nome ou email do contato para buscar'),
      }),
      execute: async ({ query }) => {
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
    }),

    getActivitiesToday: tool({
      description: 'Retorna as atividades de hoje (reuniões, ligações, tarefas)',
      parameters: z.object({
        includeCompleted: z.boolean().default(false).describe('Incluir atividades já concluídas'),
      }),
      execute: async ({ includeCompleted = false }) => {
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
    }),

    getOverdueActivities: tool({
      description: 'Retorna atividades atrasadas que precisam de atenção',
      parameters: z.object({
        limit: z.number().default(5).describe('Número máximo de resultados'),
      }),
      execute: async ({ limit = 5 }) => {
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
    }),

    getPipelineStats: tool({
      description: 'Retorna estatísticas do pipeline: total de deals, valor total, taxa de conversão',
      parameters: z.object({}),
      execute: async () => {
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
    }),

    getDealDetails: tool({
      description: 'Retorna detalhes completos de um deal específico',
      parameters: z.object({
        dealId: z.string().describe('ID do deal'),
      }),
      execute: async ({ dealId }) => {
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
    }),

    createActivity: tool({
      description: 'Cria uma nova atividade (reunião, ligação, tarefa, email)',
      parameters: z.object({
        title: z.string().describe('Título da atividade'),
        type: z.enum(['MEETING', 'CALL', 'TASK', 'EMAIL']).describe('Tipo da atividade'),
        date: z.string().describe('Data e hora no formato ISO (ex: 2025-12-01T14:00:00)'),
        description: z.string().optional().describe('Descrição ou notas'),
        contactName: z.string().optional().describe('Nome do contato relacionado'),
        dealTitle: z.string().optional().describe('Título do deal relacionado'),
      }),
      execute: async ({ title, type, date, description, contactName, dealTitle }) => {
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
          createdAt: new Date().toISOString(), // FIXED: Added missing property
        };

        addActivity(newActivity);

        return {
          success: true,
          message: `Atividade "${title}" criada para ${new Date(date).toLocaleDateString('pt-BR')}`,
          activity: { id: newActivity.id, title, type, date },
        };
      },
    }),

    completeActivity: tool({
      description: 'Marca uma atividade como concluída',
      parameters: z.object({
        activityId: z.string().describe('ID da atividade'),
      }),
      execute: async ({ activityId }) => {
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
    }),

    moveDeal: tool({
      description: 'Move um deal para outro estágio do pipeline',
      parameters: z.object({
        dealId: z.string().describe('ID do deal'),
        newStatus: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'])
          .describe('Novo status/estágio do deal'),
      }),
      execute: async ({ dealId, newStatus }) => {
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
    }),

    updateDealValue: tool({
      description: 'Atualiza o valor de um deal',
      parameters: z.object({
        dealId: z.string().describe('ID do deal'),
        newValue: z.number().describe('Novo valor do deal'),
      }),
      execute: async ({ dealId, newValue }) => {
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
    }),

    createDeal: tool({
      description: 'Cria um novo deal/oportunidade no pipeline',
      parameters: z.object({
        title: z.string().describe('Título do deal'),
        value: z.number().describe('Valor estimado'),
        contactName: z.string().optional().describe('Nome do contato principal'),
        companyName: z.string().optional().describe('Nome da empresa'),
        description: z.string().optional().describe('Descrição do deal'),
      }),
      execute: async ({ title, value, contactName, companyName, description }) => {
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
          customFields: {}, // FIXED: Added missing property
        };

        addDeal(newDeal);

        return {
          success: true,
          message: `Deal "${title}" criado com valor de R$${value.toLocaleString()}`,
          deal: { id: newDeal.id, title, value, status: newDeal.status },
        };
      },
    }),

    analyzeStagnantDeals: tool({
      description: 'Analisa deals que estão parados há muito tempo e precisam de atenção',
      parameters: z.object({
        daysStagnant: z.number().default(7).describe('Número de dias sem atualização'),
      }),
      execute: async ({ daysStagnant = 7 }) => {
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
    }),

    suggestNextAction: tool({
      description: 'Sugere a próxima melhor ação para um deal específico',
      parameters: z.object({
        dealId: z.string().describe('ID do deal para analisar'),
      }),
      execute: async ({ dealId }) => {
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
    }),
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
      // TENTATIVA 1: Primary Key
      let model = getModel();
      // If user provided a key via stats/settings (aiApiKey), getModel uses it. 
      // Otherwise it uses env VITE_GEMINI_API_KEY.

      try {
        // Convert internal messages to CoreMessage format for AI SDK
        const coreMessages: any[] = [...messages, userMessage].map(m => ({ // Cast to any to avoid version mismatch issues
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content
        }));

        await streamResponse(model, coreMessages, tools, finalSystemPrompt);
      } catch (primaryErr) {
        // Check if it's a quota error
        const isQuotaError = primaryErr instanceof Error && (
          primaryErr.message.includes('429') ||
          primaryErr.message.includes('quota') ||
          primaryErr.message.includes('Too Many Requests')
        );

        if (isQuotaError) {
          const secondaryKey = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY;
          if (secondaryKey) {
            console.warn('⚠️ Primary API Key Quota Exceeded - Switching to Secondary Key');
            // TENTATIVA 2: Secondary Key
            const google = createGoogleGenerativeAI({ apiKey: secondaryKey });
            model = google('gemini-2.5-flash'); // Re-create model with secondary key

            const coreMessages: any[] = messages.map(m => ({
              role: m.role as 'user' | 'assistant' | 'system',
              content: m.content
            }));
            await streamResponse(model, coreMessages, tools, finalSystemPrompt);
            return; // Success with secondary, exit
          }
        }
        throw primaryErr; // Re-throw to be caught by outer catch (Demo Mode)
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignorar abort
        return;
      }

      // FALLBACK FOR GEMINI 429 (Quota Exceeded) - DEMO MODE
      if (err instanceof Error && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('Too Many Requests'))) {
        console.warn('⚠️ All API Keys Quota Exceeded - Using Fallback Mode');
        // ... Demo Mode Logic ...
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

  // Helper to stream response (encapulsated for retry)
  async function streamResponse(model: any, coreMessages: any[], tools: any, customSystemPrompt?: string) {
    const result = streamText({
      model,
      system: customSystemPrompt || `You are **Mazô**, the CX/CS Strategist & Operational Manager of 'Encontro D'Água Hub'.

🌍 **LANGUAGE PROTOCOL:**
- Detect the user's language.
- If they speak **English**, respond in **English**.
- If they speak **Portuguese**, respond in **Portuguese**.

🤖 **YOUR ELITE AI TEAM:**
You are the central node of a specialized AI team:
1.  **Mazô (You):** Operations, CRM management, CX strategy, and "Hub Radio". You orchestrate everything.
2.  **Precy:** Sales & Pricing Specialist. (Calculates margins, ROI, and quote generation).
3.  **Jury:** Legal & Compliance Specialist. (Drafts contracts, analyzes risks, ensures LGPD/GDPR compliance).

*If a user needs specific pricing or legal help, explicitly mention "I will consult Precy/Jury for this..." to show collaboration.*

🚀 **ECOSYSTEM PRODUCTS:**
1.  **QR d'água (/qrdagua):**
    *   **Link:** Simple QR Code (Free).
    *   **Bridge Page:** Intermediate page with bio & CTA (Admin/Pro).
    *   **Digital Card:** Virtual business card (Admin/Pro).
2.  **Estúdio IA (/estudio):**
    *   Generative UI for creating websites from prompts.

🛠️ **YOUR CURRENT CAPABILITIES:**
- **CRM Control:** Manage Deals, Contacts, Activities.
- **Analysis:** pipeline health, stagnant deals, next best actions.
- **Execution:** Create tasks, move deals, update values.

📜 **OPERATIONAL RULES:**
1.  **Be Proactive:** Don't just answer; suggest the next step.
2.  **Be Precise:** Use real data from the CRM (Deals, Activities).
3.  **Format:** Use Markdown (bold, lists) for readability.
4.  **Values:** Always format currency (R$ or $).

💡 **GUIDING USERS:**
- If they want a QR Code -> "Go to /qrdagua".
- If they want a Contract -> "Go to Board > Jury Agent or ask me to draft a simple clause".
- If they want a Site -> "Check out Estúdio IA".

Your goal is to make the user feel they are commanding a powerful, intelligent ecosystem.`,

      messages: coreMessages,
      tools,
      stopWhen: stepCountIs(5), // Permite multi-step automático
      abortSignal: abortControllerRef.current?.signal,
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
  }

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
