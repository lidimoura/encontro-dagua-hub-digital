import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, StopCircle, Trash2 } from 'lucide-react';
import { useCRMAgent, AgentMessage } from './hooks/useCRMAgent';

// Componente de mensagem individual
const ChatMessage: React.FC<{ message: AgentMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
        ? 'bg-primary-500 text-white'
        : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
        }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Conteúdo */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl ${isUser
          ? 'bg-primary-500 text-white rounded-br-md'
          : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-bl-md'
          }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

// Indicador de digitação
const TypingIndicator: React.FC = () => (
  <div className="flex gap-3">
    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
      <Bot size={16} />
    </div>
    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// Welcome message
const WelcomeMessage: React.FC = () => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mb-4">
      <Sparkles size={32} />
    </div>
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
      Olá! Sou seu assistente de CRM
    </h2>
    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
      Posso ajudar você a gerenciar deals, atividades, contatos e muito mais.
      Experimente perguntar algo!
    </p>
    <div className="flex flex-wrap justify-center gap-2">
      {[
        'O que tenho pra fazer hoje?',
        'Mostre meu pipeline',
        'Quais deals estão parados?',
        'Crie uma reunião com Stark amanhã às 14h',
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

export const AIHubPage: React.FC = () => {
  const { messages, isLoading, error, sendMessage, clearMessages, stopGeneration } = useCRMAgent();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Foco no input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInput('');
    await sendMessage(suggestion);
  };

  return (
    <div className="p-4 md:p-6 h-full">
      <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-120px)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white">AI Assistant</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gemini 2.5 Flash • Multi-step Agentic
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="Limpar conversa"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <TypingIndicator />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mb-4 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error.message}
          </div>
        )}

        {/* Suggestions when empty */}
        {messages.length === 0 && (
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'O que tenho pra fazer hoje?',
                'Mostre meu pipeline',
                'Quais deals estão parados?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-white/5 hover:bg-primary-100 dark:hover:bg-primary-500/20 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full transition-colors border border-transparent hover:border-primary-300 dark:hover:border-primary-500/30"
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
                placeholder="Pergunte algo sobre seu CRM..."
                className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                disabled={isLoading}
              />

              {isLoading ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="m-1.5 p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                >
                  <StopCircle size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="m-1.5 p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-xs text-slate-400 mt-2">
            Powered by Gemini 2.5 Flash • Respostas podem conter imprecisões
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIHubPage;
