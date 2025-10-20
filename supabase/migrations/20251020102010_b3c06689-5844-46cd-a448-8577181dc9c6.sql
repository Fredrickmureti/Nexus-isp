-- Critical ISP Features: PPPoE Secrets, NAT Rules, Router IPs, Hotspot, DNS

-- 1. PPPoE Secrets (CRITICAL - User credentials for authentication)
CREATE TABLE IF NOT EXISTS public.pppoe_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- username
  password TEXT NOT NULL,
  service TEXT DEFAULT 'any',
  profile TEXT DEFAULT 'default',
  local_address TEXT, -- IP for router side
  remote_address TEXT, -- IP for client side
  routes TEXT, -- Static routes
  comment TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(router_id, name)
);

-- 2. NAT Rules (CRITICAL - Internet sharing)
CREATE TABLE IF NOT EXISTS public.nat_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  chain TEXT NOT NULL DEFAULT 'srcnat', -- srcnat, dstnat
  action TEXT NOT NULL DEFAULT 'masquerade', -- masquerade, dst-nat, src-nat
  src_address TEXT,
  dst_address TEXT,
  protocol TEXT,
  src_port VARCHAR,
  dst_port VARCHAR,
  to_addresses TEXT, -- For dst-nat
  to_ports VARCHAR, -- For dst-nat
  out_interface TEXT,
  in_interface TEXT,
  comment TEXT,
  position INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Router IP Addresses (Interface IPs)
CREATE TABLE IF NOT EXISTS public.router_ip_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  interface TEXT NOT NULL,
  address TEXT NOT NULL, -- IP/CIDR format (e.g., 192.168.1.1/24)
  network TEXT, -- Network address
  comment TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(router_id, interface, address)
);

-- 4. Hotspot Servers (Captive Portal)
CREATE TABLE IF NOT EXISTS public.hotspot_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  interface TEXT NOT NULL,
  address_pool TEXT,
  profile TEXT DEFAULT 'default',
  idle_timeout TEXT DEFAULT '5m',
  keepalive_timeout TEXT DEFAULT '2m',
  login_timeout TEXT DEFAULT '30s',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(router_id, name)
);

-- 5. Hotspot Users (Vouchers/Credentials)
CREATE TABLE IF NOT EXISTS public.hotspot_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- username
  password TEXT NOT NULL,
  profile TEXT DEFAULT 'default',
  limit_uptime TEXT, -- e.g., '1h', '1d'
  limit_bytes_in BIGINT,
  limit_bytes_out BIGINT,
  comment TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(router_id, name)
);

-- 6. DNS Configuration
CREATE TABLE IF NOT EXISTS public.dns_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  servers TEXT[], -- Array of DNS server IPs
  allow_remote_requests BOOLEAN DEFAULT false,
  cache_size INTEGER DEFAULT 2048,
  cache_max_ttl TEXT DEFAULT '1d',
  use_doh_server TEXT, -- DNS over HTTPS
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(router_id)
);

-- 7. Static DNS Records
CREATE TABLE IF NOT EXISTS public.dns_static_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'A', -- A, AAAA, CNAME, MX, etc.
  address TEXT,
  ttl TEXT DEFAULT '1d',
  comment TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(router_id, name, type)
);

-- 8. Bridge Interfaces
CREATE TABLE IF NOT EXISTS public.bridge_interfaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mtu INTEGER DEFAULT 1500,
  arp TEXT DEFAULT 'enabled',
  protocol_mode TEXT DEFAULT 'rstp',
  comment TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(router_id, name)
);

-- 9. Bridge Ports (interfaces assigned to bridges)
CREATE TABLE IF NOT EXISTS public.bridge_ports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  bridge TEXT NOT NULL,
  interface TEXT NOT NULL,
  pvid INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 128,
  comment TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(router_id, bridge, interface)
);

-- 10. Mangle Rules (Packet Marking for advanced QoS)
CREATE TABLE IF NOT EXISTS public.mangle_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  chain TEXT NOT NULL, -- prerouting, postrouting, forward, input, output
  action TEXT NOT NULL, -- mark-connection, mark-packet, mark-routing
  src_address TEXT,
  dst_address TEXT,
  protocol TEXT,
  src_port VARCHAR,
  dst_port VARCHAR,
  in_interface TEXT,
  out_interface TEXT,
  connection_mark TEXT,
  new_connection_mark TEXT,
  new_packet_mark TEXT,
  new_routing_mark TEXT,
  passthrough BOOLEAN DEFAULT true,
  comment TEXT,
  position INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.pppoe_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nat_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.router_ip_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspot_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspot_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_static_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bridge_interfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bridge_ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mangle_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies (ISP providers can manage their routers' configs)
CREATE POLICY "ISP providers can manage pppoe secrets"
  ON public.pppoe_secrets FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = pppoe_secrets.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

CREATE POLICY "ISP providers can manage NAT rules"
  ON public.nat_rules FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = nat_rules.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

CREATE POLICY "ISP providers can manage router IPs"
  ON public.router_ip_addresses FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = router_ip_addresses.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

CREATE POLICY "ISP providers can manage hotspot servers"
  ON public.hotspot_servers FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = hotspot_servers.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

CREATE POLICY "ISP providers can manage hotspot users"
  ON public.hotspot_users FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = hotspot_users.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

CREATE POLICY "ISP providers can manage DNS settings"
  ON public.dns_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = dns_settings.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

CREATE POLICY "ISP providers can manage DNS records"
  ON public.dns_static_records FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = dns_static_records.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

CREATE POLICY "ISP providers can manage bridges"
  ON public.bridge_interfaces FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = bridge_interfaces.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

CREATE POLICY "ISP providers can manage bridge ports"
  ON public.bridge_ports FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = bridge_ports.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

CREATE POLICY "ISP providers can manage mangle rules"
  ON public.mangle_rules FOR ALL
  USING (EXISTS (SELECT 1 FROM public.routers WHERE routers.id = mangle_rules.router_id AND is_provider_owner(auth.uid(), routers.provider_id)));

-- Triggers for updated_at
CREATE TRIGGER update_pppoe_secrets_updated_at BEFORE UPDATE ON public.pppoe_secrets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nat_rules_updated_at BEFORE UPDATE ON public.nat_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_router_ip_addresses_updated_at BEFORE UPDATE ON public.router_ip_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotspot_servers_updated_at BEFORE UPDATE ON public.hotspot_servers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotspot_users_updated_at BEFORE UPDATE ON public.hotspot_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dns_settings_updated_at BEFORE UPDATE ON public.dns_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dns_static_records_updated_at BEFORE UPDATE ON public.dns_static_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bridge_interfaces_updated_at BEFORE UPDATE ON public.bridge_interfaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bridge_ports_updated_at BEFORE UPDATE ON public.bridge_ports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mangle_rules_updated_at BEFORE UPDATE ON public.mangle_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();