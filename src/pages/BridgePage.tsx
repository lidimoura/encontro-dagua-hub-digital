import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink, Phone } from 'lucide-react';

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
    qr_logo_url?: string;
    qr_text_top?: string;
    qr_text_bottom?: string;
    direct_redirect?: boolean; // PRO feature
    profiles?: { role: string }; // Owner's role for plan detection
}

export const BridgePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<BridgePageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

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

                // Plan-based redirect logic
                const ownerRole = qrData.profiles?.role;
                const isPro = ownerRole === 'admin';

                // PRO users with direct_redirect enabled: Skip BridgePage
                if (isPro && qrData.direct_redirect === true) {
                    window.location.replace(qrData.destination_url);
                    return;
                }

                // FREE users OR PRO users without direct_redirect: Show BridgePage
                // (This includes all project types: LINK, BRIDGE, CARD)

            } catch (err) {
                console.error('Error fetching bridge data:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchBridgeData();
    }, [slug]);

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

    // BRIDGE or CARD page rendering
    return (
        <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-2xl w-full relative z-10">
                {/* Glassmorphism Container - Dark Mode */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                    {/* Header Image */}
                    {data.image_url && (
                        <div className="w-full h-64 bg-gradient-to-br from-purple-900/20 to-violet-900/20 overflow-hidden relative">
                            <img
                                src={data.image_url}
                                alt={data.client_name}
                                className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12]/80 to-transparent"></div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* QR Code with Premium Dark Glassmorphism */}
                        {data.qr_logo_url && (
                            <div className="flex justify-center mb-8">
                                <div className="text-center">
                                    {data.qr_text_top && (
                                        <p className="text-sm text-slate-300 font-medium mb-4">
                                            {data.qr_text_top}
                                        </p>
                                    )}

                                    {/* Dark Glassmorphism QR Container */}
                                    <div className="relative group inline-block">
                                        {/* Purple Glow Effect */}
                                        <div className="absolute -inset-6 bg-gradient-to-br from-purple-500/20 via-violet-500/20 to-fuchsia-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

                                        {/* Dark Glass QR Container */}
                                        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                                            {/* Decorative Corners - Purple Accent */}
                                            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-purple-400/60 rounded-tl-lg"></div>
                                            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-400/60 rounded-tr-lg"></div>
                                            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-purple-400/60 rounded-bl-lg"></div>
                                            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-purple-400/60 rounded-br-lg"></div>

                                            {/* QR Code - White on Transparent */}
                                            <div className="bg-white/95 p-4 rounded-xl">
                                                <QRCodeSVG
                                                    value={`${window.location.origin}/#/v/${data.slug}`}
                                                    size={200}
                                                    level="H"
                                                    fgColor={data.color || '#7c3aed'}
                                                    bgColor="transparent"
                                                    imageSettings={data.qr_logo_url ? {
                                                        src: data.qr_logo_url,
                                                        height: 40,
                                                        width: 40,
                                                        excavate: true,
                                                    } : undefined}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {data.qr_text_bottom && (
                                        <p className="text-xs text-slate-400 mt-4">
                                            {data.qr_text_bottom}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Title with Gradient */}
                        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
                            {data.page_title || data.client_name}
                        </h1>

                        {/* Description */}
                        {data.description && (
                            <p className="text-lg text-slate-300 text-center mb-10 leading-relaxed">
                                {data.description}
                            </p>
                        )}

                        {/* CTA Buttons - Wide, Premium, Dark Mode */}
                        <div className="flex flex-col gap-4">
                            <a
                                href={data.destination_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-bold text-white shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${data.color || '#7c3aed'} 0%, ${data.color || '#a855f7'} 100%)`,
                                    boxShadow: `0 10px 40px ${data.color || '#7c3aed'}40`
                                }}
                            >
                                {/* Shine Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                <ExternalLink size={22} className="relative z-10" />
                                <span className="relative z-10 text-lg">{data.button_text || 'Acessar'}</span>
                            </a>

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
                        </div>

                        {/* Footer - Conditional "Powered by" */}
                        <div className="mt-12 pt-6 border-t border-white/5 text-center">
                            {data.profiles?.role !== 'admin' && ( // Show only for FREE users
                                <p className="text-sm text-slate-500">
                                    Powered by <span className="font-semibold text-purple-400">Encontro D'água Hub</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
