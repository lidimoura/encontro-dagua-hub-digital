import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Scale, FileText, Download, Eye, Copy, CheckCircle, Sparkles, AlertCircle, Loader2, Globe, MessageSquare, Send, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useDealContext } from '@/context/DealContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/services/ai/bilingualService';
import { useCRMAgent } from '@/features/ai-hub/hooks/useCRMAgent';
import { IS_DEMO, isDemoVisible } from '@/lib/appConfig';
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

type Jurisdiction = 'BR' | 'US' | 'AU' | 'EU' | 'CO' | 'PE' | 'AR' | 'MX' | 'CL' | 'UY';

export const JuryAgent: React.FC<JuryAgentProps> = ({ boardId, dealId }) => {
    const [generatedContract, setGeneratedContract] = useState('');
    const { addToast } = useToast();
    const { t } = useTranslation();
    const dealContext = useDealContext();
    const { profile } = useAuth();
    const { language } = useLanguage();
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

    // Jurisdiction State
    const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('BR');

    // AI Refinement Chat — CLOSED by default, opened via header toggle button
    const [isRefinementOpen, setIsRefinementOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // AI System Prompt - DYNAMICALLY UPDATED
    const systemPrompt = useMemo(() => {
        const langInstruction = language === 'en'
            ? 'Respond in English.'
            : 'Responda em Português.';

        const jurisdictionInstruction: Record<string, string> = {
            'BR': 'Focus on Brazilian Law (LGPD, Código Civil Brasileiro, CLT/PJ, Lei 9.609/98 para software).',
            'US': 'Focus on US Law (Common Law, UCC, CCPA for privacy, IP law for digital services).',
            'AU': 'Focus on Australian Consumer Law (ACL), Privacy Act 1988, and Digital Services contracts.',
            'EU': 'Focus on EU Law (GDPR, EU Directives on Digital Services, DSA, DMA).',
            'CO': 'Focus on Colombian Law (Ley 1581 for data protection, Código Civil, Digital Services regulations).',
            'PE': 'Focus on Peruvian Law (Ley 29733 for data protection, Código Civil Peruano).',
            'AR': 'Focus on Argentine Law (Ley 25.326 for data protection, Código Civil y Comercial).',
            'MX': 'Focus on Mexican Law (LFPDPPP data protection, Código Civil Federal, digital services).',
            'CL': 'Focus on Chilean Law (Ley 19.628 data protection, Código Civil Chileno).',
            'UY': 'Focus on Uruguayan Law (Ley 18.331 data protection, Código Civil Uruguayo).',
        };
        const instrText = jurisdictionInstruction[jurisdiction] || jurisdictionInstruction['BR'];

        // Include current contract context if available
        const contractContext = generatedContract
            ? `\nCURRENT CONTRACT DRAFT:\n\`\`\`\n${generatedContract.substring(0, 5000)}...\n\`\`\`\nUser may ask to refine specific clauses.`
            : '';

        return `You are Jury, an expert Legal AI Agent specialized in contracts and commercial law.
        ${langInstruction}
        ${instrText}
        ROLE: You are a LEGAL CONSULTANT FIRST. Before generating any contract:
        1. Ask clarifying questions to understand the deal scope, parties, jurisdiction nuances.
        2. Flag potential legal risks specific to the chosen jurisdiction.
        3. Only generate the formal document when the user confirms readiness.
        CHAT OUTPUT: Use this chat for dialogue, legal Q&A, risk analysis, and email summaries.
        CONTRACT AREA (below): ONLY formal contract text goes there — no greetings, no analysis, pure document.
        IMPORTANT: Format using Markdown. Use ## for clauses, **bold** for variables.
        ${contractContext}`;
    }, [language, jurisdiction, generatedContract]);

    // Initialize AI Agent
    const { messages, isLoading: isAILoading, sendMessage } = useCRMAgent({
        systemPrompt
    });

    const [input, setInput] = useState('');
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isAILoading) return;
        const msg = input;
        setInput('');
        await sendMessage(msg);
    };

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isRefinementOpen]);


    // Contract type
    const [contractType, setContractType] = useState<'simple' | 'complete'>('complete');

    // Client data
    const [clientName, setClientName] = useState('');
    const [clientCpfCnpj, setClientCpfCnpj] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [value, setValue] = useState('');

    // Hub contractor data
    const [hubPersonType, setHubPersonType] = useState<'PF' | 'PJ'>('PF');
    const [hubName, setHubName] = useState('Lidiany Moura');
    const [hubCpf, setHubCpf] = useState('');
    const [hubCnpj, setHubCnpj] = useState('');
    const [hubAddress, setHubAddress] = useState('');

    // Pre-fill from DealContext
    useEffect(() => {
        if (dealContext?.currentDeal) {
            const deal = dealContext.currentDeal as any; // Cast for extended props like contactName
            setClientName(deal.contactName || deal.title || '');
            // For Value, use formatted value if possible, or just the number
            setValue(deal.value ? `R$ ${deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '');
            setProjectDescription(`Projeto referente ao deal: ${deal.title}`);
        }
    }, [dealContext?.currentDeal]);

    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);
    const [savingToDeal, setSavingToDeal] = useState(false);
    const [savedToDeal, setSavedToDeal] = useState(false);

    // ── Deal Picker (for when Jury is opened outside a specific deal) ─────────
    const [availableDeals, setAvailableDeals] = useState<{ id: string; title: string; value?: number }[]>([]);
    const [selectedDealId, setSelectedDealId] = useState<string>(dealId || '');

    useEffect(() => {
        const fetchDeals = async () => {
            const { data } = await supabase
                .from('deals')
                .select('id, title, value, contact_id, contacts(email, phone, tags)')
                .order('created_at', { ascending: false })
                .limit(50);
            if (data) {
                // On DEMO branch, filter deals to only show test/QA data
                const filtered = IS_DEMO
                    ? data.filter((d: any) => {
                        const c = d.contacts as any;
                        return isDemoVisible({
                            email: c?.email,
                            phone: c?.phone,
                            tags: c?.tags,
                        });
                    })
                    : data;
                setAvailableDeals(filtered.map((d: any) => ({ id: d.id, title: d.title, value: d.value })));
            }
        };
        fetchDeals();
    }, []);

    // Keep selectedDealId in sync if dealId prop changes
    useEffect(() => {
        if (dealId) setSelectedDealId(dealId);
    }, [dealId]);
    // ─────────────────────────────────────────────────────────────────────────

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
        - **CLIENT:** ${clientName} (CPF/CNPJ: ${clientCpfCnpj}, Address: ${clientAddress})
        
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

        // Send to AI then mark that next response is a contract
        setContractGenerated(true);
        await sendMessage(prompt);
        setShowPreview(true);
    };

    // Contract-specific generation: separate from chat dialogue
    // Only update generatedContract when triggered by generateContract() (formal prompt)
    const [contractGenerated, setContractGenerated] = useState(false);
    useEffect(() => {
        if (!contractGenerated) return;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            setGeneratedContract(lastMessage.content);
            setContractGenerated(false);
        }
    }, [messages, contractGenerated]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContract);
        setCopied(true);
        addToast(t('contractExported'), 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const saveToDeal = async () => {
        const targetDealId = selectedDealId || dealId;
        if (!targetDealId || !generatedContract) return;
        setSavingToDeal(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Generate Summary for the Timeline (to make it readable)
            let summaryContent = '';
            try {
                const summaryPrompt = `Analise o contrato abaixo e crie um **RESUMO ESTRATÉGICO** em tópicos curtos para o corpo de um e-mail/timeline (Valor, Prazos, Entregas Principais). Máximo de 5 tópicos bala. \n\nCONTRATO:\n${generatedContract.substring(0, 4000)}`;
                await sendMessage(summaryPrompt); // This will add to the chat, we will pick up the last msg as summary later if we want, but for now we'll just let the user see it in the refinement chat and we save the full contract text + a note.

                // A better approach for the background summary is to just ask the AI directly, but we don't have a direct generate() method exposed in useCRMAgent.
                // So we will just save the full contract to the timeline, and the USER can ask Jury for the summary in the chat if they want.
                // Or we can save a generic title and tell the user they can use the Jury chat to summarize.
            } catch (e) {
                console.error("Error generating summary", e);
            }

            // 2. Client Enrichment: Save CPF/CNPJ and Address directly to the Contact Profile notes if available
            if (dealContext?.currentDeal?.contactId && (clientCpfCnpj || clientAddress)) {
                try {
                    const contactId = dealContext.currentDeal.contactId;
                    const { data: contact } = await supabase.from('contacts').select('notes').eq('id', contactId).single();
                    let newNotes = contact?.notes || '';
                    if (clientCpfCnpj && !newNotes.includes(clientCpfCnpj)) newNotes += `\nCPF/CNPJ: ${clientCpfCnpj}`;
                    if (clientAddress && !newNotes.includes(clientAddress)) newNotes += `\nEndereço: ${clientAddress}`;

                    await supabase.from('contacts').update({ notes: newNotes.trim() }).eq('id', contactId);
                } catch (e) {
                    console.error("Error enriching contact profile", e);
                }
            }

            // Save Full Contract as Note in Deal Timeline
            const { error } = await supabase
                .from('activities')
                .insert({
                    deal_id: targetDealId,
                    type: 'note',
                    title: language === 'en' ? `📄 Contract Generated: ${selectedTemplate?.title ?? 'Draft'}` : `📄 Contrato Gerado: ${selectedTemplate?.title ?? 'Rascunho'}`,
                    description: `**CONTRATO GERADO PELO JURY (IA)**\n\n---\n\n${generatedContract.substring(0, 8000)}`,
                    owner_id: user?.id || null,
                    company_id: profile?.company_id || null,
                    date: new Date().toISOString(),
                    completed: true,
                });
            if (error) throw error;
            setSavedToDeal(true);
            addToast(language === 'en' ? 'Contract saved to deal timeline!' : 'Contrato salvo na timeline do deal!', 'success');
            setTimeout(() => setSavedToDeal(false), 3000);
        } catch (err: any) {
            console.error('Save to deal error:', err);
            addToast(language === 'en' ? 'Failed to save contract.' : 'Erro ao salvar contrato.', 'error');
        } finally {
            setSavingToDeal(false);
        }
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isRefinementOpen ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}
                    title={isRefinementOpen ? 'Fechar Chat Jury' : 'Abrir Chat Jury'}
                >
                    <MessageSquare className="w-4 h-4" />
                    {isRefinementOpen ? 'Fechar Chat' : 'Abrir Chat Jury'}
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
                    {([
                        { code: 'BR', flag: '🇧🇷', label: 'Brasil' },
                        { code: 'US', flag: '🇺🇸', label: 'USA' },
                        { code: 'AU', flag: '🇦🇺', label: 'Australia' },
                        { code: 'EU', flag: '🇪🇺', label: 'Europe' },
                        { code: 'CO', flag: '🇨🇴', label: 'Colombia' },
                        { code: 'PE', flag: '🇵🇪', label: 'Peru' },
                        { code: 'AR', flag: '🇦🇷', label: 'Argentina' },
                        { code: 'MX', flag: '🇲🇽', label: 'México' },
                        { code: 'CL', flag: '🇨🇱', label: 'Chile' },
                        { code: 'UY', flag: '🇺🇾', label: 'Uruguay' },
                    ] as { code: Jurisdiction; flag: string; label: string }[]).map(({ code, flag, label }) => (
                        <button
                            key={code}
                            onClick={() => setJurisdiction(code)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${jurisdiction === code
                                ? 'bg-purple-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
                                }`}
                        >
                            <span>{flag}</span>{label}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {language === 'en'
                        ? 'Jury will adapt clauses and analysis based on selected laws.'
                        : 'Jury adaptará cláusulas e análises com base nas leis selecionadas.'}
                </p>
            </div>

            {/* AI Refinement Chat — Fixed Overlay (bottom-right, does NOT push layout) */}
            {isRefinementOpen && (
                <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-50 bg-white dark:bg-slate-900 border-2 border-purple-500/60 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-purple-50 dark:bg-purple-900/30 px-4 py-3 border-b border-purple-100 dark:border-purple-800 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            {language === 'en' ? 'Jury AI Assistant' : 'Assistente Jury IA'}
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full">
                                {jurisdiction} Law
                            </span>
                            {/* X close button */}
                            <button
                                onClick={() => setIsRefinementOpen(false)}
                                className="p-1 rounded-full text-purple-600 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                title="Fechar"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="h-72 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#02040a]">
                        {messages.length === 0 && (
                            <div className="text-center space-y-3 py-4">
                                <p className="text-sm text-slate-500">
                                    {language === 'en'
                                        ? 'Ask Jury to draft a clause or explain a legal term...'
                                        : 'Peça ao Jury para redigir uma cláusula ou explicar um termo jurídico...'}
                                </p>
                                {generatedContract && (
                                    <button
                                        onClick={() => setInput("Gere um resumo estratégico em tópicos curtos (Valor, Prazos, Principais Entregas) para eu enviar no corpo do e-mail ao cliente.")}
                                        className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full transition-colors"
                                    >
                                        ✨ {language === 'en' ? 'Generate Email Summary' : 'Gerar Resumo para E-mail'}
                                    </button>
                                )}
                            </div>
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

                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
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

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {language === 'en' ? 'Client Address' : 'Endereço do Cliente'}
                                </label>
                                <input
                                    type="text"
                                    value={clientAddress}
                                    onChange={(e) => setClientAddress(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder={language === 'en' ? 'Street, Number, City' : 'Rua, Número, Cidade'}
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

                        {/* Deal Picker — shown when no deal is pre-selected */}
                        <div className="pb-4 border-b border-purple-200 dark:border-purple-700">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Save className="w-4 h-4 text-purple-500" />
                                {language === 'en' ? 'Link to Deal / Card' : 'Vincular ao Deal / Card'} *
                            </label>
                            <select
                                value={selectedDealId}
                                onChange={(e) => setSelectedDealId(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="">{language === 'en' ? '— Select a deal —' : '— Selecione um deal —'}</option>
                                {availableDeals.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.title}{d.value ? ` — R$ ${d.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
                                    </option>
                                ))}
                            </select>
                            {!selectedDealId && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    ⚠️ {language === 'en' ? 'Select a deal to enable saving.' : 'Selecione um deal para habilitar o salvamento.'}
                                </p>
                            )}
                        </div>

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
                            <div className="flex gap-2 flex-wrap">
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
                                {/* Salvar no Deal — visible when any deal is selected */}
                                {(selectedDealId || dealId) && (
                                    <button
                                        onClick={saveToDeal}
                                        disabled={savingToDeal || savedToDeal}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                                    >
                                        {savingToDeal ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : savedToDeal ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {savedToDeal
                                            ? (language === 'en' ? 'Saved!' : 'Salvo!')
                                            : (language === 'en' ? 'Save to Deal' : 'Salvar no Deal')}
                                    </button>
                                )}
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
