-- Phase 1: Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  monthly_price NUMERIC NOT NULL,
  yearly_price NUMERIC,
  max_customers INTEGER NOT NULL,
  max_routers INTEGER NOT NULL,
  max_bandwidth_gb INTEGER,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  trial_days INTEGER DEFAULT 14,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active plans (for registration)
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

-- Only platform owners can manage plans
CREATE POLICY "Platform owners can manage subscription plans"
ON public.subscription_plans FOR ALL
USING (has_role(auth.uid(), 'platform_owner'));

-- Seed subscription plans
INSERT INTO public.subscription_plans (plan_name, display_name, monthly_price, yearly_price, max_customers, max_routers, max_bandwidth_gb, features, trial_days) VALUES
('trial', 'Trial Plan', 0, 0, 10, 5, 50, '["Up to 10 customers", "Up to 5 routers", "50GB bandwidth", "14-day trial period", "Email support"]', 14),
('basic', 'Basic Plan', 29, 290, 100, 10, 500, '["Up to 100 customers", "Up to 10 routers", "500GB bandwidth", "Email support", "Basic analytics"]', 0),
('professional', 'Professional Plan', 99, 990, 1000, 50, 2000, '["Up to 1000 customers", "Up to 50 routers", "2TB bandwidth", "Priority support", "Advanced analytics", "Custom branding"]', 0),
('enterprise', 'Enterprise Plan', 299, 2990, 10000, 100, 10000, '["Up to 10,000 customers", "Up to 100 routers", "10TB bandwidth", "24/7 phone support", "Dedicated account manager", "Custom integrations", "White-label option"]', 0);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.isp_providers(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  transaction_ref TEXT,
  status TEXT DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- ISP providers can view their own transactions
CREATE POLICY "ISP providers can view own transactions"
ON public.payment_transactions FOR SELECT
USING (is_provider_owner(auth.uid(), provider_id));

-- Platform owners can view all transactions
CREATE POLICY "Platform owners can view all transactions"
ON public.payment_transactions FOR SELECT
USING (has_role(auth.uid(), 'platform_owner'));

-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  provider_id UUID REFERENCES public.isp_providers(id),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Platform owners can view all email logs
CREATE POLICY "Platform owners can view all email logs"
ON public.email_logs FOR SELECT
USING (has_role(auth.uid(), 'platform_owner'));

-- ISP providers can view their own email logs
CREATE POLICY "ISP providers can view own email logs"
ON public.email_logs FOR SELECT
USING (user_id = auth.uid());

-- Add new fields to isp_providers table
ALTER TABLE public.isp_providers 
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_phone TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS trial_end_date DATE,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS auto_suspend BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'pending_payment';

-- Create trigger function for automatic payment success handling
CREATE OR REPLACE FUNCTION public.handle_payment_success()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.isp_providers
    SET 
      subscription_status = 'active',
      last_payment_date = NEW.payment_date,
      next_billing_date = CASE 
        WHEN next_billing_date IS NULL THEN (NEW.payment_date + INTERVAL '1 month')::DATE
        ELSE (next_billing_date + INTERVAL '1 month')::DATE
      END,
      payment_status = 'verified',
      registration_status = 'active'
    WHERE id = NEW.provider_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for payment success
DROP TRIGGER IF EXISTS payment_success_trigger ON public.payment_transactions;
CREATE TRIGGER payment_success_trigger
  AFTER INSERT OR UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_payment_success();