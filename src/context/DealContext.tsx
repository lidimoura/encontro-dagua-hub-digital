import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/lib/translations';
import { Deal } from '@/types';

/**
 * DealContext - Shared Intelligence for Agent Collaboration
 * 
 * Enables Precy, Mazô, Objection Killer, and Jury to access unified deal data
 * and quote calculations. Prevents data silos and enables data-backed AI responses.
 */

interface Product {
    id: string;
    name: string;
    price: number;
}

interface TechStackItem {
    id: string;
    name: string;
    price: number;
    stack_category: string | null;
}

export interface DealQuoteData {
    // Precy Calculations
    stackCost: number;
    laborCost: number;
    totalCost: number;
    revenue: number;
    margin: number;
    marginPercentage: number;
    roi: {
        investment: number;
        return: number;
        percentage: number;
    } | null;

    // Selected Items
    selectedProducts: Product[];
    selectedStack: TechStackItem[];

    // Configuration
    hours: number;
    hourlyRate: number;
    impact: 'low' | 'medium' | 'high';

    // Metadata
    calculatedAt: string;
    calculatedBy: string;
    language: Language;
}

interface DealContextType {
    currentDeal: Deal | null;
    setCurrentDeal: (deal: Deal | null) => void;
    quoteData: DealQuoteData | null;
    setQuoteData: (data: DealQuoteData) => void;
    clearQuoteData: () => void;
}

const DealContext = createContext<DealContextType | undefined>(undefined);

export const DealProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
    const [quoteData, setQuoteData] = useState<DealQuoteData | null>(null);

    const clearQuoteData = () => {
        setQuoteData(null);
    };

    return (
        <DealContext.Provider
            value={{
                currentDeal,
                setCurrentDeal,
                quoteData,
                setQuoteData,
                clearQuoteData
            }}
        >
            {children}
        </DealContext.Provider>
    );
};

export const useDealContext = (): DealContextType => {
    const context = useContext(DealContext);
    if (!context) {
        throw new Error('useDealContext must be used within DealProvider');
    }
    return context;
};
