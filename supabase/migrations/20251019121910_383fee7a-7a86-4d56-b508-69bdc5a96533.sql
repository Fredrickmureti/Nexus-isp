-- Phase 1: Add customer role and update schema

-- Add customer role to app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'customer') THEN
    ALTER TYPE app_role ADD VALUE 'customer';
  END IF;
END $$;

-- Add activation fields to customers table
ALTER TABLE customers 
  ADD COLUMN IF NOT EXISTS activation_token TEXT,
  ADD COLUMN IF NOT EXISTS activation_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMPTZ;

-- Create customer_portal_settings table
CREATE TABLE IF NOT EXISTS customer_portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  show_usage_stats BOOLEAN DEFAULT true,
  show_connected_devices BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- Enable RLS on customer_portal_settings
ALTER TABLE customer_portal_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Customers can view their own portal settings
CREATE POLICY "Customers can view own portal settings"
ON customer_portal_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_portal_settings.customer_id
    AND customers.user_id = auth.uid()
  )
);

-- RLS Policy: Customers can update their own portal settings
CREATE POLICY "Customers can update own portal settings"
ON customer_portal_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_portal_settings.customer_id
    AND customers.user_id = auth.uid()
  )
);

-- RLS Policy: ISP providers can view their customers' portal settings
CREATE POLICY "ISP providers can view customer portal settings"
ON customer_portal_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_portal_settings.customer_id
    AND is_provider_owner(auth.uid(), customers.provider_id)
  )
);

-- Create trigger for customer_portal_settings updated_at
CREATE TRIGGER update_customer_portal_settings_updated_at
BEFORE UPDATE ON customer_portal_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();