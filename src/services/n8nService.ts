import { supabase } from '@/lib/supabase/client';

/**
 * N8N Webhook Integration Service
 * 
 * Serviço para integração com workflows N8N via webhooks.
 * Permite envio de dados para automações e processamento externo.
 */

// Tipos para as integrações
export interface N8nWebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface PricingData {
  productId?: string;
  quantity?: number;
  customerId?: string;
  metadata?: Record<string, any>;
}

export interface LegalConsultData {
  topic: string;
  description: string;
  urgency?: 'low' | 'medium' | 'high';
  attachments?: string[];
  metadata?: Record<string, any>;
}

/**
 * Função genérica para enviar dados para um webhook N8N
 * 
 * @param webhookUrl - URL completa do webhook N8N
 * @param payload - Dados a serem enviados (qualquer objeto JSON)
 * @returns Promise com a resposta do webhook
 * 
 * @example
 * ```typescript
 * const response = await sendToN8nWebhook(
 *   'https://n8n.example.com/webhook/abc123',
 *   { name: 'João', email: 'joao@example.com' }
 * );
 * ```
 */
export async function sendToN8nWebhook(
  webhookUrl: string,
  payload: any,
  method: 'GET' | 'POST' = 'POST'
): Promise<N8nWebhookResponse> {
  try {
    // Validação básica da URL
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      throw new Error('URL do webhook inválida');
    }

    let fetchUrl = webhookUrl;
    let fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method === 'GET') {
      // Convert payload to query params for GET requests
      const url = new URL(webhookUrl);
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
      fetchUrl = url.toString();
    } else {
      // POST requests send payload in body
      fetchOptions.body = JSON.stringify(payload);
    }

    // Envio para o webhook
    const response = await fetch(fetchUrl, fetchOptions);

    // Verificação do status da resposta
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    // Parse da resposta
    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Erro ao enviar dados para N8N:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Calcula precificação usando workflow N8N
 * 
 * Esta função será implementada para calcular preços baseados em regras
 * complexas de negócio através de um workflow N8N dedicado.
 * 
 * @param data - Dados para cálculo de precificação
 * @returns Promise com o resultado do cálculo
 * 
 * @todo Implementar quando o webhook N8N estiver configurado
 * @todo Definir estrutura exata de resposta esperada
 */
export async function calculatePricing(
  data: PricingData
): Promise<N8nWebhookResponse> {
  // URL do webhook será configurada via variável de ambiente
  const webhookUrl = import.meta.env.VITE_N8N_PRICING_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('URL do webhook de precificação não configurada');
    return {
      success: false,
      error: 'Webhook de precificação não configurado. Configure VITE_N8N_PRICING_WEBHOOK_URL no .env',
    };
  }

  // Preparação do payload com metadados adicionais
  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
    source: 'crm-encontro-dagua',
  };

  return sendToN8nWebhook(webhookUrl, payload);
}

/**
 * Consulta agente jurídico via workflow N8N
 * 
 * Esta função será implementada para enviar consultas jurídicas para
 * processamento por IA ou agentes especializados através do N8N.
 * 
 * @param data - Dados da consulta jurídica
 * @returns Promise com a resposta da consulta
 * 
 * @todo Implementar quando o webhook N8N estiver configurado
 * @todo Adicionar sistema de fila para consultas assíncronas
 * @todo Implementar notificações de resposta
 */
export async function consultLegalAgent(
  data: LegalConsultData
): Promise<N8nWebhookResponse> {
  // URL do webhook será configurada via variável de ambiente
  const webhookUrl = import.meta.env.VITE_N8N_LEGAL_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('URL do webhook de consulta jurídica não configurada');
    return {
      success: false,
      error: 'Webhook de consulta jurídica não configurado. Configure VITE_N8N_LEGAL_WEBHOOK_URL no .env',
    };
  }

  // Preparação do payload com metadados adicionais
  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
    source: 'crm-encontro-dagua',
    urgency: data.urgency || 'medium',
  };

  return sendToN8nWebhook(webhookUrl, payload);
}

/**
 * Utilitário para testar conectividade com webhook N8N
 * 
 * @param webhookUrl - URL do webhook a ser testada
 * @returns Promise com resultado do teste
 */
export async function testWebhookConnection(
  webhookUrl: string,
  method: 'GET' | 'POST' = 'POST'
): Promise<N8nWebhookResponse> {
  const testPayload = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Teste de conectividade do CRM Encontro D\'Água Hub',
  };

  return sendToN8nWebhook(webhookUrl, testPayload, method);
}

/**
 * Dispatch an event to all dynamic webhooks registered in the database
 * 
 * @param eventName O nome do evento configurado (ex: lead.created, deal.won)
 * @param payload Os dados a serem disparados
 * @param companyId O ID da companhia atual (para consultar os webhooks corretos)
 */
export async function dispatchWebhookEvent(
  eventName: string,
  payload: any,
  companyId: string
): Promise<void> {
  try {
    // 1. Fetch active webhooks for this event
    const { data: endpoints, error } = await supabase
      .from('webhook_endpoints')
      .select('id, url, method, events')
      .eq('is_active', true)
      .eq('company_id', companyId);

    if (error || !endpoints || endpoints.length === 0) return;

    // 2. Filter webhooks that listen to this specific event
    const matchedEndpoints = endpoints.filter(ep => ep.events && ep.events.includes(eventName));
    
    // 3. Dispatch to all matched asynchronously
    for (const ep of matchedEndpoints) {
      sendToN8nWebhook(ep.url, { ...payload, event: eventName }, ep.method as 'GET' | 'POST')
        .then(() => {
          // Update last_triggered_at
          supabase
            .from('webhook_endpoints')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', ep.id)
            .then();
        })
        .catch(err => console.warn(`[Webhook Dispatch] Error calling ${ep.url}:`, err));
    }

  } catch (err) {
    console.warn('[Webhook Dispatch] Failed to dispatch event:', err);
  }
}
