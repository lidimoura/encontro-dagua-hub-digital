import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { getModel } from '@/services/ai/config';
import { Deal, DealView, LifecycleStage } from '@/types';

export interface AIConfig {
  provider: 'google' | 'openai' | 'anthropic';
  apiKey: string;
  model: string;
  thinking: boolean;
  search: boolean;
  anthropicCaching: boolean;
}

// --- API FALLBACK HELPER ---
const generateTextWithFallback = async (
  params: Parameters<typeof generateText>[0],
  provider: 'google' | 'openai' | 'anthropic',
  modelId: string,
  primaryKey: string
) => {
  try {
    return await generateText(params);
  } catch (error: any) {
    const isQuota = error?.response?.status === 429 || error?.status === 429 || error?.toString().includes('429');
    const secondaryKey = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY;

    if (isQuota && secondaryKey && primaryKey !== secondaryKey) {
      console.warn('⚠️ Quota exceeded (429). Switching to Secondary API Key...');
      const fallbackModel = getModel(provider, secondaryKey, modelId);
      return await generateText({ ...params, model: fallbackModel });
    }
    throw error;
  }
};

export const analyzeLead = async (
  deal: Deal | DealView,
  config?: AIConfig
): Promise<{ suggestion: string; probabilityScore: number }> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return { suggestion: 'Erro: API Key não configurada.', probabilityScore: 0 };

  const model = getModel(provider, apiKey, modelId);

  const prompt = `
    Analyze this sales opportunity (Deal) and provide:
    1. A short and actionable suggestion on what to do next (max 2 sentences).
    2. A closing probability score (0 to 100) based on the data.

    Return ONLY a JSON in this format:
    { "suggestion": "...", "probabilityScore": 50 }

    Data:
    Title: ${deal.title}
    Value: ${deal.value}
    Stage: ${deal.status}
    Current Probability: ${deal.probability}
    Priority: ${deal.priority}
  `;

  try {
    const result = await generateTextWithFallback({
      model,
      prompt,
    }, provider, modelId, apiKey);
    const text = result.text;
    const jsonStr = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error analyzing lead:', error);
    return { suggestion: 'Não foi possível analisar.', probabilityScore: deal.probability };
  }
};

export const generateEmailDraft = async (
  deal: Deal | DealView,
  config?: AIConfig
): Promise<string> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return 'Erro: API Key não configurada.';

  const model = getModel(provider, apiKey, modelId);

  const prompt = `
    Write a short and persuasive draft email for this client.
    The goal is to move the deal to the next stage.
    
    Client: ${'contactName' in deal ? deal.contactName : 'Cliente'}
    Company: ${'companyName' in deal ? deal.companyName : 'Empresa'}
    Deal: ${deal.title}
    Current Stage: ${deal.status}

    Return ONLY the body of the email.
  `;

  try {
    const result = await generateTextWithFallback({
      model,
      prompt,
    }, provider, modelId, apiKey);
    return result.text;
  } catch (error) {
    console.error('Error generating email:', error);
    return 'Erro ao gerar e-mail.';
  }
};

// ── WhatsApp First-Contact Outreach Generator ───────────────────────────────
// Uses briefing_json to craft a warm, personalized first message.
// Different from generateRescueMessage (which is for stalled deals).
export const generateWAOutreach = async (
  deal: Deal | DealView,
  briefingData?: {
    name?: string;
    services?: string[];
    message?: string;
    whatsapp?: string;
  },
  config?: AIConfig
): Promise<string> => {
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return 'Erro: API Key não configurada.';

  const model = getModel(provider, apiKey, modelId);

  const servicesStr = briefingData?.services?.length
    ? briefingData.services.join(', ')
    : 'Serviços não especificados';

  const originalMsg = briefingData?.message
    ? `\n    Mensagem original do lead: "${briefingData.message}"`
    : '';

  const prompt = `
    You are a warm and consultative sales consultant at Encontro d'Água Hub Digital.
    
    A new lead just registered and you will send the FIRST message on WhatsApp.
    
    Lead Data:
    - Name: ${briefingData?.name || ('contactName' in deal ? deal.contactName : 'Cliente')}
    - Services of interest: ${servicesStr}${originalMsg}
    - Deal in CRM: ${deal.title}
    
    RULES:
    1. Be personal, warm, and direct. Max 4 lines.
    2. Specifically mention the services they requested.
    3. End with an open question that prompts a reply (e.g., "Can I tell you more?", "When is a good time to chat?").
    4. Use 1-2 natural emojis, don't overdo it.
    5. DO NOT use generic greetings like "Hello! How are you?". Get straight to the point.
    6. Tone: friendly, human, consultative.
    
    Return ONLY the text of the message, without external quotes.
  `;

  try {
    const result = await generateTextWithFallback({ model, prompt }, provider, modelId, apiKey);
    return result.text.trim();
  } catch (error) {
    console.error('Error generating WA outreach:', error);
    return 'Erro ao gerar mensagem.';
  }
};

export const generateObjectionResponse = async (
  deal: Deal | DealView,
  objection: string,
  config?: AIConfig
): Promise<string[]> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return ['Erro: API Key não configurada.'];

  const model = getModel(provider, apiKey, modelId);

  const prompt = `
    The client presented the following objection: "${objection}"
    Deal Context: ${deal.title}, Value: ${deal.value}.

    Provide 3 short, killer response options to overcome this objection.
    Return ONLY a JSON array of strings:
    ["Response 1...", "Response 2...", "Response 3..."]
  `;

  try {
    const result = await generateTextWithFallback({
      model,
      prompt,
    }, provider, modelId, apiKey);
    const text = result.text;
    const jsonStr = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating objections:', error);
    return ['Não foi possível gerar respostas.'];
  }
};

export const processAudioNote = async (
  audioBase64: string,
  config?: AIConfig
): Promise<{
  transcription: string;
  sentiment: string;
  nextAction?: { type: string; title: string; date: string };
}> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return { transcription: 'Erro: API Key não configurada.', sentiment: 'Neutro' };

  const model = getModel(provider, apiKey, modelId);

  const prompt = `
    Transcribe this audio of a sales note.
    Analyze the sentiment (Positive, Neutral, Negative, Urgent).
    If there is a clear next action (e.g., "call tomorrow", "send proposal"), extract it.

    Return JSON:
    {
      "transcription": "...",
      "sentiment": "...",
      "nextAction": { "type": "CALL" | "EMAIL" | "TASK", "title": "...", "date": "ISOString" } (optional)
    }
  `;

  try {
    const result = await generateTextWithFallback({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'file', data: audioBase64, mediaType: 'audio/webm' },
          ],
        },
      ],
    }, provider, modelId, apiKey);
    const text = result.text;
    const jsonStr = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error processing audio:', error);
    return { transcription: 'Erro ao processar áudio.', sentiment: 'Erro' };
  }
};

interface DailyBriefingData {
  birthdays: Array<{ name: string }>;
  stalledDeals: number;
  overdueActivities: number;
  upsellDeals: number;
}

export const generateDailyBriefing = async (
  data: DailyBriefingData,
  config?: AIConfig
): Promise<string> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return 'Erro: API Key não configurada.';

  const model = getModel(provider, apiKey, modelId);

  const prompt = `
    You are a senior sales manager analyzing the CRM.
    Generate a short and motivating morning briefing for the salesperson.
    
    Today's Data:
    - Birthdays: ${data.birthdays.length}
    - Stalled Deals (At Risk): ${data.stalledDeals}
    - Overdue Activities: ${data.overdueActivities}
    - Upsell Opportunities: ${data.upsellDeals}

    Speak in the first person ("I noticed that...", "I suggest you...").
    If there are risks, focus on them. If everything is clear, congratulate them.
    Maximum 3 sentences.
  `;

  try {
    const result = await generateTextWithFallback({
      model,
      prompt,
    }, provider, modelId, apiKey);
    return result.text;
  } catch (error) {
    console.error('Error generating briefing:', error);
    return 'Bom dia! Vamos focar em limpar as pendências hoje.';
  }
};

export const generateRescueMessage = async (
  deal: Deal | DealView,
  channel: 'EMAIL' | 'WHATSAPP' | 'PHONE',
  config?: AIConfig
): Promise<string> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return 'Erro: API Key não configurada.';

  const model = getModel(provider, apiKey, modelId);

  let context = `
    Client: ${'contactName' in deal ? deal.contactName : 'Cliente'}
    Company: ${'companyName' in deal ? deal.companyName : 'Empresa'}
    Deal: ${deal.title}
    Value: ${deal.value}
    Stage: ${deal.status}
    Time stalled: > 7 days
    `;

  let prompt = '';

  if (channel === 'WHATSAPP') {
    prompt = `
        ${context}
        Write a short, casual, and direct WhatsApp message to reactivate this contact.
        Use emojis sparingly. The tone should be "concerned but light".
        e.g.: "Hi John, how are you? I saw that..."
        Return ONLY the text of the message.
        `;
  } else if (channel === 'PHONE') {
    prompt = `
        ${context}
        Create a mini call script (bullet points) for the salesperson to call right now.
        The goal is to find out if the project is still on track.
        Include:
        - Opening (Icebreaker)
        - Key Question (The reason for the call)
        - Closing (Next step)
        Return in a simple list format.
        `;
  } else {
    // EMAIL
    prompt = `
        ${context}
        Write a "Break-up" email (sales technique).
        Be polite but firm: ask if the project has been cancelled so you can close the file.
        This usually gets a response.
        Return ONLY the body of the email.
        `;
  }

  try {
    const result = await generateTextWithFallback({
      model,
      prompt,
    }, provider, modelId, apiKey);
    return result.text;
  } catch (error) {
    console.error('Error generating rescue message:', error);
    return 'Erro ao gerar mensagem.';
  }
};

// --- NEW: NATURAL LANGUAGE ACTION PARSING ---

export interface ParsedAction {
  title: string;
  type: 'CALL' | 'MEETING' | 'EMAIL' | 'TASK';
  date?: string; // ISO string
  contactName?: string;
  companyName?: string;
  confidence: number;
}

export const parseNaturalLanguageAction = async (
  text: string,
  config?: AIConfig
): Promise<ParsedAction | null> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) {
    console.warn('API Key missing for NLP action parsing');
    return null;
  }

  const model = getModel(provider, apiKey, modelId);

  const now = new Date();
  const prompt = `
    You are an intelligent personal assistant. Analyze the following voice/text command and extract a structured action.
    
    Command: "${text}"
    
    Temporal Context: Today is ${now.toLocaleDateString('en-US')} (${now.toLocaleDateString('en-US', { weekday: 'long' })}), at ${now.toLocaleTimeString('en-US')}.
    
    Instructions:
    1. Identify the main action (Call, Meeting, Email, Task).
    2. Extract the mentioned date and time. If relative (e.g., "tomorrow afternoon"), calculate the approximate ISO date. If no time is given, set 09:00 for tasks and 14:00 for meetings.
    3. Identify people's names (contactName) and company names (companyName).
    4. Create a short and descriptive title.
    
    Return JSON.
  `;

  try {
    const result = await generateTextWithFallback({
      model,
      prompt,
    }, provider, modelId, apiKey);

    const text = result.text;
    const jsonStr = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('NLP Action Parsing Error:', error);
    return null;
  }
};

interface CRMContext {
  deals?: Array<{ id: string; title: string; value: number; status: string }>;
  contacts?: Array<{ id: string; name: string; email: string }>;
  companies?: Array<{ id: string; name: string }>;
  activities?: Array<{ id: string; title: string; type: string; date: string }>;
  [key: string]: unknown;
}

export const chatWithCRM = async (
  message: string,
  context: CRMContext,
  config?: AIConfig
): Promise<string> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return 'Erro: API Key não configurada.';

  const model = getModel(provider, apiKey, modelId);

  const prompt = `
    You are a CRM assistant. The user said: "${message}".
    Current context: ${JSON.stringify(context)}.
    Answer in a helpful and concise way.
  `;

  try {
    const result = await generateTextWithFallback({
      model,
      prompt,
    }, provider, modelId, apiKey);
    return result.text;
  } catch (error) {
    console.error('Error in chatWithCRM:', error);
    return 'Desculpe, não consegui processar sua solicitação.';
  }
};

export const generateBirthdayMessage = async (
  contactName: string,
  age?: number,
  config?: AIConfig
): Promise<string> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return 'Erro: API Key não configurada.';

  const model = getModel(provider, apiKey, modelId);

  const prompt = `
    Write a short and friendly happy birthday message to the client ${contactName}.
    ${age ? `They are turning ${age} years old.` : ''}
    Tone should be professional but warm.
    Return ONLY the text of the message.
  `;

  try {
    const result = await generateTextWithFallback({
      model,
      prompt,
    }, provider, modelId, apiKey);
    return result.text;
  } catch (error) {
    console.error('Error generating birthday message:', error);
    return 'Parabéns pelo seu dia!';
  }
};

export interface GeneratedBoard {
  name: string;
  description: string;
  stages: {
    name: string;
    description: string;
    color: string;
    linkedLifecycleStage: string;
    estimatedDuration?: string;
  }[];
  automationSuggestions: string[];
  goal: {
    description: string;
    kpi: string;
    targetValue: string;
    currentValue?: string;
  };
  agentPersona: {
    name: string;
    role: string;
    behavior: string;
  };
  entryTrigger: string;
  confidence: number;
  boardName?: string; // Optional alias for name, handled in wizard
  linkedLifecycleStage?: string; // Board-level lifecycle stage
}

// --- STEP 1: BOARD STRUCTURE ---
interface BoardStructureResult {
  boardName: string;
  description: string;
  stages: Array<{
    name: string;
    description: string;
    color: string;
    linkedLifecycleStage: string;
    estimatedDuration?: string;
  }>;
  automationSuggestions: string[];
}

export const generateBoardStructure = async (
  description: string,
  lifecycleStages: LifecycleStage[] = [],
  config?: AIConfig
): Promise<BoardStructureResult> => {
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) throw new Error('API Key not configured');

  const model = getModel(provider, apiKey, modelId);

  const lifecycleStagesList = lifecycleStages.map(s => `- ${s.name} (ID: ${s.id})`).join('\n');

  const promptStructure = `
    You are a Process Architect.
    The user wants a board for: "${description}"

    Define the STRUCTURE of the board (Process Phases).
    
    LIFECYCLE STAGE RULES (CRITICAL):
    - For EACH stage, define a 'linkedLifecycleStage' using ONLY:
    ${lifecycleStagesList}
    - If empty, use: LEAD, MQL, PROSPECT, CUSTOMER, OTHER.
    
    DESIGN RULES:
    - "color": bg-blue-500, bg-yellow-500, bg-purple-500, bg-orange-500, bg-green-500.
    - "name": MAXIMUM 2 WORDS IN ENGLISH. Ex: "Qualification", "Closing".
    
    CRITICAL: ALL stage names and descriptions MUST be in ENGLISH, regardless of user input language.
    
    Return JSON:
    {
      "boardName": "...",
      "description": "...",
      "stages": [ 
        { "name": "...", "description": "...", "color": "...", "linkedLifecycleStage": "...", "estimatedDuration": "..." }
      ],
      "automationSuggestions": [ ... ]
    }
  `;

  try {
    const resultStructure = await generateTextWithFallback({ model, prompt: promptStructure }, provider, modelId, apiKey);
    const jsonStr = resultStructure.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating board structure:', error);
    throw error;
  }
};

interface BoardStrategyResult {
  goal: {
    description: string;
    kpi: string;
    targetValue: string;
  };
  agentPersona: {
    name: string;
    role: string;
    behavior: string;
  };
  entryTrigger: string;
}

// --- STEP 2: STRATEGY (Context-Aware) ---
export const generateBoardStrategy = async (
  boardData: BoardStructureResult,
  config?: AIConfig
): Promise<BoardStrategyResult> => {
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) throw new Error('API Key not configured');

  const model = getModel(provider, apiKey, modelId);

  const promptStrategy = `
    You are a Business Strategy Expert.
    
    We have this Board designed:
    Name: ${boardData.boardName}
    Description: ${boardData.description}
    Stages: ${JSON.stringify(boardData.stages)}

    Now, define the STRATEGY to operate this board.

    1. GOAL:
       - KPI: What's the main metric? (Ex: Conversion Rate, MRR, Resolution Time)
       - Target: What's the numeric target? (Be realistic, don't use 100% unless guaranteed).
       - Description: Why does this goal matter?

    2. AGENT (Persona):
       - Create a specialist to operate THIS specific process.
       - Name: Suggest a human name (Ex: "Ana", "Carlos").
       - Role: Ex: "Senior SDR", "Onboarding Manager".
       - Behavior: Describe HOW they should act in each phase of this board. Be detailed.

    3. ENTRY TRIGGER:
       - Who enters the first phase (${boardData.stages[0]?.name})?
    
    CRITICAL: ALL text outputs (goal description, agent behavior, entry trigger) MUST be in ENGLISH.

    Retorne JSON:
    {
      "goal": { "description": "...", "kpi": "...", "targetValue": "..." },
      "agentPersona": { "name": "...", "role": "...", "behavior": "..." },
      "entryTrigger": "..."
    }
  `;

  try {
    const resultStrategy = await generateTextWithFallback({ model, prompt: promptStrategy }, provider, modelId, apiKey);
    const jsonStr = resultStrategy.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating strategy:', error);
    // Return default strategy if step 2 fails
    return {
      goal: { description: 'Definir meta', kpi: 'N/A', targetValue: '0' },
      agentPersona: { name: 'Assistente', role: 'Operador', behavior: 'Ajudar no processo.' },
      entryTrigger: 'Novos itens',
    };
  }
};

export const generateBoardFromDescription = async (
  description: string,
  lifecycleStages: LifecycleStage[] = [],
  config?: AIConfig
): Promise<GeneratedBoard> => {
  // Step 1: Structure
  const boardData = await generateBoardStructure(description, lifecycleStages, config);

  // Step 2: Strategy
  const strategyData = await generateBoardStrategy(boardData, config);

  // Merge Results
  const finalBoard: GeneratedBoard = {
    ...boardData,
    ...strategyData,
    confidence: 0.9,
    name: boardData.boardName,
  };

  // Normalize is no longer needed since we explicitly set name
  // if (finalBoard.boardName && !finalBoard.name) finalBoard.name = finalBoard.boardName;

  return finalBoard;
};

export const refineBoardWithAI = async (
  currentBoard: GeneratedBoard,
  userInstruction: string,
  config?: AIConfig,
  chatHistory?: { role: 'user' | 'ai'; content: string }[]
): Promise<{ message: string; board: GeneratedBoard | null }> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) throw new Error('API Key not configured');

  const model = getModel(provider, apiKey, modelId);

  // Format chat history for context
  const historyContext = chatHistory
    ? chatHistory
      .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
      .join('\n')
    : '';

  const prompt = `
    Você é um assistente de configuração de CRM.
    O usuário quer ajustar um board existente.

    Board Atual: ${JSON.stringify(currentBoard)}
    
    Histórico da Conversa:
    ${historyContext}

    Instrução Atual do Usuário: "${userInstruction}"

    Se a instrução do usuário for apenas uma conversa (ex: "olá", "qual meu nome", "obrigado") ou uma pergunta que NÃO requer alteração no board, retorne "board": null.

    Se a instrução requerer alteração no board, faça as alterações no JSON.
    Se o usuário pedir para mudar etapas, lembre-se de manter ou ajustar os 'linkedLifecycleStage' corretamente.
    
    REGRAS DE ESTRATÉGIA (CRÍTICO):
    - Você DEVE manter ou atualizar os campos: "goal", "agentPersona" e "entryTrigger".
    - Se a mudança no board afetar a estratégia (ex: mudou de Vendas para Suporte), ATUALIZE a estratégia (Meta, Agente, Gatilho) para combinar.
    - Se a mudança for apenas visual ou menor, MANTENHA os dados de estratégia existentes.
    - NUNCA remova esses campos do JSON.

    REGRAS DE DESIGN (IMPORTANTE):
    - Mantenha ou atribua cores ("color") para TODAS as etapas.
    - Use classes Tailwind de background: bg-blue-500, bg-yellow-500, bg-purple-500, bg-orange-500, bg-green-500, bg-teal-500, bg-indigo-500, bg-pink-500.
    - Tente seguir uma lógica de "esfriar" ou "esquentar" ou simplesmente diferenciar visualmente.
    
    IMPORTANTE:
    1. Se precisar buscar informações externas (ex: "como funciona funil de vendas para X"), USE A BUSCA (se disponível) antes de responder.
    2. CERTIFIQUE-SE de que o JSON retornado reflete EXATAMENTE as alterações que você descreveu na mensagem.
    3. Retorne APENAS um JSON válido com o seguinte formato, sem markdown:
    {
      "message": "Explicação curta do que foi feito ou resposta à pergunta",
      "board": { ...estrutura completa do board atualizada... } ou null
    }
    `;

  let tools: Record<string, unknown> | undefined = undefined;
  if (config?.search) {
    if (provider === 'google') {
      tools = { googleSearch: google.tools.googleSearch({}) };
    } else if (provider === 'anthropic') {
      tools = { web_search: anthropic.tools.webSearch_20250305({}) };
    }
  }

  interface GoogleProviderOptions {
    google?: {
      thinkingConfig?: {
        thinkingLevel?: 'high';
        thinkingBudget?: number;
        includeThoughts?: boolean;
      };
      useSearchGrounding?: boolean;
    };
  }

  let providerOptions: GoogleProviderOptions = {};

  // Google Provider Options
  if (provider === 'google') {
    providerOptions.google = {};

    // Thinking Config
    if (config?.thinking) {
      if (modelId.includes('gemini-3')) {
        providerOptions.google.thinkingConfig = { thinkingLevel: 'high', includeThoughts: true };
      } else {
        providerOptions.google.thinkingConfig = { thinkingBudget: 8192, includeThoughts: true };
      }
    }

    // Search Grounding Config
    if (config?.search) {
      providerOptions.google.useSearchGrounding = true;
    }
  }

  try {
    const result = await generateTextWithFallback({
      model,
      prompt,
      tools: tools as Parameters<typeof generateText>[0]['tools'],
      providerOptions: providerOptions as Parameters<typeof generateText>[0]['providerOptions'],
    }, provider, modelId, apiKey);

    const text = result.text;
    // Extract JSON using regex to handle potential markdown or trailing text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch
      ? jsonMatch[0]
      : text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    const parsed = JSON.parse(jsonStr);

    // SAFETY MERGE: If AI returns a board but misses strategy fields, merge from currentBoard
    if (parsed.board) {
      parsed.board = {
        ...currentBoard, // Base on current to keep existing fields
        ...parsed.board, // Overwrite with AI changes
        // Ensure strategy fields exist (prioritize AI's if present, else keep current)
        goal: parsed.board.goal || currentBoard.goal,
        agentPersona: parsed.board.agentPersona || currentBoard.agentPersona,
        entryTrigger: parsed.board.entryTrigger || currentBoard.entryTrigger,
      };
    }

    return parsed;
  } catch (error) {
    console.error('Error refining board:', error);
    throw error;
  }
};

interface DealSummary {
  id: string;
  title: string;
  value: number;
  status: string;
  probability?: number;
  contactName?: string;
}

export const chatWithBoardAgent = async (
  message: string,
  boardContext: {
    agentName: string;
    agentRole: string;
    agentBehavior: string;
    goalDescription: string;
    goalKPI: string;
    goalTarget: string;
    goalCurrent: string;
    entryTrigger: string;
    dealsSummary: DealSummary[];
  },
  config?: AIConfig
): Promise<string> => {
  // Fallback to default if no config (legacy support)
  const provider = config?.provider || 'google';
  const apiKey = config?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const modelId = config?.model || 'gemini-2.5-flash';

  if (!apiKey) return 'Erro: API Key não configurada.';

  const model = getModel(provider, apiKey, modelId);

  const prompt = `
    Você é ${boardContext.agentName}, atuando como ${boardContext.agentRole}.
    
    SUA PERSONA:
    ${boardContext.agentBehavior}
    
    SEU OBJETIVO NO BOARD:
    ${boardContext.goalDescription}
    KPI Principal: ${boardContext.goalKPI}
    Meta: ${boardContext.goalTarget}
    Atual: ${boardContext.goalCurrent}

    CRITÉRIOS DE ENTRADA (QUEM DEVE ESTAR AQUI):
    ${boardContext.entryTrigger}

    CONTEXTO DOS NEGÓCIOS (Resumo):
    ${JSON.stringify(boardContext.dealsSummary, null, 2)}

    O USUÁRIO DISSE:
    "${message}"

    INSTRUÇÕES DE ESTILO:
    1. SEJA DIRETO E OBJETIVO. Evite "blablabla" corporativo.
    2. NÃO se apresente novamente (o usuário já sabe quem você é).
    3. NÃO repita a meta inteira a cada mensagem, apenas se for relevante para o contexto.
    4. Fale como um parceiro de trabalho, não como um robô ou um texto de marketing.
    5. Máximo de 2 parágrafos curtos, a menos que seja uma lista.

    INSTRUÇÕES DE CONTEÚDO:
    1. Responda à pergunta do usuário usando os dados dos negócios.
    2. Se o usuário perguntar "qual a boa?", destaque 1 ou 2 negócios que precisam de atenção imediata para bater a meta.
    3. Cite os negócios pelo nome.
  `;

  try {
    const result = await generateText({
      model,
      prompt,
    });
    return result.text;
  } catch (error) {
    console.error('Error in chatWithBoardAgent:', error);
    return 'Desculpe, estou tendo dificuldades para acessar os dados do board agora.';
  }
};
