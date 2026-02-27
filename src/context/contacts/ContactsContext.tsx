import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Contact, Company } from '@/types';
import { contactsService, companiesService } from '@/lib/supabase';
import { useAuth } from '../AuthContext';

interface ContactsContextType {
  // Contacts
  contacts: Contact[];
  contactsLoading: boolean;
  contactsError: string | null;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Promise<Contact | null>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  // Companies
  companies: Company[];
  companiesLoading: boolean;
  companiesError: string | null;
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Promise<Company | null>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;

  // Lookup maps (O(1) access)
  companyMap: Record<string, Company>;
  contactMap: Record<string, Contact>;

  // Derived data
  leadsFromContacts: Contact[];

  // Refresh
  refreshContacts: () => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState<string | null>(null);

  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    if (!profile?.company_id) {
      setContacts([]);
      setContactsLoading(false);
      return;
    }

    setContactsLoading(true);
    setContactsError(null);

    const { data, error } = await contactsService.getAll(profile.company_id);

    if (error) {
      setContactsError(error.message);
      setContacts([]);
    } else {
      setContacts(data || []);
    }

    setContactsLoading(false);
  }, [profile?.company_id]);

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    if (!profile?.company_id) {
      setCompanies([]);
      setCompaniesLoading(false);
      return;
    }

    setCompaniesLoading(true);
    setCompaniesError(null);

    const { data, error } = await companiesService.getAll(profile.company_id);

    if (error) {
      setCompaniesError(error.message);
      setCompanies([]);
    } else {
      setCompanies(data || []);
    }

    setCompaniesLoading(false);
  }, [profile]);

  // Initial fetch
  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, [fetchContacts, fetchCompanies]);

  // Contact CRUD
  const addContact = useCallback(
    async (contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact | null> => {
      if (!profile?.company_id) {
        setContactsError('Usuário não tem empresa associada');
        return null;
      }

      const { data, error } = await contactsService.create(contact, profile.company_id);

      if (error) {
        setContactsError(error.message);
        return null;
      }

      if (data) {
        setContacts(prev => [...prev, data]);
      }

      return data;
    },
    [profile?.company_id]
  );

  const updateContact = useCallback(async (id: string, updates: Partial<Contact>) => {
    const { error } = await contactsService.update(id, updates);

    if (error) {
      setContactsError(error.message);
      return;
    }

    setContacts(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    const { error } = await contactsService.delete(id);

    if (error) {
      setContactsError(error.message);
      return;
    }

    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  // Company CRUD
  const addCompany = useCallback(
    async (company: Omit<Company, 'id' | 'createdAt'>): Promise<Company | null> => {
      if (!profile?.company_id) {
        setCompaniesError('Usuário não tem empresa associada');
        return null;
      }

      const { data, error } = await companiesService.create(company, profile.company_id);

      if (error) {
        setCompaniesError(error.message);
        return null;
      }

      if (data) {
        setCompanies(prev => [...prev, data]);
      }

      return data;
    },
    [profile?.company_id]
  );

  const updateCompany = useCallback(async (id: string, updates: Partial<Company>) => {
    const { error } = await companiesService.update(id, updates);

    if (error) {
      setCompaniesError(error.message);
      return;
    }

    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCompany = useCallback(async (id: string) => {
    const { error } = await companiesService.delete(id);

    if (error) {
      setCompaniesError(error.message);
      return;
    }

    setCompanies(prev => prev.filter(c => c.id !== id));
  }, []);

  // Hash Maps para O(1) lookups
  const companyMap = useMemo(() => {
    return companies.reduce(
      (acc, c) => {
        acc[c.id] = c;
        return acc;
      },
      {} as Record<string, Company>
    );
  }, [companies]);

  const contactMap = useMemo(() => {
    return contacts.reduce(
      (acc, c) => {
        acc[c.id] = c;
        return acc;
      },
      {} as Record<string, Contact>
    );
  }, [contacts]);

  // Contacts filtrados por stage = LEAD
  const leadsFromContacts = useMemo(() => {
    return contacts.filter(c => c.stage === 'LEAD');
  }, [contacts]);

  const value = useMemo(
    () => ({
      contacts,
      contactsLoading,
      contactsError,
      addContact,
      updateContact,
      deleteContact,
      companies,
      companiesLoading,
      companiesError,
      addCompany,
      updateCompany,
      deleteCompany,
      companyMap,
      contactMap,
      leadsFromContacts,
      refreshContacts: fetchContacts,
      refreshCompanies: fetchCompanies,
    }),
    [
      contacts,
      contactsLoading,
      contactsError,
      addContact,
      updateContact,
      deleteContact,
      companies,
      companiesLoading,
      companiesError,
      addCompany,
      updateCompany,
      deleteCompany,
      companyMap,
      contactMap,
      leadsFromContacts,
      fetchContacts,
      fetchCompanies,
    ]
  );

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
};
