-- ════════════════════════════════════════════════════════════════
-- Migration 031: Add method to webhook_endpoints
-- Date: 2026-03-14
-- Purpose: allow users to pick between GET and POST for webhooks
-- ════════════════════════════════════════════════════════════════

ALTER TABLE webhook_endpoints
ADD COLUMN IF NOT EXISTS method TEXT NOT NULL DEFAULT 'POST' CHECK (method IN ('GET', 'POST'));

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

SELECT 'Migration 031 applied: webhook_endpoints method column added' AS result;
