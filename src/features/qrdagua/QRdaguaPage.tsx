import React, { useState, useEffect } from 'react';
import { QrCode, Sparkles, Save, Link as LinkIcon, Palette, FileText, Edit2, Trash2, Smartphone, Globe, CreditCard } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase/client';

type ProjectType = 'LINK' | 'BRIDGE' | 'CARD';

interface QRFormData {
    id?: string;
    projectType: ProjectType;
    clientName: string;
    destinationUrl: string;
    slug: string;
    color: string;
    description: string;
    // Fields for BRIDGE/CARD
    pageTitle?: string;
    buttonText?: string;
    imageUrl?: string;
    whatsapp?: string;
    // Enhanced QR Code fields
    qrLogoUrl?: string;
    qrTextTop?: string;
    qrTextBottom?: string;
    // Portfolio/Gallery fields
    inPortfolio?: boolean;
    inGallery?: boolean;
    directRedirect?: boolean; // PRO feature: Skip BridgePage
}

interface QRProject {
    id: string;
    project_type?: string;
    client_name: string;
    destination_url: string;
    slug: string;
    color: string;
    description: string;
    page_title?: string;
    button_text?: string;
    image_url?: string;
    whatsapp?: string;
    in_portfolio?: boolean;
    in_gallery?: boolean;
    direct_redirect?: boolean; // PRO feature
    created_at: string;
}

// Phone Mockup Component with Crash Protection
const PhoneMockup: React.FC<{ formData: QRFormData }> = ({ formData }) => {
    const {
        projectType,
        destinationUrl,
        color,
        pageTitle,
        buttonText,
        clientName,
        description,
        imageUrl,
        whatsapp,
        qrLogoUrl,
        qrTextTop,
        qrTextBottom
    } = formData;

    // Safe color with fallback
    const safeColor = color || '#620939';
    const safeUrl = destinationUrl?.trim() || '';

    return (
        <div className="relative mx-auto" style={{ width: '280px', height: '560px' }}>
            {/* Phone Frame */}
            <div className="absolute inset-0 rounded-[3rem] border-[14px] border-slate-900 dark:border-slate-800 bg-slate-900 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 dark:bg-slate-800 rounded-b-2xl z-10"></div>

                {/* Screen */}
                <div className="absolute inset-2 rounded-[2.5rem] bg-white dark:bg-slate-950 overflow-hidden">
                    {/* Status Bar */}
                    <div className="h-8 bg-gradient-to-b from-slate-100 to-transparent dark:from-slate-900 flex items-center justify-between px-6 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">9:41</span>
                        <div className="flex gap-1">
                            <div className="w-4 h-3 border border-slate-600 dark:border-slate-400 rounded-sm"></div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="h-[calc(100%-2rem)] overflow-y-auto p-4">
                        {projectType === 'LINK' && safeUrl.length > 0 ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                {/* Text Above QR */}
                                {qrTextTop && (
                                    <p className="mb-4 text-sm font-semibold text-slate-900 dark:text-white text-center px-2">
                                        {qrTextTop}
                                    </p>
                                )}

                                {/* Premium QR Code Container with Glassmorphism */}
                                <div className="relative group">
                                    {/* Gradient Background Glow */}
                                    <div className="absolute -inset-4 bg-gradient-to-br from-acai-900/30 via-acai-700/20 to-solimoes-400/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                                    {/* Glassmorphism Container */}
                                    <div className="relative bg-white/90 dark:bg-rionegro-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 dark:border-acai-900/30">
                                        {/* Decorative Corner Accents */}
                                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-acai-900/40 rounded-tl-lg"></div>
                                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-acai-900/40 rounded-tr-lg"></div>
                                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-acai-900/40 rounded-bl-lg"></div>
                                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-acai-900/40 rounded-br-lg"></div>

                                        {/* QR Code with Subtle Pulse Animation */}
                                        <div className="relative animate-pulse-subtle">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/#/v/${formData.slug || 'preview'}`}
                                                size={180}
                                                level="H"
                                                fgColor={safeColor}
                                                bgColor="transparent"
                                            />

                                            {/* Logo Overlay with Enhanced Styling */}
                                            {qrLogoUrl && (
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white dark:bg-white rounded-xl p-2 shadow-xl ring-2 ring-acai-900/20">
                                                    <img
                                                        src={qrLogoUrl}
                                                        alt="Logo"
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Below QR */}
                                {qrTextBottom && (
                                    <p className="mt-4 text-xs text-slate-600 dark:text-slate-400 text-center px-2">
                                        {qrTextBottom}
                                    </p>
                                )}

                                {!qrTextBottom && (
                                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 bg-solimoes-400 rounded-full animate-pulse"></span>
                                        Escaneie para acessar
                                    </p>
                                )}
                            </div>
                        ) : projectType === 'BRIDGE' ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                {imageUrl?.trim() && (
                                    <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                                        <img
                                            src={imageUrl}
                                            alt="Logo"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e2e8f0" width="80" height="80"/%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                )}
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {pageTitle?.trim() || 'Título da Página'}
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {description?.trim() || 'Descrição do seu negócio'}
                                </p>
                                <button
                                    style={{ backgroundColor: safeColor }}
                                    className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg"
                                >
                                    {buttonText?.trim() || 'Clique Aqui'}
                                </button>
                            </div>
                        ) : projectType === 'CARD' ? (
                            <div className="flex flex-col items-center space-y-4 py-6">
                                {imageUrl?.trim() && (
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900">
                                        <img
                                            src={imageUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23e2e8f0" width="96" height="96"/%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="text-center">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {clientName?.trim() || 'Nome do Cliente'}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {description?.trim() || 'Bio profissional'}
                                    </p>
                                </div>
                                <div className="w-full space-y-2">
                                    {safeUrl && (
                                        <a
                                            href={safeUrl}
                                            style={{ borderColor: safeColor, color: safeColor }}
                                            className="block w-full px-4 py-2 border-2 rounded-lg text-center text-sm font-medium"
                                        >
                                            🌐 Website
                                        </a>
                                    )}
                                    {whatsapp?.trim() && (
                                        <a
                                            href={`https://wa.me/${whatsapp}`}
                                            style={{ backgroundColor: safeColor }}
                                            className="block w-full px-4 py-2 text-white rounded-lg text-center text-sm font-medium"
                                        >
                                            💬 WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Smartphone className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                                <p className="text-sm text-slate-400 dark:text-slate-600">
                                    Preencha o formulário para ver o preview
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const QRdaguaPage: React.FC = () => {
    const { showToast } = useToast();
    const { profile } = useAuth();

    // Admin check based on database role
    const isAdmin = profile?.role === 'admin';

    // Plan detection: admin = PRO, vendedor = FREE
    const isPro = profile?.role === 'admin';

    const [formData, setFormData] = useState<QRFormData>({
        projectType: 'LINK',
        clientName: '',
        destinationUrl: '',
        slug: '',
        color: '#620939',
        description: '',
    });
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [projects, setProjects] = useState<QRProject[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchProjects = async () => {
        setIsLoadingProjects(true);
        try {
            const { data, error } = await supabase
                .from('qr_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            showToast('Erro ao carregar projetos', 'error');
        } finally {
            setIsLoadingProjects(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, color: e.target.value }));
    };

    const generateTitle = async () => {
        if (!formData.clientName) {
            showToast('Por favor, preencha o nome do cliente primeiro', 'error');
            return;
        }

        setIsGeneratingTitle(true);
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

            const prompt = `Crie um título curto e impactante (máximo 5-7 palavras) para uma página de negócio chamado "${formData.clientName}". 
            O título deve ser acolhedor, profissional e convidativo. Responda APENAS com o título, sem aspas ou formatação extra.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim().replace(/^["']|["']$/g, '');

            setFormData((prev) => ({ ...prev, pageTitle: text }));
            showToast('Título gerado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao gerar título:', error);
            showToast('Erro ao gerar título. Verifique sua API Key.', 'error');
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const generateBio = async () => {
        if (!formData.clientName) {
            showToast('Por favor, preencha o nome do cliente primeiro', 'error');
            return;
        }

        setIsGeneratingBio(true);
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

            const prompt = `Crie uma descrição curta e vendedora (máximo 2-3 frases) para um negócio chamado "${formData.clientName}". 
            A descrição deve ser profissional, atraente e destacar o valor do negócio. 
            Seja criativo mas mantenha um tom profissional. Responda APENAS com a descrição, sem aspas ou formatação extra.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim().replace(/^["']|["']$/g, '');

            setFormData((prev) => ({ ...prev, description: text }));
            showToast('Bio gerada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao gerar bio:', error);
            showToast('Erro ao gerar bio. Verifique sua API Key.', 'error');
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const handleEdit = (project: QRProject) => {
        setFormData({
            id: project.id,
            projectType: (project.project_type as ProjectType) || 'LINK',
            clientName: project.client_name,
            destinationUrl: project.destination_url,
            slug: project.slug,
            color: project.color,
            description: project.description || '',
            pageTitle: project.page_title,
            buttonText: project.button_text,
            imageUrl: project.image_url,
            whatsapp: project.whatsapp,
            inPortfolio: project.in_portfolio || false,
            inGallery: project.in_gallery || false,
            directRedirect: project.direct_redirect || false, // PRO feature
        });
        setEditingId(project.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

        try {
            const { error } = await supabase
                .from('qr_codes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast('Projeto excluído com sucesso!', 'success');
            fetchProjects();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            showToast('Erro ao excluir projeto', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            projectType: 'LINK',
            clientName: '',
            destinationUrl: '',
            slug: '',
            color: '#620939',
            description: '',
            qrLogoUrl: '',
            qrTextTop: '',
            qrTextBottom: '',
            inPortfolio: false,
            inGallery: false,
        });
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientName || !formData.destinationUrl || !formData.slug) {
            showToast('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            showToast('Você precisa estar logado para criar projetos', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                project_type: formData.projectType,
                client_name: formData.clientName,
                destination_url: formData.destinationUrl,
                slug: formData.slug,
                color: formData.color,
                description: formData.description || '',
                page_title: formData.pageTitle || null,
                button_text: formData.buttonText || null,
                image_url: formData.imageUrl || null,
                whatsapp: formData.whatsapp || null,
                qr_logo_url: formData.qrLogoUrl || null,
                qr_text_top: formData.qrTextTop || null,
                qr_text_bottom: formData.qrTextBottom || null,
                in_portfolio: formData.inPortfolio || false,
                in_gallery: formData.inGallery || false,
                direct_redirect: formData.directRedirect || false, // PRO feature
                owner_id: user.id, // FIX: Add user ID to prevent null constraint violation
            };

            if (editingId) {
                // Update existing project
                const { error } = await supabase
                    .from('qr_codes')
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                // Create new project
                const { error } = await supabase
                    .from('qr_codes')
                    .insert([payload]);

                if (error) throw error;
            }

            showToast(editingId ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!', 'success');

            resetForm();
            fetchProjects();
        } catch (error: any) {
            console.error('Erro ao salvar:', error);

            // Handle specific error cases
            if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
                // Duplicate slug error
                showToast('Este link (slug) já está em uso. Tente outro nome.', 'error');
            } else if (error?.code === '23502') {
                // Not null constraint
                showToast('Erro: Campo obrigatório faltando. Verifique os dados.', 'error');
            } else if (error?.message) {
                // Show specific error message from database
                showToast(`Erro: ${error.message}`, 'error');
            } else {
                // Generic error
                showToast('Erro ao salvar projeto. Tente novamente.', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const showConditionalFields = formData.projectType !== 'LINK';

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl shadow-lg shadow-acai-900/30">
                        <QrCode className="w-6 h-6 text-solimoes-400" />
                    </div>
                    <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-solimoes-400 to-solimoes-500 bg-clip-text text-transparent">
                        QR d'água - Concierge de Sites
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    Crie QR Codes, Páginas Ponte e Cartões Digitais personalizados
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form - 2 columns */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-solimoes-400/20 dark:border-solimoes-400/10 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingId ? 'Editar Projeto' : 'Novo Projeto'}
                            </h2>
                            {editingId && (
                                <button
                                    onClick={resetForm}
                                    className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    Cancelar edição
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Project Type Selector */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-3">
                                    Tipo de Projeto *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, projectType: 'LINK' }))}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.projectType === 'LINK'
                                            ? 'border-acai-900 bg-acai-50 dark:bg-acai-900/20'
                                            : 'border-slate-200 dark:border-rionegro-800 hover:border-acai-900/50'
                                            }`}
                                    >
                                        <LinkIcon className="w-6 h-6 mx-auto mb-2 text-acai-900" />
                                        <p className="text-sm font-medium">Link</p>
                                        <p className="text-xs text-slate-500 mt-1">QR Code simples</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => isAdmin && setFormData(prev => ({ ...prev, projectType: 'BRIDGE' }))}
                                        disabled={!isAdmin}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.projectType === 'BRIDGE'
                                            ? 'border-acai-900 bg-acai-50 dark:bg-acai-900/20'
                                            : 'border-slate-200 dark:border-rionegro-800 hover:border-acai-900/50'
                                            } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Globe className="w-6 h-6 mx-auto mb-2 text-acai-900" />
                                        <p className="text-sm font-medium">Bridge</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {isAdmin ? 'Página Ponte' : '🔒 Admin'}
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => isAdmin && setFormData(prev => ({ ...prev, projectType: 'CARD' }))}
                                        disabled={!isAdmin}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.projectType === 'CARD'
                                            ? 'border-acai-900 bg-acai-50 dark:bg-acai-900/20'
                                            : 'border-slate-200 dark:border-rionegro-800 hover:border-acai-900/50'
                                            } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <CreditCard className="w-6 h-6 mx-auto mb-2 text-acai-900" />
                                        <p className="text-sm font-medium">Card</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {isAdmin ? 'Cartão Digital' : '🔒 Admin'}
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* Client Name */}
                            <div>
                                <label htmlFor="clientName" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                    Nome do Cliente *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="clientName"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                        placeholder="Ex: Restaurante Amazônia"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Conditional Fields for BRIDGE/CARD */}
                            {showConditionalFields && (
                                <>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="pageTitle" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400">
                                                Título da Página
                                            </label>
                                            <button
                                                type="button"
                                                onClick={generateTitle}
                                                disabled={isGeneratingTitle || !formData.clientName}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-acai-900 to-acai-700 text-solimoes-400 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-acai-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                {isGeneratingTitle ? 'Gerando...' : '✨ Gerar'}
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            id="pageTitle"
                                            name="pageTitle"
                                            value={formData.pageTitle || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                            placeholder="Ex: Bem-vindo ao nosso negócio"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="buttonText" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                            Texto do Botão
                                        </label>
                                        <input
                                            type="text"
                                            id="buttonText"
                                            name="buttonText"
                                            value={formData.buttonText || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                            placeholder="Ex: Ver Cardápio"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="imageUrl" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                            URL da Imagem
                                        </label>
                                        <input
                                            type="url"
                                            id="imageUrl"
                                            name="imageUrl"
                                            value={formData.imageUrl || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                            placeholder="https://exemplo.com/logo.png"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="whatsapp" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                            WhatsApp (com código do país)
                                        </label>
                                        <input
                                            type="tel"
                                            id="whatsapp"
                                            name="whatsapp"
                                            value={formData.whatsapp || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                            placeholder="5511999999999"
                                        />
                                    </div>
                                </>
                            )}

                            {/* URL */}
                            <div>
                                <label htmlFor="destinationUrl" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                    URL Destino *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="url"
                                        id="destinationUrl"
                                        name="destinationUrl"
                                        value={formData.destinationUrl}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                        placeholder="https://exemplo.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Slug */}
                            <div>
                                <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                    Slug (Identificador único) *
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all font-mono"
                                    placeholder="restaurante-amazonia"
                                    title="Apenas letras minúsculas, números e hífens"
                                    required
                                />
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Apenas letras minúsculas, números e hífens
                                </p>
                            </div>

                            {/* Color */}
                            <div>
                                <label htmlFor="color" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                    Cor do Tema
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Palette className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="color"
                                            id="color"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleColorChange}
                                            className="w-32 h-12 pl-10 pr-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, color: e.target.value }))
                                            }
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white font-mono"
                                            placeholder="#620939"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400">
                                        Descrição
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateBio}
                                        disabled={isGeneratingBio || !formData.clientName}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-acai-900 to-acai-700 text-solimoes-400 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-acai-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        {isGeneratingBio ? 'Gerando...' : '✨ Gerar Bio'}
                                    </button>
                                </div>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all resize-none"
                                    placeholder="Descrição do negócio (opcional)"
                                />
                            </div>

                            {/* Portfolio/Gallery Checkboxes */}
                            <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/20 rounded-lg">
                                <h3 className="text-sm font-semibold text-green-900 dark:text-green-400 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Vitrine Pública
                                </h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.inPortfolio || false}
                                            onChange={(e) => setFormData(prev => ({ ...prev, inPortfolio: e.target.checked }))}
                                            className="w-4 h-4 text-green-600 bg-white dark:bg-rionegro-950 border-green-300 dark:border-green-700 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                📁 Exibir no Portfólio
                                            </span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Projeto aparecerá na landing page oficial
                                            </p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.inGallery || false}
                                            onChange={(e) => setFormData(prev => ({ ...prev, inGallery: e.target.checked }))}
                                            className="w-4 h-4 text-green-600 bg-white dark:bg-rionegro-950 border-green-300 dark:border-green-700 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                🖼️ Exibir na Galeria
                                            </span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Projeto aparecerá na galeria de exemplos
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Enhanced QR Code Fields (LINK type only) */}
                            {formData.projectType === 'LINK' && (
                                <div className="space-y-4 p-4 bg-solimoes-400/5 border border-solimoes-400/20 rounded-lg">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-solimoes-400 flex items-center gap-2">
                                        <QrCode className="w-4 h-4" />
                                        QR Code Pro (Opcional)
                                    </h3>

                                    <div>
                                        <label htmlFor="qrLogoUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Logo no Centro do QR
                                        </label>
                                        <input
                                            type="url"
                                            id="qrLogoUrl"
                                            name="qrLogoUrl"
                                            value={formData.qrLogoUrl || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                            placeholder="https://exemplo.com/logo.png"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="qrTextTop" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Texto Acima do QR
                                        </label>
                                        <input
                                            type="text"
                                            id="qrTextTop"
                                            name="qrTextTop"
                                            value={formData.qrTextTop || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                            placeholder="Ex: Escaneie e ganhe 10% de desconto"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="qrTextBottom" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Texto Abaixo do QR
                                        </label>
                                        <input
                                            type="text"
                                            id="qrTextBottom"
                                            name="qrTextBottom"
                                            value={formData.qrTextBottom || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                            placeholder="Ex: Válido até 31/12/2025"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Direct Redirect (PRO Only) */}
                            {isPro && (
                                <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-400 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            💎 PRO: Redirecionamento Direto
                                        </h3>
                                        {/* Help Tooltip */}
                                        <div className="group relative">
                                            <button
                                                type="button"
                                                className="p-1 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                                                title="Ajuda"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                            {/* Tooltip */}
                                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50 border border-slate-700">
                                                <p className="font-semibold mb-1">Recurso PRO</p>
                                                <p className="text-slate-300">
                                                    Quando ativado, o QR Code redireciona diretamente para o destino final,
                                                    pulando a Página Ponte e removendo o footer "Powered by".
                                                </p>
                                                <div className="absolute top-full right-4 w-2 h-2 bg-slate-900 transform rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.directRedirect || false}
                                            onChange={(e) => setFormData(prev => ({ ...prev, directRedirect: e.target.checked }))}
                                            className="w-4 h-4 text-purple-600 bg-white dark:bg-rionegro-950 border-purple-300 dark:border-purple-700 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                ⚡ Redirecionar automaticamente
                                            </span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Pula a Página Ponte e vai direto para o destino (sem mostrar "Powered by")
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-acai-900 to-acai-700 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-acai-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    {isSaving ? 'Salvando...' : editingId ? 'Atualizar Projeto' : 'Salvar Projeto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Preview - 1 column */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            📱 Preview
                        </h3>
                        <div className="flex justify-center items-start overflow-hidden">
                            <div className="transform scale-75 origin-top">
                                <PhoneMockup formData={formData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meus Projetos */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Meus Projetos
                </h2>

                {isLoadingProjects ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-acai-900"></div>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">Carregando projetos...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-solimoes-400/20 dark:border-solimoes-400/10 p-12 text-center">
                        <QrCode className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                            Nenhum projeto criado ainda. Crie seu primeiro projeto acima!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white dark:bg-rionegro-900 rounded-xl shadow-lg border border-solimoes-400/20 dark:border-solimoes-400/10 p-4 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white">
                                                {project.client_name}
                                            </h3>
                                            {project.project_type && (
                                                <span className="px-2 py-0.5 text-xs bg-acai-100 dark:bg-acai-900/30 text-acai-900 dark:text-acai-400 rounded">
                                                    {project.project_type}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                            /{project.slug}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(project)}
                                            className="p-2 text-slate-400 hover:text-acai-900 hover:bg-acai-50 dark:hover:bg-acai-900/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-rionegro-950 rounded-lg mb-3">
                                    {project.destination_url && (
                                        <QRCodeSVG
                                            value={`${window.location.origin}/#/v/${project.slug}`}
                                            size={120}
                                            level="H"
                                            fgColor={project.color}
                                        />
                                    )}
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 break-all">
                                    {project.destination_url}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="mt-6 p-4 bg-solimoes-400/10 border border-solimoes-400/20 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong className="text-solimoes-600 dark:text-solimoes-400">
                        💡 Dica:
                    </strong>{' '}
                    Escolha o tipo de projeto e veja o preview em tempo real no celular! Use "✨ Gerar Bio" para criar descrições automáticas.
                </p>
            </div>
        </div>
    );
};

export default QRdaguaPage;
