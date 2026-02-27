import React, { useState, useEffect } from 'react';
import { QrCode, Sparkles, Save, Link as LinkIcon, Palette, FileText, Edit2, Trash2, Smartphone, Globe, CreditCard, Copy, ExternalLink, X, Share2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QRCode } from 'react-qrcode-logo';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase/client';
import { calculateContrastRatio, isContrastSafe, getContrastLevel, suggestForegroundColor } from '@/lib/utils/contrastValidator';
import { CardLinksEditor } from './components/CardLinksEditor';
import { ImageUpload } from '@/components/ImageUpload';
import { useTranslation } from '@/hooks/useTranslation';
import { templatesService, BridgeTemplate } from '@/lib/supabase/templates';
import { TemplateManager } from './components/TemplateManager';

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
    redirectMode?: 'direct' | 'iframe' | 'bridge';
    enableWatermark?: boolean;
    bridgeTemplate?: string;
    linksArray?: Array<{
        id: string;
        type: string;
        label: string;
        url: string;
        icon: string;
        active: boolean;
    }>;
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
    redirect_mode?: string;
    enable_watermark?: boolean;
    bridge_template?: string;
    qr_style?: 'squares' | 'dots';
    qr_eye_radius?: number;
    qr_logo_url?: string;
    qr_text_top?: string;
    qr_text_bottom?: string;
    links_array?: any;
    created_at: string;
}

// Phone Mockup Component with Crash Protection
const PhoneMockup: React.FC<{ formData: QRFormData; templates?: BridgeTemplate[] }> = ({ formData, templates = [] }) => {
    const { t } = useTranslation();
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
        qrTextBottom,
        enableWatermark,
        bridgeTemplate
    } = formData;

    const activeTemplate = templates.find(t => t.id === bridgeTemplate) || templates[0];
    const layoutStyle = projectType !== 'LINK' && activeTemplate ? {
        backgroundColor: activeTemplate.bg_color || undefined,
        color: activeTemplate.text_color || undefined,
        fontFamily: activeTemplate.font_family || undefined
    } : {};

    const cardStyle = projectType !== 'LINK' && activeTemplate ? {
        backgroundColor: activeTemplate.card_bg_color || undefined,
    } : {};

    const btnStyle = projectType !== 'LINK' && activeTemplate ? {
        backgroundColor: activeTemplate.button_bg_color || color,
        color: activeTemplate.button_text_color || '#fff'
    } : { backgroundColor: color, color: '#fff' };

    // Safe color with fallback
    const safeColor = color || '#620939';
    const safeUrl = destinationUrl?.trim() || '';

    return (
        <div className="relative mx-auto" style={{ width: '280px', height: '560px' }}>
            {/* Phone Frame */}
            <div className="absolute inset-0 rounded-[3rem] border-[14px] border-slate-900 dark:border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 dark:bg-slate-800 rounded-b-2xl z-20"></div>

                {/* Screen */}
                <div className="absolute inset-2 rounded-[2.5rem] bg-white dark:bg-slate-950 overflow-hidden relative">
                    {/* Watermark Overlay */}
                    {enableWatermark && (
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-top-4 duration-500 fade-in w-max">
                            <div className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-500/25 border border-emerald-400/30 backdrop-blur-md flex items-center gap-1.5">
                                <span className="flex h-1.5 w-1.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                </span>
                                <span className="text-white text-[9px] font-bold tracking-wider uppercase">
                                    Prova D'água
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Status Bar */}
                    <div className="h-8 bg-gradient-to-b from-slate-100 to-transparent dark:from-slate-900 flex items-center justify-between px-6 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">9:41</span>
                        <div className="flex gap-1">
                            <div className="w-4 h-3 border border-slate-600 dark:border-slate-400 rounded-sm"></div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="h-[calc(100%-2rem)] overflow-y-auto p-4 transition-colors duration-500" style={layoutStyle}>
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
                                            <QRCode
                                                value={`${window.location.origin}/r/${formData.slug || 'preview'}`}
                                                size={180}
                                                ecLevel="H"
                                                fgColor={safeColor}
                                                bgColor="transparent"
                                                qrStyle="dots"
                                                eyeRadius={10}
                                                logoImage={qrLogoUrl || ''}
                                                logoWidth={40}
                                                logoHeight={40}
                                                removeQrCodeBehindLogo={true}
                                            />
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
                                        {t('scanToAccess')}
                                    </p>
                                )}
                            </div>
                        ) : projectType === 'BRIDGE' ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                {imageUrl?.trim() && (
                                    <div className="w-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-violet-900/20 relative">
                                        <img
                                            src={imageUrl}
                                            alt="Logo"
                                            className="w-full max-h-[150px] object-contain opacity-90"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e2e8f0" width="80" height="80"/%3E%3C/svg%3E';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    </div>
                                )}
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {pageTitle?.trim() || t('pageTitleDefault')}
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {description?.trim() || t('businessDescDefault')}
                                </p>
                                <button
                                    style={btnStyle}
                                    className="px-6 py-3 rounded-lg font-semibold shadow-lg"
                                >
                                    {buttonText?.trim() || t('clickHere')}
                                </button>
                            </div>
                        ) : projectType === 'CARD' ? (
                            <div className="flex flex-col items-center space-y-4 py-6">
                                {imageUrl?.trim() && (
                                    <div className="w-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-violet-900/20 relative rounded-t-3xl overflow-hidden -mt-6 mb-2">
                                        <img
                                            src={imageUrl}
                                            alt="Profile"
                                            className="w-full max-h-[150px] object-contain opacity-90"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23e2e8f0" width="96" height="96"/%3E%3C/svg%3E';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    </div>
                                )}
                                <div className="text-center">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {clientName?.trim() || t('clientNameDefault')}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {description?.trim() || t('professionalBio')}
                                    </p>
                                </div>
                                <div className="w-full space-y-2">
                                    {/* Render links_array for CARD type */}
                                    {projectType === 'CARD' && formData.linksArray && formData.linksArray.length > 0 ? (
                                        formData.linksArray
                                            .filter(link => link.active)
                                            .map((link) => (
                                                <a
                                                    key={link.id}
                                                    href={link.url}
                                                    style={{
                                                        backgroundColor: link.type === 'whatsapp' ? '#25D366' : safeColor,
                                                        borderColor: safeColor
                                                    }}
                                                    className="block w-full px-4 py-3 text-white rounded-lg text-center text-sm font-medium shadow-md hover:shadow-lg transition-all"
                                                >
                                                    <span className="mr-2">{link.icon}</span>
                                                    {link.label || 'Link'}
                                                </a>
                                            ))
                                    ) : (
                                        <>
                                            {/* Fallback for BRIDGE type or empty CARD */}
                                            {safeUrl && (
                                                <a
                                                    href={safeUrl}
                                                    style={{ borderColor: safeColor, color: safeColor }}
                                                    className="block w-full px-4 py-2 border-2 rounded-lg text-center text-sm font-medium"
                                                >
                                                    {buttonText || `🌐 ${t('website')}`}
                                                </a>
                                            )}
                                            {whatsapp?.trim() && (
                                                <a
                                                    href={`https://wa.me/${whatsapp}`}
                                                    style={btnStyle}
                                                    className="block w-full px-4 py-2 rounded-lg text-center text-sm font-medium"
                                                >
                                                    💬 {t('whatsapp')}
                                                </a >
                                            )}
                                        </>
                                    )}
                                </div >
                            </div >
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Smartphone className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                                <p className="text-sm text-slate-400 dark:text-slate-600">
                                    {t('fillFormPreview')}
                                </p>
                            </div>
                        )}
                    </div >
                </div >
            </div >
        </div >
    );
};

export const QRdaguaPage: React.FC = () => {
    const { showToast } = useToast();
    const { profile } = useAuth();
    const { t } = useTranslation();

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
        linksArray: [],
    });
    const [activeTab, setActiveTab] = useState<'projetos' | 'templates'>('projetos');
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [projects, setProjects] = useState<QRProject[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successUrl, setSuccessUrl] = useState('');
    const [bridgeTemplates, setBridgeTemplates] = useState<BridgeTemplate[]>([]);

    useEffect(() => {
        const fetchTpls = async () => {
            if (profile?.company_id) {
                const { data } = await templatesService.getAll(profile.company_id);
                setBridgeTemplates(data || []);
            }
        };
        fetchTpls();
    }, [profile?.company_id]);

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
        const newColor = e.target.value;
        setFormData((prev) => ({ ...prev, color: newColor }));
    };

    // Calculate contrast ratio for QR code safety
    const bgColor = '#FFFFFF'; // QR codes typically have white background
    const contrastRatio = calculateContrastRatio(formData.color, bgColor);
    const contrastSafe = isContrastSafe(formData.color, bgColor);
    const contrastInfo = getContrastLevel(contrastRatio);


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
        setEditingId(project.id);
        const type = (project.project_type as ProjectType) || 'LINK';

        // Parse links JSON if exists
        let parsedLinks: any[] = [];
        if (project.links_array) {
            try {
                parsedLinks = typeof project.links_array === 'string'
                    ? JSON.parse(project.links_array)
                    : project.links_array;
            } catch (e) {
                console.error("Error parsing links_array", e);
                parsedLinks = [];
            }
        }

        setFormData({
            projectType: type,
            clientName: project.client_name,
            destinationUrl: project.destination_url,
            slug: project.slug,
            color: project.color,
            description: project.description || '',
            pageTitle: project.page_title || '',
            buttonText: project.button_text || '',
            imageUrl: project.image_url || '',
            whatsapp: project.whatsapp || '',
            inPortfolio: project.in_portfolio || false,
            inGallery: project.in_gallery || false,
            directRedirect: project.direct_redirect || false,
            redirectMode: (project.redirect_mode as any) || 'bridge',
            enableWatermark: project.enable_watermark || false,
            bridgeTemplate: project.bridge_template || '',
            qrLogoUrl: project.qr_logo_url || '',
            qrTextTop: project.qr_text_top || '',
            qrTextBottom: project.qr_text_bottom || '',
            linksArray: parsedLinks
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            projectType: 'LINK',
            clientName: '',
            destinationUrl: '',
            slug: '',
            color: '#620939',
            description: '',
            pageTitle: '',
            buttonText: '',
            imageUrl: '',
            whatsapp: '',
            inPortfolio: false,
            inGallery: false,
            directRedirect: false,
            redirectMode: 'bridge',
            enableWatermark: false,
            bridgeTemplate: '',
            qrLogoUrl: '',
            qrTextTop: '',
            qrTextBottom: '',
            linksArray: []
        });
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
            directRedirect: false,
            redirectMode: 'bridge',
            enableWatermark: false,
            bridgeTemplate: '',
            linksArray: []
        });
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: destinationUrl only required for LINK and BRIDGE, not CARD
        const requiresUrl = formData.projectType !== 'CARD';
        if (!formData.clientName || (requiresUrl && !formData.destinationUrl) || !formData.slug) {
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
                redirect_mode: formData.redirectMode || 'bridge',
                enable_watermark: formData.enableWatermark || false,
                bridge_template: formData.bridgeTemplate || null,
                links_array: formData.linksArray || [], // Card Digital links
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

            // Show success modal with URL and actions
            const finalUrl = `${window.location.origin}/#/v/${formData.slug}`;
            setSuccessUrl(finalUrl);
            setShowSuccessModal(true);

            // Show appropriate toast message
            showToast(editingId ? 'Projeto Atualizado com Sucesso!' : 'Projeto Criado!', 'success');

            resetForm();
            fetchProjects();
        } catch (error: any) {
            console.error('❌ ERRO AO SALVAR PROJETO:', error);
            console.error('📋 Error details:', {
                code: error?.code,
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                full: error
            });

            // Handle specific error cases
            if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
                // Duplicate slug error
                showToast('Este link (slug) já está em uso. Tente outro nome.', 'error');
            } else if (error?.code === '23502') {
                // Not null constraint
                showToast('Erro: Campo obrigatório faltando. Verifique os dados.', 'error');
            } else if (error?.code === '42501' || error?.message?.includes('policy')) {
                // RLS Policy violation
                console.error('🚨 RLS POLICY ERROR - Database bloqueando INSERT!');
                showToast('Erro de permissão. Execute a migration 009_fix_rls_policies.sql', 'error');
            } else if (error?.message) {
                // Show specific error message from database
                showToast(`Erro: ${error.message}`, 'error');
            } else {
                // Generic error
                showToast('Erro ao salvar projeto. Verifique o console.', 'error');
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
                        {t('qrPageTitle')}
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    {t('qrPageSubtitle')}
                </p>
            </div>

            <div className="flex items-center gap-4 mb-8 border-b border-slate-200 dark:border-rionegro-800 pb-px text-sm">
                <button
                    onClick={() => setActiveTab('projetos')}
                    className={`pb-4 px-2 font-semibold border-b-2 transition-all ${activeTab === 'projetos'
                        ? 'border-acai-900 text-acai-900 dark:border-solimoes-400 dark:text-solimoes-400'
                        : 'border-transparent text-slate-500 hover:border-slate-300 dark:text-slate-400 dark:hover:border-slate-700'
                        }`}
                >
                    Projetos & Links
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`pb-4 px-2 font-semibold border-b-2 transition-all ${activeTab === 'templates'
                        ? 'border-acai-900 text-acai-900 dark:border-solimoes-400 dark:text-solimoes-400'
                        : 'border-transparent text-slate-500 hover:border-slate-300 dark:text-slate-400 dark:hover:border-slate-700'
                        }`}
                >
                    Meus Templates
                </button>
            </div>

            {activeTab === 'templates' ? (
                <TemplateManager />
            ) : (
                <>
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
                                            {t('cancel')}
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Project Type Selector */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-3">
                                            {t('qrType')} *
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
                                                <p className="text-sm font-medium">Link / QR Code</p>
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
                                                <p className="text-sm font-medium">Cartão Digital</p>
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
                                                <p className="text-sm font-medium">Bio Premium</p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Client Name */}
                                    <div>
                                        <label htmlFor="clientName" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                            {t('customerName')} *
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
                                                placeholder={t('bridgeTitlePlaceholder')}
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
                                                        {t('bridgeTitle')}
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={generateTitle}
                                                        disabled={isGeneratingTitle || !formData.clientName}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-acai-900 to-acai-700 text-solimoes-400 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-acai-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                        {isGeneratingTitle ? t('loading') : '✨ Gerar'}
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    id="pageTitle"
                                                    name="pageTitle"
                                                    value={formData.pageTitle || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                                    placeholder={t('bridgeTitlePlaceholder')}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="buttonText" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                                    {t('bridgeButton')}
                                                </label>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                    💡 Ex: "Ver Cardápio", "Ir para Site", "Falar Comigo"
                                                </p>
                                                <input
                                                    type="text"
                                                    id="buttonText"
                                                    name="buttonText"
                                                    value={formData.buttonText || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                                    placeholder={t('bridgeButtonPlaceholder')}
                                                />
                                            </div>


                                            {/* Image Upload - Supabase Storage */}
                                            <ImageUpload
                                                bucket="qr-images"
                                                currentImageUrl={formData.imageUrl}
                                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                                label={t('logoUpload')}
                                                accept="image/*"
                                            />

                                            <div>
                                                <label htmlFor="whatsapp" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                                    {t('waNumber')}
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="whatsapp"
                                                    name="whatsapp"
                                                    value={formData.whatsapp || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                                    placeholder={t('waPlaceholder')}
                                                />
                                            </div>

                                            {/* Card Digital Links Editor - Only for CARD type */}
                                            {formData.projectType === 'CARD' && (
                                                <div className="col-span-2 mt-4">
                                                    <CardLinksEditor
                                                        links={formData.linksArray || []}
                                                        onChange={(links) => setFormData(prev => ({ ...prev, linksArray: links }))}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* URL - Only for LINK and BRIDGE, not CARD */}
                                    {formData.projectType !== 'CARD' && (
                                        <div>
                                            <label htmlFor="destinationUrl" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                                {t('targetUrl')} *
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
                                                    placeholder={t('urlPlaceholder')}
                                                    required
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Para onde o QR Code deve redirecionar
                                            </p>
                                        </div>
                                    )}

                                    {/* ——— NEW: Redirect Mode Selector (LINK type only) ——— */}
                                    {formData.projectType === 'LINK' && (
                                        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700/40 rounded-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Modo de Redirecionamento</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {([
                                                    { id: 'direct' as const, label: 'Direto', desc: 'Redirect 302', icon: '⚡' },
                                                    { id: 'iframe' as const, label: 'Iframe', desc: 'Mascarado', icon: '🔳' },
                                                ]).map(mode => (
                                                    <button
                                                        key={mode.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, redirectMode: mode.id }))}
                                                        className={`p-3 rounded-lg border-2 transition-all text-left ${formData.redirectMode === mode.id
                                                            ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:border-blue-400'
                                                            : 'border-slate-200 dark:border-rionegro-800 hover:border-blue-400/60'
                                                            }`}
                                                    >
                                                        <span className="text-lg block mb-1">{mode.icon}</span>
                                                        <p className="text-xs font-semibold text-slate-800 dark:text-white">{mode.label}</p>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{mode.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {formData.redirectMode === 'direct' && '⚡ O visitante vai direto para o destino. Sem página intermediária.'}
                                                {formData.redirectMode === 'iframe' && '🔳 O destino é exibido dentro de um iframe. A URL do hub permanece visível.'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Slug - Renamed for clarity */}
                                    <div>
                                        <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 dark:text-solimoes-400 mb-2">
                                            Endereço do Link (ex: seu-nome) *
                                        </label>
                                        <input
                                            type="text"
                                            id="slug"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all font-mono"
                                            placeholder="seu-nome"
                                            title="Apenas letras minúsculas, números e hífens"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            💡 Seu link será: <span className="font-mono text-acai-900 dark:text-solimoes-400">{window.location.origin}/#/v/{formData.slug || 'seu-nome'}</span>
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Use apenas letras minúsculas, números e hífens
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

                                        {/* Contrast Validation Warning */}
                                        {!contrastSafe && (
                                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                                                            ⚠️ Contraste Insuficiente
                                                        </p>
                                                        <p className="text-xs text-yellow-800 dark:text-yellow-400 mt-1">
                                                            Razão de contraste: <strong>{contrastRatio.toFixed(2)}:1</strong> (mínimo recomendado: 4.5:1)
                                                        </p>
                                                        <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                                                            O QR Code pode ser difícil de escanear em alguns dispositivos.
                                                            Sugestão: use uma cor mais escura como <strong>{suggestForegroundColor(bgColor)}</strong>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Contrast Success Indicator */}
                                        {contrastSafe && contrastInfo.level === 'aaa' && (
                                            <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                                <p className="text-xs text-green-800 dark:text-green-300 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    ✅ {contrastInfo.description} - Contraste: {contrastRatio.toFixed(2)}:1
                                                </p>
                                            </div>
                                        )}
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

                                    {/* ——— NEW: Bridge Page Toggle ——— */}
                                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-700/40 rounded-lg mb-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">Ativar Página Ponte (Cartão Digital)</h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Se ativado, o QR exibe o Cartão Digital (com template). Se desativado, redireciona direto.</p>
                                        </div>
                                        {/* Toggle Switch */}
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={formData.redirectMode === 'bridge' || formData.redirectMode === undefined}
                                            onClick={() => {
                                                const isCurrentlyOn = formData.redirectMode === 'bridge' || formData.redirectMode === undefined;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    redirectMode: isCurrentlyOn ? 'direct' : 'bridge',
                                                    directRedirect: isCurrentlyOn ? true : false
                                                }));
                                            }}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${(formData.redirectMode === 'bridge' || formData.redirectMode === undefined)
                                                ? 'bg-purple-600 dark:bg-purple-500'
                                                : 'bg-slate-200 dark:bg-slate-700'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform ${(formData.redirectMode === 'bridge' || formData.redirectMode === undefined) ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* ——— NEW: Template Selector ——— */}
                                    <div className="space-y-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-700/40 rounded-lg">
                                        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                            </svg>
                                            Template do Cartão Digital
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Salvo por projeto. Pode ser alterado a qualquer momento sem perda de dados.</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {bridgeTemplates.map(tpl => (
                                                <button
                                                    key={tpl.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, bridgeTemplate: tpl.id }))}
                                                    className={`p-3 rounded-lg border-2 transition-all text-left ${formData.bridgeTemplate === tpl.id
                                                        ? 'border-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-400'
                                                        : 'border-slate-200 dark:border-rionegro-800 hover:border-indigo-400/60'
                                                        }`}
                                                >
                                                    <span className="text-xl block mb-1">✨</span>
                                                    <p className="text-xs font-bold text-slate-800 dark:text-white">{tpl.name}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{tpl.description || 'Template personalizado'}</p>
                                                </button>
                                            ))}
                                            {bridgeTemplates.length === 0 && (
                                                <div className="col-span-2 p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                    Nenhum template encontrado. Crie um no Template Manager.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ——— NEW: Watermark Toggle ——— */}
                                    <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-700/40 rounded-lg">
                                        <div>
                                            <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-300">Marca D'Água "PROVA D'ÁGUA"</h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Exibe overlay diagonal no preview e no Cartão Digital. Ative durante testes/provas de arte.</p>
                                        </div>
                                        {/* Toggle Switch */}
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={formData.enableWatermark || false}
                                            onClick={() => setFormData(prev => ({ ...prev, enableWatermark: !prev.enableWatermark }))}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${formData.enableWatermark
                                                ? 'bg-rose-600 dark:bg-rose-500'
                                                : 'bg-slate-200 dark:bg-slate-700'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform ${formData.enableWatermark ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>



                                    {/* Gallery Consent - Available for all users */}
                                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-solimoes-50 dark:from-amber-900/10 dark:to-solimoes-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.inGallery || false}
                                                onChange={(e) => setFormData(prev => ({ ...prev, inGallery: e.target.checked }))}
                                                className="mt-1 w-4 h-4 text-amber-600 bg-white dark:bg-rionegro-950 border-amber-300 dark:border-amber-700 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                    🌟 Autorizo exibir este projeto na Galeria de Exemplos do Hub
                                                </span>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                    Seu projeto pode inspirar outros empreendedores e trazer visibilidade extra para seu negócio!
                                                    Você pode desativar isso a qualquer momento.
                                                </p>
                                                <p className="text-xs text-amber-700 dark:text-amber-500 mt-2 font-medium">
                                                    ⚠️ Marque esta opção APENAS se quiser que este modelo apareça na vitrine pública do Hub para todos verem. Seus projetos privados são salvos automaticamente na sua conta.
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Submit */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-acai-900 to-acai-700 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-acai-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save className="w-5 h-5" />
                                            {isSaving ? t('saving') : editingId ? t('updateProject') : t('saveProject')}
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
                                        <PhoneMockup formData={formData} templates={bridgeTemplates} />
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
                                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                                    {t('noProjectsYet')}
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
                                                            {project.project_type === 'LINK' ? 'Link / QR Code' : project.project_type === 'BRIDGE' ? 'Cartão Digital' : project.project_type === 'CARD' ? 'Bio Premium' : project.project_type}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                    /{project.slug}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            console.log('🖼️ Starting SVG QR Code download...');
                                                            const QRCodeStyling = (await import('qr-code-styling')).default;

                                                            const qrCode = new QRCodeStyling({
                                                                width: 1000,
                                                                height: 1000,
                                                                data: `${window.location.origin}/#/v/${project.slug}`,
                                                                image: project.qr_logo_url || undefined,
                                                                dotsOptions: {
                                                                    color: project.color || '#620939',
                                                                    type: "dots"
                                                                },
                                                                cornersSquareOptions: {
                                                                    type: "extra-rounded",
                                                                    color: project.color || '#620939',
                                                                },
                                                                cornersDotOptions: {
                                                                    type: "dot",
                                                                    color: project.color || '#620939',
                                                                },
                                                                backgroundOptions: {
                                                                    color: "transparent"
                                                                },
                                                                imageOptions: {
                                                                    crossOrigin: "anonymous",
                                                                    margin: 15
                                                                }
                                                            });

                                                            qrCode.download({ name: `qr-${project.slug}-vector`, extension: "svg" });
                                                            showToast(`QR Code SVG baixado!`, 'success');
                                                        } catch (error) {
                                                            console.error('❌ Download error:', error);
                                                            showToast('Erro ao baixar SVG. Tente novamente.', 'error');
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="Baixar QR Code (Alta Resolução)"
                                                >
                                                    <QrCode size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/#/v/${project.slug}`;
                                                        navigator.clipboard.writeText(url);
                                                        showToast('Link copiado!', 'success');
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Copiar Link"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/#/v/${project.slug}`, '_blank')}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Visualizar"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(project)}
                                                    className="p-2 text-slate-400 hover:text-acai-900 hover:bg-acai-50 dark:hover:bg-acai-900/20 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={handleCancelEdit} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                                    {t('cancelEdit')}
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

                                        <div id={`qr-card-${project.id}`} className="flex items-center justify-center p-4 bg-slate-50 dark:bg-rionegro-950 rounded-lg mb-3">
                                            <QRCode
                                                value={`${window.location.origin}/#/v/${project.slug}`}
                                                size={120}
                                                ecLevel="H"
                                                fgColor={project.color}
                                                bgColor="transparent"
                                                qrStyle={project.qr_style || "dots"}
                                                eyeRadius={project.qr_eye_radius || 10}
                                                logoImage={project.qr_logo_url || ''}
                                                logoWidth={project.qr_logo_url ? 30 : 0}
                                                logoHeight={project.qr_logo_url ? 30 : 0}
                                                removeQrCodeBehindLogo={true}
                                            />
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

                    {/* Success Modal */}
                    {showSuccessModal && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                                onClick={() => setShowSuccessModal(false)}
                            />

                            {/* Modal */}
                            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-rionegro-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                            <QrCode className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Projeto Criado!
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Seu link está pronto para usar
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowSuccessModal(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* URL Display */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Seu Link:
                                    </label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg">
                                        <input
                                            type="text"
                                            value={successUrl}
                                            readOnly
                                            className="flex-1 bg-transparent border-none text-sm font-mono text-slate-900 dark:text-white focus:ring-0 p-0"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            try {
                                                console.log('🖼️ Starting high-res QR Code download from modal...');

                                                // Get the original canvas from react-qrcode-logo
                                                const qrCanvas = document.querySelector('#qr-code-styled canvas') as HTMLCanvasElement;
                                                if (!qrCanvas) {
                                                    showToast('QR Code não encontrado', 'error');
                                                    return;
                                                }

                                                // Create high-resolution canvas (4000x4000 for print quality)
                                                const canvas = document.createElement('canvas');
                                                const ctx = canvas.getContext('2d', { alpha: false });
                                                if (!ctx) {
                                                    showToast('Erro ao criar canvas', 'error');
                                                    return;
                                                }

                                                // Set high resolution
                                                const highResSize = 4000;
                                                canvas.width = highResSize;
                                                canvas.height = highResSize;

                                                // White background
                                                ctx.fillStyle = '#FFFFFF';
                                                ctx.fillRect(0, 0, highResSize, highResSize);

                                                // Disable image smoothing for crisp QR codes
                                                ctx.imageSmoothingEnabled = false;

                                                try {
                                                    // Draw QR code scaled up to high resolution
                                                    ctx.drawImage(qrCanvas, 0, 0, highResSize, highResSize);
                                                    console.log('✅ QR Code drawn at', highResSize, 'x', highResSize);
                                                } catch (corsError) {
                                                    console.warn('⚠️ CORS error drawing QR Code, continuing without logo:', corsError);
                                                    // QR Code will still download, just without the external logo
                                                }

                                                // Convert to blob and download
                                                canvas.toBlob((blob) => {
                                                    if (blob) {
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `qr-code-${successUrl.split('/').pop()}-${highResSize}px.png`;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                        showToast(`QR Code baixado em ${highResSize}px!`, 'success');
                                                        console.log('✅ Download completed:', a.download);
                                                    } else {
                                                        showToast('Erro ao gerar imagem', 'error');
                                                    }
                                                }, 'image/png', 1.0); // Quality 1.0 = maximum
                                            } catch (error) {
                                                console.error('❌ Download error:', error);
                                                showToast('Erro ao baixar QR Code', 'error');
                                            }
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                                    >
                                        <QrCode size={18} />
                                        ⬇️ Baixar QR Code (2000px)
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(successUrl);
                                            showToast('Link copiado!', 'success');
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-acai-900 hover:bg-acai-800 text-white rounded-lg font-semibold transition-all"
                                    >
                                        <Copy size={18} />
                                        Copiar Link
                                    </button>
                                    <button
                                        onClick={() => {
                                            const message = `Confira meu cartão digital: ${successUrl}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                                    >
                                        <Share2 size={18} />
                                        Enviar no WhatsApp
                                    </button>
                                    <button
                                        onClick={() => window.open(successUrl, '_blank')}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-all"
                                    >
                                        <ExternalLink size={18} />
                                        Visualizar
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default QRdaguaPage;
