---
name: provadagua-standard
description: "Standards for the Provadágua Hub Digital CRM — multi-tenancy, bilingualism, access expiry. Use before any feature work on this project."
risk: low
source: project
date_added: "2026-04-02"
---

# Provadágua Standard — Project-Local Development Skill

## Project Identity

- **Product:** Hub Digital Provadágua (also: NossoCRM / Encontro d'Água SaaS)
- **Stack:** React 18 + Vite · TypeScript · Supabase (PostgreSQL + RLS + Edge Functions) · Vercel
- **Repo:** `c:\PROJETOS\crm-encontro-dagua`
- **Branch:** `main` is production. Never push untested code directly.
- **Super Admin:** `lidimfc@gmail.com` — `is_super_admin = true` in `profiles`

---

## 1. Multi-Tenancy — `company_id` Pattern

### Rule
Every table that stores tenant-scoped data MUST have a `company_id UUID` column.

### Super Admin Bypass
The Super Admin sees ALL data regardless of `company_id`. All RLS policies MUST
include the bypass clause:

```sql
-- Standard RLS policy pattern
CREATE POLICY "tenant_access" ON public.<table>
  FOR ALL USING (
    company_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );
```

### Frontend Enforcement
- Never expose leads from other tenants in client-side queries
- Always pass `company_id` filter unless the auth context confirms `is_super_admin`
- Use the `useAuth()` hook from `@/context/AuthContext` to read current user role

```typescript
// Pattern: tenant-safe query
const { profile } = useAuth();
const query = supabase.from('contacts').select('*');
if (!profile?.is_super_admin) {
  query.eq('company_id', profile?.id);
}
```

---

## 2. Bilingualism — PT-BR / EN

### Rule
All user-facing strings MUST support both PT-BR and EN. English is the demo default.

### Hook Usage
```typescript
import { useLanguage } from '@/context/LanguageContext';

const { t, language } = useLanguage();
// language: 'pt' | 'en'
// t('key') returns localized string
```

### String Convention
- Keys: `camelCase` namespaced by feature — `contacts.addNew`, `showcase.headline`
- Never hardcode PT-only strings in TSX files
- For new pages, add entries to both locale objects in `LanguageContext`

### Language Enforcement in app
`App.tsx` forces `language = 'en'` for the international demo environment.
PT is restored via `localStorage.setItem('app_language', 'pt')` for the PO.

---

## 3. Access Validity — `access_expires_at`

### Column
`profiles.access_expires_at TIMESTAMPTZ DEFAULT NULL`
- `NULL` = permanent access (Super Admin, full clients)
- Set to a future timestamp for trial/demo users (e.g., Amanda)

### Frontend Check
`ProtectedRoute` MUST check this column on every route guard:

```typescript
// In ProtectedRoute.tsx
if (profile.access_expires_at && new Date(profile.access_expires_at) < new Date()) {
  return <Navigate to="/login?reason=expired" replace />;
}
```

### Backend Check (Edge Function)
Any Edge Function receiving authenticated requests MUST validate:

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('access_expires_at, is_super_admin')
  .eq('id', user.id)
  .single();

if (!profile.is_super_admin && profile.access_expires_at) {
  if (new Date(profile.access_expires_at) < new Date()) {
    return new Response('Access expired', { status: 403 });
  }
}
```

---

## 4. RLS Patterns

### Privacy Wall — `is_demo_data`
Demo leads are flagged with `is_demo_data = true` in `contacts`.
Real authenticated leads must NEVER see demo data:

```sql
-- Demo leads visible only to admin/super_admin
CREATE POLICY "demo_data_isolation" ON public.contacts
  FOR SELECT USING (
    is_demo_data = false
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vendedor')
    )
  );
```

### Public Insert (Lead Capture via LP)
The `/showcase` and landing page forms use a service-role webhook to insert leads.
RLS on `contacts` must allow `INSERT` via service role. Never allow unauthenticated
client-side inserts directly.

---

## 5. Migration Conventions

| Prefix | Meaning |
|--------|---------|
| `000–038` | Sequential numbered migrations (run once, in order) |
| `FIX_` | Emergency hotfix — idempotent, safe to re-run |
| `MANUAL_EXECUTION_` | Must be run manually in Supabase SQL Editor |
| `SEED_` | Seed/demo data only — never in production |
| `CLEANUP_` | Policy/index cleanup — idempotent |

**Always wrap in `BEGIN; ... COMMIT;`**
**Always use `IF NOT EXISTS` guards for schema changes**
**Always add `RAISE NOTICE` messages for verification**

---

## 6. Commit Style

```
feat(scope): short imperative description
fix(scope): what was broken and how it's fixed
chore: dependency/config/non-feature change
```

Examples:
```
feat(showcase): unify ShowcasePage as high-ticket pitch LP
feat(god-mode): promote lidimfc to super admin via migration 038
fix(rls): add company_id bypass for super admin on contacts table
```

---

## 7. Environment Keys — What Goes Where

| Key | Location | Bundled in JS? |
|-----|----------|---------------|
| `VITE_SUPABASE_URL` | `.env`, Vercel | YES (public) |
| `VITE_SUPABASE_ANON_KEY` | `.env`, Vercel | YES (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` (local only), Vercel Secrets | NO — server-only |
| `VITE_GEMINI_API_KEY` | `.env`, Vercel | YES (public) |
| `VITE_VAPID_PUBLIC_KEY` | `.env`, Vercel | YES (public) |

**GOLDEN RULE:** Any key with prefix `VITE_` is bundled into the client JS and is
effectively public. Store ONLY non-sensitive config in `VITE_` variables.
Service Role Key must NEVER have the `VITE_` prefix.

---

## 8. Showcase / Pitch LP Rules

The `/showcase` route targets High Ticket health professionals:
- Doctors, Physiotherapists, Psychologists
- Must load without authentication
- Must have bilingual toggle (PT/EN)
- Must show a QA/Security badge section
- Must have a lead capture form that calls the webhook endpoint

---

## 9. When to Use This Skill

Read this skill BEFORE:
- Creating or modifying any database table
- Building any new page or route
- Writing any Edge Function
- Designing any RLS policy
- Committing any environment variable change
