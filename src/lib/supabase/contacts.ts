import { supabase } from './client';
import { Contact, Company } from '@/types';

// ============================================
// CONTACTS SERVICE
// ============================================

export interface DbContact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  company_name: string | null;
  crm_company_id: string | null;
  avatar: string | null;
  notes: string | null;
  status: string;
  stage: string;
  source: string | null;
  birth_date: string | null;
  last_interaction: string | null;
  last_purchase_date: string | null;
  total_value: number;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
}

export interface DbCompany {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
}

// Transform DB -> App
const transformContact = (db: DbContact): Contact => ({
  id: db.id,
  name: db.name,
  email: db.email || '',
  phone: db.phone || '',
  role: db.role || '',
  companyId: db.crm_company_id || '',
  avatar: db.avatar || '',
  notes: db.notes || '',
  status: db.status as Contact['status'],
  stage: db.stage,
  source: db.source as Contact['source'] || undefined,
  birthDate: db.birth_date || undefined,
  lastInteraction: db.last_interaction || undefined,
  lastPurchaseDate: db.last_purchase_date || undefined,
  totalValue: db.total_value || 0,
  createdAt: db.created_at,
});

const transformCompany = (db: DbCompany): Company => ({
  id: db.id,
  name: db.name,
  industry: db.industry || '',
  website: db.website || '',
  createdAt: db.created_at,
});

// Transform App -> DB
const transformContactToDb = (contact: Partial<Contact>): Partial<DbContact> => {
  const db: Partial<DbContact> = {};

  if (contact.name !== undefined) db.name = contact.name;
  if (contact.email !== undefined) db.email = contact.email || null;
  if (contact.phone !== undefined) db.phone = contact.phone || null;
  if (contact.role !== undefined) db.role = contact.role || null;
  if (contact.companyId !== undefined) db.crm_company_id = contact.companyId || null;
  if (contact.avatar !== undefined) db.avatar = contact.avatar || null;
  if (contact.notes !== undefined) db.notes = contact.notes || null;
  if (contact.status !== undefined) db.status = contact.status;
  if (contact.stage !== undefined) db.stage = contact.stage;
  if (contact.source !== undefined) db.source = contact.source || null;
  if (contact.birthDate !== undefined) db.birth_date = contact.birthDate || null;
  if (contact.lastInteraction !== undefined) db.last_interaction = contact.lastInteraction || null;
  if (contact.lastPurchaseDate !== undefined) db.last_purchase_date = contact.lastPurchaseDate || null;
  if (contact.totalValue !== undefined) db.total_value = contact.totalValue;

  return db;
};

export const contactsService = {
  async getAll(): Promise<{ data: Contact[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return { data: null, error };
      return { data: (data || []).map(c => transformContact(c as DbContact)), error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  },

  async create(contact: Omit<Contact, 'id' | 'createdAt'>, companyId: string): Promise<{ data: Contact | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({ ...transformContactToDb(contact as Contact), company_id: companyId })
        .select()
        .single();

      if (error) return { data: null, error };
      return { data: transformContact(data as DbContact), error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  },

  async update(id: string, updates: Partial<Contact>): Promise<{ error: Error | null }> {
    try {
      const dbUpdates = transformContactToDb(updates);
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('contacts')
        .update(dbUpdates)
        .eq('id', id);

      return { error };
    } catch (e) {
      return { error: e as Error };
    }
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      return { error };
    } catch (e) {
      return { error: e as Error };
    }
  },
};

export const companiesService = {
  async getAll(): Promise<{ data: Company[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return { data: null, error };
      return { data: (data || []).map(c => transformCompany(c as DbCompany)), error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  },

  async create(company: Omit<Company, 'id' | 'createdAt'>, tenantId: string): Promise<{ data: Company | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: company.name,
          industry: company.industry || null,
          website: company.website || null,
          company_id: tenantId,
        })
        .select()
        .single();

      if (error) return { data: null, error };
      return { data: transformCompany(data as DbCompany), error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  },

  async update(id: string, updates: Partial<Company>): Promise<{ error: Error | null }> {
    try {
      const dbUpdates: Partial<DbCompany> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.industry !== undefined) dbUpdates.industry = updates.industry || null;
      if (updates.website !== undefined) dbUpdates.website = updates.website || null;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('companies')
        .update(dbUpdates)
        .eq('id', id);

      return { error };
    } catch (e) {
      return { error: e as Error };
    }
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      return { error };
    } catch (e) {
      return { error: e as Error };
    }
  },
};
