import { supabase } from './client';

export interface BridgeTemplate {
    id: string;
    company_id: string;
    name: string;
    description?: string;
    bg_color: string;
    card_bg_color: string;
    text_color: string;
    button_bg_color: string;
    button_text_color: string;
    font_family?: string;
    custom_css?: string;
    is_global?: boolean; // For default system templates
    created_at?: string;
}

export const templatesService = {
    async getAll(companyId: string): Promise<{ data: BridgeTemplate[] | null; error: Error | null }> {
        try {
            if (!companyId) return { data: [], error: null };

            const { data, error } = await supabase
                .from('bridge_templates')
                .select('*')
                .or(`company_id.eq.${companyId},is_global.eq.true`)
                .order('created_at', { ascending: false });

            if (error) return { data: null, error };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: e as Error };
        }
    },

    async create(template: Omit<BridgeTemplate, 'id' | 'created_at'>): Promise<{ data: BridgeTemplate | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('bridge_templates')
                .insert([template])
                .select()
                .single();

            if (error) return { data: null, error };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: e as Error };
        }
    },

    async update(id: string, updates: Partial<BridgeTemplate>): Promise<{ data: BridgeTemplate | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('bridge_templates')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) return { data: null, error };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: e as Error };
        }
    },

    async delete(id: string): Promise<{ error: Error | null }> {
        try {
            const { error } = await supabase
                .from('bridge_templates')
                .delete()
                .eq('id', id)
                .eq('is_global', false); // Prevent deleting global templates

            return { error };
        } catch (e) {
            return { error: e as Error };
        }
    }
};
