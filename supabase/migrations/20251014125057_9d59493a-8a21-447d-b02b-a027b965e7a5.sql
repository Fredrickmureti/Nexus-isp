-- Sprint 1: Foundation - Database Schema Updates

-- 1. Add onboarding tracking to isp_providers
ALTER TABLE isp_providers 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- 2. Enhance routers table for secure credentials and connection testing
ALTER TABLE routers 
ADD COLUMN IF NOT EXISTS credentials_vault_id TEXT,
ADD COLUMN IF NOT EXISTS connection_test_status TEXT DEFAULT 'untested',
ADD COLUMN IF NOT EXISTS last_test_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS api_endpoint TEXT DEFAULT '/rest',
ADD COLUMN IF NOT EXISTS router_os_version TEXT;

-- 3. Add customer-router assignment
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS assigned_router_id UUID REFERENCES routers(id) ON DELETE SET NULL;

-- 4. Create router capabilities tracking table
CREATE TABLE IF NOT EXISTS router_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID REFERENCES routers(id) ON DELETE CASCADE NOT NULL,
  capability TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(router_id, capability)
);

-- Enable RLS on router_capabilities
ALTER TABLE router_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS policy: ISP providers can view capabilities for their routers
CREATE POLICY "ISP providers can view router capabilities"
ON router_capabilities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM routers 
    WHERE routers.id = router_capabilities.router_id 
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- RLS policy: ISP providers can insert capabilities for their routers
CREATE POLICY "ISP providers can insert router capabilities"
ON router_capabilities
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM routers 
    WHERE routers.id = router_capabilities.router_id 
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- 5. Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES isp_providers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_on_payment BOOLEAN DEFAULT true,
  email_on_customer_signup BOOLEAN DEFAULT true,
  email_on_router_offline BOOLEAN DEFAULT true,
  sms_on_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policy: ISP providers can manage their own notification preferences
CREATE POLICY "ISP providers can view own notification preferences"
ON notification_preferences
FOR SELECT
USING (is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can insert own notification preferences"
ON notification_preferences
FOR INSERT
WITH CHECK (is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can update own notification preferences"
ON notification_preferences
FOR UPDATE
USING (is_provider_owner(auth.uid(), provider_id));

-- 6. Add trigger for notification_preferences updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();