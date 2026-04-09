# BACKUP_CHECKLIST — Transição para Acer Aspire Go
## Encontro d'Água Hub Digital v4.2

---

## 1. Variáveis de Ambiente Necessárias (.env)

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Google Gemini
VITE_GEMINI_API_KEY=
VITE_GEMINI_API_KEY_SECONDARY=

# N8N / Automação
VITE_N8N_WEBHOOK_URL=

# Push Notifications (opcional)
VITE_VAPID_PUBLIC_KEY=

# Apenas no servidor Vercel — NUNCA commitar
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=

# Feature flags
VITE_ACCESS_KEYWORD=provadagua
VITE_APP_MODE=PRODUCTION
```

> **Obtenha os valores:** Faça login no Supabase → Settings → API.
> As chaves Stripe ficam apenas na Vercel (não são variáveis locais).

---

## 2. Comandos para Rodar do Zero

```bash
# 1. Clonar repositório
git clone https://github.com/lidimoura/encontro-dagua-hub-digital.git
cd encontro-dagua-hub-digital

# 2. Instalar dependências
npm install

# 3. Criar o .env (ver seção acima)
cp .env.example .env
# Edite o .env com os valores reais

# 4. Rodar em dev
npm run dev

# 5. Build de produção (para validar)
npm run build

# 6. (Opcional) Supabase CLI para migrations
npx supabase db push
```

---

## 3. Branches e Deploy

| Branch | URL | Propósito |
|---|---|---|
| `main` | hub.encontrodagua.com | CRM produção |
| `provadagua` | prova.encontrodagua.com | Trial 7 dias |

Vercel detecta automaticamente o push e faz o deploy.

---

## 4. Extensões VS Code Recomendadas

```
denoland.vscode-deno     ← OBRIGATÓRIA para as Edge Functions
dbaeumer.vscode-eslint
esbenp.prettier-vscode
bradlc.vscode-tailwindcss
```

---

## 5. Checklist de Verificação Pós-Clone

- [ ] `.env` criado com todas as variáveis (seção 1)
- [ ] `npm install` executado sem erros
- [ ] `npm run dev` sobe na porta 5173 sem erros de compilação
- [ ] Login funciona com a palavra-chave `provadagua`
- [ ] Extensão Deno instalada no VS Code (sem erros em `supabase/functions/`)
- [ ] Supabase: column `access_expires_at` existe em `profiles` (migration 038)
- [ ] Vercel: variáveis `SUPABASE_SERVICE_ROLE_KEY` e `GEMINI_API_KEY` configuradas
- [ ] Branch `provadagua` configurada no Vercel → `prova.encontrodagua.com`

---

## 6. Correções Deno/IDE (já commitadas ✅)

| Arquivo | Status | Commit |
|---|---|---|
| `.vscode/settings.json` | ✅ Commitado | `8c3bfe2` |
| `supabase/functions/deno.json` | ✅ Commitado | `8c3bfe2` |
| `qr-redirect/index.ts` — error cast | ✅ Commitado | `8c3bfe2` |

---

## 7. Contexto Amazô (SDR)
- Arquivo: `.gemini/antigravity/brain/.../contexto_amazo_v42.md`
- Cole o conteúdo diretamente no Typebot / treinamento da Amazô

---

*Gerado em: 2026-04-09 | Transição Hardware | Encontro d'Água Hub v4.2*
