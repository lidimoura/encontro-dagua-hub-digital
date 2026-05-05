import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { LifecycleStage, Product, CustomFieldDefinition, Lead } from '@/types';
import { settingsService, lifecycleStagesService } from '@/lib/supabase';
import { productsService } from '@/lib/supabase/productsService';
import { useAuth } from '../AuthContext';

const DEFAULT_LIFECYCLE_STAGES: LifecycleStage[] = [
  { id: 'LEAD', name: 'Lead', color: 'bg-blue-500', order: 0, isDefault: true },
  { id: 'MQL', name: 'MQL', color: 'bg-yellow-500', order: 1, isDefault: true },
  { id: 'PROSPECT', name: 'Oportunidade', color: 'bg-purple-500', order: 2, isDefault: true },
  { id: 'CUSTOMER', name: 'Cliente', color: 'bg-green-500', order: 3, isDefault: true },
  { id: 'OTHER', name: 'Outros / Perdidos', color: 'bg-slate-500', order: 4, isDefault: true },
];

interface AIConfig {
  provider: 'google' | 'openai' | 'anthropic';
  apiKey: string;
  apiKeySecondary: string;
  apiKeyNote: string;
  apiKeySecondaryNote: string;
  model: string;
  thinking: boolean;
  search: boolean;
  anthropicCaching: boolean;
}

interface SettingsContextType {
  // Loading state
  loading: boolean;
  error: string | null;

  // Lifecycle Stages
  lifecycleStages: LifecycleStage[];
  addLifecycleStage: (stage: Omit<LifecycleStage, 'id' | 'order'>) => Promise<LifecycleStage | null>;
  updateLifecycleStage: (id: string, updates: Partial<LifecycleStage>) => Promise<void>;
  deleteLifecycleStage: (id: string) => Promise<void>;
  reorderLifecycleStages: (newOrder: LifecycleStage[]) => Promise<void>;

  // Products (TODO: migrate to Supabase)
  products: Product[];

  // Custom Fields (TODO: migrate to Supabase)
  customFieldDefinitions: CustomFieldDefinition[];
  addCustomField: (field: Omit<CustomFieldDefinition, 'id'>) => void;
  updateCustomField: (id: string, updates: Partial<CustomFieldDefinition>) => void;
  removeCustomField: (id: string) => void;

  // Tags (TODO: migrate to Supabase)
  availableTags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  // AI Config
  aiProvider: AIConfig['provider'];
  setAiProvider: (provider: AIConfig['provider']) => Promise<void>;
  aiApiKey: string;
  setAiApiKey: (key: string) => Promise<void>;
  aiApiKeySecondary: string;
  setAiApiKeySecondary: (key: string) => Promise<void>;
  aiApiKeyNote: string;
  setAiApiKeyNote: (note: string) => void;
  aiApiKeySecondaryNote: string;
  setAiApiKeySecondaryNote: (note: string) => void;
  aiModel: string;
  setAiModel: (model: string) => Promise<void>;
  aiThinking: boolean;
  setAiThinking: (enabled: boolean) => Promise<void>;
  aiSearch: boolean;
  setAiSearch: (enabled: boolean) => Promise<void>;
  aiAnthropicCaching: boolean;
  setAiAnthropicCaching: (enabled: boolean) => Promise<void>;

  // UI State
  isGlobalAIOpen: boolean;
  setIsGlobalAIOpen: (isOpen: boolean) => void;

  // Legacy Leads (deprecated - kept for compatibility)
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  discardLead: (id: string) => void;

  // Pool A — Super Admin exclusive keys
  poolAKeys: KeyEntry[];
  addPoolAKey: (label: string, key: string) => void;
  removePoolAKey: (id: string) => void;
  // Pool B — Demo keys for leads without own key
  poolBKeys: KeyEntry[];
  addPoolBKey: (label: string, key: string) => void;
  removePoolBKey: (id: string) => void;
  isSavingKeys: boolean;
  /** Returns the correct API key for the current user + rotates on 429 */
  resolveApiKey: () => string;
  /** Call when Gemini returns 429 to rotate to next available key */
  onApiKey429: () => void;

  // Refresh
  refresh: () => Promise<void>;

  // Save Settings
  saveAISettings: () => Promise<{ error: Error | null } | void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/** Shared type for AI key pool entries */
export interface KeyEntry { id: string; label: string; key: string; }

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lifecycleStages, setLifecycleStages] = useState<LifecycleStage[]>(DEFAULT_LIFECYCLE_STAGES);
  const [products, setProducts] = useState<Product[]>([]);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // AI Config state
  const [aiProvider, setAiProviderState] = useState<AIConfig['provider']>('google');
  const [aiApiKey, setAiApiKeyState] = useState<string>(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [aiApiKeySecondary, setAiApiKeySecondaryState] = useState<string>(import.meta.env.VITE_GEMINI_API_KEY_SECONDARY || '');
  const [aiApiKeyNote, setAiApiKeyNoteState] = useState<string>('');
  const [aiApiKeySecondaryNote, setAiApiKeySecondaryNoteState] = useState<string>('');
  const [aiModel, setAiModelState] = useState<string>('gemini-2.5-flash');
  const [aiThinking, setAiThinkingState] = useState<boolean>(true);
  const [aiSearch, setAiSearchState] = useState<boolean>(true);
  const [aiAnthropicCaching, setAiAnthropicCachingState] = useState<boolean>(false);

  // UI State
  const [isGlobalAIOpen, setIsGlobalAIOpen] = useState(false);

  // ── Pool A/B state (Super Admin key tiers) ──────────────────────────────
  const [poolAKeys, setPoolAKeys] = useState<KeyEntry[]>([]);
  const [poolBKeys, setPoolBKeys] = useState<KeyEntry[]>([]);
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  // Index tracker for round-robin rotation on 429
  const poolBIndexRef = React.useRef(0);
  const poolAIndexRef = React.useRef(0);

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch user settings
      const { data: settings } = await settingsService.get();
      if (settings) {
        setAiProviderState(settings.aiProvider);
        setAiModelState(settings.aiModel);
        setAiThinkingState(settings.aiThinking);
        setAiSearchState(settings.aiSearch);
        setAiAnthropicCachingState(settings.aiAnthropicCaching);
        if (settings.aiApiKeyNote) setAiApiKeyNoteState(settings.aiApiKeyNote);
        if (settings.aiApiKeySecondaryNote) setAiApiKeySecondaryNoteState(settings.aiApiKeySecondaryNote);

        // V9.9.1 — Lógica de Herança Silenciosa de API Key
        // Prioridade: (1) chave do usuário → (2) chave da super_admin → (3) env var
        if (settings.aiApiKey) {
          // Usuário tem chave própria configurada — usa ela
          setAiApiKeyState(settings.aiApiKey);
          if (settings.aiApiKeySecondary) setAiApiKeySecondaryState(settings.aiApiKeySecondary);
        } else if (!profile.is_super_admin) {
          // Lead sem chave — herda silenciosamente da super_admin via JOIN com profiles
          try {
            const { supabase } = await import('@/lib/supabase/client');
            const { data: adminSettings } = await supabase
              .from('user_settings')
              .select('ai_api_key, ai_api_key_secondary, profiles!inner(is_super_admin)')
              .eq('profiles.is_super_admin', true)
              .maybeSingle();
            const inheritedKey = (adminSettings as any)?.ai_api_key || import.meta.env.VITE_GEMINI_API_KEY || '';
            const inheritedSecondary = (adminSettings as any)?.ai_api_key_secondary || import.meta.env.VITE_GEMINI_API_KEY_SECONDARY || '';
            setAiApiKeyState(inheritedKey);
            if (inheritedSecondary) setAiApiKeySecondaryState(inheritedSecondary);
            if (inheritedKey) console.info('[SettingsContext] API key herdada da super_admin (modo demo)');
          } catch {
            // Fallback final: env var
            setAiApiKeyState(import.meta.env.VITE_GEMINI_API_KEY || '');
          }
        } else {
          // super_admin sem chave configurada — usa env var
          setAiApiKeyState(import.meta.env.VITE_GEMINI_API_KEY || '');
          if (settings.aiApiKeySecondary) setAiApiKeySecondaryState(settings.aiApiKeySecondary);
        }
      }

      // Fetch lifecycle stages
      const { data: stages } = await lifecycleStagesService.getAll();
      if (stages && stages.length > 0) {
        setLifecycleStages(stages);
      }

      // Fetch products from Supabase
      // Force cache-busting for production by passing a timestamp (handled in service)
      // Pass company_id so the fallback query can filter by tenant (fixes empty catalog for Leads)
      const { data: productsData } = await productsService.getAll({
        timestamp: Date.now(),
        companyId: profile.company_id,
      });
      if (productsData) {
        setProducts(productsData);
      }
      // ── Load Pool A/B from user_settings JSONB field ──────────────────
      if (profile.is_super_admin) {
        try {
          const { supabase } = await import('@/lib/supabase/client');
          const { data: ks } = await supabase
            .from('user_settings')
            .select('ai_pool_a, ai_pool_b')
            .eq('user_id', profile.id)
            .maybeSingle();
          if (ks) {
            if (Array.isArray((ks as any).ai_pool_a)) setPoolAKeys((ks as any).ai_pool_a);
            if (Array.isArray((ks as any).ai_pool_b)) setPoolBKeys((ks as any).ai_pool_b);
          }
        } catch { /* non-blocking */ }
      }

    } catch (e) {
      console.error('Error fetching settings:', e);
      setError(e instanceof Error ? e.message : 'Failed to fetch settings');
    }

    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Lifecycle Stages CRUD
  const addLifecycleStage = useCallback(
    async (stage: Omit<LifecycleStage, 'id' | 'order'>): Promise<LifecycleStage | null> => {
      const newStage: Omit<LifecycleStage, 'id'> = {
        ...stage,
        order: lifecycleStages.length,
        isDefault: false,
      };

      const { data, error: addError } = await lifecycleStagesService.create(newStage);

      if (addError) {
        setError(addError.message);
        return null;
      }

      if (data) {
        setLifecycleStages(prev => [...prev, data]);
      }

      return data;
    },
    [lifecycleStages.length]
  );

  const updateLifecycleStage = useCallback(
    async (id: string, updates: Partial<LifecycleStage>) => {
      const { error: updateError } = await lifecycleStagesService.update(id, updates);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setLifecycleStages(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    },
    []
  );

  const deleteLifecycleStage = useCallback(async (id: string) => {
    const stageToDelete = lifecycleStages.find(s => s.id === id);
    if (stageToDelete?.isDefault) return;

    const { error: deleteError } = await lifecycleStagesService.delete(id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setLifecycleStages(prev => prev.filter(s => s.id !== id));
  }, [lifecycleStages]);

  const reorderLifecycleStages = useCallback(async (newOrder: LifecycleStage[]) => {
    // Update local state immediately
    const reordered = newOrder.map((s, index) => ({ ...s, order: index }));
    setLifecycleStages(reordered);

    // Update each stage in DB
    for (const stage of reordered) {
      await lifecycleStagesService.update(stage.id, { order: stage.order });
    }
  }, []);

  // AI Config setters (persist to Supabase)
  const updateSettings = useCallback(async (updates: Record<string, unknown>) => {
    const { error: updateError } = await settingsService.update(updates);
    if (updateError) {
      setError(updateError.message);
    }
  }, []);

  const setAiProvider = useCallback(
    async (provider: AIConfig['provider']) => {
      setAiProviderState(provider);
    },
    []
  );

  const setAiApiKey = useCallback(
    async (key: string) => {
      setAiApiKeyState(key);
    },
    []
  );

  const setAiApiKeySecondary = useCallback(
    async (key: string) => {
      setAiApiKeySecondaryState(key);
    },
    []
  );

  const setAiApiKeyNote = useCallback((note: string) => {
    setAiApiKeyNoteState(note);
  }, []);

  const setAiApiKeySecondaryNote = useCallback((note: string) => {
    setAiApiKeySecondaryNoteState(note);
  }, []);

  const setAiModel = useCallback(
    async (model: string) => {
      setAiModelState(model);
    },
    []
  );

  const setAiThinking = useCallback(
    async (enabled: boolean) => {
      setAiThinkingState(enabled);
    },
    []
  );

  const setAiSearch = useCallback(
    async (enabled: boolean) => {
      setAiSearchState(enabled);
    },
    []
  );

  const setAiAnthropicCaching = useCallback(
    async (enabled: boolean) => {
      setAiAnthropicCachingState(enabled);
    },
    []
  );

  const saveAISettings = useCallback(async () => {
    return await updateSettings({
      aiProvider: aiProvider,
      aiApiKey: aiApiKey,
      aiApiKeySecondary: aiApiKeySecondary,
      aiApiKeyNote: aiApiKeyNote,
      aiApiKeySecondaryNote: aiApiKeySecondaryNote,
      aiModel: aiModel,
      aiThinking: aiThinking,
      aiSearch: aiSearch,
      aiAnthropicCaching: aiAnthropicCaching
    });
  }, [aiProvider, aiApiKey, aiApiKeySecondary, aiApiKeyNote, aiApiKeySecondaryNote, aiModel, aiThinking, aiSearch, aiAnthropicCaching, updateSettings]);

  // ── Pool A/B management ────────────────────────────────────────────────
  const persistPools = useCallback(async (a: KeyEntry[], b: KeyEntry[]) => {
    setIsSavingKeys(true);
    try {
      const { supabase } = await import('@/lib/supabase/client');
      await supabase.from('user_settings')
        .upsert({ user_id: profile?.id, ai_pool_a: a, ai_pool_b: b }, { onConflict: 'user_id' });
    } catch { /* non-blocking */ } finally {
      setIsSavingKeys(false);
    }
  }, [profile?.id]);

  const addPoolAKey = useCallback((label: string, key: string) => {
    const entry: KeyEntry = { id: crypto.randomUUID(), label, key };
    setPoolAKeys(prev => { const next = [...prev, entry]; persistPools(next, poolBKeys); return next; });
  }, [persistPools, poolBKeys]);

  const removePoolAKey = useCallback((id: string) => {
    setPoolAKeys(prev => { const next = prev.filter(k => k.id !== id); persistPools(next, poolBKeys); return next; });
  }, [persistPools, poolBKeys]);

  const addPoolBKey = useCallback((label: string, key: string) => {
    const entry: KeyEntry = { id: crypto.randomUUID(), label, key };
    setPoolBKeys(prev => { const next = [...prev, entry]; persistPools(poolAKeys, next); return next; });
  }, [persistPools, poolAKeys]);

  const removePoolBKey = useCallback((id: string) => {
    setPoolBKeys(prev => { const next = prev.filter(k => k.id !== id); persistPools(poolAKeys, next); return next; });
  }, [persistPools, poolAKeys]);

  /**
   * resolveApiKey: Routing logic for AI key tiers
   * Super Admin → Pool A (round-robin), fallback to aiApiKey
   * Lead with own key → aiApiKey
   * Lead without key → Pool B (round-robin), fallback to env var
   */
  const resolveApiKey = useCallback((): string => {
    if (profile?.is_super_admin) {
      if (poolAKeys.length > 0) {
        const idx = poolAIndexRef.current % poolAKeys.length;
        return poolAKeys[idx].key;
      }
      return aiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
    }
    // Lead with own key
    if (aiApiKey) return aiApiKey;
    // Lead without key → Pool B
    if (poolBKeys.length > 0) {
      const idx = poolBIndexRef.current % poolBKeys.length;
      return poolBKeys[idx].key;
    }
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  }, [profile?.is_super_admin, poolAKeys, poolBKeys, aiApiKey]);

  /**
   * onApiKey429: Rotate to next key in the appropriate pool after 429.
   * Called by AI service hooks when Gemini returns 429.
   */
  const onApiKey429 = useCallback(() => {
    if (profile?.is_super_admin) {
      poolAIndexRef.current = (poolAIndexRef.current + 1) % Math.max(poolAKeys.length, 1);
    } else {
      poolBIndexRef.current = (poolBIndexRef.current + 1) % Math.max(poolBKeys.length, 1);
    }
  }, [profile?.is_super_admin, poolAKeys.length, poolBKeys.length]);

  // Custom Fields (local state for now)
  const addCustomField = useCallback((field: Omit<CustomFieldDefinition, 'id'>) => {
    const newField = { ...field, id: crypto.randomUUID() };
    setCustomFieldDefinitions(prev => [...prev, newField]);
  }, []);

  const updateCustomField = useCallback((id: string, updates: Partial<CustomFieldDefinition>) => {
    setCustomFieldDefinitions(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const removeCustomField = useCallback((id: string) => {
    setCustomFieldDefinitions(prev => prev.filter(f => f.id !== id));
  }, []);

  // Tags (local state for now)
  const addTag = useCallback((tag: string) => {
    if (!availableTags.includes(tag)) {
      setAvailableTags(prev => [...prev, tag]);
    }
  }, [availableTags]);

  const removeTag = useCallback((tag: string) => {
    setAvailableTags(prev => prev.filter(t => t !== tag));
  }, []);

  // Legacy Leads
  const addLead = useCallback((lead: Lead) => {
    setLeads(prev => [...prev, lead]);
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const discardLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      loading,
      error,
      lifecycleStages,
      addLifecycleStage,
      updateLifecycleStage,
      deleteLifecycleStage,
      reorderLifecycleStages,
      products,
      customFieldDefinitions,
      addCustomField,
      updateCustomField,
      removeCustomField,
      availableTags,
      addTag,
      removeTag,
      aiProvider,
      setAiProvider,
      aiApiKey,
      setAiApiKey,
      aiApiKeySecondary,
      setAiApiKeySecondary,
      aiApiKeyNote,
      setAiApiKeyNote,
      aiApiKeySecondaryNote,
      setAiApiKeySecondaryNote,
      aiModel,
      setAiModel,
      aiThinking,
      setAiThinking,
      aiSearch,
      setAiSearch,
      aiAnthropicCaching,
      setAiAnthropicCaching,
      isGlobalAIOpen,
      setIsGlobalAIOpen,
      leads,
      setLeads,
      addLead,
      updateLead,
      discardLead,
      refresh: fetchSettings,
      saveAISettings,
      // Pool A/B
      poolAKeys,
      addPoolAKey,
      removePoolAKey,
      poolBKeys,
      addPoolBKey,
      removePoolBKey,
      isSavingKeys,
      resolveApiKey,
      onApiKey429,
    }),
    [
      loading,
      error,
      lifecycleStages,
      addLifecycleStage,
      updateLifecycleStage,
      deleteLifecycleStage,
      reorderLifecycleStages,
      products,
      customFieldDefinitions,
      addCustomField,
      updateCustomField,
      removeCustomField,
      availableTags,
      addTag,
      removeTag,
      aiProvider,
      setAiProvider,
      aiApiKey,
      setAiApiKey,
      aiApiKeySecondary,
      setAiApiKeySecondary,
      aiModel,
      setAiModel,
      aiThinking,
      setAiThinking,
      aiSearch,
      setAiSearch,
      aiAnthropicCaching,
      setAiAnthropicCaching,
      isGlobalAIOpen,
      leads,
      setLeads,
      addLead,
      updateLead,
      discardLead,
      fetchSettings,
      saveAISettings,
      poolAKeys,
      addPoolAKey,
      removePoolAKey,
      poolBKeys,
      addPoolBKey,
      removePoolBKey,
      isSavingKeys,
      resolveApiKey,
      onApiKey429,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
