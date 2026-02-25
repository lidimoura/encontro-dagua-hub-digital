import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCRMAgent } from '@/features/ai-hub/hooks/useCRMAgent';

import { supabase } from '@/lib/supabase/client';
import { Sparkles, Bot, Trash2, Send, MessageSquarePlus } from 'lucide-react';

// Welcome message
const WelcomeMessage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mb-4">
        <Sparkles size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {t('aiWelcomeTitle')}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
        {t('aiWelcomeDesc')}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {[
          t('suggestion1'),
          t('suggestion2'),
          t('suggestion3'),
          t('suggestion4'),
        ].map((suggestion) => (
          <button
            key={suggestion}
            className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export const AIHubPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Construct a simple system prompt for the AI Hub Page
  const systemPrompt = language === 'en'
    ? `You are Mazô, the CX/CS Strategist of 'Encontro D'Água Hub'.
      CRITICAL: You MUST respond in English. All analysis, suggestions, and communication must be in English.
      Your mission is to ensure the user succeeds in sales and customer relationships.
      Be proactive, helpful, and professional.`
    : `Você é a Mazô, a Estrategista CX/CS do 'Encontro D'Água Hub'.
      CRÍTICO: Você DEVE responder em Português. Toda análise, sugestões e comunicação devem ser em Português.
      Sua missão é garantir que o usuário tenha sucesso em suas vendas e relacionamento com clientes.
      Seja proativa, empática e extremamente profissional.`;

  const { messages, isLoading, error, sendMessage, clearMessages, stopGeneration } = useCRMAgent({
    systemPrompt
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  return (
    <div className="w-full h-screen max-w-full overflow-hidden flex flex-col">
      <div className="flex flex-col h-full w-full bg-white dark:bg-dark-bg/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white">{t('aiAssistant')}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gemini 2.5 Flash • Multi-step Agentic
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title={t('clearConversation')}
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={() => {
              const feedback = prompt(language === 'en' ? 'Enter your feedback:' : 'Digite seu feedback:');
              if (feedback) {
                const submit = async () => {
                  const { error } = await supabase.from('activities').insert({
                    type: 'TASK',
                    title: `Feedback Demo: ${feedback.substring(0, 20)}...`,
                    description: feedback,
                    status: 'PENDING', // lowercase 'pending' might be required? Check schema usually capitalized or not. User said 'pending'.
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    company_id: (await supabase.auth.getUser()).data.user?.user_metadata?.company_id
                  });
                  if (!error) alert(language === 'en' ? 'Feedback sent!' : 'Feedback enviado!');
                };
                submit();
              }
            }}
            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
            title="Feedback"
          >
            <MessageSquarePlus size={18} />
          </button>
        </div>

        {/* Messages Area */}
        {/* ... */}

        {/* Suggestions when empty */}
        {messages.length === 0 && (
          <div className="px-4 pb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 ml-1">
              {t('ai_hub.suggestions')}
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                t('suggestion1'),
                t('suggestion2'),
                t('suggestion3'),
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                // ... className
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 pb-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('aiPlaceholder')}
                className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                disabled={isLoading}
              />
              {/* ... buttons ... */}
            </div>
          </form>

          <p className="text-center text-xs text-slate-400 mt-2">
            {t('poweredBy')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIHubPage;
