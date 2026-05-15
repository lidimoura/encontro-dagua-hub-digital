import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Zap, Users, BarChart3, MessageCircle } from 'lucide-react';

/**
 * ══ KOMMO PARTNER SECTION ═══════════════════════════════════════════════════
 * Dynamic, collapsible section for the Kommo CRM partnership.
 * Hidden by default — triggered via "Soluções Internacionais" ou "Escalar com Kommo".
 *
 * Branding compliance:
 *   - Encontro d'Água Hub é uma entidade independente, NÃO uma divisão do Kommo.
 *   - Usa badges oficiais Kommo (public/kommo/Badge dark.png & Badge light.png).
 *   - CTA aponta EXCLUSIVAMENTE para https://m.me/encontrodagua (proteção de comissão).
 * ══════════════════════════════════════════════════════════════════════════════
 */

const KOMMO_FEATURES = [
  {
    icon: Zap,
    title: 'Pipeline Messenger-First',
    description: 'Centralize WhatsApp, Instagram, Facebook e Telegram em um único funil inteligente.',
  },
  {
    icon: Users,
    title: 'Salesbot & Automações',
    description: 'Bots nativos que qualificam leads 24/7 sem intervenção humana.',
  },
  {
    icon: BarChart3,
    title: 'Analytics em Tempo Real',
    description: 'Dashboards de conversão, tempo de resposta e performance por canal.',
  },
  {
    icon: Shield,
    title: 'Conformidade & LGPD',
    description: 'Dados protegidos com criptografia, auditoria e controle de acesso granular.',
  },
];

interface KommoPartnerSectionProps {
  /** If true, section starts expanded. Default: false (collapsed). */
  initiallyOpen?: boolean;
}

export const KommoPartnerSection: React.FC<KommoPartnerSectionProps> = ({ initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <section id="sec-kommo-partner" className="py-16 px-6 bg-[#02040a] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Toggle Trigger */}
        <button
          id="btn-kommo-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full group flex items-center justify-between p-6 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <img
              src="/kommo/Badge dark.png"
              alt="Kommo Certified Partner"
              className="w-10 h-10 object-contain"
            />
            <div className="text-left">
              <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                Escalar com Kommo
              </h3>
              <p className="text-sm text-slate-400">
                Parceiro Certificado · Soluções Internacionais de CRM
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-blue-400/70 font-medium uppercase tracking-wider">
              {isOpen ? 'Recolher' : 'Explorar'}
            </span>
            {isOpen
              ? <ChevronUp className="w-5 h-5 text-blue-400" />
              : <ChevronDown className="w-5 h-5 text-blue-400" />
            }
          </div>
        </button>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          {/* Hero Banner — centralizado */}
          <div className="bg-gradient-to-br from-[#0a1628] to-[#060d1a] border border-blue-500/15 rounded-3xl p-8 md:p-12 mb-8">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <img
                src="/kommo/Badge light.png"
                alt="Kommo Partner Badge"
                className="w-20 h-20 object-contain flex-shrink-0"
              />
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Shield className="w-3 h-3" /> Parceiro Certificado
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  CRM Messenger-First para escalar sua operação
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl">
                  O <strong className="text-white">Encontro d'Água Hub</strong> é parceiro certificado Kommo,
                  oferecendo implementação, customização e suporte especializado para negócios
                  que querem centralizar toda a comunicação em um único pipeline inteligente.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {KOMMO_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-blue-500/30 transition-all group/card"
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/card:bg-blue-500/20 transition-colors">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-1">{feat.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{feat.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA — ÚNICO, aponta exclusivamente para Messenger (proteção de comissão) */}
            <div className="flex flex-col items-center gap-4">
              <a
                id="btn-kommo-contact"
                href="https://m.me/encontrodagua"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-blue-500/20 hover:-translate-y-0.5 active:scale-[0.98] flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Solicitar Consultoria e Teste Grátis
              </a>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <p className="text-center text-xs text-slate-600 max-w-xl mx-auto">
            O Encontro d'Água Hub é uma entidade independente e parceiro certificado Kommo.
            Não somos uma divisão, filial ou representante oficial da Kommo Inc.
          </p>
        </div>
      </div>
    </section>
  );
};

export default KommoPartnerSection;
