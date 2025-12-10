import React, { useState } from 'react';
import { Wand2, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useToast } from '@/context/ToastContext';

type Persona = 'software-engineer' | 'copywriter' | 'designer' | 'lawyer' | 'marketer' | 'teacher';

interface PersonaOption {
    value: Persona;
    label: string;
    description: string;
}

const PERSONAS: PersonaOption[] = [
    { value: 'software-engineer', label: '👨‍💻 Engenheiro de Software', description: 'Código, arquitetura, debugging' },
    { value: 'copywriter', label: '✍️ Copywriter', description: 'Textos persuasivos, vendas' },
    { value: 'designer', label: '🎨 Designer', description: 'UI/UX, branding, visual' },
    { value: 'lawyer', label: '⚖️ Advogado', description: 'Contratos, compliance, legal' },
    { value: 'marketer', label: '📈 Profissional de Marketing', description: 'Campanhas, estratégia, growth' },
    { value: 'teacher', label: '👩‍🏫 Professor', description: 'Educação, didática, conteúdo' },
];

export const PromptLabPage: React.FC = () => {
    const { showToast } = useToast();
    const [rawIdea, setRawIdea] = useState('');
    const [selectedPersona, setSelectedPersona] = useState<Persona>('software-engineer');
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleOptimize = async () => {
        if (!rawIdea.trim()) {
            showToast('Por favor, insira sua ideia primeiro', 'error');
            return;
        }

        setIsOptimizing(true);
        setOptimizedPrompt('');

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('API Key do Gemini não configurada');
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
            showToast('Prompt otimizado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao otimizar prompt:', error);
            showToast('Erro ao otimizar prompt. Verifique sua API Key.', 'error');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleCopy = async () => {
        if (!optimizedPrompt) return;

        try {
            await navigator.clipboard.writeText(optimizedPrompt);
            setCopied(true);
            showToast('Prompt copiado!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            showToast('Erro ao copiar', 'error');
        }
    };

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
                    Transforme ideias brutas em prompts perfeitos com IA
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-purple-400/20 dark:border-purple-400/10 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            Sua Ideia Bruta
                        </h2>

                        {/* Persona Selector */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Área de Atuação
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
                                Descreva sua ideia
                            </label>
                            <textarea
                                value={rawIdea}
                                onChange={(e) => setRawIdea(e.target.value)}
                                rows={12}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all resize-none font-mono text-sm"
                                placeholder="Ex: preciso criar um sistema de autenticação seguro com JWT e refresh tokens..."
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
                                    Otimizando...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    ✨ Otimizar Prompt
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
                                Prompt Otimizado
                            </h2>
                            {optimizedPrompt && (
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copiar
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            {optimizedPrompt ? (
                                <div className="bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                                    <pre className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap font-mono leading-relaxed">
                                        {optimizedPrompt}
                                    </pre>
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg p-4 min-h-[400px] flex flex-col items-center justify-center text-center">
                                    <Wand2 className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                                    <p className="text-slate-400 dark:text-slate-600 text-sm">
                                        Seu prompt otimizado aparecerá aqui
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-600 text-xs mt-2">
                                        Preencha sua ideia e clique em "Otimizar Prompt"
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
        </div>
    );
};

export default PromptLabPage;
