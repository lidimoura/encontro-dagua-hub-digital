# DEVLOG — Prova d'Água (provadagua)

> Branch `provadagua` | Demo Environment

---

## 2026-03-23 — Full Isolation Enforcement

All modules now return empty arrays or localStorage-only data in DEMO mode:

- `activitiesService.getAll()` → `[]`
- `productsService.getAll()` → `[]`
- `QRdaguaPage.fetchProjects()` → `[]` (early return)
- `contactsService.getAll()` → DB-level OR filter (only QA contacts)
- `PromptLabPage.fetchSavedPrompts()` → `[]` + localStorage saves
- `PrecyAgent`: BRL price as canonical `price` column
- `useDealsByBoard`: email DISTINCT dedup eliminates webhook-replay duplicates

**Guarantees:**
> A product added in Demo **will never appear in the Hub**.
> Real client contacts **will never leak to this branch**.

---

## 2026-03-22 — IS_DEMO Foundation

- `appConfig.ts`: `IS_DEMO = VITE_APP_MODE === 'DEMO'`
- `DEFAULT_LANG = 'en'` when IS_DEMO
- Vercel env var `VITE_APP_MODE=DEMO` configured for this branch
- Activities isolation, deals isolation (isDemoVisible)
- Contacts hostname-check replaced with IS_DEMO

---

## 2026-03-20 — Branch Created

- `provadagua` branched from `main`
- QA test contacts created: Gamer pc, Lilas, lidi@teste.com
- English UI default enabled
- Greeting changed to "Hi, Amanda!" → Generic "Hi there!"

---

*Sandbox environment — Encontro d'Água | Manager: Antigravity AI*
