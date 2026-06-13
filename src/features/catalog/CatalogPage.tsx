import React, { useEffect } from 'react';
import CatalogTab from '@/features/admin/CatalogTab';
import { MicroTour } from '@/components/MicroTour';
import { useMicroTour } from '@/hooks/useMicroTour';

/**
 * V11.0: Standalone Catalog page — wraps the existing CatalogTab
 * as a first-class route accessible to admin and vendedor roles.
 * MicroTour registration is handled entirely by MicroTour.tsx.
 */
export const CatalogPage: React.FC = () => {
    // useMicroTour state is passed via prop to MicroTour component
    // which handles registration with MicroTourContext internally
    const tourSteps = [
        {
            target: '[data-tour="catalog-page"]',
            titleKey: 'microTour.catalog.title',
            descKey: 'microTour.catalog.desc',
            placement: 'bottom' as const,
        },
    ];

    return (
        <div data-tour="catalog-page" className="h-full">
            <CatalogTab />
            <MicroTour routeKey="catalog" steps={tourSteps} />
        </div>
    );
};
