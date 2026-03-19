/**
 * appConfig.ts — Configuração de contexto por branch
 *
 * main (hub.encontrodagua.com):
 *   - IS_DEMO = false
 *   - APP_TITLE = "Hub Encontro d'água"
 *   - DEFAULT_LANG = 'pt'
 *   - Dados: acesso total a todos os leads
 *
 * provadagua (prova.encontrodagua.com):
 *   - IS_DEMO = true
 *   - APP_TITLE = "Prova d'água Hub"
 *   - DEFAULT_LANG = 'en'
 *   - Dados: filtro de privacidade estrito (apenas leads test/QA/Lilas/Gamer pc/00000)
 *
 * Detecção via hostname (sem necessidade de variáveis de build extras).
 */

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

export const IS_DEMO = hostname.includes('prova.encontrodagua.com');

export const APP_TITLE = IS_DEMO ? "Prova d'água Hub" : "Hub Encontro d'água";

export const DEFAULT_LANG: 'pt' | 'en' = IS_DEMO ? 'en' : 'pt';

/**
 * Critérios ESTRITOS permitidos na branch provadagua.
 * Qualquer contato/deal que NÃO satisfaça pelo menos um critério será ocultado.
 *
 * Email exato:     lidi@teste.com
 * Telefone exato:  0000000000
 * Tags permitidas: test | QA | Gamer pc | Lilas | amazo-sdr
 */
export const DEMO_ALLOWED_EMAILS   = ['lidi@teste.com'];
export const DEMO_ALLOWED_PHONES   = ['0000000000'];
export const DEMO_ALLOWED_TAGS     = ['test', 'QA', 'Gamer pc', 'Lilas', 'amazo-sdr', '🤖 sdr'];

/**
 * Retorna true se um contato deve ser exibido na branch provadagua.
 * Na main, sempre retorna true (sem filtro).
 */
export function isDemoVisible(contact: {
    tags?: string[] | null;
    email?: string | null;
    phone?: string | null;
}): boolean {
    if (!IS_DEMO) return true;

    const tags  = contact.tags  || [];
    const email = (contact.email || '').toLowerCase().trim();
    const phone = (contact.phone || '').replace(/\D/g, '').trim();

    const hasAllowedEmail = DEMO_ALLOWED_EMAILS.some(e => email === e.toLowerCase());
    const hasAllowedPhone = DEMO_ALLOWED_PHONES.some(p => phone === p);
    const hasAllowedTag   = tags.some(tag =>
        DEMO_ALLOWED_TAGS.some(allowed => tag.toLowerCase() === allowed.toLowerCase())
    );

    return hasAllowedEmail || hasAllowedPhone || hasAllowedTag;
}
