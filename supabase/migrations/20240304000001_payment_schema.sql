-- Payment and Subscription Management Schema
-- Secure backend for M-Pesa, PayPal, and Card payments

-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan VARCHAR(50) NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'annual')),
  status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('mpesa', 'paypal', 'card')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('mpesa', 'paypal', 'card')),
  provider_transaction_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) DEFAULT 'KES',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider_response JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment_webhooks_log table for audit trail
CREATE TABLE IF NOT EXISTS payment_webhooks_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('mpesa', 'paypal', 'flutterwave', 'stripe')),
  event_type VARCHAR(100),
  payload JSONB NOT NULL,
  verified BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all payment tables
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memberships
CREATE POLICY "Users read own membership" ON memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role only insert membership" ON memberships
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only update membership" ON memberships
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role only delete membership" ON memberships
  FOR DELETE USING (auth.role() = 'service_role');

-- RLS Policies for payment_transactions
CREATE POLICY "Users read own transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages transactions" ON payment_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for payment_webhooks_log (service role only - never exposed to users)
CREATE POLICY "Service role only webhook log" ON payment_webhooks_log
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_expires_at ON memberships(expires_at);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_transaction_id ON payment_transactions(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_log_provider ON payment_webhooks_log(provider);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_log_processed ON payment_webhooks_log(processed);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_log_created_at ON payment_webhooks_log(created_at);

-- Membership activation function (atomic operation)
CREATE OR REPLACE FUNCTION activate_membership(
  p_user_id UUID,
  p_plan VARCHAR,
  p_payment_method VARCHAR,
  p_transaction_id UUID,
  p_days INTEGER
)
RETURNS void AS $$
BEGIN
  -- Insert or update membership atomically
  INSERT INTO memberships (user_id, plan, status, payment_method, started_at, expires_at)
  VALUES (
    p_user_id, p_plan, 'active', p_payment_method,
    now(), now() + (p_days || ' days')::interval
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    status = 'active',
    payment_method = EXCLUDED.payment_method,
    started_at = now(),
    expires_at = EXCLUDED.expires_at,
    updated_at = now();

  -- Update transaction status
  UPDATE payment_transactions
  SET status = 'completed', updated_at = now()
  WHERE id = p_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user membership status (for useAuth context)
CREATE OR REPLACE FUNCTION get_user_membership(p_user_id UUID)
RETURNS TABLE(
  plan VARCHAR,
  status VARCHAR,
  payment_method VARCHAR,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.plan,
    m.status,
    m.payment_method,
    m.started_at,
    m.expires_at,
    (m.status = 'active' AND m.expires_at > now()) as is_active
  FROM memberships m
  WHERE m.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and expire memberships (for cron job)
CREATE OR REPLACE FUNCTION expire_memberships()
RETURNS void AS $$
BEGIN
  UPDATE memberships
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get payment statistics (admin only)
CREATE OR REPLACE FUNCTION get_payment_stats(p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  total_payments BIGINT,
  successful_payments BIGINT,
  failed_payments BIGINT,
  total_revenue DECIMAL(12,2),
  successful_revenue DECIMAL(12,2),
  mpesa_payments BIGINT,
  paypal_payments BIGINT,
  card_payments BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_payments,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_payments,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
    COALESCE(SUM(amount), 0) as total_revenue,
    COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as successful_revenue,
    COUNT(*) FILTER (WHERE payment_method = 'mpesa') as mpesa_payments,
    COUNT(*) FILTER (WHERE payment_method = 'paypal') as paypal_payments,
    COUNT(*) FILTER (WHERE payment_method = 'card') as card_payments
  FROM payment_transactions
  WHERE created_at >= now() - (p_days || ' days')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_memberships_updated_at
    BEFORE UPDATE ON memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE memberships IS 'User subscription and membership information';
COMMENT ON TABLE payment_transactions IS 'All payment transactions across all providers';
COMMENT ON TABLE payment_webhooks_log IS 'Audit log for all payment provider webhooks';
COMMENT ON COLUMN payment_transactions.provider_response IS 'Sanitized response from payment provider - never store sensitive card data';
COMMENT ON COLUMN payment_webhooks_log.payload IS 'Raw webhook payload for audit purposes';
COMMENT ON FUNCTION activate_membership IS 'Atomically activates user membership after successful payment';
COMMENT ON FUNCTION get_user_membership IS 'Returns current membership status for useAuth context';
COMMENT ON FUNCTION expire_memberships IS 'Expires overdue memberships - called by cron job';
