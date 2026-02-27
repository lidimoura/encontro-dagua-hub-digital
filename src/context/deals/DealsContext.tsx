import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Deal, DealView, DealItem, Company, Contact } from '@/types';
import { dealsService } from '@/lib/supabase';
import { useAuth } from '../AuthContext';

interface DealsContextType {
  // Raw data
  rawDeals: Deal[];
  loading: boolean;
  error: string | null;

  // CRUD Operations
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => Promise<Deal | null>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  updateDealStatus: (id: string, newStatus: string, lossReason?: string) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;

  // Items
  addItemToDeal: (dealId: string, item: Omit<DealItem, 'id'>) => Promise<DealItem | null>;
  removeItemFromDeal: (dealId: string, itemId: string) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

export const DealsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [rawDeals, setRawDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch deals
  const fetchDeals = useCallback(async () => {
    if (!profile?.company_id) {
      setRawDeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await dealsService.getAll(profile.company_id);

    if (fetchError) {
      setError(fetchError.message);
      setRawDeals([]);
    } else {
      setRawDeals(data || []);
    }

    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // CRUD Operations
  const addDeal = useCallback(
    async (deal: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal | null> => {
      if (!profile?.company_id) {
        setError('Usuário não tem empresa associada');
        return null;
      }

      const { data, error: addError } = await dealsService.create(deal, profile.company_id);

      if (addError) {
        setError(addError.message);
        return null;
      }

      if (data) {
        setRawDeals(prev => [...prev, data]);
      }

      return data;
    },
    [profile?.company_id]
  );

  const updateDeal = useCallback(async (id: string, updates: Partial<Deal>) => {
    const { error: updateError } = await dealsService.update(id, updates);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setRawDeals(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const updateDealStatus = useCallback(
    async (id: string, newStatus: string, lossReason?: string) => {
      const updates: Partial<Deal> = {
        status: newStatus as Deal['status'],
        ...(lossReason && { lossReason }),
        ...(newStatus === 'WON' && { closedAt: new Date().toISOString() }),
        ...(newStatus === 'LOST' && { closedAt: new Date().toISOString() }),
      };

      await updateDeal(id, updates);
    },
    [updateDeal]
  );

  const deleteDeal = useCallback(async (id: string) => {
    const { error: deleteError } = await dealsService.delete(id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setRawDeals(prev => prev.filter(d => d.id !== id));
  }, []);

  // Items
  const addItemToDeal = useCallback(
    async (dealId: string, item: Omit<DealItem, 'id'>): Promise<DealItem | null> => {
      const { data, error: addError } = await dealsService.addItem(dealId, item);

      if (addError) {
        setError(addError.message);
        return null;
      }

      if (data) {
        // Refresh the deal to get updated value
        const { data: updatedDeal } = await dealsService.getById(dealId);
        if (updatedDeal) {
          setRawDeals(prev => prev.map(d => (d.id === dealId ? updatedDeal : d)));
        }
      }

      return data;
    },
    []
  );

  const removeItemFromDeal = useCallback(async (dealId: string, itemId: string) => {
    const { error: removeError } = await dealsService.removeItem(dealId, itemId);

    if (removeError) {
      setError(removeError.message);
      return;
    }

    // Refresh the deal to get updated value
    const { data: updatedDeal } = await dealsService.getById(dealId);
    if (updatedDeal) {
      setRawDeals(prev => prev.map(d => (d.id === dealId ? updatedDeal : d)));
    }
  }, []);

  const value = useMemo(
    () => ({
      rawDeals,
      loading,
      error,
      addDeal,
      updateDeal,
      updateDealStatus,
      deleteDeal,
      addItemToDeal,
      removeItemFromDeal,
      refresh: fetchDeals,
    }),
    [
      rawDeals,
      loading,
      error,
      addDeal,
      updateDeal,
      updateDealStatus,
      deleteDeal,
      addItemToDeal,
      removeItemFromDeal,
      fetchDeals,
    ]
  );

  return <DealsContext.Provider value={value}>{children}</DealsContext.Provider>;
};

export const useDeals = () => {
  const context = useContext(DealsContext);
  if (context === undefined) {
    throw new Error('useDeals must be used within a DealsProvider');
  }
  return context;
};

// Hook para deals com view projection (desnormalizado)
export const useDealsView = (
  companyMap: Record<string, Company>,
  contactMap: Record<string, Contact>
): DealView[] => {
  const { rawDeals } = useDeals();

  return useMemo(() => {
    return rawDeals.map(deal => ({
      ...deal,
      companyName: companyMap[deal.companyId]?.name || 'Empresa Desconhecida',
      contactName: contactMap[deal.contactId]?.name || 'Sem Contato',
      contactEmail: contactMap[deal.contactId]?.email || '',
    }));
  }, [rawDeals, companyMap, contactMap]);
};
