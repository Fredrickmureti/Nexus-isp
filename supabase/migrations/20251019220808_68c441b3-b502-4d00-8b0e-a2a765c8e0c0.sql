-- Payment Override System
ALTER TABLE customers 
ADD COLUMN payment_override boolean DEFAULT false,
ADD COLUMN override_reason text,
ADD COLUMN override_until timestamp with time zone,
ADD COLUMN auto_disconnect_enabled boolean DEFAULT true;

-- Enhanced Router Information
ALTER TABLE routers
ADD COLUMN board_name text,
ADD COLUMN architecture text,
ADD COLUMN cpu_count integer,
ADD COLUMN total_memory bigint,
ADD COLUMN disk_size bigint;

-- Router Interfaces Management
CREATE TABLE router_interfaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id uuid REFERENCES routers(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  mac_address text,
  status text DEFAULT 'unknown',
  rx_bytes bigint DEFAULT 0,
  tx_bytes bigint DEFAULT 0,
  rx_packets bigint DEFAULT 0,
  tx_packets bigint DEFAULT 0,
  last_sync timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(router_id, name)
);

ALTER TABLE router_interfaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP providers can view router interfaces"
ON router_interfaces FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM routers
    WHERE routers.id = router_interfaces.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

CREATE POLICY "ISP providers can insert router interfaces"
ON router_interfaces FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM routers
    WHERE routers.id = router_interfaces.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

CREATE POLICY "ISP providers can update router interfaces"
ON router_interfaces FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM routers
    WHERE routers.id = router_interfaces.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- PPPoE Profiles
CREATE TABLE pppoe_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id uuid REFERENCES routers(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  local_address text,
  remote_address text,
  dns_server text,
  service_name text,
  max_sessions integer,
  authentication text DEFAULT 'pap,chap,mschap1,mschap2',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(router_id, name)
);

ALTER TABLE pppoe_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP providers can manage pppoe profiles"
ON pppoe_profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM routers
    WHERE routers.id = pppoe_profiles.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- PPPoE Sessions (Active connections)
CREATE TABLE pppoe_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id uuid REFERENCES routers(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  username text NOT NULL,
  caller_id text,
  address text,
  uptime text,
  encoding text,
  session_id text,
  service text,
  rx_bytes bigint DEFAULT 0,
  tx_bytes bigint DEFAULT 0,
  status text DEFAULT 'active',
  connected_at timestamp with time zone DEFAULT now(),
  last_sync timestamp with time zone DEFAULT now(),
  UNIQUE(router_id, session_id)
);

ALTER TABLE pppoe_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP providers can view pppoe sessions"
ON pppoe_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM routers
    WHERE routers.id = pppoe_sessions.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

CREATE POLICY "ISP providers can insert pppoe sessions"
ON pppoe_sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM routers
    WHERE routers.id = pppoe_sessions.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

CREATE POLICY "ISP providers can update pppoe sessions"
ON pppoe_sessions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM routers
    WHERE routers.id = pppoe_sessions.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- Payment Override Audit Log
CREATE TABLE payment_override_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES isp_providers(id) ON DELETE CASCADE NOT NULL,
  override_status boolean NOT NULL,
  reason text,
  override_until timestamp with time zone,
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE payment_override_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP providers can view override logs"
ON payment_override_log FOR SELECT
USING (is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can insert override logs"
ON payment_override_log FOR INSERT
WITH CHECK (is_provider_owner(auth.uid(), provider_id));

-- Trigger to update router_interfaces updated_at
CREATE TRIGGER update_router_interfaces_updated_at
BEFORE UPDATE ON router_interfaces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update pppoe_profiles updated_at
CREATE TRIGGER update_pppoe_profiles_updated_at
BEFORE UPDATE ON pppoe_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();