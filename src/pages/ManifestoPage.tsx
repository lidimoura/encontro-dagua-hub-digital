import React, { useEffect, useState } from 'react';
import { useSystemStats } from '@/hooks/useSystemStats';
import { Brain, TrendingUp, Users, QrCode, Sparkles, ExternalLink } from 'lucide-react';

export const ManifestoPage: React.FC = () => {
    const { stats, loading } = useSystemStats();
    const [counts, setCounts] = useState({ assets: 0, deals: 0, agents: 0, qrs: 0 });

    // Animated counter effect
    useEffect(() => {
        if (loading) return;

        const duration = 2000; // 2 seconds
        const steps = 60;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;

            setCounts({
                assets: Math.floor(stats.libraryAssets * progress),
                deals: Math.floor(stats.dealsManaged * progress),
                agents: Math.floor(stats.aiAgents * progress),
                qrs: Math.floor(stats.qrCodesGenerated * progress),
            });

            if (step >= steps) {
                clearInterval(timer);
                setCounts({
                    assets: stats.libraryAssets,
                    deals: stats.dealsManaged,
                    agents: stats.aiAgents,
                    qrs: stats.qrCodesGenerated,
                });
            }
        }, interval);

        return () => clearInterval(timer);
    }, [stats, loading]);

    return (
        <div className="min-h-screen bg-dark-primary text-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-wine/20 to-gold/10"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-wine-gold bg-clip-text text-transparent">
                        Do Streamlit ao Ecossistema
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed">
                        A jornada de transformar uma ideia em realidade em apenas 1 mês
                    </p>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">A Jornada</h2>

                    <div className="space-y-8">
                        {[
                            {
                                date: 'Novembro 2024',
                                title: 'Streamlit MVP',
                                description: 'Primeiro protótipo funcional em Python. Validação do conceito de CRM + QR Codes.',
                            },
                            {
                                date: 'Dezembro 2024 - Semana 1',
                                title: 'CRM Base',
                                description: 'Migração para React + Supabase. Sistema de boards, deals e contatos funcionando.',
                            },
                            {
                                date: 'Dezembro 2024 - Semana 2',
                                title: 'QR D\'água',
                                description: 'Módulo de QR Codes dinâmicos com 3 tipos (Link, Bridge, Card). Gerador visual premium.',
                            },
                            {
                                date: 'Dezembro 2024 - Semana 3',
                                title: 'AI Agents Squad',
                                description: 'PRECY (precificação), MAZÔ (CS), JURY (contratos). Inteligência integrada ao workflow.',
                            },
                            {
                                date: 'Dezembro 2024 - Semana 4',
                                title: 'Ecossistema Completo',
                                description: 'Portal do Cliente, Analytics, Auto-Stack, Design System Premium. Pronto para produção.',
                            },
                        ].map((milestone, idx) => (
                            <div
                                key={idx}
                                className="relative pl-8 border-l-2 border-wine/30 hover:border-wine transition-colors"
                            >
                                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-wine"></div>
                                <div className="bg-dark-secondary/50 backdrop-blur-lg rounded-card border border-white/10 p-6">
                                    <div className="text-sm text-gold font-semibold mb-2">{milestone.date}</div>
                                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                                    <p className="text-slate-400">{milestone.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Credits Section */}
            <section className="py-16 px-4 bg-dark-secondary/30">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">Créditos & Inspirações</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Thales Laray',
                                role: 'Base CRM & Automação',
                                description: 'Arquitetura inicial do CRM e integração com n8n',
                                link: 'https://github.com/thaleslaray',
                                icon: Users,
                            },
                            {
                                name: 'Alura + Oracle ONE',
                                role: 'Data Science & Lógica',
                                description: 'Formação em análise de dados e pensamento computacional',
                                link: 'https://www.oracle.com/br/education/oracle-next-education/',
                                icon: Brain,
                            },
                            {
                                name: 'Google Gemini',
                                role: 'Arquitetura & Pair Programming',
                                description: 'Co-piloto de desenvolvimento e design de sistema',
                                link: 'https://gemini.google.com',
                                icon: Sparkles,
                            },
                        ].map((credit, idx) => (
                            <div
                                key={idx}
                                className="bg-dark-secondary/50 backdrop-blur-lg rounded-card border border-white/10 p-6 hover:border-wine/50 transition-all group"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-gradient-wine-gold rounded-lg">
                                        <credit.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{credit.name}</h3>
                                        <p className="text-sm text-gold">{credit.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">{credit.description}</p>
                                <a
                                    href={credit.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-wine hover:text-gold transition-colors"
                                >
                                    Saiba mais <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Legacy Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-dark-secondary/50 backdrop-blur-lg rounded-card border border-white/10 p-8">
                        <h2 className="text-3xl font-bold mb-6">O Legado: Lógica ↔ Psicologia</h2>
                        <div className="space-y-4 text-slate-300 leading-relaxed">
                            <p>
                                Este projeto é dedicado à memória do <strong className="text-gold">Prof. Dorval Varella Moura</strong>,
                                da Universidade Federal do Amazonas (UFAM), que sempre acreditou na conexão entre
                                <strong className="text-wine"> Lógica e Psicologia</strong>.
                            </p>
                            <p>
                                Como psicóloga e desenvolvedora, carrego essa visão: a tecnologia não é apenas código,
                                é <strong className="text-gold">compreensão humana traduzida em sistemas</strong>.
                                Cada feature deste Hub foi pensada para resolver problemas reais de pessoas reais.
                            </p>
                            <p className="text-sm italic text-slate-400">
                                "A lógica nos dá estrutura. A psicologia nos dá propósito." - Prof. Dorval Moura
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dogfooding Section (Live Stats) */}
            <section className="py-16 px-4 bg-gradient-to-br from-wine/10 to-gold/10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Dogfooding em Ação</h2>
                        <p className="text-slate-300">
                            Estatísticas reais do nosso próprio uso do Hub
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Brain,
                                label: 'Assets na Biblioteca',
                                value: counts.assets,
                                color: 'from-purple-600 to-purple-400',
                            },
                            {
                                icon: TrendingUp,
                                label: 'Deals Gerenciados',
                                value: counts.deals,
                                color: 'from-blue-600 to-blue-400',
                            },
                            {
                                icon: Users,
                                label: 'Agentes IA Ativos',
                                value: counts.agents,
                                color: 'from-green-600 to-green-400',
                            },
                            {
                                icon: QrCode,
                                label: 'QR Codes Gerados',
                                value: counts.qrs,
                                color: 'from-orange-600 to-orange-400',
                            },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="bg-dark-secondary/70 backdrop-blur-lg rounded-card border border-white/10 p-6 text-center hover:scale-105 transition-transform"
                            >
                                <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${stat.color} mb-4`}>
                                    <stat.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-4xl font-bold mb-2 bg-gradient-wine-gold bg-clip-text text-transparent">
                                    {loading ? '...' : stat.value}
                                </div>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-400">
                            ✨ Atualizado em tempo real • Última atualização: {new Date().toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-16 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Pronto para transformar seu negócio?</h2>
                    <p className="text-slate-300 mb-8">
                        Junte-se ao ecossistema e comece a usar o poder da IA no seu CRM
                    </p>
                    <a
                        href="/?action=apply"
                        className="inline-block px-8 py-4 bg-gradient-wine-gold text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
                    >
                        Quero Acesso ao Hub Pro
                    </a>
                </div>
            </section>
        </div>
    );
};
