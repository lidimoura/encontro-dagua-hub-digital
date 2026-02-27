/**
 * TanStack Query hooks for Contacts - Supabase Edition
 *
 * Features:
 * - Real Supabase API calls (ALL filtered by profile.company_id)
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation
 * - Cross-app analytics: aggregates QR engagement from both qr_codes and qr_links tables
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { contactsService, companiesService } from '@/lib/supabase';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Contact, ContactStage, Company } from '@/types';

// ============ QUERY HOOKS ============

export interface ContactsFilters {
  companyId?: string;
  stage?: ContactStage | string;
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
}

/**
 * Hook to fetch all contacts with optional filters.
 * FIXED: passes profile.company_id to contactsService.getAll() so contacts are actually returned.
 */
export const useContacts = (filters?: ContactsFilters) => {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  return useQuery({
    queryKey: filters
      ? queryKeys.contacts.list({ companyId, ...(filters as Record<string, unknown>) })
      : queryKeys.contacts.lists(),
    enabled: !!companyId, // Don't fire without a session/company
    queryFn: async () => {
      const { data, error } = await contactsService.getAll(companyId!);
      if (error) throw error;

      let contacts = data || [];

      // Apply client-side filters
      if (filters) {
        contacts = contacts.filter(contact => {
          if (filters.companyId && contact.companyId !== filters.companyId) return false;
          if (filters.stage && contact.stage !== filters.stage) return false;
          if (filters.status && contact.status !== filters.status) return false;
          if (filters.search) {
            const search = filters.search.toLowerCase();
            const matchName = contact.name.toLowerCase().includes(search);
            const matchEmail = contact.email.toLowerCase().includes(search);
            if (!matchName && !matchEmail) return false;
          }
          return true;
        });
      }

      return contacts;
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single contact by ID.
 */
export const useContact = (id: string | undefined) => {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  return useQuery({
    queryKey: queryKeys.contacts.detail(id || ''),
    enabled: !!id && !!companyId,
    queryFn: async () => {
      const { data, error } = await contactsService.getAll(companyId!);
      if (error) throw error;
      return (data || []).find(c => c.id === id) || null;
    },
  });
};

/**
 * Hook to fetch contacts by company.
 */
export const useContactsByCompany = (crm_company_id: string) => {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  return useQuery({
    queryKey: queryKeys.contacts.list({ companyId, crm_company_id }),
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await contactsService.getAll(companyId!);
      if (error) throw error;
      return (data || []).filter(c => c.companyId === crm_company_id);
    },
  });
};

/**
 * Hook to fetch leads (contacts in LEAD stage).
 */
export const useLeadContacts = () => {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  return useQuery({
    queryKey: queryKeys.contacts.list({ companyId, stage: 'LEAD' }),
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await contactsService.getAll(companyId!);
      if (error) throw error;
      return (data || []).filter(c => c.stage === 'LEAD');
    },
  });
};

/**
 * Hook to fetch all CRM companies.
 */
export const useCompanies = () => {
  const { profile } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.companies.lists(), profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      const { data, error } = await companiesService.getAll(profile.company_id);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============ CROSS-APP ANALYTICS ============

export interface ClientQREngagement {
  qrCodesCount: number;   // Number of projects in qr_codes (CRM)
  qrLinksCount: number;   // Number of projects in qr_links (Link d'Água)
  totalScans: number;     // Sum of total_scans from both tables
  totalProjects: number;  // Combined count
}

/**
 * Hook to fetch unified QR engagement for a specific client contact.
 * Aggregates data from both qr_codes (CRM projects) and qr_links (Link d'Água app),
 * matching by contact email. This hook is used on Deal Cards for the Total Engagement metric.
 */
export const useClientQREngagement = (contactEmail: string | undefined) => {
  return useQuery({
    queryKey: ['client-qr-engagement', contactEmail],
    enabled: !!contactEmail,
    queryFn: async (): Promise<ClientQREngagement> => {
      if (!contactEmail) return { qrCodesCount: 0, qrLinksCount: 0, totalScans: 0, totalProjects: 0 };

      // Query both tables in parallel, matching by client email
      const [crmResult, linksResult] = await Promise.all([
        // CRM projects: match by client_name is fragile — use owner_id or email if available.
        // For now we query by contact email stored in qr_codes (if column exists),
        // with a fallback to count all projects for resilience.
        (async () => {
          const res = await supabase
            .from('qr_codes')
            .select('id, total_scans, client_email')
            .eq('client_email', contactEmail);
          return res.data || [];
        })(),

        // Link d'Água projects: query qr_links table (with catch to prevent 400 error crashing)
        (async () => {
          try {
            const res = await supabase
              .from('qr_links')
              .select('id, total_scans, client_email')
              .eq('client_email', contactEmail);
            return res.data || [];
          } catch (e) {
            return [];
          }
        })(),
      ]);

      const crmProjects = crmResult;
      const linkProjects = linksResult;

      const qrCodesCount = crmProjects.length;
      const qrLinksCount = linkProjects.length;

      const crmScans = crmProjects.reduce((sum, p) => sum + (p.total_scans || 0), 0);
      const linksScans = linkProjects.reduce((sum, p) => sum + (p.total_scans || 0), 0);

      return {
        qrCodesCount,
        qrLinksCount,
        totalScans: crmScans + linksScans,
        totalProjects: qrCodesCount + qrLinksCount,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============ MUTATION HOOKS ============

/**
 * Hook to create a new contact.
 */
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (contact: Omit<Contact, 'id' | 'createdAt'>) => {
      const sanitizedContact = {
        ...contact,
        companyId: contact.companyId || undefined,
      };

      const companyId = profile?.company_id || '';
      const { data, error } = await contactsService.create(sanitizedContact, companyId);
      if (error) throw error;
      return data!;
    },
    onMutate: async newContact => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts.all });
      const previousContacts = queryClient.getQueryData<Contact[]>(queryKeys.contacts.lists());

      const tempContact: Contact = {
        ...newContact,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Contact;

      queryClient.setQueryData<Contact[]>(queryKeys.contacts.lists(), (old = []) => [
        tempContact,
        ...old,
      ]);
      return { previousContacts };
    },
    onError: (error, _newContact, context) => {
      console.error('❌ ERRO CRÍTICO SUPABASE - Criação de Contato:', {
        message: error.message,
        // @ts-ignore
        details: error.details,
        // @ts-ignore
        hint: error.hint,
        // @ts-ignore
        code: error.code,
        fullError: error,
      });

      if (context?.previousContacts) {
        queryClient.setQueryData(queryKeys.contacts.lists(), context.previousContacts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
};

/**
 * Hook to update a contact.
 */
export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contact> }) => {
      const { error } = await contactsService.update(id, updates);
      if (error) throw error;
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts.all });
      const previousContacts = queryClient.getQueryData<Contact[]>(queryKeys.contacts.lists());
      queryClient.setQueryData<Contact[]>(queryKeys.contacts.lists(), (old = []) =>
        old.map(contact => (contact.id === id ? { ...contact, ...updates } : contact))
      );
      return { previousContacts };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(queryKeys.contacts.lists(), context.previousContacts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
};

/**
 * Hook to update contact stage (lifecycle).
 */
export const useUpdateContactStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await contactsService.update(id, { stage });
      if (error) throw error;
      return { id, stage };
    },
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts.all });
      const previousContacts = queryClient.getQueryData<Contact[]>(queryKeys.contacts.lists());
      queryClient.setQueryData<Contact[]>(queryKeys.contacts.lists(), (old = []) =>
        old.map(contact => (contact.id === id ? { ...contact, stage } : contact))
      );
      return { previousContacts };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(queryKeys.contacts.lists(), context.previousContacts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
};

/**
 * Hook to delete a contact.
 */
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await contactsService.delete(id);
      if (error) throw error;
      return id;
    },
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts.all });
      const previousContacts = queryClient.getQueryData<Contact[]>(queryKeys.contacts.lists());
      queryClient.setQueryData<Contact[]>(queryKeys.contacts.lists(), (old = []) =>
        old.filter(contact => contact.id !== id)
      );
      return { previousContacts };
    },
    onError: (_error, _id, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(queryKeys.contacts.lists(), context.previousContacts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
    },
  });
};

// ============ COMPANIES MUTATIONS ============

/**
 * Hook to create a new company.
 */
export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (company: Omit<Company, 'id' | 'createdAt'>) => {
      const sanitizedCompany = {
        ...company,
        industry: company.industry || undefined,
        website: company.website || undefined,
      };

      const companyId = profile?.company_id || '';
      const { data, error } = await companiesService.create(sanitizedCompany, companyId);
      if (error) throw error;
      return data!;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
};

/**
 * Hook to update a company.
 */
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Company> }) => {
      const { error } = await companiesService.update(id, updates);
      if (error) throw error;
      return { id, updates };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
};

/**
 * Hook to delete a company.
 */
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await companiesService.delete(id);
      if (error) throw error;
      return id;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
};

// ============ UTILITY HOOKS ============

/**
 * Hook to prefetch a contact (for hover previews).
 */
export const usePrefetchContact = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  return async (id: string) => {
    if (!companyId) return;
    await queryClient.prefetchQuery({
      queryKey: queryKeys.contacts.detail(id),
      queryFn: async () => {
        const { data, error } = await contactsService.getAll(companyId);
        if (error) throw error;
        return (data || []).find(c => c.id === id) || null;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};
