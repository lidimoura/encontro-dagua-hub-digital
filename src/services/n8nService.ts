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
  payload: any
): Promise<N8nWebhookResponse> {
  try {
    // Validação básica da URL
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      throw new Error('URL do webhook inválida');
    }

    // Envio do POST para o webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

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
  webhookUrl: string
): Promise<N8nWebhookResponse> {
  const testPayload = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Teste de conectividade do CRM Encontro D\'Água Hub',
  };

  return sendToN8nWebhook(webhookUrl, testPayload);
}
