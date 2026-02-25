<!-- 
SYSTEM HEADER
FILE PURPOSE: The Technical Manual mapping the ecosystem (Hub + CRM + Link d'Água).
UPDATE RULES: 
1. Maintain the "NEXUS PROTOCOL" section as the source of truth for shared backend logic.
2. Distinctly tag features as [CORE-BASE] or [LIDI-CUSTOM].
3. Update this guide when adding new routes or changing RLS policies.
-->

# SaaS Master Guide: Encontro D'água Hub

## SYSTEM NOTE
This document maps the ecosystem (Hub + CRM + Link d'Água context). It covers every route, feature, and boundary, clearly distinguishing between the inherited template foundation and the Founder's custom engineering.

---

## 1. THE FOUNDER'S METHODOLOGY (A MÁQUINA)
The technical architecture follows a strict validation pipeline known as **"The Creation Machine"**:
1.  **Anamnese**: Diagnosis of the problem using the **Diagnostic Agent**.
2.  **PRD**: Technical specification generation via **Thales' PRD Creator**.
3.  **Prototype**: Rapid visual validation (Lovable/AI Studio).
4.  **Nexus Code**: Final implementation by the **Antigravity Agent** (You are here).
5.  **Client Zero (Dogfooding)**: The Hub itself uses the feature before any client does. "Prova d'água".

---

## 2. THE NEXUS PROTOCOL
**Definition**: The set of rules and logic governing the shared Supabase Backend between the CRM Hub and the Link d'Água project.

### Global Admin
- **Super-User**: `lidimfc@gmail.com`
- **Privileges**:
    - Bypass RLS on all tables via `is_super_admin` flag.
    - View metrics across all tenants (CRM clients and Link d'Água users).
    - Access to the "God Mode" dashboard.
- **Implementation**: Checked via `AuthContext.tsx` -> `profile.is_super_admin`.

### Data Isolation (RLS)
- **CRM Data**: Protected by `company_id`. Users only see data belonging to their assigned company.
- **Link d'Água Data**: Protected by `user_id`. Public profiles are accessible via the `link.encontrodagua.com/r/` route (public read, private write).
- **Cross-Contamination Prevention**: Strict RLS policies ensure CRM users cannot query Link d'Água tables unless explicitly authorized.

---

## 3. FEATURE CATALOG & CODE ORIGIN

### A. Authentication & User Management
- **[CORE-BASE] Supabase Auth**: Standard email/password and magic link login.
- **[LIDI-CUSTOM] "Concierge Mode"**: Automated onboarding flow triggered on first login.
- **[LIDI-CUSTOM] Global Admin Role**: Logic to unify access across the dual-ecosystem.

### B. AI Capabilities (The Brain)
- **[LIDI-CUSTOM] Mazô (Customer Success)**: Chat interface for support. Context-aware. Monitors "Rotting Deals".
- **[LIDI-CUSTOM] Jury (Legal)**: **Generation via LLM**. Drafts custom contracts based on input data (not distinct templates). **Context-Aware Chat** allows refining specific clauses in real-time. Jurisdiction Awareness (BR/Intl).
- **[LIDI-CUSTOM] Precy (Finance)**: Pricing strategy, **Multi-currency** (BRL/USD/AUD), and ROI/Margin calculation.
- **[LIDI-CUSTOM] Prompt Lab**: Experiment directly with Gemini 2.0 within the app.

### C. Public Facing (Source: `src/pages/LandingPage.tsx`)
- **[LIDI-CUSTOM] Landing Page**: 
    - "Glassmorphism" UI with river animation.
    - Interactive "Prompt Lab" demo section.
    - "Client Gallery" carousel showcasing real QR Codes.
    - "CRM Simulator" component for lead capture.
- **[LIDI-CUSTOM] Link d'Água Profiles**: The "Linktree-killer" feature.

---

## 4. VISUAL AUDIT: NAVIGATION & MENU

### The Sidebar (Source: `src/components/Layout.tsx`)
*Location: Left vertical menu (Desktop) / Drawer (Mobile)*

| Icon | Label (Key) | Route | Origin | Description |
| :--- | :--- | :--- | :--- | :--- |
| `LayoutDashboard` | Dashboard | `/dashboard` | [CORE-BASE] | Main KPIs (Deals, Revenue, Activities). |
| `KanbanSquare` | Boards | `/boards` | [CORE-BASE] | Drag-and-drop Deal pipeline. |
| `Users` | Contacts | `/contacts` | [CORE-BASE] | Client database. |
| `Inbox` | Inbox | `/inbox` | [CORE-BASE] | Message center (Email/SMS integration). |
| `CalendarCheck` | Activities | `/activities` | [CORE-BASE] | Tasks, Calls, Meetings scheduler. |
| `BarChart3` | Reports | `/reports` | [CORE-BASE] | Analytics visualization. |
| `Sparkles` | AI Hub | `/ai` | [LIDI-CUSTOM] | Central command for Agents (Mazô, Jury, Precy). |
| `Crosshair` | Decisions | `/decisions` | [LIDI-CUSTOM] | Strategic decision helper. |
| `QrCode` | QR Water | `/qrdagua` | [LIDI-CUSTOM] | **Link d'Água** profile generator. |
| `Wand2` | Prompt Lab | `/prompt-lab` | [LIDI-CUSTOM] | Internal prompt engineering playground. |
| `Settings` | Settings | `/settings` | [CORE-BASE] | User profile and system config. |
| `Shield` | Admin | `/admin` | [LIDI-CUSTOM] | **Global Admin** only. Nexus Protocol controls. |
| `Package` | Tech Stack | `/admin/tech-stack` | [LIDI-CUSTOM] | **Global Admin** only. Tool management. |
