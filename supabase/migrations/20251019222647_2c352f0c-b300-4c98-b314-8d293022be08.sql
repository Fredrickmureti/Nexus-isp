-- Create tables for network configuration management

-- VLANs table
CREATE TABLE IF NOT EXISTS public.vlans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  vlan_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  interface TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(router_id, vlan_id)
);

ALTER TABLE public.vlans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP providers can manage VLANs"
ON public.vlans FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.routers
    WHERE routers.id = vlans.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- DHCP Servers table
CREATE TABLE IF NOT EXISTS public.dhcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  interface TEXT NOT NULL,
  address_pool TEXT NOT NULL,
  lease_time TEXT DEFAULT '24h',
  dns_servers TEXT,
  gateway TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(router_id, name)
);

ALTER TABLE public.dhcp_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP providers can manage DHCP servers"
ON public.dhcp_servers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.routers
    WHERE routers.id = dhcp_servers.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- IP Address Pools table
CREATE TABLE IF NOT EXISTS public.ip_address_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ip_range TEXT NOT NULL,
  gateway TEXT,
  dns_servers TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(router_id, name)
);

ALTER TABLE public.ip_address_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP providers can manage IP pools"
ON public.ip_address_pools FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.routers
    WHERE routers.id = ip_address_pools.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- Firewall Rules table
CREATE TABLE IF NOT EXISTS public.firewall_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  chain TEXT NOT NULL,
  action TEXT NOT NULL,
  protocol TEXT,
  src_address TEXT,
  dst_address TEXT,
  comment TEXT,
  position INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.firewall_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP providers can manage firewall rules"
ON public.firewall_rules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.routers
    WHERE routers.id = firewall_rules.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- Bandwidth Queues table
CREATE TABLE IF NOT EXISTS public.bandwidth_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  max_upload BIGINT NOT NULL,
  max_download BIGINT NOT NULL,
  priority INTEGER DEFAULT 8,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(router_id, name)
);

ALTER TABLE public.bandwidth_queues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP providers can manage bandwidth queues"
ON public.bandwidth_queues FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.routers
    WHERE routers.id = bandwidth_queues.router_id
    AND is_provider_owner(auth.uid(), routers.provider_id)
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_vlans_updated_at
BEFORE UPDATE ON public.vlans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dhcp_servers_updated_at
BEFORE UPDATE ON public.dhcp_servers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ip_pools_updated_at
BEFORE UPDATE ON public.ip_address_pools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_firewall_rules_updated_at
BEFORE UPDATE ON public.firewall_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bandwidth_queues_updated_at
BEFORE UPDATE ON public.bandwidth_queues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();