import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Hook for handling deep linking to specific deals from notifications
 * Supports URL patterns like: /inbox?dealId=xxx or /boards?dealId=xxx
 */
export const useDeepLink = (onDealIdDetected?: (dealId: string) => void) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const dealId = searchParams.get('dealId');

        if (dealId && onDealIdDetected) {
            // Call the callback to open the deal
            onDealIdDetected(dealId);

            // Clean up URL parameters after a short delay
            setTimeout(() => {
                searchParams.delete('dealId');
                setSearchParams(searchParams, { replace: true });
            }, 500);
        }
    }, [searchParams, onDealIdDetected, setSearchParams]);

    /**
     * Navigate to a specific deal with deep linking
     */
    const navigateToDeal = (dealId: string, route: '/inbox' | '/boards' = '/inbox') => {
        navigate(`${route}?dealId=${dealId}`);
    };

    return {
        navigateToDeal,
    };
};
