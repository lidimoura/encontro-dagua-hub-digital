import React, { useState, useEffect } from 'react';
import { Scale, FileText, Download, Eye, Copy, CheckCircle, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useDealContext } from '@/context/DealContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/services/ai/bilingualService';
import jsPDF from 'jspdf';

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

export const JuryAgent: React.FC<JuryAgentProps> = ({ boardId, dealId }) => {
    const { addToast } = useToast();
    const dealContext = useDealContext();
    const { language } = useLanguage();
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

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

    const [generatedContract, setGeneratedContract] = useState('');
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
            addToast('Erro ao carregar templates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateContract = () => {
        if (!selectedTemplate || !clientName) {
            addToast('Selecione um template e preencha o nome do cliente', 'error');
            return;
        }

        // Replace placeholders in template
        let contract = selectedTemplate.content;

        // Client placeholders
        contract = contract.replace(/\[NOME_CLIENTE\]/g, clientName);
        contract = contract.replace(/\[CPF\/CNPJ\]/g, clientCpfCnpj || '[CPF/CNPJ]');
        contract = contract.replace(/\[DESCRIÇÃO_PROJETO\]/g, projectDescription || '[Descrição do Projeto]');
        contract = contract.replace(/\[VALOR\]/g, value || '[Valor]');
        contract = contract.replace(/\[DATA\]/g, new Date().toLocaleDateString('pt-BR'));

        // Hub contractor placeholders (editable)
        contract = contract.replace(/\[EMPRESA\]/g, hubName);
        contract = contract.replace(/\[CONTRATANTE\]/g, hubName);

        if (hubPersonType === 'PJ') {
            contract = contract.replace(/\[CNPJ_EMPRESA\]/g, hubCnpj || '[CNPJ]');
            contract = contract.replace(/\[CPF_EMPRESA\]/g, '');
        } else {
            contract = contract.replace(/\[CPF_EMPRESA\]/g, hubCpf || '[CPF]');
            contract = contract.replace(/\[CNPJ_EMPRESA\]/g, '');
        }

        contract = contract.replace(/\[ENDEREÇO_EMPRESA\]/g, hubAddress || '[Endereço]');

        // Contract type: if simple, remove clauses (basic implementation)
        if (contractType === 'simple') {
            // Simple contracts typically have fewer clauses
            // This is a placeholder - actual implementation would depend on template structure
            contract = '=== CONTRATO SIMPLIFICADO ===\n\n' + contract;
        }

        setGeneratedContract(contract);
        setShowPreview(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContract);
        setCopied(true);
        addToast('Contrato copiado!', 'success');
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

            // Header
            pdf.setFont('times', 'bold');
            pdf.setFontSize(16);
            const title = language === 'en' ? 'SERVICE CONTRACT' : 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS';
            pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Contract content
            pdf.setFont('times', 'normal');
            pdf.setFontSize(11);

            const lines = pdf.splitTextToSize(generatedContract, contentWidth);

            for (let i = 0; i < lines.length; i++) {
                if (yPosition > pageHeight - 60) {
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

                if (yPosition > pageHeight - 80) {
                    pdf.addPage();
                    yPosition = margin;
                }

                pdf.setFont('times', 'bold');
                pdf.setFontSize(12);
                pdf.text(language === 'en' ? 'PRICING BREAKDOWN' : 'DETALHAMENTO FINANCEIRO', margin, yPosition);
                yPosition += 8;

                pdf.setFont('times', 'normal');
                pdf.setFontSize(10);
                pdf.text(`${language === 'en' ? 'Total Cost' : 'Custo Total'}: ${formatCurrency(quote.totalCost, language)}`, margin, yPosition);
                yPosition += 6;
                pdf.text(`${language === 'en' ? 'Revenue' : 'Receita'}: ${formatCurrency(quote.revenue, language)}`, margin, yPosition);
                yPosition += 6;
                pdf.text(`${language === 'en' ? 'Profit Margin' : 'Margem de Lucro'}: ${quote.marginPercentage.toFixed(1)}%`, margin, yPosition);
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
            pdf.text(language === 'en' ? 'Client Signature' : 'Assinatura do Cliente', margin, yPosition);

            // Contractor signature
            const contractorX = pageWidth - margin - 70;
            pdf.line(contractorX, yPosition - 6, contractorX + 70, yPosition - 6);
            pdf.text(language === 'en' ? 'Contractor Signature' : 'Assinatura do Contratante', contractorX, yPosition);

            // Save PDF
            const filename = `contract_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);

            addToast(language === 'en' ? 'Contract exported!' : 'Contrato exportado!', 'success');
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
            <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-purple-600" />
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Gerador de Contratos
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Templates da biblioteca com compliance garantido
                    </p>
                </div>
            </div>

            {/* Template Selection */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Selecione o Template
                </label>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-sm text-slate-500 mt-2">Carregando templates...</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                        <FileText className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            Nenhum template de contrato encontrado na biblioteca.
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                            Adicione templates na página de Biblioteca (tipo: Contrato)
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
                            Dados do Contrato
                        </h4>

                        {/* Contract Type Toggle */}
                        <div className="flex items-center gap-4 pb-4 border-b border-purple-200 dark:border-purple-700">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo de Contrato:</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setContractType('simple')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${contractType === 'simple'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-purple-400'
                                        }`}
                                >
                                    Simples
                                </button>
                                <button
                                    onClick={() => setContractType('complete')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${contractType === 'complete'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-purple-400'
                                        }`}
                                >
                                    Completo
                                </button>
                            </div>
                        </div>

                        {/* Hub Contractor Data */}
                        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg p-4 space-y-3">
                            <h5 className="font-semibold text-slate-900 dark:text-white text-sm">Dados do Contratante (Hub)</h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Person Type */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Pessoa</label>
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
                                        {hubPersonType === 'PJ' ? 'Razão Social' : 'Nome Completo'}
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
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
                                    <input
                                        type="text"
                                        value={hubAddress}
                                        onChange={(e) => setHubAddress(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500"
                                        placeholder="Rua, Número, Cidade - UF"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Client Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Nome do Cliente *
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
                                    CPF/CNPJ do Cliente
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
                                    Descrição do Projeto
                                </label>
                                <textarea
                                    value={projectDescription}
                                    onChange={(e) => setProjectDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Ex: Desenvolvimento de site institucional com 5 páginas..."
                                />
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Valor (R$)
                                </label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Ex: R$ 5.000,00"
                                />
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateContract}
                            disabled={!clientName}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <FileText className="w-5 h-5" />
                            Gerar Contrato
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
                                Preview do Contrato
                            </h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copiar
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleExportPdf}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Exportar PDF
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
                                💡 Clique no texto para selecionar tudo e copiar facilmente
                            </p>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
