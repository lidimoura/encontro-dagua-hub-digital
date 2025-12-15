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
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error || !qrData) {
                    setNotFound(true);
                    return;
                }

                setData(qrData as BridgePageData);

                // If it's a LINK type, redirect immediately
                if (qrData.project_type === 'LINK') {
                    window.location.href = qrData.destination_url;
                }
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (notFound || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
                    <p className="text-slate-600 dark:text-slate-400">Link não encontrado</p>
                </div>
            </div>
        );
    }

    // BRIDGE or CARD page rendering
    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4"
            style={{ backgroundColor: data.color ? `${data.color}10` : undefined }}
        >
            <div className="max-w-2xl w-full">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header Image */}
                    {data.image_url && (
                        <div className="w-full h-64 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <img
                                src={data.image_url}
                                alt={data.client_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* QR Code with custom styling */}
                        {data.qr_logo_url && (
                            <div className="flex justify-center mb-8">
                                <div className="text-center">
                                    {data.qr_text_top && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            {data.qr_text_top}
                                        </p>
                                    )}
                                    <div className="bg-white p-4 rounded-2xl shadow-lg inline-block">
                                        <QRCodeSVG
                                            value={`${window.location.origin}/#/v/${data.slug}`}
                                            size={200}
                                            level="H"
                                            includeMargin
                                            fgColor={data.color || '#000000'}
                                            imageSettings={data.qr_logo_url ? {
                                                src: data.qr_logo_url,
                                                height: 40,
                                                width: 40,
                                                excavate: true,
                                            } : undefined}
                                        />
                                    </div>
                                    {data.qr_text_bottom && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                            {data.qr_text_bottom}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <h1
                            className="text-3xl md:text-4xl font-bold text-center mb-4"
                            style={{ color: data.color || '#1f2937' }}
                        >
                            {data.page_title || data.client_name}
                        </h1>

                        {/* Description */}
                        {data.description && (
                            <p className="text-lg text-slate-600 dark:text-slate-300 text-center mb-8 leading-relaxed">
                                {data.description}
                            </p>
                        )}

                        {/* CTA Button */}
                        <div className="flex flex-col gap-4">
                            <a
                                href={data.destination_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                style={{ backgroundColor: data.color || '#9333ea' }}
                            >
                                <ExternalLink size={20} />
                                {data.button_text || 'Acessar'}
                            </a>

                            {/* WhatsApp Button */}
                            {data.whatsapp && (
                                <a
                                    href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                >
                                    <Phone size={20} />
                                    Falar no WhatsApp
                                </a>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Powered by <span className="font-semibold text-primary-600">Encontro D'água Hub</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
