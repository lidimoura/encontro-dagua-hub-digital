import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, MessageCircle, RefreshCcw } from 'lucide-react';
import { initGA4, trackCheckoutCancel } from '@/lib/analytics';

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  useEffect(() => {
    initGA4();
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan') ?? undefined;
    trackCheckoutCancel(plan);
  }, []);

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/20">
            <XCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-4">
          Checkout Cancelado
        </h1>
        <p className="text-lg text-slate-300 mb-3">
          Nenhuma cobrança foi realizada.
        </p>
        <p className="text-slate-400 mb-8">
          Mudou de ideia? Tudo bem! Você pode tentar novamente quando quiser,
          ou falar diretamente com nossa equipe pelo WhatsApp.
        </p>

        {/* Planos reminder */}
        <div className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-6 mb-8 text-left">
          <p className="text-amber-400 font-semibold text-sm mb-3">🌿 Lembre-se dos nossos planos:</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white text-sm font-medium">Pro Mensal</span>
              <span className="text-amber-400 font-bold text-sm">R$ 3,00/mês</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm font-medium">Pro Anual</span>
              <span className="text-green-400 font-bold text-sm">R$ 29,90/ano</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-3">✓ 20% de desconto por indicação · ✓ 60% off para Impacto Social</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-amber-500/20"
          >
            <RefreshCcw className="w-5 h-5" /> Tentar novamente
          </button>
          <a
            href="https://wa.me/5592992943998?text=Quero saber mais sobre o Hub Digital"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-700/80 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all"
          >
            <MessageCircle className="w-5 h-5" /> Falar no WhatsApp
          </a>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-3 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
