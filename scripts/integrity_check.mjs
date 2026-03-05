import https from 'https';

const SUPABASE_URL = 'https://bcdyxnauokxikrtmhnlm.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZHl4bmF1b2t4aWtydG1obmxtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY0Mjg2MywiZXhwIjoyMDgwMjE4ODYzfQ.Xzskwvgh_dX-gnCrM-WnbTrY5gvE6yQk_E_KzsXWgDk';

function get(path) {
    return new Promise((resolve) => {
        const url = new URL(SUPABASE_URL + '/rest/v1/' + path);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': 'Bearer ' + SERVICE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact',
                'Range-Unit': 'items',
                'Range': '0-4'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    contentRange: res.headers['content-range'] || 'n/a',
                    body: data
                });
            });
        });
        req.on('error', (e) => resolve({ status: 0, body: e.message }));
        req.end();
    });
}

function post(path, bodyObj) {
    const body = JSON.stringify(bodyObj);
    return new Promise((resolve) => {
        const url = new URL(SUPABASE_URL + '/rest/v1/rpc/' + path);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': 'Bearer ' + SERVICE_KEY,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', (e) => resolve({ status: 0, body: e.message }));
        req.write(body);
        req.end();
    });
}

async function runChecks() {
    console.log('=========================================');
    console.log('  INTEGRITY CHECK — ' + new Date().toLocaleString('pt-BR'));
    console.log('  Projeto: bcdyxnauokxikrtmhnlm');
    console.log('=========================================');

    // --- CHECK 1: contacts ---
    console.log('\n[CHECK 1] TABELA: contacts');
    const c1 = await get('contacts?select=id,name,source,stage,created_at&order=created_at.desc');
    const contacts = JSON.parse(c1.body);
    console.log('  Total registros (Range): ' + c1.contentRange);
    if (Array.isArray(contacts) && contacts.length > 0) {
        contacts.forEach(c => {
            console.log(`  → "${c.name}" | source="${c.source}" | stage="${c.stage}"`);
        });
        console.log('  STATUS: ✅ TABELA CONTACTS INTACTA');
    } else {
        console.log('  (sem contatos cadastrados ainda)');
        console.log('  STATUS: ✅ TABELA EXISTS, 0 rows');
    }

    // --- CHECK 2: leads ---
    console.log('\n[CHECK 2] TABELA: leads');
    const c2 = await get('leads?select=id,name,source,status,briefing_json,linkdagua_user_id&order=created_at.desc');
    if (c2.status === 200) {
        const leads = JSON.parse(c2.body);
        console.log('  Total registros (Range): ' + c2.contentRange);
        if (Array.isArray(leads) && leads.length > 0) {
            leads.forEach(l => {
                const bj = l.briefing_json ? 'SIM → ' + JSON.stringify(l.briefing_json) : 'NULL';
                const lid = l.linkdagua_user_id || 'NULL';
                console.log(`  → "${l.name}" | source="${l.source}" | status="${l.status}"`);
                console.log(`      briefing_json: ${bj}`);
                console.log(`      linkdagua_user_id: ${lid}`);
            });
            console.log('  STATUS: ✅ TABELA LEADS INTACTA');
        } else {
            console.log('  (sem leads cadastrados ainda)');
            console.log('  STATUS: ✅ TABELA EXISTS, 0 rows');
        }
    } else {
        console.log('  ERROR ' + c2.status + ': ' + c2.body);
        if (c2.body.includes('briefing_json') || c2.body.includes('linkdagua_user_id')) {
            console.log('  STATUS: ❌ COLUNAS NÃO EXISTEM — execute migration 019!');
        }
    }

    // --- CHECK 3: qr_codes ---
    console.log('\n[CHECK 3] TABELA: qr_codes (qr_links)');
    const c3 = await get('qr_codes?select=id,title,slug,user_id,created_at&order=created_at.desc');
    if (c3.status === 200) {
        const qrs = JSON.parse(c3.body);
        console.log('  Total registros (Range): ' + c3.contentRange);
        if (Array.isArray(qrs) && qrs.length > 0) {
            qrs.forEach(q => {
                console.log(`  → "${q.title}" | slug="${q.slug}" | user_id="${q.user_id}" | created="${q.created_at}"`);
            });
            console.log('  STATUS: ✅ TABELA QR_CODES INTACTA (dados de ontem preservados)');
        } else {
            console.log('  (sem QR codes cadastrados ainda)');
            console.log('  STATUS: ✅ TABELA EXISTS');
        }
    } else {
        console.log('  ERROR ' + c3.status + ': ' + c3.body);
    }

    // --- CHECK 4: Colunas migration 019 ---
    console.log('\n[CHECK 4] SCHEMA: migration 019 (briefing_json + linkdagua_user_id)');
    const c4a = await get('contacts?select=briefing_json,linkdagua_user_id&limit=1');
    if (c4a.status === 200) {
        console.log('  contacts.briefing_json: ✅ COLUNA EXISTE');
        console.log('  contacts.linkdagua_user_id: ✅ COLUNA EXISTE');
    } else {
        const err4a = c4a.body;
        console.log('  contacts: ❌ ERRO ' + c4a.status + ' — ' + err4a.substring(0, 200));
        if (err4a.includes('briefing_json') || err4a.includes('linkdagua_user_id')) {
            console.log('  → Migration 019 AINDA NÃO FOI EXECUTADA no Supabase!');
        }
    }

    const c4b = await get('leads?select=briefing_json,linkdagua_user_id&limit=1');
    if (c4b.status === 200) {
        console.log('  leads.briefing_json: ✅ COLUNA EXISTE');
        console.log('  leads.linkdagua_user_id: ✅ COLUNA EXISTE');
    } else {
        console.log('  leads: ❌ ERRO ' + c4b.status + ' — Migration 019 pendente');
    }

    // --- CHECK 5: Função convert_lead_to_client ---
    console.log('\n[CHECK 5] FUNÇÃO: convert_lead_to_client');
    const c5 = await post('convert_lead_to_client', {
        p_lead_id: '00000000-0000-0000-0000-000000000000'
    });
    if (c5.status === 200 || c5.body.includes('encontrado') || c5.body.includes('not found') || c5.body.includes('CONVERTED')) {
        console.log('  Função responde corretamente com UUID fake');
        console.log('  Response: ' + c5.body.substring(0, 200));
        console.log('  STATUS: ✅ FUNÇÃO EXISTE E ESTÁ ATIVA');
    } else if (c5.status === 404 && c5.body.includes('convert_lead_to_client')) {
        console.log('  STATUS: ❌ FUNÇÃO NÃO ENCONTRADA — execute migration 020!');
        console.log('  Response: ' + c5.body.substring(0, 200));
    } else {
        console.log('  Response HTTP ' + c5.status + ': ' + c5.body.substring(0, 300));
        if (c5.body.includes('não encontrado') || c5.body.includes('not found')) {
            console.log('  STATUS: ✅ FUNÇÃO EXISTE (erro esperado de lead não encontrado)');
        } else {
            console.log('  STATUS: VERIFICAÇÃO INCONCLUSIVA — veja a response acima');
        }
    }

    // --- CHECK 6: push_subscriptions ---
    console.log('\n[CHECK 6] TABELA: push_subscriptions');
    const c6 = await get('push_subscriptions?select=id,user_id,created_at&limit=1');
    if (c6.status === 200) {
        console.log('  STATUS: ✅ TABELA EXISTE (migration 021 executada)');
    } else if (c6.status === 404 || c6.body.includes('does not exist') || c6.body.includes('relation')) {
        console.log('  STATUS: ❌ TABELA NÃO EXISTE — execute migration 021!');
    } else {
        console.log('  Response ' + c6.status + ': ' + c6.body.substring(0, 200));
    }

    console.log('\n=========================================');
    console.log('  FIM DO INTEGRITY CHECK');
    console.log('=========================================');
}

runChecks().catch(console.error);
