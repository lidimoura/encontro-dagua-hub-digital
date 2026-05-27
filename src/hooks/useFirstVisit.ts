import { useState, useCallback } from 'react';

const ONBOARDING_KEY = 'crm_onboarding_completed';
const MISSIONS_KEY = 'crm_onboarding_missions';
const TOUR_KEY = 'hasSeenTour';

export interface OnboardingMissions {
    addLead: boolean;
    createBoard: boolean;
    moveCard: boolean;
    createActivity: boolean;
    testAI: boolean;
}

const DEFAULT_MISSIONS: OnboardingMissions = {
    addLead: false,
    createBoard: false,
    moveCard: false,
    createActivity: false,
    testAI: false,
};

/**
 * useFirstVisit - Extended hook for gamified onboarding (V10.4)
 * 
 * Tracks first-time visit status AND individual mission completion.
 * Missions persist in localStorage and trigger confetti on completion.
 * 
 * @returns Onboarding state, mission tracking, and control functions
 */
export const useFirstVisit = () => {
    const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
        return localStorage.getItem(ONBOARDING_KEY) !== 'true';
    });

    const [missions, setMissions] = useState<OnboardingMissions>(() => {
        try {
            const saved = localStorage.getItem(MISSIONS_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_MISSIONS;
        } catch {
            return DEFAULT_MISSIONS;
        }
    });

    const completeMission = useCallback((key: keyof OnboardingMissions) => {
        setMissions(prev => {
            if (prev[key]) return prev; // already completed
            const next = { ...prev, [key]: true };
            localStorage.setItem(MISSIONS_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const completedCount = Object.values(missions).filter(Boolean).length;
    const totalMissions = Object.keys(missions).length;
    const allComplete = completedCount === totalMissions;

    const completeOnboarding = useCallback(() => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsFirstVisit(false);
    }, []);

    const resetOnboarding = useCallback(() => {
        localStorage.removeItem(ONBOARDING_KEY);
        localStorage.removeItem(MISSIONS_KEY);
        localStorage.removeItem(TOUR_KEY);
        setIsFirstVisit(true);
        setMissions(DEFAULT_MISSIONS);
    }, []);

    return {
        isFirstVisit,
        missions,
        completeMission,
        completedCount,
        totalMissions,
        allComplete,
        completeOnboarding,
        resetOnboarding
    };
};
