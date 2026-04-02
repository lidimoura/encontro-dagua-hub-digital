---
name: provadagua-standard
description: "Governance rules for Provadágua multi-tenant CRM: company_id isolation, bilingualism (PT/EN), and access_expires_at enforcement"
risk: critical
source: internal
date_added: "2026-04-01"
---

# Provadágua Standard — Governance Rules

> Rules every agent and developer MUST follow when working on NossoCRM / Encontro d'Água Hub.
> Violating these rules is a P0 incident.

---

## 1. Multi-Tenant Isolation (`company_id`)

- Every table that stores user-owned data MUST have a `company_id` column (UUID, nullable for system records).
- RLS policies MUST filter by `company_id = auth.jwt() ->> 'company_id'` OR `is_super_admin = true`.
- **Cross-company data leaks are a P0 incident** — stop all work, rollback, notify the Super Admin.

### Enforced Tables
| Table | Isolation Column | RLS Active |
|--- |--- |--- |
| `contacts` | `company_id` | ✅ |
| `deals` | `company_id` (via contact FK) | ✅ |
| `activities` | `is_demo_data` | ✅ |
| `profiles` | `company_id` | ✅ |
| `qr_codes` | `is_demo_data` | ✅ |

---

## 2. Lead Isolation

- Leads (contacts) from different sources (Amanda, Médica, demo, SDR) MUST be separated by `company_id` or `is_demo_data` flag.
- `is_demo_data = true` → visible ONLY in Provadágua (`VITE_APP_MODE=DEMO`).
- `is_demo_data = false` → Production Hub only — never exposed in demo.
- Deduplication by email DISTINCT is mandatory on SDR webhook inserts.

### Lead Source Tags
| Tag | Source | Isolation |
|--- |--- |--- |
| `🤖 sdr` | Link d'Água / Typebot | `company_id` filter |
| `demo` | Seed data | `is_demo_data = true` |
| `médica` | Manual / specialty lead | `company_id` filter |

---

## 3. Bilingualism (PT-BR / EN-US)

- All user-facing strings MUST exist in both PT-BR and EN-US.
- Use `const { t } = useTranslation()` from `@/hooks/useTranslation` — never hardcode strings.
- The `/showcase` page MUST render correctly in both languages with a toggle.
- Showcase default language: Portuguese (PT-BR), with English toggle.

### Translation Pattern
```tsx
// ✅ Correct
const { t } = useTranslation();
return <h1>{t('showcase.hero.title')}</h1>;

// ❌ Wrong
return <h1>Bem-vindo ao Hub</h1>;
```

---

## 4. `access_expires_at` — Temporal Access Control

- Temporary leads/users have `access_expires_at` (timestamptz, nullable).
- NULL = permanent access (default for admin/vendedor).
- When set, the user loses access after that timestamp.

### RLS Rule
```sql
-- Deny access to expired users
CREATE POLICY "deny_expired_access" ON contacts
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      access_expires_at IS NULL OR access_expires_at > now()
    )
  );
```

### Admin UI Requirements
- Display `access_expires_at` in Admin → Users table.
- Allow extension via date picker.
- Show badge "⏳ Expira em X dias" on profiles with active expiry.

---

## 5. Super Admin Role

- **`lidimfc@gmail.com`** is the canonical Super Admin (Migration 038).
- Role = `admin`. `is_super_admin = true` in `profiles` table.
- Super Admin bypasses `company_id` RLS for cross-tenant operations.
- Super Admin is the only role that can:
  - Create/delete companies
  - Promote users to admin
  - Access all leads across all company_ids
  - Execute migrations via SQL Editor

### Verification Query
```sql
SELECT email, role, is_super_admin, access_expires_at
FROM profiles
WHERE email = 'lidimfc@gmail.com';
-- Expected: role='admin', is_super_admin=true, access_expires_at=null
```

---

## 6. Security Rules

| Rule | Details |
|--- |--- |
| ❌ Never commit `.env` | `.gitignore` enforces this — verify before every push |
| 🔄 Rotate on exposure | Rotate `SUPABASE_SERVICE_ROLE_KEY` immediately if seen in Git/chat |
| 🔒 Vercel secrets only | Production keys live in Vercel Environment Variables — never in code |
| 🧪 Local keys | `.env` for local dev only — separate from Vercel production keys |
| 🚫 No hardcoded keys | `import.meta.env.VITE_*` always — never inline |

---

## 7. Showcase Page (`/showcase`)

- The `/showcase` route is **public** — no authentication required.
- It renders an independent high-conversion landing page with:
  - QA & Security Report visible
  - Feature status table
  - Bilingual toggle (PT/EN)
  - CTA to request access
- It must NOT redirect to `/hub` or require login.

### Routing Check
```tsx
// In App.tsx — public route, no ProtectedRoute wrapper
<Route path="/showcase" element={<ShowcasePage />} />
```

---

## 8. Execution Checklist (Pre-Commit)

Before every commit, verify:
- [ ] `.env` is NOT staged (`git status` — should not appear)
- [ ] No hardcoded strings in new TSX files
- [ ] `IS_DEMO` guard present in any new service function
- [ ] Migration SQL tested locally before push
- [ ] `DEVLOG.md` updated with the change summary
