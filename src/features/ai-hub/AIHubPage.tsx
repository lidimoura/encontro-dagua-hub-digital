import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCRMAgent } from '@/features/ai-hub/hooks/useCRMAgent';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase/client';
import {
  Sparkles, Bot, Trash2, Send, MessageSquarePlus, Square, User, Wrench,
} from 'lucide-react';

// ─── Welcome / Empty State ───────────────────────────────────────────────────
const WelcomeMessage: React.FC<{ onSuggestion: (s: string) => void }> = ({ onSuggestion }) => {
  const { t } = useTranslation();
  const suggestions = [
    t('suggestion1'),
    t('suggestion2'),
    t('suggestion3'),
    t('suggestion4'),
  ];

  return (
    <div className="text-center py-16 px-4 flex flex-col items-center justify-center h-full">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mb-4 shadow-lg shadow-violet-500/30">
        <Sparkles size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {t('aiWelcomeTitle')}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm">
        {t('aiWelcomeDesc')}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.filter(Boolean).map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestion(suggestion)}
            className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-white/5 hover:bg-violet-100 dark:hover:bg-violet-900/20 text-slate-700 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300 rounded-full transition-colors border border-slate-200 dark:border-white/10"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ role: string; content: string; isStreaming?: boolean }> = ({ role, content, isStreaming }) => {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) return null;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
        ${isUser ? 'bg-primary-500 text-white' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ring-1
          ${isUser
            ? 'bg-primary-600 text-white rounded-br-sm ring-primary-500/30'
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm ring-slate-200/60 dark:ring-white/10'}`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-0.5 prose-pre:bg-black/10 dark:prose-pre:bg-white/5 prose-pre:text-xs prose-code:text-purple-600 dark:prose-code:text-purple-300 prose-code:bg-purple-50 dark:prose-code:bg-purple-900/20 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-violet-500 animate-pulse rounded-sm ml-1 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AIHubPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, error, sendMessage, clearMessages, stopGeneration } = useCRMAgent({
    id: 'ai-hub-main',
  });

  // Auto scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
    // Re-focus after send
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [input, isLoading, sendMessage]);

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    if (isLoading) return;
    await sendMessage(suggestion);
  }, [isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleFeedback = async () => {
    const feedback = prompt(language === 'en' ? 'Enter your feedback:' : 'Digite seu feedback:');
    if (!feedback) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('activities').insert({
      type: 'TASK',
      title: `Feedback: ${feedback.substring(0, 40)}`,
      description: feedback,
      company_id: user?.user_metadata?.company_id,
    });
    alert(language === 'en' ? 'Feedback sent! Thank you.' : 'Feedback enviado! Obrigado.');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-dark-bg/50 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-sm">{t('aiAssistant')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
              {isLoading ? (language === 'pt' ? 'Pensando…' : 'Thinking…') : 'Gemini 2.5 Flash'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title={t('clearConversation')}
            >
              <Trash2 size={17} />
            </button>
          )}
          <button
            onClick={handleFeedback}
            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
            title="Feedback"
          >
            <MessageSquarePlus size={17} />
          </button>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-0 scroll-smooth">
        {messages.length === 0 ? (
          <WelcomeMessage onSuggestion={handleSuggestionClick} />
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isStreaming = isLoading && idx === messages.length - 1 && msg.role === 'assistant';
              return (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming}
                />
              );
            })}
          </>
        )}
        {/* Loading indicator when AI hasn't started streaming yet */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
              <Bot size={14} />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm ring-1 ring-slate-200/60 dark:ring-white/10">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-auto max-w-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">⚠️ {error.message}</p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* ── Input Area ── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/40 focus-within:border-violet-500 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('aiPlaceholder') || (language === 'pt' ? 'Pergunte ao Mazô...' : 'Ask Mazô anything...')}
              className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm"
              disabled={isLoading}
            />

            {isLoading ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="m-1.5 p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Parar geração"
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="m-1.5 p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-violet-500/30"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2">
          {t('poweredBy') || 'Powered by Google Gemini'}
        </p>
      </div>
    </div>
  );
};

export default AIHubPage;
