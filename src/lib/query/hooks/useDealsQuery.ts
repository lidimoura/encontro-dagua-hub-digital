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
import { isDemoVisible, IS_DEMO } from '@/lib/appConfig';

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

      // Fetch all data in parallel — companies is non-critical, never let it crash the hook
      const [dealsResult, contactsResult, companiesResult] = await Promise.all([
        dealsService.getAll(profile.company_id),
        contactsService.getAll(profile.company_id),
        companiesService.getAll(profile.company_id).catch(() => ({ data: [], error: null })),
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
      // DISTINCT by email — collapse duplicate contacts created by webhook replays
      // Keep the newest record (contacts are sorted desc by created_at from service)
      const seenEmails = new Set<string>();
      const contacts = (contactsResult.data || []).filter(c => {
        const emailKey = (c.email || c.id).toLowerCase().trim();
        if (seenEmails.has(emailKey)) return false;
        seenEmails.add(emailKey);
        return true;
      });
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

      // AUTO-MAPPING: Only create ghost cards on main branch.
      // On provadagua, ghost cards are disabled to prevent duplicates with test data.
      const activeBoard = boardResult.find((b: any) => b.id === boardId);
      if (activeBoard && activeBoard.stages && !IS_DEMO) {
        // Critical fix: use ALL deals from ALL boards to exclude contacts that already have a real deal
        const allDeals = dealsResult.data || [];
        const contactIdsWithAnyDeal = new Set(allDeals.map((d: any) => d.contactId).filter(Boolean));

        // Build a map for strict linkedLifecycleStage resolution ONLY
        const stageIdToBoardStageId = new Map<string, string>();
        const stageNameToBoardStageId = new Map<string, string>();

        for (const stage of activeBoard.stages) {
          if (stage.linkedLifecycleStage) {
            stageIdToBoardStageId.set(stage.linkedLifecycleStage, stage.id);
            const matchedLs = lifecycleStages.find((ls: any) => ls.id === stage.linkedLifecycleStage);
            if (matchedLs) {
              stageNameToBoardStageId.set(matchedLs.name.toUpperCase(), stage.id);
            }
          }
        }

        // First stage of the board — used as fallback for SDR force-mapping
        const firstStageId = activeBoard.stages[0]?.id;

        // Only create ghost cards for contacts without ANY real deal
        const orphanContacts = contacts.filter(c => !contactIdsWithAnyDeal.has(c.id));

        for (const contact of orphanContacts) {
          // Skip contacts with no usable identity (neither name nor email)
          if (!contact.name && !contact.email) continue;

          const tags: string[] = (contact.tags as any) || [];
          const hasSdrTag = tags.some(t => t.includes('sdr') || t.includes('🤖'));

          const actualStageText = (contact.stage || '').toUpperCase();
          const matchedStageId = stageIdToBoardStageId.get(contact.stage) || stageNameToBoardStageId.get(actualStageText);

          // SDR leads are ALWAYS force-mapped to the first stage if no lifecycle match found
          // — this restores the original behavior where Link d'Água leads went straight to the board
          const targetStageId = matchedStageId || (hasSdrTag && firstStageId ? firstStageId : null);

          if (targetStageId) {
            enrichedDeals.push({
              id: `auto-${contact.id}`,
              title: contact.name || contact.email || 'Novo Lead',
              value: contact.totalValue || 0,
              probability: 0,
              status: targetStageId,
              priority: 'medium' as any,
              boardId: boardId,
              contactId: contact.id,
              companyId: contact.companyId || '',
              tags: tags,
              customFields: {},
              createdAt: contact.createdAt,
              updatedAt: (contact as any).updatedAt || contact.createdAt,
              items: [],
              owner: { name: hasSdrTag ? '🤖 SDR' : 'Auto', avatar: '' },
              companyName: 'Sem empresa',
              contactName: contact.name || 'Sem contato',
              contactEmail: contact.email || '',
              source: contact.source || (hasSdrTag ? 'Link d\'Água' : 'Desconhecido'),
            });
          }
        }
      }

      // DEDUPLICATION: one card per contact — prevents ghost + real deal duplicates
      // Priority: real deals win over auto-mapped ghost cards
      const seenContactIds = new Set<string>();
      const seenDealIds = new Set<string>();

      // Pass 1: register all real deal contactIds (real deals win)
      for (const deal of enrichedDeals) {
        if (!deal.id.startsWith('auto-') && deal.contactId) {
          seenContactIds.add(deal.contactId);
        }
      }

      // Pass 2: filter — keep real deals always, keep auto only if contactId not taken
      let dedupedDeals = enrichedDeals.filter(deal => {
        if (!deal.status) return false;
        if (seenDealIds.has(deal.id)) return false;
        seenDealIds.add(deal.id);

        if (deal.id.startsWith('auto-')) {
          // Drop ghost card if a real deal already covers this contact
          if (!deal.contactId || seenContactIds.has(deal.contactId)) return false;
          seenContactIds.add(deal.contactId);
        }
        return true;
      });

      // ── PRIVACIDADE ESTRITA (branch provadagua) ─────────────────────────
      // Filtra deals cujo contato não satisfaz os critérios da branch provadagua.
      if (IS_DEMO) {
        const contactCache = new Map(contacts.map(c => [c.id, c]));
        dedupedDeals = dedupedDeals.filter(deal => {
          const contact = contactCache.get(deal.contactId);
          if (!contact) return false;
          return isDemoVisible({
            tags:  contact.tags, // Fixed: use real tags array
            email: contact.email,
            phone: (contact as any).phone,
          });
        });
      }

      return dedupedDeals;

    },
    staleTime: 0, // Always refetch after mutations — no stale data on Kanban
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
  const { profile } = useAuth(); // V9.7 FIX: must be at hook top level, not inside mutationFn

  return useMutation({
    mutationFn: async (deal: CreateDealInput) => {
      // Sanitize: Convert empty strings to null for UUID fields to prevent 22P02 error
      const sanitizedDeal = {
        ...deal,
        contactId: deal.contactId || undefined,
        companyId: deal.companyId || undefined,
        boardId: deal.boardId || undefined,
        updatedAt: new Date().toISOString(),
      };

      // V9.7 FIX: company_id MUST be passed — same root cause fixed for boards in V9.6.
      // Passing '' (falsy) caused dealsService to send null company_id → RLS 403.
      const { data, error } = await dealsService.create(sanitizedDeal, profile?.company_id || '');
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
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Deal>;
    }) => {
      updates.updatedAt = new Date().toISOString();
      if (updates.status) {
        updates.lastStageChangeDate = new Date().toISOString();
      }
      const { error } = await dealsService.update(id, updates);
      if (error) throw error;
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deals.all });
      const previousDeals = queryClient.getQueryData<Deal[]>(queryKeys.deals.lists());

      // Optimistically update all deal lists (including board filtered lists)
      queryClient.setQueriesData<Deal[]>({ queryKey: queryKeys.deals.lists() }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(deal => (deal.id === id ? { ...deal, ...updates } : deal));
      });

      return { previousDeals };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDeals) {
        queryClient.setQueryData(queryKeys.deals.lists(), context.previousDeals);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
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

      // Optimistic update for instant drag feedback on all lists (boards, generic)
      queryClient.setQueriesData<Deal[]>({ queryKey: queryKeys.deals.lists() }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(deal =>
          deal.id === id
            ? {
              ...deal,
              status,
              lastStageChangeDate: new Date().toISOString(),
              ...(lossReason && { lossReason }),
            }
            : deal
        );
      });

      return { previousDeals };
    },
    onError: (_error, _variables, context) => {
      // Revert is harder with setQueriesData, skipping robust revert for now
      // and relying on onSettled invalidation which is secure
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
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
      // Cancel ALL deal queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: queryKeys.deals.all });

      // Snapshot ALL deal caches (lists + board-specific)
      const previousDeals = queryClient.getQueryData<Deal[]>(queryKeys.deals.lists());

      // Optimistically remove from every deal cache entry
      queryClient.setQueriesData<Deal[]>(
        { queryKey: queryKeys.deals.all, exact: false },
        (old) => (old || []).filter(deal => deal.id !== id)
      );

      // Also remove from DealView caches (board view uses DealView[])
      queryClient.setQueriesData<{ id: string }[]>(
        { queryKey: queryKeys.deals.all, exact: false },
        (old) => (old || []).filter((deal: any) => deal.id !== id)
      );

      return { previousDeals };
    },
    onError: (_error, _id, context) => {
      if (context?.previousDeals) {
        queryClient.setQueryData(queryKeys.deals.lists(), context.previousDeals);
      }
    },
    onSettled: () => {
      // Invalidate ALL related queries to fetch fresh data
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
