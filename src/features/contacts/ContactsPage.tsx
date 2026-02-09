import React, { useState, useMemo } from 'react';
import { useContactsController } from './hooks/useContactsController';
import { ContactsHeader } from './components/ContactsHeader';
import { ContactsFilters } from './components/ContactsFilters';
import { ContactsTabs } from './components/ContactsTabs';
import { ContactsStageTabs } from './components/ContactsStageTabs';
import { ContactsList } from './components/ContactsList';
import { ContactFormModal } from './components/ContactFormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { MazoSuggestionCard } from '@/components/MazoSuggestionCard';
import { MazoInviteModal } from '@/components/MazoInviteModal';
import { useTranslation } from '@/hooks/useTranslation';

export const ContactsPage: React.FC = () => {
    const controller = useContactsController();
    const { t } = useTranslation();

    // DEBUG: Log contact data for visibility diagnosis
    React.useEffect(() => {
        console.log('🔍 CONTACTS DEBUG:', {
            totalContacts: controller.contacts.length,
            filteredContacts: controller.filteredContacts.length,
            isLoading: controller.isLoading,
            rawData: controller.contacts
        });
    }, [controller.contacts, controller.filteredContacts, controller.isLoading]);

    const [mazoInviteModal, setMazoInviteModal] = useState<{
        isOpen: boolean;
        contactName: string;
        contactEmail: string;
        contactId: string;
    }>({
        isOpen: false,
        contactName: '',
        contactEmail: '',
        contactId: '',
    });
    const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

    // Mazô AI Logic: Find clients who won but don't have user_id (need onboarding)
    const mazoSuggestion = useMemo(() => {
        const wonClients = controller.filteredContacts.filter(
            contact =>
                contact.stage === 'CUSTOMER' &&
                !contact.user_id &&
                !dismissedSuggestions.has(contact.id)
        );
        return wonClients.length > 0 ? wonClients[0] : null;
    }, [controller.filteredContacts, dismissedSuggestions]);

    const handleAcceptMazoSuggestion = () => {
        if (mazoSuggestion) {
            setMazoInviteModal({
                isOpen: true,
                contactName: mazoSuggestion.name,
                contactEmail: mazoSuggestion.email,
                contactId: mazoSuggestion.id,
            });
        }
    };

    const handleDismissMazoSuggestion = () => {
        if (mazoSuggestion) {
            setDismissedSuggestions(prev => new Set(prev).add(mazoSuggestion.id));
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-[1600px] mx-auto">
            {/* DEBUG INFO */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-sm">
                <strong>DEBUG:</strong> Contacts: {controller.contacts.length} |
                Filtered: {controller.filteredContacts.length} |
                Companies: {controller.companies.length} |
                Loading: {controller.isLoading ? 'YES' : 'NO'}
            </div>

            <ContactsHeader
                viewMode={controller.viewMode}
                search={controller.search}
                setSearch={controller.setSearch}
                statusFilter={controller.statusFilter}
                setStatusFilter={controller.setStatusFilter}
                isFilterOpen={controller.isFilterOpen}
                setIsFilterOpen={controller.setIsFilterOpen}
                openCreateModal={controller.openCreateModal}
            />

            {controller.isFilterOpen && (
                <ContactsFilters
                    dateRange={controller.dateRange}
                    setDateRange={controller.setDateRange}
                />
            )}

            {/* Mazô CS Copilot Suggestion */}
            {mazoSuggestion && (
                <MazoSuggestionCard
                    contactName={mazoSuggestion.name}
                    onAccept={handleAcceptMazoSuggestion}
                    onDismiss={handleDismissMazoSuggestion}
                />
            )}

            {/* Stage Tabs - Funil de Contatos */}
            <ContactsStageTabs
                activeStage={controller.stageFilter}
                onStageChange={controller.setStageFilter}
                counts={controller.stageCounts}
            />

            <ContactsTabs
                viewMode={controller.viewMode}
                setViewMode={controller.setViewMode}
                contactsCount={controller.filteredContacts.length}
                companiesCount={controller.companies.length}
            />

            <ContactsList
                viewMode={controller.viewMode}
                filteredContacts={controller.filteredContacts}
                filteredCompanies={controller.filteredCompanies}
                contacts={controller.contacts}
                getCompanyName={controller.getCompanyName}
                updateContact={controller.updateContact}
                convertContactToDeal={controller.convertContactToDeal}
                openEditModal={controller.openEditModal}
                setDeleteId={controller.setDeleteId}
                addToast={controller.addToast}
            />

            <ContactFormModal
                isOpen={controller.isModalOpen}
                onClose={() => controller.setIsModalOpen(false)}
                onSubmit={controller.handleSubmit}
                formData={controller.formData}
                setFormData={controller.setFormData}
                editingContact={controller.editingContact}
            />

            <ConfirmModal
                isOpen={!!controller.deleteId}
                onClose={() => controller.setDeleteId(null)}
                onConfirm={controller.confirmDelete}
                title={t('deleteContact')}
                message={t('confirmDeleteContact')}
                confirmText={t('delete')}
                variant="danger"
            />

            {/* Mazô Invite Modal */}
            <MazoInviteModal
                isOpen={mazoInviteModal.isOpen}
                onClose={() => setMazoInviteModal({ ...mazoInviteModal, isOpen: false })}
                contactName={mazoInviteModal.contactName}
                contactEmail={mazoInviteModal.contactEmail}
                contactId={mazoInviteModal.contactId}
            />
        </div>
    );
};
