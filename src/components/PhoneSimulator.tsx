import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type SimulatorMode = 'venda' | 'bio' | 'pix';

interface PhoneSimulatorProps {
    className?: string;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ className = '' }) => {
    const [mode, setMode] = useState<SimulatorMode>('venda');

    const screens = {
        venda: {
            title: 'Modo Venda',
            bg: 'from-purple-900 to-violet-900',
            content: (
                <div className="space-y-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Açaí Premium</h2>
                        <p className="text-purple-200 text-sm">Delivery em 30min</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <div className="flex justify-center mb-3">
                            <QRCodeSVG
                                value="https://exemplo.com/venda"
                                size={120}
                                level="H"
                                fgColor="#7c3aed"
                                bgColor="transparent"
                            />
                        </div>
                        <p className="text-white text-xs text-center">Escaneie para pedir</p>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg">
                        🛒 Fazer Pedido
                    </button>
                </div>
            ),
        },
        bio: {
            title: 'Modo Bio',
            bg: 'from-fuchsia-900 to-pink-900',
            content: (
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
                            👤
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Ana Silva</h2>
                        <p className="text-pink-200 text-sm">Designer & Criadora</p>
                    </div>
                    <div className="space-y-2">
                        <a href="#" className="block w-full py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium text-center transition-all">
                            📷 Instagram
                        </a>
                        <a href="#" className="block w-full py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium text-center transition-all">
                            💼 Portfolio
                        </a>
                        <a href="#" className="block w-full py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium text-center transition-all">
                            📧 Contato
                        </a>
                    </div>
                </div>
            ),
        },
        pix: {
            title: 'Modo Pix',
            bg: 'from-teal-900 to-cyan-900',
            content: (
                <div className="space-y-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Receba Pagamentos</h2>
                        <p className="text-teal-200 text-sm">Instantâneo e seguro</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="flex justify-center mb-4">
                            <QRCodeSVG
                                value="00020126580014br.gov.bcb.pix0136"
                                size={140}
                                level="H"
                                fgColor="#14b8a6"
                                bgColor="transparent"
                            />
                        </div>
                        <p className="text-white text-xs text-center font-mono bg-black/30 p-2 rounded">
                            pix@exemplo.com
                        </p>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg">
                        📋 Copiar Chave
                    </button>
                </div>
            ),
        },
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* Mode Selector Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setMode('venda')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${mode === 'venda'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    🛍️ Modo Venda
                </button>
                <button
                    onClick={() => setMode('bio')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${mode === 'bio'
                        ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    👤 Modo Bio
                </button>
                <button
                    onClick={() => setMode('pix')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${mode === 'pix'
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    💰 Modo Pix
                </button>
            </div>

            {/* Phone Mockup */}
            <div className="relative">
                {/* Phone Frame - Dark Premium */}
                <div className="w-[280px] h-[560px] bg-slate-900 rounded-[40px] shadow-2xl border-8 border-slate-800 relative overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10"></div>

                    {/* Screen Content with Gradient Background */}
                    <div className={`w-full h-full bg-gradient-to-br ${screens[mode].bg} p-6 pt-10 overflow-y-auto`}>
                        {/* Status Bar */}
                        <div className="flex justify-between items-center text-white text-xs mb-6 opacity-70">
                            <span>9:41</span>
                            <div className="flex gap-1">
                                <div className="w-4 h-4">📶</div>
                                <div className="w-4 h-4">🔋</div>
                            </div>
                        </div>

                        {/* Dynamic Content */}
                        <div className="animate-fade-in">
                            {screens[mode].content}
                        </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${screens[mode].bg} opacity-20 blur-3xl -z-10 scale-110`}></div>
            </div>

            {/* Mode Label */}
            <p className="mt-4 text-sm text-slate-400 font-medium">
                {screens[mode].title}
            </p>

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};
