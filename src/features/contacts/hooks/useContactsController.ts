import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { Contact, ContactStage } from '@/types';
import {
  useContacts,
  useCompanies,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useCreateCompany,
} from '@/lib/query/hooks/useContactsQuery';
import { useCreateDeal } from '@/lib/query/hooks/useDealsQuery';
import { useRealtimeSync } from '@/lib/realtime';

export const useContactsController = () => {
  // TanStack Query hooks
  const { data: contacts = [], isLoading: contactsLoading } = useContacts();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();
  const createCompanyMutation = useCreateCompany();
  const createDealMutation = useCreateDeal();

  // Enable realtime sync
  useRealtimeSync('contacts');
  useRealtimeSync('companies');

  const { addToast, showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'RISK'
  >(() => {
    const filter = searchParams.get('filter');
    const validFilters = ['ALL', 'ACTIVE', 'INACTIVE', 'CHURNED', 'RISK'] as const;
    return validFilters.includes(filter as (typeof validFilters)[number])
      ? (filter as (typeof validFilters)[number])
      : 'ALL';
  });
  const [stageFilter, setStageFilter] = useState<ContactStage | 'ALL'>(
    (searchParams.get('stage') as ContactStage) || 'ALL'
  );
  const [viewMode, setViewMode] = useState<'people' | 'companies'>('people');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    companyName: '',
  });

  const isLoading = contactsLoading || companiesLoading;

  const openCreateModal = () => {
    setEditingContact(null);
    setFormData({ name: '', email: '', phone: '', role: '', companyName: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    const company = companies.find(c => c.id === contact.companyId);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.role || '',
      companyName: company?.name || '',
    });
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteContactMutation.mutate(deleteId, {
        onSuccess: () => {
          (addToast || showToast)('Contato excluído com sucesso', 'success');
          setDeleteId(null);
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Find or create company
    let companyId: string | undefined;
    const existingCompany = companies.find(
      c => c.name.toLowerCase() === formData.companyName.toLowerCase()
    );

    if (existingCompany) {
      companyId = existingCompany.id;
    } else if (formData.companyName) {
      // Create new company and wait for result
      const newCompany = await new Promise<{ id: string } | null>(resolve => {
        createCompanyMutation.mutate(
          { name: formData.companyName },
          { onSuccess: resolve, onError: () => resolve(null) }
        );
      });
      if (newCompany) {
        companyId = newCompany.id;
      }
    } else if (editingContact) {
      companyId = editingContact.companyId;
    }

    if (editingContact) {
      updateContactMutation.mutate(
        {
          id: editingContact.id,
          updates: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            companyId: companyId,
          },
        },
        {
          onSuccess: () => {
            (addToast || showToast)('Contato atualizado!', 'success');
            setIsModalOpen(false);
          },
        }
      );
    } else {
      createContactMutation.mutate(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          companyId: companyId || '',
          status: 'ACTIVE',
          stage: ContactStage.LEAD,
          totalValue: 0,
        },
        {
          onSuccess: () => {
            (addToast || showToast)('Contato criado!', 'success');
            setIsModalOpen(false);
          },
        }
      );
    }
  };

  // Convert contact to deal (uses default board)
  const convertContactToDeal = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    // For now, create a deal without board/stage - can be assigned later
    createDealMutation.mutate({
      title: `Deal - ${contact.name}`,
      contactId,
      companyId: contact.companyId,
      boardId: '',
      status: 'NEW',
      value: 0,
      probability: 0,
      priority: 'medium',
      tags: [],
      items: [],
      customFields: {},
      owner: { name: 'Eu', avatar: '' },
    });
  };

  // Update contact wrapper
  const updateContact = (contactId: string, data: Partial<Contact>) => {
    updateContactMutation.mutate({
      id: contactId,
      updates: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        stage: data.stage,
      },
    });
  };

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());

      // Filtro por estágio
      const matchesStage = stageFilter === 'ALL' || c.stage === stageFilter;

      let matchesStatus = true;
      if (statusFilter === 'RISK') {
        // Risk logic: Active but no purchase > 30 days
        if (c.status !== 'ACTIVE') {
          matchesStatus = false;
        } else {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          matchesStatus = !c.lastPurchaseDate || new Date(c.lastPurchaseDate) < thirtyDaysAgo;
        }
      } else {
        matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      }

      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = matchesDate && new Date(c.createdAt) >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(c.createdAt) <= endDate;
      }

      return matchesSearch && matchesStage && matchesStatus && matchesDate;
    });
  }, [contacts, search, stageFilter, statusFilter, dateRange]);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(
      c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()))
    );
  }, [companies, search]);

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || 'Empresa não vinculada';
  };

  // Contadores por estágio
  const stageCounts = useMemo(
    () => ({
      LEAD: contacts.filter(c => c.stage === ContactStage.LEAD).length,
      MQL: contacts.filter(c => c.stage === ContactStage.MQL).length,
      PROSPECT: contacts.filter(c => c.stage === ContactStage.PROSPECT).length,
      CUSTOMER: contacts.filter(c => c.stage === ContactStage.CUSTOMER).length,
      OTHER: contacts.filter(c => !Object.values(ContactStage).includes(c.stage as ContactStage))
        .length,
    }),
    [contacts]
  );

  return {
    // State
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    stageFilter,
    setStageFilter,
    stageCounts,
    viewMode,
    setViewMode,
    isFilterOpen,
    setIsFilterOpen,
    dateRange,
    setDateRange,
    isModalOpen,
    setIsModalOpen,
    editingContact,
    deleteId,
    setDeleteId,
    formData,
    setFormData,
    isLoading,

    // Data
    contacts,
    companies,
    filteredContacts,
    filteredCompanies,

    // Actions
    openCreateModal,
    openEditModal,
    confirmDelete,
    handleSubmit,
    getCompanyName,
    updateContact,
    convertContactToDeal,
    addToast: addToast || showToast,
  };
};
