/**
 * Centralized Query Keys for TanStack Query
 * 
 * Provides type-safe query keys for cache management across the application.
 * Separated from index.tsx to prevent circular imports.
 */

export const queryKeys = {
    // Deals
    deals: {
        all: ['deals'] as const,
        lists: () => [...queryKeys.deals.all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.deals.lists(), filters] as const,
        details: () => [...queryKeys.deals.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.deals.details(), id] as const,
    },

    // Contacts
    contacts: {
        all: ['contacts'] as const,
        lists: () => [...queryKeys.contacts.all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.contacts.lists(), filters] as const,
        details: () => [...queryKeys.contacts.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
    },

    // Companies
    companies: {
        all: ['companies'] as const,
        lists: () => [...queryKeys.companies.all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.companies.lists(), filters] as const,
        details: () => [...queryKeys.companies.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.companies.details(), id] as const,
    },

    // Activities
    activities: {
        all: ['activities'] as const,
        lists: () => [...queryKeys.activities.all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.activities.lists(), filters] as const,
        byDeal: (dealId: string) => [...queryKeys.activities.all, 'deal', dealId] as const,
    },

    // Boards
    boards: {
        all: ['boards'] as const,
        lists: () => [...queryKeys.boards.all, 'list'] as const,
        details: () => [...queryKeys.boards.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.boards.details(), id] as const,
    },

    // Dashboard
    dashboard: {
        stats: ['dashboard', 'stats'] as const,
        funnel: ['dashboard', 'funnel'] as const,
        timeline: ['dashboard', 'timeline'] as const,
    },
};
