/**
 * appConfig.ts — Configuração de contexto por branch
 *
 * Controlado pela variável de ambiente VITE_APP_MODE:
 *
 *   VITE_APP_MODE=DEMO       → Inglês, Modo Demo, filtros de privacidade ATIVADOS
 *                               (usado em prova.encontrodagua.com)
 *
 *   VITE_APP_MODE=PRODUCTION → Português, dados reais, TODOS os leads visíveis
 *                               (usado em hub.encontrodagua.com)
 *
 * Fallback: se a variável não estiver definida, usa detecção por hostname.
 */

const appMode = import.meta.env.VITE_APP_MODE as string | undefined;

// Primary: use env var; Secondary: hostname fallback for local dev
const _isDemo = appMode
  ? appMode === 'DEMO'
  : (typeof window !== 'undefined' && window.location.hostname.includes('prova.encontrodagua.com'));

export const IS_DEMO = _isDemo;

export const APP_TITLE = IS_DEMO ? "Prova d'água Hub" : "Hub Encontro d'água";

export const DEFAULT_LANG: 'pt' | 'en' = IS_DEMO ? 'en' : 'pt';

/**
 * Critérios ESTRITOS permitidos no modo DEMO (branch provadagua).
 * Qualquer contato/deal que NÃO satisfaça pelo menos um critério será ocultado.
 *
 * Email:  lidi@teste.com
 * Fone:   0000000000
 * Tags:   test | QA | Gamer pc | Lilas | amazo-sdr | 🤖 sdr
 */
export const DEMO_ALLOWED_EMAILS   = ['lidi@teste.com'];
export const DEMO_ALLOWED_PHONES   = ['0000000000'];
export const DEMO_ALLOWED_TAGS     = ['test', 'QA', 'Gamer pc', 'Lilas', 'amazo-sdr', '🤖 sdr'];

/**
 * Retorna true se um contato deve ser exibido.
 * No modo PRODUCTION, sempre retorna true (sem filtro).
 *
 * Critérios de visibilidade na Demo (modo combinado):
 *   1. is_demo_data === true  (flag de banco — caminho rápido)
 *   2. Email na lista permitida
 *   3. Telefone na lista permitida
 *   4. Ao menos uma tag na lista permitida
 */
export function isDemoVisible(contact: {
    tags?: string[] | null;
    email?: string | null;
    phone?: string | null;
    isDemoData?: boolean | null;
}): boolean {
    if (!IS_DEMO) return true;

    // Fast-path: explicitly flagged as demo data in the DB
    if (contact.isDemoData === true) return true;

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
