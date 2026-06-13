import React, { useEffect } from 'react';
import CatalogTab from '@/features/admin/CatalogTab';
import { MicroTour } from '@/components/MicroTour';
import { useMicroTour } from '@/hooks/useMicroTour';
import { useMicroTourContext } from '@/context/MicroTourContext';

/**
 * V11.0: Standalone Catalog page — wraps the existing CatalogTab
 * as a first-class route accessible to admin and vendedor roles.
 */
export const CatalogPage: React.FC = () => {
    const tourState = useMicroTour('catalog');
    const { registerTrigger, unregisterTrigger, consumePendingRequest } = useMicroTourContext();

    useEffect(() => {
        registerTrigger('catalog', tourState.forceTrigger);
        const pending = consumePendingRequest('catalog');
        if (pending) setTimeout(() => tourState.forceTrigger(), 100);
        return () => unregisterTrigger('catalog');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tourSteps = [
        { target: '[data-tour="catalog-page"]', titleKey: 'microTour.catalog.title', descKey: 'microTour.catalog.desc', placement: 'bottom' as const },
    ];

    return (
        <div data-tour="catalog-page" className="h-full">
            <CatalogTab />
            <MicroTour routeKey="catalog" steps={tourSteps} />
        </div>
    );
};
