import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Zap, Users, BarChart3, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GoogleCalendarButton } from '@/components/GoogleCalendarButton';

interface KommoPartnerSectionProps {
  initiallyOpen?: boolean;
}

export const KommoPartnerSection: React.FC<KommoPartnerSectionProps> = ({ initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const { language } = useTranslation();
  const isEn = language === 'en';

  const features = isEn
    ? [
        {
          icon: Zap,
          title: 'Messenger-First Pipeline',
          description: 'Centralize WhatsApp, Instagram, Facebook, and Telegram in one intelligent sales funnel.',
        },
        {
          icon: Users,
          title: 'Salesbot & GPTMaker AI Integration',
          description: 'Native bots and AI agents (GPTMaker) qualifying leads 24/7 with your structured business data.',
        },
        {
          icon: BarChart3,
          title: 'Structured Data & Analytics',
          description: 'Conversion dashboards, response times, loss reasons, and channel performance.',
        },
        {
          icon: Shield,
          title: 'Compliance & Data Governance',
          description: 'Protected data with encryption, audit trails, and role-based access control.',
        },
      ]
    : [
        {
          icon: Zap,
          title: 'Pipeline Messenger-First',
          description: 'Centralize WhatsApp, Instagram, Facebook e Telegram em um único funil inteligente.',
        },
        {
          icon: Users,
          title: 'Salesbot & Integração GPTMaker',
          description: 'Bots nativos e agentes de IA (GPTMaker) que qualificam leads 24/7 com a base de dados do seu negócio.',
        },
        {
          icon: BarChart3,
          title: 'Dados Estruturados & Analytics',
          description: 'Dashboards de conversão, tempo de resposta, motivos de perda e performance por canal.',
        },
        {
          icon: Shield,
          title: 'Conformidade & LGPD',
          description: 'Dados protegidos com criptografia, auditoria e controle de acesso granular por usuário.',
        },
      ];

  const waTrialUrl = isEn
    ? "https://wa.me/5541992557600?text=Hello%20Lidi%21%20%5BOrigin%3A%20Hub%20LP%20-%20Kommo%20Partner%20Badge%5D%20I%20would%20like%20to%20request%20the%20Guided%20Kommo%20CRM%20Free%20Trial%20%28Prova%20d%27%C3%81gua%29."
    : "https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%21%20%5BOrigem%3A%20LP%20Hub%20-%20Selo%20Parceiro%20Kommo%5D%20Quero%20solicitar%20o%20Teste%20Gr%C3%A1tis%20Guiado%20do%20Kommo%20CRM%20%28Prova%20d%27%C3%81gua%29.";

  return (
    <section id="sec-kommo-partner" className="py-12 px-6 bg-[#02040a] relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Toggle Trigger */}
        <button
          id="btn-kommo-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full group flex items-center justify-between p-5 md:p-6 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <img
              src="/kommo/Badge dark.png"
              alt="Kommo Certified Partner"
              className="w-10 h-10 object-contain"
            />
            <div className="text-left">
              <h3 className="text-base md:text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                {isEn
                  ? 'Kommo CRM Certified Partner — Architecture & Guided Trial'
                  : 'Parceira Certificada Kommo CRM — Arquitetura & Teste Guiado'}
              </h3>
              <p className="text-xs md:text-sm text-slate-400">
                {isEn
                  ? 'Official Messenger-First CRM implementation integrated with GPTMaker & Data Structuring'
                  : 'Implementação oficial de CRM Messenger-First integrado ao GPTMaker & Estruturação de Dados'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-blue-400/70 font-medium uppercase tracking-wider">
              {isOpen ? (isEn ? 'Collapse' : 'Recolher') : (isEn ? 'Learn More' : 'Ver Diferenciais')}
            </span>
            {isOpen
              ? <ChevronUp className="w-5 h-5 text-blue-400" />
              : <ChevronDown className="w-5 h-5 text-blue-400" />
            }
          </div>
        </button>

        {/* Collapsible Content (Enxuto, sem repetir tabela de preços nem múltiplos rodapés) */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[1600px] opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          <div className="bg-gradient-to-br from-[#0a1628] to-[#060d1a] border border-blue-500/15 rounded-3xl p-7 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 text-center md:text-left">
              <img
                src="/kommo/Badge light.png"
                alt="Kommo Partner Badge"
                className="w-16 h-16 object-contain flex-shrink-0"
              />
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Shield className="w-3 h-3" /> {isEn ? 'Certified Kommo Partner' : 'Parceira Certificada Kommo'}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {isEn
                    ? 'Messenger-First CRM + Structured Business Data'
                    : 'CRM Messenger-First + Dados do Seu Negócio Organizados'}
                </h2>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                  {isEn
                    ? "Encontro d'Água Hub combines Data Analysis (structuring catalogs, documents, and business rules) with official Kommo CRM and GPTMaker implementation so your team never loses a lead again."
                    : "O Encontro d'Água Hub une Análise de Dados (organização de catálogos, documentos e regras de negócio) com a implementação oficial do Kommo CRM e GPTMaker para que sua equipe nunca mais perca vendas por falta de acompanhamento."}
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-blue-500/30 transition-all flex items-start gap-3"
                  >
                    <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">{feat.title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">{feat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTAs — WhatsApp Business & Direct Calendar Booking */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                id="btn-kommo-contact"
                href={waTrialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 text-xs md:text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                {isEn ? "Request Kommo Free Trial (Prova d'Água)" : "Solicitar Teste Grátis Kommo (Prova d'Água)"}
              </a>
              <GoogleCalendarButton
                label={isEn ? 'Book your consultation' : 'Agende sua consultoria'}
                color="#8E24AA"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KommoPartnerSection;
