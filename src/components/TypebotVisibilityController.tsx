import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * TypebotVisibilityController
 * 
 * Hides the Typebot chatbot (from LandingPage) when user navigates to internal routes
 * to prevent conflict with FloatingAIWidget (AiFlow).
 * 
 * Internal routes: /dashboard, /boards, /contacts, /settings, /admin, etc.
 * Public routes: /, /login, /manifesto (Typebot visible)
 */
export const TypebotVisibilityController = () => {
    const location = useLocation();

    useEffect(() => {
        const hash = window.location.hash;

        // Define internal routes where Typebot should be hidden
        const internalRoutes = [
            '/dashboard',
            '/boards',
            '/pipeline',
            '/contacts',
            '/inbox',
            '/activities',
            '/reports',
            '/ai',
            '/decisions',
            '/settings',
            '/admin',
            '/profile',
            '/qrdagua',
            '/prompt-lab',
            '/portal'
        ];

        // Check if current route is internal
        const isInternalRoute = internalRoutes.some(route => hash.includes(route));

        // Hide/show Typebot bubble
        const typebotBubble = document.querySelector('typebot-bubble');
        if (typebotBubble) {
            (typebotBubble as HTMLElement).style.display = isInternalRoute ? 'none' : 'block';
        }

        // Also check for typebot-standard (alternative selector)
        const typebotStandard = document.querySelector('typebot-standard');
        if (typebotStandard) {
            (typebotStandard as HTMLElement).style.display = isInternalRoute ? 'none' : 'block';
        }

    }, [location]);

    return null; // This component doesn't render anything
};
