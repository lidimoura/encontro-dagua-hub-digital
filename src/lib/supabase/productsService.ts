import { supabase } from './client';
import { Product } from '@/types';

export const productsService = {
    /**
     * Get all active products for the current user's company
     */
    async getAll() {
        return await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('name');
    },

    /**
     * Get a single product by ID
     */
    async getById(id: string) {
        return await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
    },

    /**
     * Create a new product (Admin only)
     */
    async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
        return await supabase
            .from('products')
            .insert([{
                ...product,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();
    },

    /**
     * Update an existing product (Admin only)
     */
    async update(id: string, updates: Partial<Product>) {
        return await supabase
            .from('products')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
    },

    /**
     * Soft delete a product by setting is_active to false
     */
    async softDelete(id: string) {
        return await supabase
            .from('products')
            .update({
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
    },

    /**
     * Hard delete a product (Admin only)
     */
    async delete(id: string) {
        return await supabase
            .from('products')
            .delete()
            .eq('id', id);
    }
};
