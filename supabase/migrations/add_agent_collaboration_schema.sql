-- Add quote_details column to deals table for persisting Precy calculations
ALTER TABLE deals ADD COLUMN IF NOT EXISTS quote_details JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS quote_approved_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS quote_approved_by UUID REFERENCES auth.users(id);

-- Create webhook_logs table for integration panel
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_company ON webhook_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- RLS for webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own company webhook logs" ON webhook_logs;
CREATE POLICY "Users can view own company webhook logs"
  ON webhook_logs FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "System can insert webhook logs" ON webhook_logs;
CREATE POLICY "System can insert webhook logs"
  ON webhook_logs FOR INSERT
  WITH CHECK (true); -- Webhooks come from external systems

-- Add comment
COMMENT ON TABLE webhook_logs IS 'Stores webhook call history for integration debugging';
COMMENT ON COLUMN deals.quote_details IS 'Stores Precy quote calculations (ROI, costs, margins) for agent collaboration';
