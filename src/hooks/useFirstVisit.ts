import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'crm_onboarding_completed';

/**
 * useFirstVisit - Hook to track and manage first-time user onboarding status
 * 
 * Checks if the user has completed onboarding by reading from localStorage.
 * Provides functions to mark onboarding as complete or reset it for testing.
 * 
 * @returns {Object} Onboarding state and control functions
 * @returns {boolean} isFirstVisit - True if user hasn't completed onboarding
 * @returns {() => void} completeOnboarding - Function to mark onboarding as complete
 * @returns {() => void} resetOnboarding - Function to reset onboarding status (for testing)
 * 
 * @example
 * const { isFirstVisit, completeOnboarding } = useFirstVisit();
 * 
 * if (isFirstVisit) {
 *   return <OnboardingModal onComplete={completeOnboarding} />;
 * }
 */
export const useFirstVisit = () => {
    const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        return completed !== 'true';
    });

    const completeOnboarding = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsFirstVisit(false);
    };

    const resetOnboarding = () => {
        localStorage.removeItem(ONBOARDING_KEY);
        setIsFirstVisit(true);
    };

    return {
        isFirstVisit,
        completeOnboarding,
        resetOnboarding
    };
};
