import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Scale, FileText, Download, Eye, Copy, CheckCircle, Sparkles, AlertCircle, Loader2, Globe, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useDealContext } from '@/context/DealContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/services/ai/bilingualService';
import { useCRMAgent } from '@/features/ai-hub/hooks/useCRMAgent'; // Import AI Hook
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';

interface JuryAgentProps {
    boardId: string;
    dealId?: string;
}

interface ContractTemplate {
    id: string;
    title: string;
    description: string | null;
    content: string;
    category: string | null;
    tags: string[];
}

type Jurisdiction = 'BR' | 'US' | 'AU' | 'EU';

export const JuryAgent: React.FC<JuryAgentProps> = ({ boardId, dealId }) => {
    const [generatedContract, setGeneratedContract] = useState('');
    const { addToast } = useToast();
    const { t } = useTranslation();
    const dealContext = useDealContext();
    const { language } = useLanguage();
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

    // Jurisdiction State
    const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('BR');

    // AI Refinement State
    const [isRefinementOpen, setIsRefinementOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // AI System Prompt - DYNAMICALLY UPDATED
    const systemPrompt = useMemo(() => {
        const langInstruction = language === 'en'
            ? 'Respond in English.'
            : 'Responda em Português.';

        const jurisdictionInstruction = {
            'BR': 'Focus on Brazilian Law (LGPD, Código Civil, CLT/PJ).',
            'US': 'Focus on US Law (Common Law, UCC).',
            'AU': 'Focus on Australian Law (Consumer Law, Privacy Act).',
            'EU': 'Focus on EU Law (GDPR, EU Directives).',
        }[jurisdiction];

        // Include current contract context if available
        const contractContext = generatedContract
            ? `\nCURRENT CONTRACT DRAFT:\n\`\`\`\n${generatedContract.substring(0, 5000)}...\n\`\`\`\nUser may ask to refine specific clauses.`
            : '';

        return `You are Jury, an expert Legal AI Agent specialized in contracts and commercial law.
        ${langInstruction}
        ${jurisdictionInstruction}
        Your goal is to help the user refine contract clauses, explain legal terms, and ensure compliance.
        Be precise, formal, but accessible. Always prioritize the user's protection.
        If asked to draft a clause, provide it clearly.
        IMPORTANT: Format your response using Markdown. Use ## for titles, **bold** for emphasis, and > for quoting clauses. Structure it like a professional legal document.
        OUTPUT FORMAT: You must write the contract using Markdown. Use # for Titles, ## for Clauses, **bold** for variables. DO NOT output code blocks. Output raw markdown text.
        ${contractContext}`;
    }, [language, jurisdiction, generatedContract]);

    // Initialize AI Agent
    const { messages, input, handleInputChange, handleSubmit, isLoading: isAILoading } = useCRMAgent({
        systemPrompt
    });

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isRefinementOpen]);


    // Contract type
    const [contractType, setContractType] = useState<'simple' | 'complete'>('complete');

    // Client data
    const [clientName, setClientName] = useState('');
    const [clientCpfCnpj, setClientCpfCnpj] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [value, setValue] = useState('');

    // Hub contractor data
    const [hubPersonType, setHubPersonType] = useState<'PF' | 'PJ'>('PF');
    const [hubName, setHubName] = useState('Lidiany Moura');
    const [hubCpf, setHubCpf] = useState('');
    const [hubCnpj, setHubCnpj] = useState('');
    const [hubAddress, setHubAddress] = useState('');

    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);

    useEffect(() => {
        fetchContractTemplates();
    }, []);

    const fetchContractTemplates = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('library_assets')
                .select('*')
                .eq('asset_type', 'contract')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error: any) {
            console.error('Error fetching contract templates:', error);
            addToast(t('errorLoadingPrompts'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateContract = async () => {
        if (!selectedTemplate || !clientName) {
            addToast(t('fillClientName'), 'error');
            return;
        }

        // Construct the Prompt for the AI
        const prompt = `
        ACT AS: Jury, Expert Legal AI.
        TASK: Draft a **${selectedTemplate.title}** (${contractType === 'simple' ? 'Simple Version' : 'Comprehensive Version'}).
        
        **PARTIES:**
        - **CONTRACTOR (The Hub):** ${hubName} (${hubPersonType}, CPF/CNPJ: ${hubPersonType === 'PF' ? hubCpf : hubCnpj}, Address: ${hubAddress})
        - **CLIENT:** ${clientName} (CPF/CNPJ: ${clientCpfCnpj})
        
        **PROJECT DETAILS:**
        - **Description:** ${projectDescription}
        - **Value:** ${value}
        
        **REQUIREMENTS:**
        1. Jurisdiction: **${jurisdiction}** (${jurisdiction === 'BR' ? 'Portuguese/Brazilian Law' : 'English/International Law'}).
        2. Format: Markdown (Use ## for Clauses).
        3. Tone: Professional, protective but fair.
        4. ${contractType === 'simple' ? 'Keep it concise (1-2 pages).' : 'Include all standard clauses (Indemnification, Confidentiality, Termination).'}
        
        **OUTPUT:**
        Generate the FULL contract text now.
        `;

        // Send to AI
        await sendMessage(prompt);
        setShowPreview(true);
    };

    // Effect: Update generatedContract when AI responds
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            setGeneratedContract(lastMessage.content);
        }
    }, [messages]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContract);
        setCopied(true);
        addToast(t('contractExported'), 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const exportToPDF = async () => {
        if (!generatedContract) return;

        setExportingPDF(true);
        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Professional formatting
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // Configure font for UTF-8 support (Standard fonts have limited support, but we try best effort)
            // Ideally, we would load a custom font, but for now we stick to standard.
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);

            const title = t('serviceContract');
            pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Contract content
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);

            // Replace special chars that might break (sanity check)
            const safeText = generatedContract.replace(/[^\x00-\xFF\u00C0-\u00FF\u0100-\u017F]/g, " ");

            const lines = pdf.splitTextToSize(safeText, contentWidth);

            for (let i = 0; i < lines.length; i++) {
                if (yPosition > pageHeight - 30) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(lines[i], margin, yPosition);
                yPosition += 6;
            }

            // Quote data from Precy (if available)
            if (dealContext?.quoteData) {
                const quote = dealContext.quoteData;
                yPosition += 10;

                if (yPosition > pageHeight - 50) {
                    pdf.addPage();
                    yPosition = margin;
                }

                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(12);
                pdf.text(t('pricingBreakdown'), margin, yPosition);
                yPosition += 8;

                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.text(`${t('totalCost')}: ${formatCurrency(quote.totalCost, language)}`, margin, yPosition);
                yPosition += 6;
                pdf.text(`${t('revenue')}: ${formatCurrency(quote.revenue, language)}`, margin, yPosition);
                yPosition += 6;
                pdf.text(`${t('profitMargin')}: ${quote.marginPercentage.toFixed(1)}%`, margin, yPosition);
                yPosition += 6;
                if (quote.roi) {
                    pdf.text(`ROI: ${quote.roi.percentage.toFixed(1)}%`, margin, yPosition);
                    yPosition += 10;
                }
            }

            // Signature section
            if (yPosition > pageHeight - 80) {
                pdf.addPage();
                yPosition = margin;
            }

            yPosition += 10;
            pdf.setFont('times', 'normal');
            pdf.setFontSize(10);

            const dateText = `${language === 'en' ? 'Date' : 'Data'}: ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}`;
            pdf.text(dateText, margin, yPosition);
            yPosition += 20;

            // Client signature
            pdf.line(margin, yPosition, margin + 70, yPosition);
            yPosition += 6;
            pdf.text(t('clientSignature'), margin, yPosition);

            // Contractor signature
            const contractorX = pageWidth - margin - 70;
            pdf.line(contractorX, yPosition - 6, contractorX + 70, yPosition - 6);
            pdf.text(t('contractorSignature'), contractorX, yPosition);

            // Save PDF
            const filename = `contract_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);

            addToast(t('contractExported'), 'success');
        } catch (error: any) {
            console.error('PDF export error:', error);
            addToast(error.message || 'Failed to export PDF', 'error');
        } finally {
            setExportingPDF(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-purple-600" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {t('contractGenerator')}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t('legalAssistant')}
                        </p>
                    </div>
                </div>

                {/* Refinement Chat Toggle */}
                <button
                    onClick={() => setIsRefinementOpen(!isRefinementOpen)}
                    className={`p-2 rounded-full transition-all ${isRefinementOpen ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-100'}`}
                    title={t('openLegalChat')}
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
            </div>

            {/* Jurisdiction Selector */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-purple-500" />
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'en' ? 'Jurisdiction / Region' : 'Jurisdição / Região'}
                    </label>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(['BR', 'US', 'AU', 'EU'] as Jurisdiction[]).map((region) => (
                        <button
                            key={region}
                            onClick={() => setJurisdiction(region)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${jurisdiction === region
                                ? 'bg-purple-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
                                }`}
                        >
                            <span>{region === 'BR' ? '🇧🇷' : region === 'US' ? '🇺🇸' : region === 'AU' ? '🇦🇺' : '🇪🇺'}</span>
                            {region === 'BR' ? 'Brasil' : region === 'US' ? 'USA' : region === 'AU' ? 'Australia' : 'Europe'}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {language === 'en'
                        ? 'Jury will adapt clauses and analysis based on selected laws.'
                        : 'Jury adaptará cláusulas e análises com base nas leis selecionadas.'}
                </p>
            </div>

            {/* AI Refinement Chat Panel */}
            {isRefinementOpen && (
                <div className="mb-6 bg-white dark:bg-rionegro-900 border-2 border-purple-500/50 rounded-xl overflow-hidden shadow-xl animate-fade-in-up">
                    <div className="bg-purple-50 dark:bg-purple-900/30 p-3 border-b border-purple-100 dark:border-purple-800 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            {language === 'en' ? 'Jury AI Assistant' : 'Assistente Jury IA'}
                        </h4>
                        <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full">
                            {jurisdiction} Law
                        </span>
                    </div>

                    <div className="h-64 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#02040a]">
                        {messages.length === 0 && (
                            <p className="text-center text-sm text-slate-500 py-4">
                                {language === 'en'
                                    ? 'Ask Jury to draft a clause or explain a legal term...'
                                    : 'Peça ao Jury para redigir uma cláusula ou explicar um termo jurídico...'}
                            </p>
                        )}
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-sm relative ${m.role === 'user'
                                    ? 'bg-purple-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                                    }`}>
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                    {m.role === 'assistant' && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(m.content);
                                                addToast('Texto copiado!', 'success');
                                            }}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 text-slate-500 transition-opacity"
                                            title="Copy"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isAILoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg rounded-bl-none border border-slate-200 dark:border-slate-700">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-3 bg-white dark:bg-rionegro-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                        <input
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e as any);
                                }
                            }}
                            placeholder={language === 'en' ? 'Type your legal question...' : 'Digite sua dúvida jurídica...'}
                            className="flex-1 text-sm px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                            onClick={(e) => handleSubmit(e as any)}
                            disabled={isAILoading || !input?.trim()}
                            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Template Selection */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'en' ? 'Select Template' : 'Selecione o Template'}
                </label>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-sm text-slate-500 mt-2">{language === 'en' ? 'Loading templates...' : 'Carregando templates...'}</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                        <FileText className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            {language === 'en' ? 'No contract templates found in library.' : 'Nenhum template de contrato encontrado na biblioteca.'}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                            {language === 'en' ? 'Add templates in Library page (type: Contract)' : 'Adicione templates na página de Biblioteca (tipo: Contrato)'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                className={`text-left p-4 rounded-lg border-2 transition-all ${selectedTemplate?.id === template.id
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-slate-200 dark:border-rionegro-800 bg-white dark:bg-rionegro-900 hover:border-purple-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                                            {template.title}
                                        </h4>
                                        {template.description && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {template.description}
                                            </p>
                                        )}
                                        {template.tags && template.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {template.tags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {selectedTemplate?.id === template.id && (
                                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 ml-2" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Contract Data Form */}
            {
                selectedTemplate && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 space-y-4">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            {language === 'en' ? 'Contract Data' : 'Dados do Contrato'}
                        </h4>

                        {/* Contract Type Toggle */}
                        <div className="flex items-center gap-4 pb-4 border-b border-purple-200 dark:border-purple-700">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{language === 'en' ? 'Contract Type:' : 'Tipo de Contrato:'}</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setContractType('simple')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${contractType === 'simple'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-purple-400'
                                        }`}
                                >
                                    {language === 'en' ? 'Simple' : 'Simples'}
                                </button>
                                <button
                                    onClick={() => setContractType('complete')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${contractType === 'complete'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-purple-400'
                                        }`}
                                >
                                    {language === 'en' ? 'Complete' : 'Completo'}
                                </button>
                            </div>
                        </div>

                        {/* Hub Contractor Data */}
                        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg p-4 space-y-3">
                            <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{language === 'en' ? 'Contractor Data (Hub)' : 'Dados do Contratante (Hub)'}</h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Person Type */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{language === 'en' ? 'Person Type' : 'Tipo de Pessoa'}</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setHubPersonType('PF')}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${hubPersonType === 'PF'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                                                }`}
                                        >
                                            PF
                                        </button>
                                        <button
                                            onClick={() => setHubPersonType('PJ')}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${hubPersonType === 'PJ'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                                                }`}
                                        >
                                            PJ
                                        </button>
                                    </div>
                                </div>

                                {/* Hub Name */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {hubPersonType === 'PJ' ? (language === 'en' ? 'Business Name' : 'Razão Social') : (language === 'en' ? 'Full Name' : 'Nome Completo')}
                                    </label>
                                    <input
                                        type="text"
                                        value={hubName}
                                        onChange={(e) => setHubName(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500"
                                        placeholder="Ex: Lidiany Moura"
                                    />
                                </div>

                                {/* CPF or CNPJ */}
                                {hubPersonType === 'PF' ? (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">CPF</label>
                                        <input
                                            type="text"
                                            value={hubCpf}
                                            onChange={(e) => setHubCpf(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500"
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
                                        <input
                                            type="text"
                                            value={hubCnpj}
                                            onChange={(e) => setHubCnpj(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500"
                                            placeholder="00.000.000/0000-00"
                                        />
                                    </div>
                                )}

                                {/* Address */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{language === 'en' ? 'Address' : 'Endereço'}</label>
                                    <input
                                        type="text"
                                        value={hubAddress}
                                        onChange={(e) => setHubAddress(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500"
                                        placeholder={language === 'en' ? 'Street, Number, City - State' : 'Rua, Número, Cidade - UF'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Client Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {language === 'en' ? 'Client Name *' : 'Nome do Cliente *'}
                                </label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Ex: João Silva"
                                />
                            </div>

                            {/* CPF/CNPJ */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {language === 'en' ? 'Client CPF/CNPJ' : 'CPF/CNPJ do Cliente'}
                                </label>
                                <input
                                    type="text"
                                    value={clientCpfCnpj}
                                    onChange={(e) => setClientCpfCnpj(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Ex: 000.000.000-00"
                                />
                            </div>

                            {/* Project Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {language === 'en' ? 'Project Description' : 'Descrição do Projeto'}
                                </label>
                                <textarea
                                    value={projectDescription}
                                    onChange={(e) => setProjectDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder={language === 'en' ? 'Ex: Institutional website development with 5 pages...' : 'Ex: Desenvolvimento de site institucional com 5 páginas...'}
                                />
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {language === 'en' ? 'Value ($)' : 'Valor (R$)'}
                                </label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder={language === 'en' ? 'Ex: 5,000.00' : 'Ex: R$ 5.000,00'}
                                />
                            </div>
                        </div>

                        {/* Generate Button */}
                        {/* Generate Button */}
                        <button
                            onClick={generateContract}
                            disabled={!clientName || isAILoading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isAILoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {language === 'en' ? 'Drafting Contract...' : 'Redigindo Contrato...'}
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    {language === 'en' ? 'Generate Contract' : 'Gerar Contrato'}
                                </>
                            )}
                        </button>
                    </div>
                )
            }

            {/* Contract Preview */}
            {
                showPreview && generatedContract && (
                    <div className="bg-white dark:bg-rionegro-900 border-2 border-purple-500 rounded-xl p-6 space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-purple-600" />
                                {language === 'en' ? 'Contract Preview' : 'Preview do Contrato'}
                            </h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            {language === 'en' ? 'Copied!' : 'Copiado!'}
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            {language === 'en' ? 'Copy' : 'Copiar'}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    {language === 'en' ? 'Export PDF' : 'Exportar PDF'}
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                readOnly
                                value={generatedContract}
                                onClick={(e) => e.currentTarget.select()}
                                className="w-full h-96 p-4 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {language === 'en' ? '💡 Click on text to select all and copy easily' : '💡 Clique no texto para selecionar tudo e copiar facilmente'}
                            </p>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
