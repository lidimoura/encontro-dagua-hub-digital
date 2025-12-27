import React, { useState, useEffect } from 'react';
import { X, Sparkles, Brain, MessageCircle, QrCode } from 'lucide-react';

interface OnboardingStep {
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        title: 'Bem-vindo ao Encontro D\'água .hub 🌀',
        description: 'Aqui sua tecnologia flui. Um ecossistema digital inspirado na natureza para integrar estratégias humanas com a eficiência da IA.',
        icon: Sparkles,
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        title: 'Prompt Lab 🧠',
        description: 'Transforme ideias em ouro aqui. Engenharia de prompts estratégicos para maximizar resultados com IA.',
        icon: Brain,
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        title: 'Aiflow - Suporte IA 🤖',
        description: 'Precisa de ajuda? O Aiflow está sempre disponível no canto inferior direito para te guiar pelo sistema.',
        icon: MessageCircle,
        gradient: 'from-emerald-500 to-teal-500',
    },
    {
        title: 'Novo QR 📱',
        description: 'Crie seu primeiro cartão digital agora. QR Codes dinâmicos que conectam negócios no mundo digital.',
        icon: QrCode,
        gradient: 'from-orange-500 to-red-500',
    },
];

export const OnboardingTour: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Check if user has seen the tour
        const hasSeenTour = localStorage.getItem('hasSeenTour');
        if (!hasSeenTour) {
            // Show tour after a short delay for better UX
            setTimeout(() => setIsOpen(true), 1000);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenTour', 'true');
    };

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        handleClose();
    };

    if (!isOpen) return null;

    const step = ONBOARDING_STEPS[currentStep];
    const Icon = step.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg mx-4 glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Fechar tour"
                >
                    <X size={20} className="text-white" />
                </button>

                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${step.gradient} p-8 text-center`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                        <Icon size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
                    <p className="text-white/90 text-sm">{step.description}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {ONBOARDING_STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`h-2 rounded-full transition-all ${index === currentStep
                                    ? 'w-8 bg-primary-500'
                                    : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-primary-300'
                                    }`}
                                aria-label={`Ir para passo ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            Pular tour
                        </button>

                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <button
                                    onClick={handlePrevious}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Anterior
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors shadow-lg shadow-primary-600/20"
                            >
                                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Começar' : 'Próximo'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
