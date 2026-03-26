-- Payments and Membership Schema for Taichi Nerves Academy

-- Extend the profiles table with payment-related fields
ALTER TABLE profiles 
ADD COLUMN phone TEXT,
ADD COLUMN membership_status TEXT DEFAULT 'free' CHECK (membership_status IN ('free', 'premium', 'expired', 'inactive')),
ADD COLUMN membership_plan TEXT,
ADD COLUMN membership_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN membership_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_method TEXT,
ADD COLUMN last_payment_at TIMESTAMP WITH TIME ZONE;

-- Create payments table for transaction history
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'paypal', 'card')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    plan_duration TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create subscriptions table for recurring billing
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_method TEXT NOT NULL,
    external_subscription_id TEXT, -- For PayPal/Stripe subscription IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Function to update membership status
CREATE OR REPLACE FUNCTION update_membership_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's membership status when payment is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE profiles SET
            membership_status = 'premium',
            membership_plan = NEW.plan_id,
            membership_started_at = COALESCE(membership_started_at, NEW.completed_at),
            membership_expires_at = CASE 
                WHEN NEW.plan_id = '12m' THEN NEW.completed_at + INTERVAL '1 year'
                WHEN NEW.plan_id = '6m' THEN NEW.completed_at + INTERVAL '6 months'
                WHEN NEW.plan_id = '3m' THEN NEW.completed_at + INTERVAL '3 months'
                ELSE NEW.completed_at + INTERVAL '1 month'
            END,
            payment_method = NEW.payment_method,
            last_payment_at = NEW.completed_at
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update membership status
CREATE TRIGGER trigger_update_membership_status
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_membership_status();

-- Function to check and expire memberships
CREATE OR REPLACE FUNCTION expire_memberships()
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET membership_status = 'expired'
    WHERE membership_status = 'premium' 
    AND membership_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can insert payments
CREATE POLICY "Users can insert payments" ON payments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can insert subscriptions
CREATE POLICY "Users can insert subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Sample data for testing
INSERT INTO profiles (id, email, name, membership_status) VALUES
('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 'free')
ON CONFLICT (id) DO NOTHING;

-- Create a view for user membership summary
CREATE OR REPLACE VIEW user_membership_summary AS
SELECT 
    p.id as user_id,
    p.email,
    p.name,
    p.membership_status,
    p.membership_plan,
    p.membership_started_at,
    p.membership_expires_at,
    p.payment_method,
    p.last_payment_at,
    CASE 
        WHEN p.membership_expires_at < NOW() THEN 'expired'
        WHEN p.membership_status = 'premium' THEN 'active'
        ELSE p.membership_status
    END as current_status,
    -- Get latest payment info
    (SELECT json_agg(
        json_build_object(
            'transaction_id', transaction_id,
            'amount', amount,
            'payment_method', payment_method,
            'status', status,
            'completed_at', completed_at,
            'plan_name', plan_name
        )
    ) FROM payments WHERE user_id = p.id AND status = 'completed' ORDER BY completed_at DESC LIMIT 3) as recent_payments
FROM profiles p;

-- Comments for documentation
COMMENT ON TABLE payments IS 'Stores all payment transactions including M-Pesa, PayPal, and card payments';
COMMENT ON TABLE subscriptions IS 'Manages recurring subscription information';
COMMENT ON COLUMN payments.transaction_id IS 'Unique identifier from payment provider (M-Pesa, PayPal, etc.)';
COMMENT ON COLUMN payments.metadata IS 'Additional data from payment provider in JSON format';
COMMENT ON COLUMN subscriptions.external_subscription_id IS 'Subscription ID from external provider (PayPal/Stripe)';
