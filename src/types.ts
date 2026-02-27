// ============================================
// CORE ENUMS & CONSTANTS
// ============================================

export const DealStatus = {
    NEW: 'NEW',
    CONTACTED: 'CONTACTED',
    LEAD: 'LEAD',
    QUALIFIED: 'QUALIFIED',
    PROPOSAL: 'PROPOSAL',
    NEGOTIATION: 'NEGOTIATION',
    CLOSED_WON: 'CLOSED_WON',
    CLOSED_LOST: 'CLOSED_LOST',
} as const;

export type DealStatusType = typeof DealStatus[keyof typeof DealStatus];

// Contact Lifecycle Stages
export enum ContactStage {
    LEAD = 'LEAD',
    MQL = 'MQL',
    SQL = 'SQL',
    PROSPECT = 'PROSPECT',
    CUSTOMER = 'CUSTOMER',
    EVANGELIST = 'EVANGELIST',
    CHURNED = 'CHURNED',
}

// ============================================
// USER & OWNER
// ============================================

export interface User {
    name: string;
    avatar: string;
}

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
    role: 'user' | 'admin' | 'super_admin' | 'equipe' | 'cliente' | 'cliente_restrito';
    plan_type?: 'free' | 'monthly' | 'annual';
    status?: 'active' | 'inactive' | 'suspended';
    company_id?: string;
    created_at?: string;
}

// ============================================
// COMPANY
// ============================================

export interface Company {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    createdAt: string;
    updatedAt?: string;
}

// ============================================
// CONTACT
// ============================================

export interface Contact {
    id: string;
    companyId: string;
    name: string;
    email: string;
    phone: string;
    user_id?: string;
    role?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'CHURNED';
    stage: string; // Lifecycle stage ID
    lastPurchaseDate?: string;
    totalValue?: number;
    avatar?: string;
    source?: string;
    notes?: string;
    birthDate?: string;
    lastInteraction?: string;
    createdAt: string;
    updatedAt?: string;
}

// ============================================
// DEAL ITEM
// ============================================

export interface DealItem {
    id: string;
    productId: string;
    productName?: string;
    name?: string; // fallback
    quantity: number;
    unitPrice?: number;
    price?: number; // fallback
    discount?: number;
    total?: number;
}

// ============================================
// DEAL (Core)
// ============================================

export interface Deal {
    id: string;
    title: string;
    companyId: string;
    contactId: string;
    boardId: string;
    value: number;
    items: DealItem[];
    status: string; // Board stage ID
    updatedAt: string;
    createdAt: string;
    probability: number;
    priority: 'low' | 'medium' | 'high';
    owner: User;
    tags: string[];
    customFields: Record<string, unknown>;
    lastStageChangeDate?: string;
    lossReason?: string;
    nextActivity?: {
        type: string;
        date: string;
        isOverdue?: boolean;
    };
    aiSummary?: string;
    closedAt?: string;
}

// ============================================
// DEAL VIEW (Denormalized for UI)
// ============================================

export interface DealView extends Deal {
    companyName: string;
    contactName: string;
    contactEmail: string;
    source?: string;
}

// ============================================
// ACTIVITY
// ============================================

export interface Activity {
    id: string;
    dealId: string;
    dealTitle: string;
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE' | 'STATUS_CHANGE';
    title: string;
    description?: string;
    date: string;
    user: User;
    completed: boolean;
    createdAt?: string;
    completedAt?: string;
}

// ============================================
// BOARD & STAGES
// ============================================

export interface BoardStage {
    id: string;
    label: string;
    color: string;
    order?: number;
    linkedLifecycleStage?: string; // ID of lifecycle stage
}

export interface BoardGoal {
    description: string;
    targetValue?: number | string;
    currentValue?: number | string;
    type?: 'revenue' | 'deals' | 'custom' | 'number' | 'currency' | 'percentage';
    kpi?: string;
}

export interface AgentPersona {
    name: string;
    role: string;
    tone?: string;
    behavior?: string;
}

export interface Board {
    id: string;
    name: string;
    description?: string;
    stages: BoardStage[];
    isDefault: boolean;
    nextBoardId?: string; // For automation
    goal?: BoardGoal;
    agentPersona?: AgentPersona;
    template?: string;
    linkedLifecycleStage?: string;
    entryTrigger?: string;
    automationSuggestions?: string[];
    createdAt: string;
    updatedAt?: string;
}

// Default Board Stages Configuration
export const DEFAULT_BOARD_STAGES: BoardStage[] = [
    { id: 'LEAD', label: 'Lead', color: '#6366f1', order: 0, linkedLifecycleStage: 'LEAD' },
    { id: 'QUALIFIED', label: 'Qualificado', color: '#8b5cf6', order: 1, linkedLifecycleStage: 'MQL' },
    { id: 'PROPOSAL', label: 'Proposta', color: '#ec4899', order: 2, linkedLifecycleStage: 'SQL' },
    { id: 'NEGOTIATION', label: 'Negociação', color: '#f59e0b', order: 3, linkedLifecycleStage: 'PROSPECT' },
    { id: 'CLOSED_WON', label: 'Ganho', color: '#10b981', order: 4, linkedLifecycleStage: 'CUSTOMER' },
    { id: 'CLOSED_LOST', label: 'Perdido', color: '#ef4444', order: 5 },
];

// ============================================
// LIFECYCLE STAGE
// ============================================

export interface LifecycleStage {
    id: string;
    name: string;
    color: string;
    order: number;
    isDefault?: boolean;
}

// ============================================
// PRODUCT
// ============================================

export interface Product {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    price?: number; // fallback for backwards compatibility
    category?: string;
    type?: string; // e.g. 'catalog', 'tech_stack', 'service'
    unit?: string;
    is_active?: boolean;
    sku?: string;
    createdAt: string;
}

// ============================================
// CUSTOM FIELDS
// ============================================

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface CustomFieldDefinition {
    id: string;
    name?: string;
    label?: string;
    key?: string;
    type: CustomFieldType;
    options?: string[]; // For select type
    required?: boolean;
}

// ============================================
// JOURNEY & REGISTRY SYSTEM
// ============================================

export interface JourneyDefinition {
    schemaVersion?: string;
    name: string;
    description?: string;
    icon?: string;
    boards: Array<{
        slug?: string;
        name: string;
        columns: Array<{
            name: string;
            color?: string;
            linkedLifecycleStage?: string;
        }>;
        strategy?: {
            agentPersona?: any;
            goal?: any;
            entryTrigger?: string;
        };
    }>;
    triggers?: Array<{
        event: string;
        action: string;
    }>;
}

export interface RegistryTemplate {
    id: string;
    name: string;
    path: string;
    category?: string;
    version?: string;
    description?: string;
    tags?: string[];
    author?: string;
}

export interface RegistryIndex {
    templates: RegistryTemplate[];
    journeys: RegistryTemplate[];
}

// ============================================
// LEAD (Legacy - Deprecated)
// ============================================

export interface Lead {
    id: string;
    name: string;
    email: string;
    companyName: string;
    role?: string;
    source: string;
    status?: string | 'LEAD' | 'QUALIFIED' | 'CONTACTED' | 'NEW';
    notes?: string;
    createdAt: string;
}
