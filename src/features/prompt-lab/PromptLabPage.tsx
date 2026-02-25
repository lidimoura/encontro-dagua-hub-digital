import React, { useState, useEffect } from 'react';
import { Wand2, Copy, Check, Sparkles, Loader2, Trash2, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase/client';

type Persona = 'software-engineer' | 'product-manager' | 'data-scientist' | 'designer' | 'marketer' | 'teacher' | 'bot-architect' | 'llm-trainer' | 'web-architect';

interface PersonaOption {
    value: Persona;
    label: string;
    description: string;
}

export const PromptLabPage: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();

    // Moved PERSONAS inside to use translation
    const PERSONAS: PersonaOption[] = [
        { value: 'software-engineer', label: `👨‍💻 ${t('softwareEngineer')}`, description: 'Code, architecture, debugging' },
        { value: 'product-manager', label: `📊 ${t('productManager')}`, description: 'Roadmap, features, stakeholders' },
        { value: 'data-scientist', label: `📈 ${t('dataScientist')}`, description: 'Analysis, ML, insights' },
        { value: 'designer', label: `🎨 ${t('designer')}`, description: 'UI/UX, prototyping, visual' },
        { value: 'marketer', label: `📈 ${t('marketer')}`, description: 'Campaigns, strategy, growth' },
        { value: 'teacher', label: `👩‍🏫 ${t('teacher')}`, description: 'Education, didactics, content' },
        { value: 'bot-architect', label: `🤖 ${t('botArchitect')}`, description: 'AI Agent structure and flows' },
        { value: 'llm-trainer', label: `🧠 ${t('llmTrainer')}`, description: 'System Prompts for Custom LLMs' },
        { value: 'web-architect', label: `🌐 ${t('webArchitect')}`, description: 'Scope and code (HTML/Tailwind)' },
    ];

    const [rawIdea, setRawIdea] = useState('');
    const [selectedPersona, setSelectedPersona] = useState<Persona>('software-engineer');
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Save functionality
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saveTags, setSaveTags] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [savedPrompts, setSavedPrompts] = useState<any[]>([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);

    // Test/Feedback functionality
    const [isTesting, setIsTesting] = useState(false);
    const [testResponse, setTestResponse] = useState('');
    const [showTestResponse, setShowTestResponse] = useState(false);
    const [currentFeedbackId, setCurrentFeedbackId] = useState<string | null>(null);
    const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);


    const handleOptimize = async () => {
        if (!rawIdea.trim()) {
            showToast(t('insertIdeaFirst'), 'error');
            return;
        }

        setIsOptimizing(true);
        setOptimizedPrompt('');

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error(t('apiKeyMissing'));
            }

            const genAI = new GoogleGenerativeAI(apiKey);

            // Try gemini-2.5-flash-lite first, fallback to gemini-1.5-flash
            let model;
            try {
                model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
            } catch {
                model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            }

            const personaContext = PERSONAS.find(p => p.value === selectedPersona);

            const systemPrompt = `Atue como um Engenheiro de Prompt Sênior especializado em otimização de prompts para LLMs.

Sua missão é transformar ideias brutas em prompts estruturados, detalhados e prontos para obter o melhor resultado de uma LLM.

CONTEXTO DO USUÁRIO:
O usuário está pedindo ajuda na área de: ${personaContext?.label} (${personaContext?.description})

REGRAS DE OTIMIZAÇÃO:
1. Seja específico e detalhado
2. Defina claramente o papel/persona que a IA deve assumir
3. Especifique o formato de saída desejado
4. Inclua exemplos quando relevante
5. Adicione restrições e requisitos importantes
6. Use linguagem clara e objetiva
7. Estruture o prompt em seções quando necessário

FORMATO DE SAÍDA:
Retorne APENAS o prompt otimizado, sem explicações adicionais ou meta-comentários.
O prompt deve estar pronto para ser copiado e colado diretamente em uma LLM.

IDEIA BRUTA DO USUÁRIO:
${rawIdea}

Agora, gere o prompt perfeito:`;

            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text().trim();

            setOptimizedPrompt(text);
            showToast(t('promptOptimizedSuccess'), 'success');
        } catch (error) {
            console.error('Erro ao otimizar prompt:', error);
            showToast(t('errorOptimizing'), 'error');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleCopy = async () => {
        if (!optimizedPrompt) return;

        try {
            await navigator.clipboard.writeText(optimizedPrompt);
            setCopied(true);
            showToast(t('promptCopied'), 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            showToast(t('errorCopying'), 'error');
        }
    };

    const fetchSavedPrompts = async () => {
        setIsLoadingSaved(true);
        try {
            const { data, error } = await supabase
                .from('saved_prompts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSavedPrompts(data || []);
        } catch (error) {
            console.error('Erro ao carregar prompts salvos:', error);
            showToast(t('errorLoadingPrompts'), 'error');
        } finally {
            setIsLoadingSaved(false);
        }
    };

    const handleSavePrompt = async () => {
        if (!saveTitle.trim()) {
            showToast(t('insertTitle'), 'error');
            return;
        }

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast(t('loginRequired'), 'error');
                return;
            }

            const tagsArray = saveTags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const { error } = await supabase
                .from('saved_prompts')
                .insert([{
                    user_id: user.id,
                    title: saveTitle,
                    raw_idea: rawIdea,
                    optimized_prompt: optimizedPrompt,
                    persona: selectedPersona,
                    tags: tagsArray,
                }]);

            if (error) throw error;

            showToast(t('promptSavedSuccess'), 'success');
            setShowSaveModal(false);
            setSaveTitle('');
            setSaveTags('');
            fetchSavedPrompts(); // Reload list
        } catch (error) {
            console.error('Erro ao salvar prompt:', error);
            showToast(t('errorSaving'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePrompt = async (id: string) => {
        if (!confirm(t('confirmDeletePrompt'))) return;

        try {
            const { error } = await supabase
                .from('saved_prompts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast(t('promptDeleted'), 'success');
            fetchSavedPrompts();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            showToast(t('errorDeleting'), 'error');
        }
    };

    const loadSavedPrompt = (prompt: any) => {
        setRawIdea(prompt.raw_idea);
        setOptimizedPrompt(prompt.optimized_prompt);
        setSelectedPersona(prompt.persona);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(t('promptLoaded'), 'success');
    };

    const handleTestPrompt = async () => {
        if (!optimizedPrompt.trim()) {
            showToast(t('optimizeFirst'), 'error');
            return;
        }

        setIsTesting(true);
        setTestResponse('');
        setShowTestResponse(true);
        setFeedbackGiven(null);
        setCurrentFeedbackId(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error(t('apiKeyMissing'));

            const genAI = new GoogleGenerativeAI(apiKey);
            let model;
            try {
                model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
            } catch {
                model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            }

            // Use the optimized prompt to generate a response
            const result = await model.generateContent(optimizedPrompt);
            const response = await result.response;
            const text = response.text().trim();

            setTestResponse(text);

            // Save test interaction to database
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('prompt_feedback')
                    .insert([{
                        user_id: user.id,
                        raw_idea: rawIdea,
                        optimized_prompt: optimizedPrompt,
                        ai_response: text,
                        persona: selectedPersona,
                        is_useful: null, // Will be updated when user gives feedback
                    }])
                    .select()
                    .single();

                if (!error && data) {
                    setCurrentFeedbackId(data.id);
                }
            }

            showToast(t('testCompleted'), 'success');
        } catch (error) {
            console.error('Erro ao testar:', error);
            showToast(t('errorTesting'), 'error');
        } finally {
            setIsTesting(false);
        }
    };

    const handleFeedback = async (isUseful: boolean) => {
        if (!currentFeedbackId) {
            showToast(t('errorFeedback'), 'error');
            return;
        }

        try {
            const { error } = await supabase
                .from('prompt_feedback')
                .update({ is_useful: isUseful })
                .eq('id', currentFeedbackId);

            if (error) throw error;

            setFeedbackGiven(isUseful);
            showToast(isUseful ? t('feedbackPositive') : t('feedbackNegative'), 'success');
        } catch (error) {
            console.error('Erro ao salvar feedback:', error);
            showToast(t('errorFeedback'), 'error');
        }
    };

    // Load saved prompts on mount
    useEffect(() => {
        fetchSavedPrompts();
    }, []);


    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-600/30">
                        <Wand2 className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Prompt Lab
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    {t('promptLabSubtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-purple-400/20 dark:border-purple-400/10 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            {t('yourRawIdea')}
                        </h2>

                        {/* Persona Selector */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                {t('areaOfExpertise')}
                            </label>
                            <select
                                value={selectedPersona}
                                onChange={(e) => setSelectedPersona(e.target.value as Persona)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900 dark:text-white transition-all"
                            >
                                {PERSONAS.map((persona) => (
                                    <option key={persona.value} value={persona.value}>
                                        {persona.label} - {persona.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Raw Idea Input */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                {t('describeIdea')}
                            </label>
                            <textarea
                                value={rawIdea}
                                onChange={(e) => setRawIdea(e.target.value)}
                                rows={12}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all resize-none font-mono text-sm"
                                placeholder={t('inputPlaceholder')}
                            />
                        </div>

                        {/* Optimize Button */}
                        <button
                            onClick={handleOptimize}
                            disabled={isOptimizing || !rawIdea.trim()}
                            className="w-full mt-4 flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg shadow-purple-600/30 font-bold hover:shadow-xl hover:shadow-purple-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {isOptimizing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('optimizing')}
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    {t('optimizePrompt')}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-green-400/20 dark:border-green-400/10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                {t('optimizedPrompt')}
                            </h2>
                            {optimizedPrompt && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {t('copied')}
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                {t('copy')}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowSaveModal(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        {t('save')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            {optimizedPrompt ? (
                                <>
                                    <div className="bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                                        <pre className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap font-mono leading-relaxed">
                                            {optimizedPrompt}
                                        </pre>
                                    </div>

                                    {/* Test Prompt Button */}
                                    <button
                                        onClick={handleTestPrompt}
                                        disabled={isTesting}
                                        className="w-full mt-4 flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-blue-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isTesting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {t('testing')}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>

                                                {t('testPrompt')}
                                            </>
                                        )}
                                    </button>

                                    {/* AI Response Section */}
                                    {showTestResponse && (
                                        <div className="mt-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-500/40 rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5" />
                                                    {t('aiResponse')}
                                                </h3>

                                                {/* Copy and Save buttons for AI Response */}
                                                {testResponse && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                await navigator.clipboard.writeText(testResponse);
                                                                showToast('Resposta copiada!', 'success');
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                            {t('copy')}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowSaveModal(true)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                            </svg>
                                                            {t('save')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {testResponse ? (
                                                <>
                                                    <div className="bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-4 max-h-[400px] overflow-y-auto shadow-inner">
                                                        <pre className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed font-sans">
                                                            {testResponse}
                                                        </pre>
                                                    </div>

                                                    {/* Feedback Buttons */}
                                                    {feedbackGiven === null ? (
                                                        <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 rounded-lg p-3">
                                                            <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold">
                                                                {t('wasThisUseful')}
                                                            </p>
                                                            <button
                                                                onClick={() => handleFeedback(true)}
                                                                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                                                            >
                                                                👍 Útil
                                                            </button>
                                                            <button
                                                                onClick={() => handleFeedback(false)}
                                                                className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                                                            >
                                                                👎 Não Útil
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-green-800 dark:text-green-300 font-semibold bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center">
                                                            ✅ {t('feedbackRegistered')}
                                                        </div>
                                                    )}
                                                </>
                                            ) : null}
                                        </div>
                                    )}

                                </>
                            ) : (
                                <div className="bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg p-4 min-h-[400px] flex flex-col items-center justify-center text-center">
                                    <Wand2 className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                                    <p className="text-slate-400 dark:text-slate-600 text-sm">
                                        {t('promptPlaceholderTitle')}
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-600 text-xs mt-2">
                                        {t('promptPlaceholderDesc')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                        <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
                            💡 Dicas para melhores resultados
                        </h3>
                        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                            <li>• Seja específico sobre o que você quer</li>
                            <li>• Mencione o contexto e restrições importantes</li>
                            <li>• Indique o formato de saída desejado</li>
                            <li>• Escolha a persona mais adequada ao seu objetivo</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Saved Prompts Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    📚 Prompts Salvos
                </h2>

                {
                    isLoadingSaved ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Carregando...</p>
                        </div>
                    ) : savedPrompts.length === 0 ? (
                        <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-purple-400/20 dark:border-purple-400/10 p-12 text-center">
                            <Wand2 className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">
                                {t('noPromptsSaved')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savedPrompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    className="bg-white dark:bg-rionegro-900 rounded-xl shadow-lg border border-purple-400/20 dark:border-purple-400/10 p-4 hover:shadow-xl transition-shadow cursor-pointer"
                                    onClick={() => loadSavedPrompt(prompt)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex-1">
                                            {prompt.title}
                                        </h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePrompt(prompt.id);
                                            }}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                        {PERSONAS.find(p => p.value === prompt.persona)?.label}
                                    </p>
                                    {prompt.tags && prompt.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {prompt.tags.map((tag: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-400 rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                }
            </div >

            {/* Save Modal */}
            {
                showSaveModal && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={() => setShowSaveModal(false)} />
                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('savePrompt')}</h3>
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        {t('titleRequired')}
                                    </label>
                                    <input
                                        type="text"
                                        value={saveTitle}
                                        onChange={(e) => setSaveTitle(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900 dark:text-white"
                                        placeholder={t('titleRequired')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        {t('tags')}
                                    </label>
                                    <input
                                        type="text"
                                        value={saveTags}
                                        onChange={(e) => setSaveTags(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900 dark:text-white"
                                        placeholder={t('tagsPlaceholder')}
                                    />
                                </div>
                                <button
                                    onClick={handleSavePrompt}
                                    disabled={isSaving || !saveTitle.trim()}
                                    className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? t('saving') : t('save')}
                                </button>
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    );
};

export default PromptLabPage;
