import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Zap, Users, BarChart3, MessageCircle, CalendarCheck, Check } from 'lucide-react';

const KOMMO_FEATURES = [
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

const KOMMO_USD_PLANS = [
  {
    name: 'Kommo Base',
    priceUsd: 'US$ 15',
    period: 'por usuário / mês',
    desc: 'Para pequenos negócios que precisam centralizar conversas e organizar o funil de vendas.',
    features: [
      'Caixa de entrada unificada (WhatsApp, Instagram, E-mail)',
      'Funil de vendas visual (Kanban)',
      'Cadastro completo de leads, contatos e empresas',
    ],
    featured: false,
  },
  {
    name: 'Kommo Avançado',
    priceUsd: 'US$ 25',
    period: 'por usuário / mês',
    desc: 'Para empresas em crescimento que querem automatizar o atendimento e o follow-up comercial.',
    features: [
      'Tudo do plano Base',
      'Salesbot (robô de vendas sem código)',
      'Automações de funil e tarefas automáticas para a equipe',
    ],
    featured: true,
  },
  {
    name: 'Kommo Empresarial',
    priceUsd: 'US$ 45',
    period: 'por usuário / mês',
    desc: 'Para operações robustas com maior volume de leads, múltiplos times e governança avançada.',
    features: [
      'Tudo do plano Avançado',
      'Volume expandido de leads e armazenamento',
      'Lead Scoring, perfis avançados de segurança e monitoramento',
    ],
    featured: false,
  },
];

interface KommoPartnerSectionProps {
  initiallyOpen?: boolean;
}

export const KommoPartnerSection: React.FC<KommoPartnerSectionProps> = ({ initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const WA_TRIAL_URL = "https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20quero%20solicitar%20o%20Teste%20Gr%C3%A1tis%20do%20Kommo%20CRM%20%28Prova%20d%27%C3%81gua%29%20e%20entender%20como%20implementar%20no%20meu%20neg%C3%B3cio.";
  const WA_AGENDA_URL = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultoria%20%26%20Diagn%C3%B3stico%20%E2%80%94%20Encontro%20d%27%C3%81gua%20Hub&add=encontrodaguahub%40gmail.com&details=Ol%C3%A1%20L%C3%ADdi%20Moura%20%28encontrodaguahub%40gmail.com%29%2C%20gostaria%20de%20agendar%20um%20diagn%C3%B3stico%20de%20Dados%2C%20IA%20e%20Kommo%20CRM.";

  return (
    <section id="sec-kommo-partner" className="py-16 px-6 bg-[#02040a] relative overflow-hidden">
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
                Escalar com Kommo CRM (Planos Oficiais em USD & Teste Grátis)
              </h3>
              <p className="text-sm text-slate-400">
                Parceiro Certificado · Veja os pacotes oficiais da licença em dólar e solicite sua Prova d'Água
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-blue-400/70 font-medium uppercase tracking-wider">
              {isOpen ? 'Recolher' : 'Ver Planos (USD)'}
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
            isOpen ? 'max-h-[3000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          <div className="bg-gradient-to-br from-[#0a1628] to-[#060d1a] border border-blue-500/15 rounded-3xl p-8 md:p-12 mb-8">
            <div className="flex flex-col items-center text-center gap-6 mb-10">
              <img
                src="/kommo/Badge light.png"
                alt="Kommo Partner Badge"
                className="w-20 h-20 object-contain flex-shrink-0"
              />
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Shield className="w-3 h-3" /> Parceiro Certificado Kommo
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  CRM Messenger-First + Organização de Dados do Seu Negócio
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl">
                  O <strong className="text-white">Encontro d'Água Hub</strong> une análise de dados (organização de catálogos, documentos e regras de negócio) com a implementação oficial do <strong className="text-white">Kommo CRM</strong> e <strong className="text-white">GPTMaker</strong> para que sua equipe nunca mais perca vendas por falta de acompanhamento.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
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

            {/* Tabela de Licenças Oficiais Kommo em USD */}
            <div className="mb-10">
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block mb-1">
                  Transparência Oficial (Cotação em Dólar)
                </span>
                <h3 className="text-xl font-bold text-white">
                  Planos de Licença Oficial da Plataforma Kommo (USD)
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
                  As licenças da plataforma Kommo são sempre cotadas oficialmente em dólar (USD). Apresentamos os valores na moeda original para garantir total transparência e evitar distorções cambiais:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {KOMMO_USD_PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={`rounded-2xl p-6 border flex flex-col justify-between ${
                      plan.featured
                        ? 'bg-gradient-to-b from-blue-900/35 to-slate-900/80 border-blue-400/50 shadow-xl shadow-blue-950/40 relative'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    {plan.featured && (
                      <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider">
                        Mais Escolhido
                      </span>
                    )}
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-3xl font-black text-blue-300">{plan.priceUsd}</span>
                        <span className="text-xs text-slate-400">{plan.period}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{plan.desc}</p>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-slate-500 mt-4">
                * Os serviços de diagnóstico, organização de dados/catálogo, configuração personalizada e treinamento com Lídi Moura são dimensionados sob medida para a realidade do seu negócio.
              </p>
            </div>

            {/* CTAs — WhatsApp Business & Agendamento de Diagnóstico */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                id="btn-kommo-contact"
                href={WA_TRIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-blue-500/20 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Solicitar Teste Grátis Kommo (Prova d'Água)
              </a>
              <a
                href={WA_AGENDA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-blue-400/30 hover:bg-white/10 text-blue-200 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <CalendarCheck className="w-5 h-5" />
                Agendar Consultoria (encontrodaguahub@gmail.com)
              </a>
            </div>
          </div>

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
