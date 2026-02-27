import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { QRCode } from 'react-qrcode-logo';
import { ExternalLink, Phone, Instagram, Copy, Check, Download, Share2, X } from 'lucide-react';

interface BridgePageData {
    project_type: string;
    client_name: string;
    destination_url: string;
    slug: string;
    color: string;
    description: string;
    page_title?: string;
    button_text?: string;
    image_url?: string;
    whatsapp?: string;
    instagram?: string;
    pix_key?: string;
    qr_logo_url?: string;
    qr_text_top?: string;
    qr_text_bottom?: string;
    direct_redirect?: boolean;
    redirect_mode?: 'direct' | 'iframe' | 'bridge';
    enable_watermark?: boolean;
    profiles?: { role: string };
    bridge_template?: string;
    links_array?: any;
}

export const BridgePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<BridgePageData | null>(null);
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [copied, setCopied] = useState<'phone' | 'pix' | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);

    const handleCopy = async (text: string, type: 'phone' | 'pix') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownloadQR = async () => {
        try {
            // Import dynamically to avoid bundle bloat
            const QRCodeStyling = (await import('qr-code-styling')).default;

            const qrCode = new QRCodeStyling({
                width: 1000,
                height: 1000,
                data: `${window.location.origin}/#/v/${data?.slug}`,
                image: data?.image_url || undefined,
                dotsOptions: {
                    color: data?.color || '#7c3aed',
                    type: "dots"
                },
                cornersSquareOptions: {
                    type: "extra-rounded",
                    color: data?.color || '#7c3aed',
                },
                cornersDotOptions: {
                    type: "dot",
                    color: data?.color || '#7c3aed',
                },
                backgroundOptions: {
                    color: "transparent"
                },
                imageOptions: {
                    crossOrigin: "anonymous",
                    margin: 15
                }
            });

            qrCode.download({ name: `qr-code-${data?.slug || 'hub'}`, extension: "svg" });
        } catch (error) {
            console.error('Failed to generate SVG QR code:', error);
        }
    };

    const handleShareWhatsApp = () => {
        const url = `${window.location.origin} /#/v / ${data?.slug} `;
        const text = `Confira: ${data?.page_title || data?.client_name} `;
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    };

    useEffect(() => {
        const fetchBridgeData = async () => {
            if (!slug) return;

            try {
                const { data: qrData, error } = await supabase
                    .from('qr_codes')
                    .select('*, profiles!owner_id(role)') // Join to get owner's role
                    .eq('slug', slug)
                    .single();

                if (error || !qrData) {
                    setNotFound(true);
                    return;
                }

                setData(qrData as BridgePageData);

                if (qrData.bridge_template) {
                    const { data: tplData } = await supabase
                        .from('bridge_templates')
                        .select('*')
                        .eq('id', qrData.bridge_template)
                        .single();
                    if (tplData) setTemplate(tplData);
                }

                // Parse links JSON if it's a string
                if (qrData.links_array && typeof qrData.links_array === 'string') {
                    try {
                        qrData.links_array = JSON.parse(qrData.links_array);
                    } catch (e) {
                        console.error('Failed to parse links_array', e);
                        qrData.links_array = [];
                    }
                }

                // Redirect logic based on new redirect_mode field (falls back to direct_redirect for compat)
                const ownerRole = qrData.profiles?.role;
                const isPro = ownerRole === 'admin';
                const redirectMode = qrData.redirect_mode;

                if (redirectMode === 'direct' || (isPro && qrData.direct_redirect === true && !redirectMode)) {
                    window.location.replace(qrData.destination_url);
                    return;
                }
                // iframe mode and bridge mode: render page normally below

            } catch (err) {
                console.error('Error fetching bridge data:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchBridgeData();
    }, [slug]);



    // Handle Direct Redirect (PRO feature)
    useEffect(() => {
        if (!data || !data.destination_url) return;

        const isPro = data.profiles?.role === 'admin';

        // If Direct Redirect is enabled AND user is PRO
        if (isPro && data.direct_redirect) {
            window.location.href = data.destination_url;
            return; // Stop rendering
        }

        // Handle explicit redirect modes
        if (data.redirect_mode === 'direct') {
            window.location.href = data.destination_url;
            return;
        }
    }, [data]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (notFound || !data) {
        return (
            <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                    <p className="text-slate-400">Link não encontrado</p>
                </div>
            </div>
        );
    }

    // Watermark overlay — shown when enable_watermark is true
    const WatermarkOverlay = () => !data?.enable_watermark ? null : (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            <span
                style={{
                    transform: 'rotate(-35deg)',
                    fontSize: '48px',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    color: 'rgba(255,255,255,0.10)',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
            >
                PROVA D'ÁGUA
            </span>
        </div>
    );

    const PremiumWatermarkBadge = () => (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-top-4 duration-500 fade-in">
            <div className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-500/30 border border-orange-400/40 backdrop-blur-md flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-white text-xs font-bold tracking-wider uppercase drop-shadow-sm">
                    Prova D'água
                </span>
            </div>
        </div>
    );

    // iframe mode: wrap destination in full-screen iframe
    if (data?.redirect_mode === 'iframe') {
        return (
            <div className="fixed inset-0 w-full h-full">
                {data.enable_watermark && <PremiumWatermarkBadge />}
                <iframe
                    src={data.destination_url}
                    className="w-full h-full border-0"
                    title={data.page_title || data.client_name}
                    allow="fullscreen"
                />
            </div>
        );
    }

    // BRIDGE or CARD page rendering
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" style={template?.font_family ? { fontFamily: template.font_family } : {}}>
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#0B1120] -z-20" style={template?.bg_color ? { backgroundColor: template.bg_color } : {}}></div>

            {/* Ambient gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen mix-blend-color-dodge"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen mix-blend-color-dodge"></div>

            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10 -z-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(${data.color || '#fff'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

            {/* ——— NEW: Top-Centered Watermark Badge ——— */}
            {data.enable_watermark && <PremiumWatermarkBadge />}

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Glassmorphism Container - Dark Mode */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden" style={template?.card_bg_color ? { backgroundColor: template.card_bg_color } : {}}>
                    {/* Header Image */}
                    {data.image_url && (
                        <div className="w-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-violet-900/20 relative">
                            <img
                                src={data.image_url}
                                alt={data.client_name}
                                className="w-full max-h-[350px] object-contain opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-transparent to-transparent"></div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* Social Bar - Top */}
                        {(data.whatsapp || data.instagram || data.pix_key) && (
                            <div className="flex justify-center gap-3 mb-8 flex-wrap">
                                {data.whatsapp && (
                                    <a
                                        href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-full text-green-300 hover:text-green-200 transition-all"
                                        title="WhatsApp"
                                    >
                                        <Phone size={18} />
                                        <span className="text-sm font-medium">WhatsApp</span>
                                    </a>
                                )}
                                {data.instagram && (
                                    <a
                                        href={`https://instagram.com/${data.instagram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 rounded-full text-pink-300 hover:text-pink-200 transition-all"
                                        title="Instagram"
                                    >
                                        <Instagram size={18} />
                                        <span className="text-sm font-medium">Instagram</span>
                                    </a>
                                )}
                                {data.pix_key && (
                                    <button
                                        onClick={() => handleCopy(data.pix_key!, 'pix')}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-full text-purple-300 hover:text-purple-200 transition-all"
                                        title="Copiar Chave Pix"
                                    >
                                        {copied === 'pix' ? <Check size={18} /> : <Copy size={18} />}
                                        <span className="text-sm font-medium">
                                            {copied === 'pix' ? 'Copiado!' : 'Pix'}
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* QR Code with Premium Dark Glassmorphism - CLICKABLE */}
                        {data.qr_logo_url && (
                            <div className="flex justify-center mb-8">
                                <div className="text-center">
                                    {data.qr_text_top && (
                                        <p className="text-sm text-slate-300 font-medium mb-4">
                                            {data.qr_text_top}
                                        </p>
                                    )}

                                    {/* Dark Glassmorphism QR Container - CLICKABLE */}
                                    <div
                                        className="relative group inline-block cursor-pointer"
                                        onClick={() => setShowQRModal(true)}
                                        title="Clique para ampliar"
                                    >
                                        {/* Purple Glow Effect */}
                                        <div className="absolute -inset-6 bg-gradient-to-br from-purple-500/20 via-violet-500/20 to-fuchsia-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

                                        {/* Dark Glass QR Container */}
                                        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 group-hover:border-purple-400/40 transition-all">
                                            {/* Decorative Corners - Purple Accent */}
                                            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-purple-400/60 rounded-tl-lg"></div>
                                            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-400/60 rounded-tr-lg"></div>
                                            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-purple-400/60 rounded-bl-lg"></div>
                                            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-purple-400/60 rounded-br-lg"></div>

                                            {/* QR Code - Styled with Dots */}
                                            <div id="qr-code-styled" className="bg-white/95 p-4 rounded-xl">
                                                <QRCode
                                                    value={`${window.location.origin}/#/v/${data.slug}`}
                                                    size={200}
                                                    ecLevel="H"
                                                    fgColor={data.color || '#7c3aed'}
                                                    bgColor="transparent"
                                                    qrStyle="dots"
                                                    eyeRadius={10}
                                                    logoImage={data.qr_logo_url || ''}
                                                    logoWidth={40}
                                                    logoHeight={40}
                                                    removeQrCodeBehindLogo={true}
                                                />
                                            </div>

                                            {/* Hover hint */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-2xl">
                                                <span className="text-white text-sm font-medium">Clique para ampliar</span>
                                            </div>
                                        </div>
                                    </div>

                                    {data.qr_text_bottom && (
                                        <p className="text-xs text-slate-400 mt-4">
                                            {data.qr_text_bottom}
                                        </p>
                                    )}

                                    {/* QR Action Buttons */}
                                    <div className="flex gap-2 justify-center mt-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadQR(); }}
                                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all text-sm"
                                            title="Baixar QR Code"
                                        >
                                            <Download size={16} />
                                            Baixar
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleShareWhatsApp(); }}
                                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all text-sm"
                                            title="Compartilhar no WhatsApp"
                                        >
                                            <Share2 size={16} />
                                            Enviar Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Title with Gradient */}
                        <h1
                            className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent"
                            style={template?.text_color ? { color: template.text_color, WebkitTextFillColor: template.text_color } : {}}
                        >
                            {data.page_title || data.client_name}
                        </h1>

                        {/* Description */}
                        {data.description && (
                            <p className="text-lg text-slate-300 text-center mb-10 leading-relaxed" style={template?.text_color ? { color: template.text_color } : {}}>
                                {data.description}
                            </p>
                        )}

                        {/* CTA Buttons - Wide, Premium, Dark Mode */}
                        <div className="flex flex-col gap-4">
                            {/* Render Custom Links Array for TypeBridge (CARD project) */}
                            {data.links_array && Array.isArray(data.links_array) && data.links_array.length > 0 ? (
                                data.links_array.filter((link: any) => link.active).map((link: any) => (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-bold text-white shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                                        style={{
                                            background: link.type === 'whatsapp' ? '#25D366' : (template?.button_bg_color || `linear-gradient(135deg, ${data.color || '#7c3aed'} 0%, ${data.color || '#a855f7'} 100%)`),
                                            color: template?.button_text_color || '#ffffff',
                                            boxShadow: `0 10px 40px ${data.color || '#7c3aed'}40`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                        <span className="relative z-10 text-lg">{link.icon} {link.label || 'Acessar'}</span>
                                    </a>
                                ))
                            ) : (
                                <>
                                    {/* Default behavior if no links_array is present */}
                                    {data.destination_url && (
                                        <a
                                            href={data.destination_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-bold text-white shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                                            style={{
                                                background: template?.button_bg_color || `linear-gradient(135deg, ${data.color || '#7c3aed'} 0%, ${data.color || '#a855f7'} 100%)`,
                                                boxShadow: `0 10px 40px ${data.color || '#7c3aed'}40`,
                                                color: template?.button_text_color || '#ffffff'
                                            }}
                                        >
                                            {/* Shine Effect on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                            <ExternalLink size={22} className="relative z-10" />
                                            <span className="relative z-10 text-lg">{data.button_text || 'Acessar'}</span>
                                        </a>
                                    )}

                                    {/* WhatsApp Button - Premium Dark Style */}
                                    {data.whatsapp && (
                                        <a
                                            href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl font-bold text-white shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                                            style={{ boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)' }}
                                        >
                                            {/* Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                            <Phone size={22} className="relative z-10" />
                                            <span className="relative z-10 text-lg">Falar no WhatsApp</span>
                                        </a>
                                    )}
                                </>
                            )}

                            {/* Copy Number Button (if whatsapp exists) */}
                            {data.whatsapp && (!data.links_array || data.links_array.length === 0) && (
                                <button
                                    onClick={() => handleCopy(data.whatsapp!, 'phone')}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all"
                                >
                                    {copied === 'phone' ? (
                                        <>
                                            <Check size={18} className="text-green-400" />
                                            <span className="text-sm font-medium text-green-400">Número Copiado!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            <span className="text-sm font-medium">Copiar Número</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Footer - Conditional "Powered by" */}
                        <div className="mt-12 pt-6 border-t border-white/5 text-center">
                            {data.profiles?.role !== 'admin' && ( // Show only for FREE users
                                <p className="text-sm text-slate-500">
                                    Powered by{' '}
                                    <a
                                        href={window.location.origin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        Hub d'Água
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* QR Code Full-Screen Modal */}
                {showQRModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={() => setShowQRModal(false)}
                    >
                        <div className="relative max-w-2xl w-full">
                            {/* Close Button */}
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="absolute -top-12 right-0 p-2 text-white hover:text-purple-400 transition-colors"
                                title="Fechar"
                            >
                                <X size={32} />
                            </button>

                            {/* QR Code Container */}
                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
                                <div className="bg-white p-8 rounded-2xl">
                                    <QRCode
                                        value={`${window.location.origin}/#/v/${data.slug}`}
                                        size={200}
                                        ecLevel="H"
                                        fgColor={data.color || '#7c3aed'}
                                        bgColor="transparent"
                                        qrStyle="dots"
                                        eyeRadius={10}
                                        removeQrCodeBehindLogo={true}
                                        logoImage={data.image_url}
                                        logoWidth={50}
                                        logoHeight={50}
                                        logoPadding={5}
                                        logoPaddingStyle="circle"

                                    />
                                </div>

                                {/* Action Buttons in Modal */}
                                <div className="flex gap-3 justify-center mt-6">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDownloadQR(); }}
                                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-all"
                                    >
                                        <Download size={20} />
                                        Baixar HD
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleShareWhatsApp(); }}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium transition-all"
                                    >
                                        <Share2 size={20} />
                                        Compartilhar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
