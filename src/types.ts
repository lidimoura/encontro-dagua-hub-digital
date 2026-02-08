// ============================================
// CORE ENUMS & CONSTANTS
// ============================================

export const DealStatus = {
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

// ============================================
// COMPANY
// ============================================

export interface Company {
    id: string;
    name: string;
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
    role: string;
    status: 'ACTIVE' | 'INACTIVE';
    stage: string; // Lifecycle stage ID
    lastPurchaseDate?: string;
    totalValue: number;
    createdAt: string;
    updatedAt?: string;
}

// ============================================
// DEAL ITEM
// ============================================

export interface DealItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
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
    nextActivity?: string;
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
    createdAt: string;
    completedAt?: string;
}

// ============================================
// BOARD & STAGES
// ============================================

export interface BoardStage {
    id: string;
    label: string;
    color: string;
    order: number;
    linkedLifecycleStage?: string; // ID of lifecycle stage
}

export interface BoardGoal {
    description: string;
    targetValue?: number;
    type?: 'revenue' | 'deals' | 'custom';
}

export interface AgentPersona {
    name: string;
    role: string;
    tone: string;
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
    category?: string;
    createdAt: string;
}

// ============================================
// CUSTOM FIELDS
// ============================================

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface CustomFieldDefinition {
    id: string;
    name: string;
    type: CustomFieldType;
    options?: string[]; // For select type
    required: boolean;
}

// ============================================
// JOURNEY & REGISTRY SYSTEM
// ============================================

export interface JourneyDefinition {
    name: string;
    stages: Array<{
        id: string;
        name: string;
        description?: string;
    }>;
    triggers?: Array<{
        event: string;
        action: string;
    }>;
}

export interface RegistryIndex {
    templates: Array<{
        id: string;
        name: string;
        path: string;
        category?: string;
    }>;
    journeys: Array<{
        id: string;
        name: string;
        path: string;
    }>;
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
    createdAt: string;
}
