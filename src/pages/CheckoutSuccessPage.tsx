import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles, Home } from 'lucide-react';
import { initGA4, trackCheckoutSuccess } from '@/lib/analytics';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    initGA4();
    // Inferir plano da URL (Stripe redireciona com ?plan=mensal|anual)
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan') ?? 'unknown';
    const value = plan === 'anual' ? 29.9 : 3;
    trackCheckoutSuccess(plan, value);
  }, []);

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Animated success icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3 h-3" /> Pagamento Confirmado
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-4">
          Bem-vinda ao Hub! 🌿
        </h1>
        <p className="text-lg text-slate-300 mb-3">
          Sua assinatura foi ativada com sucesso.
        </p>
        <p className="text-slate-400 mb-8">
          Em instantes você receberá um e-mail com seus dados de acesso.
          A Amazô está pronta para te receber!
        </p>

        {/* Action cards */}
        <div className="space-y-3 mb-8">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-left">
            <p className="text-white font-semibold text-sm mb-1">📧 Verifique seu e-mail</p>
            <p className="text-slate-400 text-xs">Suas credenciais de acesso foram enviadas</p>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-left">
            <p className="text-white font-semibold text-sm mb-1">💬 Entre em contato</p>
            <p className="text-slate-400 text-xs">
              Dúvidas? WhatsApp:{' '}
              <a
                href="https://wa.me/5592992943998?text=Acabei de assinar o Hub!"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline"
              >
                (92) 99294-3998
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-green-500/20 mb-3"
        >
          Acessar o Hub <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-3 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" /> Voltar à página inicial
        </button>
      </div>
    </div>
  );
}
