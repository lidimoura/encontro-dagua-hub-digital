/**
 * TanStack Query hooks for Deals - Supabase Edition
 *
 * Features:
 * - Real Supabase API calls
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation
 * - Ready for Realtime integration
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { queryKeys } from '../queryKeys';
import { dealsService, contactsService, companiesService } from '@/lib/supabase';
import type { Deal, DealView, DealItem, DealStatusType } from '@/types';
import { DealStatus } from '@/types';

// ============ QUERY HOOKS ============

export interface DealsFilters {
  boardId?: string;
  status?: DealStatusType;
  search?: string;
  minValue?: number;
  maxValue?: number;
}

/**
 * Hook to fetch all deals with optional filters
 */
export const useDeals = (filters?: DealsFilters) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: filters
      ? queryKeys.deals.list({ ...filters, companyId: profile?.company_id } as Record<string, unknown>)
      : [...queryKeys.deals.lists(), profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];

      const { data, error } = await dealsService.getAll(profile.company_id);
      if (error) throw error;

      let deals = data || [];

      // Apply client-side filters
      if (filters) {
        deals = deals.filter(deal => {
          if (filters.boardId && deal.boardId !== filters.boardId) return false;
          if (filters.status && deal.status !== filters.status) return false;
          if (filters.minValue && deal.value < filters.minValue) return false;
          if (filters.maxValue && deal.value > filters.maxValue) return false;
          if (filters.search) {
            const search = filters.search.toLowerCase();
            if (!deal.title.toLowerCase().includes(search)) return false;
          }
          return true;
        });
      }

      return deals;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch all deals with enriched company/contact data (DealView)
 */
export const useDealsView = (filters?: DealsFilters) => {
  const { profile } = useAuth();

  return useQuery<DealView[]>({
    queryKey: filters
      ? [...queryKeys.deals.list({ ...filters, companyId: profile?.company_id } as Record<string, unknown>), 'view']
      : [...queryKeys.deals.lists(), profile?.company_id, 'view'],
    queryFn: async () => {
      if (!profile?.company_id) return [];

      // Fetch all data in parallel
      const [dealsResult, contactsResult, companiesResult] = await Promise.all([
        dealsService.getAll(profile.company_id),
        contactsService.getAll(profile.company_id),
        companiesService.getAll(profile.company_id),
      ]);

      if (dealsResult.error) throw dealsResult.error;

      const deals = dealsResult.data || [];
      const contacts = contactsResult.data || [];
      const companies = companiesResult.data || [];

      // Create lookup maps
      const contactMap = new Map(contacts.map(c => [c.id, c]));
      const companyMap = new Map(companies.map(c => [c.id, c]));

      // Enrich deals with company/contact names
      let enrichedDeals: DealView[] = deals.map(deal => {
        const contact = contactMap.get(deal.contactId);
        const company = companyMap.get(deal.companyId);
        return {
          ...deal,
          companyName: company?.name || 'Sem empresa',
          contactName: contact?.name || 'Sem contato',
          contactEmail: contact?.email || '',
        };
      });

      // Apply client-side filters
      if (filters) {
        enrichedDeals = enrichedDeals.filter(deal => {
          if (filters.boardId && deal.boardId !== filters.boardId) return false;
          if (filters.status && deal.status !== filters.status) return false;
          if (filters.minValue && deal.value < filters.minValue) return false;
          if (filters.maxValue && deal.value > filters.maxValue) return false;
          if (filters.search) {
            const search = filters.search.toLowerCase();
            if (
              !deal.title.toLowerCase().includes(search) &&
              !deal.companyName.toLowerCase().includes(search)
            )
              return false;
          }
          return true;
        });
      }

      return enrichedDeals;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch a single deal by ID
 */
export const useDeal = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.deals.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await dealsService.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch deals by board (for Kanban view) - Returns DealView[]
 * Also auto-maps contacts without deals into the matching stage column
 */
export const useDealsByBoard = (boardId: string) => {
  const { profile } = useAuth();
  return useQuery<DealView[]>({
    queryKey: [...queryKeys.deals.list({ boardId }), profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];

      // Fetch all data in parallel — companies is non-critical
      const [dealsResult, contactsResult, companiesResult, boardResult, lifecycleStagesResult] = await Promise.all([
        dealsService.getAll(profile.company_id),
        contactsService.getAll(profile.company_id),
        companiesService.getAll(profile.company_id).catch(() => ({ data: [], error: null })),
        // Fetch boards to resolve linkedLifecycleStage
        (async () => {
          const { data } = await import('@/lib/supabase').then(m => m.boardsService.getAll(profile!.company_id!));
          return data || [];
        })(),
        // Fetch lifecycle stages
        (async () => {
          const { data } = await import('@/lib/supabase').then(m => m.lifecycleStagesService.getAll());
          return data || [];
        })(),
      ]);

      if (dealsResult.error) throw dealsResult.error;

      const deals = (dealsResult.data || []).filter(d => d.boardId === boardId);
      const contacts = contactsResult.data || [];
      const companies = companiesResult.data || [];
      const lifecycleStages = lifecycleStagesResult;

      // Create lookup maps
      const contactMap = new Map(contacts.map(c => [c.id, c]));
      const companyMap = new Map(companies.map(c => [c.id, c]));

      // Enrich deals with company/contact names
      const enrichedDeals: DealView[] = deals.map(deal => {
        const contact = contactMap.get(deal.contactId);
        const company = companyMap.get(deal.companyId);
        return {
          ...deal,
          companyName: company?.name || 'Sem empresa',
          contactName: contact?.name || 'Sem contato',
          contactEmail: contact?.email || '',
          source: contact?.source || 'Desconhecido',
        };
      });

      // AUTO-MAPPING: Contacts with a lifecycle stage matching a board column
      // that don't already have a deal → synthesize virtual DealView entries
      const activeBoard = boardResult.find((b: any) => b.id === boardId);
      if (activeBoard && activeBoard.stages) {
        // Build a set of contactIds that already have deals on this board
        const contactIdsWithDeals = new Set(deals.map(d => d.contactId).filter(Boolean));

        // Build maps for stage resolution
        const stageIdToBoardStageId = new Map<string, string>(); // LifecycleStage UUID -> BoardStage UUID
        const stageNameToBoardStageId = new Map<string, string>(); // LifecycleStage Name (uppercase) -> BoardStage UUID

        for (const stage of activeBoard.stages) {
          if (stage.linkedLifecycleStage) {
            stageIdToBoardStageId.set(stage.linkedLifecycleStage, stage.id);
            // Also store the uppercase Name for legacy contacts
            const matchedLs = lifecycleStages.find((ls: any) => ls.id === stage.linkedLifecycleStage);
            if (matchedLs) {
              stageNameToBoardStageId.set(matchedLs.name.toUpperCase(), stage.id);
            }
          }
        }

        // Find contacts who do not have a deal on this board
        const orphanContacts = contacts.filter(c => !contactIdsWithDeals.has(c.id));

        for (const contact of orphanContacts) {
          const actualStageText = (contact.stage || '').toUpperCase();
          const actualStatusText = (contact.status || '').toUpperCase();

          // 1. Try to map by exact Stage UUID or Name
          let matchedStageId = stageIdToBoardStageId.get(contact.stage) || stageNameToBoardStageId.get(actualStageText);

          // 2. Smart Fallback: Respect board boundaries based on name/purpose
          const boardNameUpper = (activeBoard.name || '').toUpperCase();

          if (!matchedStageId) {
            const isLead = actualStatusText === 'LEAD' || actualStatusText === 'NEW' || actualStageText === 'LEAD' || actualStageText === 'NEW';
            const isCustomer = actualStatusText === 'CUSTOMER' || actualStatusText === 'WON' || actualStageText === 'CUSTOMER' || actualStageText === 'WON' || actualStageText === 'CLIENTE';

            if (boardNameUpper.includes('SDR') || boardNameUpper.includes('INBOUND') || boardNameUpper.includes('VENDAS')) {
              if (isLead) matchedStageId = activeBoard.stages[0]?.id;
            } else if (boardNameUpper.includes('ONBOARDING') || boardNameUpper.includes('CUSTOMER') || boardNameUpper.includes('CLIENTE')) {
              if (isCustomer) matchedStageId = activeBoard.stages[0]?.id;
            } else {
              // Closer / Pipeline boards DO NOT spawn ghost cards. Deals here must travel from previous boards.
              matchedStageId = undefined;
            }
          }

          if (matchedStageId) {
            enrichedDeals.push({
              id: `auto-${contact.id}`,
              title: contact.name || contact.email || 'Novo Lead',
              value: contact.totalValue || 0,
              probability: 0,
              status: matchedStageId,
              priority: 'medium' as any,
              boardId: boardId,
              contactId: contact.id,
              companyId: contact.companyId || '',
              tags: [],
              customFields: {},
              createdAt: contact.createdAt,
              updatedAt: contact.updatedAt || contact.createdAt,
              items: [],
              owner: { name: 'Auto', avatar: '' },
              companyName: 'Sem empresa',
              contactName: contact.name || 'Sem contato',
              contactEmail: contact.email || '',
              source: contact.source || 'Desconhecido',
            });
          }
        }
      }

      return enrichedDeals;
    },
    staleTime: 1 * 60 * 1000, // 1 minute for kanban (more interactive)
  });
};

// ============ MUTATION HOOKS ============

// Input type for creating a deal (without auto-generated fields)
type CreateDealInput = Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Hook to create a new deal
 */
export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deal: CreateDealInput) => {
      // Sanitize: Convert empty strings to null for UUID fields to prevent 22P02 error
      const sanitizedDeal = {
        ...deal,
        contactId: deal.contactId || undefined,
        companyId: deal.companyId || undefined,
        boardId: deal.boardId || undefined,
        // Removed undefined stageId reference
        updatedAt: new Date().toISOString(),
      };

      // company_id will be auto-set by trigger on server
      const { data, error } = await dealsService.create(sanitizedDeal, '');
      if (error) throw error;
      return data!;
    },
    onMutate: async newDeal => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deals.all });

      const previousDeals = queryClient.getQueryData<Deal[]>(queryKeys.deals.lists());

      // Optimistic update with temp ID
      const tempDeal: Deal = {
        ...newDeal,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Deal;

      queryClient.setQueryData<Deal[]>(queryKeys.deals.lists(), (old = []) => [tempDeal, ...old]);

      return { previousDeals };
    },
    onError: (_error, _newDeal, context) => {
      if (context?.previousDeals) {
        queryClient.setQueryData(queryKeys.deals.lists(), context.previousDeals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
};

/**
 * Hook to update a deal
 */
export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Deal> }) => {
      const { error } = await dealsService.update(id, updates);
      if (error) throw error;
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deals.all });

      const previousDeals = queryClient.getQueryData<Deal[]>(queryKeys.deals.lists());

      queryClient.setQueryData<Deal[]>(queryKeys.deals.lists(), (old = []) =>
        old.map(deal =>
          deal.id === id ? { ...deal, ...updates, updatedAt: new Date().toISOString() } : deal
        )
      );

      // Also update detail cache
      queryClient.setQueryData<Deal>(queryKeys.deals.detail(id), old =>
        old ? { ...old, ...updates, updatedAt: new Date().toISOString() } : old
      );

      return { previousDeals };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDeals) {
        queryClient.setQueryData(queryKeys.deals.lists(), context.previousDeals);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.detail(id) });
    },
  });
};

/**
 * Hook to update deal status (for drag & drop in Kanban)
 * Optimized for instant UI feedback
 */
export const useUpdateDealStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      lossReason,
    }: {
      id: string;
      status: string;
      lossReason?: string;
    }) => {
      const updates: Partial<Deal> = {
        status,
        lastStageChangeDate: new Date().toISOString(),
        ...(lossReason && { lossReason }),
      };
      const { error } = await dealsService.update(id, updates);
      if (error) throw error;
      return { id, status, lossReason };
    },
    onMutate: async ({ id, status, lossReason }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deals.all });

      const previousDeals = queryClient.getQueryData<Deal[]>(queryKeys.deals.lists());

      // Optimistic update for instant drag feedback
      queryClient.setQueryData<Deal[]>(queryKeys.deals.lists(), (old = []) =>
        old.map(deal =>
          deal.id === id
            ? {
              ...deal,
              status,
              lastStageChangeDate: new Date().toISOString(),
              ...(lossReason && { lossReason }),
            }
            : deal
        )
      );

      return { previousDeals };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDeals) {
        queryClient.setQueryData(queryKeys.deals.lists(), context.previousDeals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
};

/**
 * Hook to delete a deal
 */
export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await dealsService.delete(id);
      if (error) throw error;
      return id;
    },
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deals.all });

      const previousDeals = queryClient.getQueryData<Deal[]>(queryKeys.deals.lists());

      queryClient.setQueryData<Deal[]>(queryKeys.deals.lists(), (old = []) =>
        old.filter(deal => deal.id !== id)
      );

      return { previousDeals };
    },
    onError: (_error, _id, context) => {
      if (context?.previousDeals) {
        queryClient.setQueryData(queryKeys.deals.lists(), context.previousDeals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
};

// ============ DEAL ITEMS MUTATIONS ============

/**
 * Hook to add an item to a deal
 */
export const useAddDealItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, item }: { dealId: string; item: Omit<DealItem, 'id'> }) => {
      const { data, error } = await dealsService.addItem(dealId, item);
      if (error) throw error;
      return { dealId, item: data! };
    },
    onSettled: (_data, _error, { dealId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.detail(dealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.lists() });
    },
  });
};

/**
 * Hook to remove an item from a deal
 */
export const useRemoveDealItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, itemId }: { dealId: string; itemId: string }) => {
      const { error } = await dealsService.removeItem(dealId, itemId);
      if (error) throw error;
      return { dealId, itemId };
    },
    onSettled: (_data, _error, { dealId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.detail(dealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.lists() });
    },
  });
};

// ============ UTILITY HOOKS ============

/**
 * Hook to invalidate all deals queries (useful after bulk operations)
 */
export const useInvalidateDeals = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
};

/**
 * Hook to prefetch a deal (for hover previews)
 */
export const usePrefetchDeal = () => {
  const queryClient = useQueryClient();
  return async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.deals.detail(id),
      queryFn: async () => {
        const { data, error } = await dealsService.getById(id);
        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};
