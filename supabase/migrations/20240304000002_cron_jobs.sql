-- Scheduled jobs for payment and membership management

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule membership expiration job to run every hour
SELECT cron.schedule(
  'expire-memberships',
  '0 * * * *', -- every hour at minute 0
  $$
    UPDATE memberships
    SET status = 'expired', updated_at = now()
    WHERE status = 'active' AND expires_at < now();
  $$
);

-- Schedule payment cleanup job to run daily at 2 AM
-- Remove old pending transactions (older than 24 hours)
SELECT cron.schedule(
  'cleanup-pending-transactions',
  '0 2 * * *', -- daily at 2 AM
  $$
    UPDATE payment_transactions
    SET status = 'failed', updated_at = now()
    WHERE status = 'pending' 
    AND created_at < now() - interval '24 hours';
  $$
);

-- Schedule webhook log cleanup job to run weekly on Sunday at 3 AM
-- Remove processed webhook logs older than 30 days
SELECT cron.schedule(
  'cleanup-webhook-logs',
  '0 3 * * 0', -- weekly on Sunday at 3 AM
  $$
    DELETE FROM payment_webhooks_log
    WHERE processed = true 
    AND created_at < now() - interval '30 days';
  $$
);

-- Schedule payment analytics update job to run daily at 1 AM
-- Update payment statistics for reporting
SELECT cron.schedule(
  'update-payment-analytics',
  '0 1 * * *', -- daily at 1 AM
  $$
    -- This could be used to update analytics tables
    -- For now, just log that the job ran
    INSERT INTO payment_webhooks_log (provider, event_type, payload, verified, processed)
    VALUES ('system', 'analytics_update', '{"job": "update-payment-analytics", "timestamp": "' || now() || '"}', true, true)
    ON CONFLICT DO NOTHING;
  $$
);

-- View to monitor scheduled jobs
CREATE OR REPLACE VIEW scheduled_jobs_status AS
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job;

-- Comments for documentation
COMMENT ON EXTENSION pg_cron IS 'PostgreSQL extension for cron-based job scheduling';
COMMENT ON VIEW scheduled_jobs_status IS 'Monitor status of all scheduled cron jobs';
