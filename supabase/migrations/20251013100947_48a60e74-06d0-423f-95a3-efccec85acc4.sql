-- Create custom enum types
CREATE TYPE public.app_role AS ENUM ('platform_owner', 'isp_provider', 'customer');
CREATE TYPE public.subscription_plan AS ENUM ('trial', 'standard', 'professional', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'suspended', 'cancelled', 'trial');
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'pending', 'disconnected');
CREATE TYPE public.router_status AS ENUM ('online', 'offline', 'warning', 'maintenance');
CREATE TYPE public.api_type AS ENUM ('mikrotik_api', 'ssh', 'snmp', 'rest_api');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'issued', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash', 'mpesa', 'bank_transfer', 'credit_card', 'paypal', 'stripe');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.session_status AS ENUM ('active', 'disconnected');
CREATE TYPE public.notification_type AS ENUM ('payment_reminder', 'package_expiry', 'system_alert', 'promotional');
CREATE TYPE public.send_via AS ENUM ('email', 'sms', 'both');
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed');

-- ============================================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- ============================================================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ============================================================
-- 2. ISP PROVIDER MANAGEMENT
-- ============================================================

CREATE TABLE public.isp_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_email TEXT NOT NULL,
  company_phone TEXT,
  address TEXT,
  subscription_plan subscription_plan NOT NULL DEFAULT 'trial',
  subscription_status subscription_status NOT NULL DEFAULT 'trial',
  subscription_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subscription_end_date DATE,
  monthly_fee DECIMAL(10,2),
  max_customers INTEGER DEFAULT 100,
  max_routers INTEGER DEFAULT 10,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. SERVICE PACKAGES
-- ============================================================

CREATE TABLE public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.isp_providers(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  speed_mbps INTEGER NOT NULL,
  bandwidth_limit_gb INTEGER,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. CUSTOMER MANAGEMENT
-- ============================================================

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.isp_providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  installation_address TEXT,
  account_status account_status NOT NULL DEFAULT 'pending',
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. CUSTOMER SUBSCRIPTIONS
-- ============================================================

CREATE TABLE public.customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.service_packages(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. ROUTER MANAGEMENT
-- ============================================================

CREATE TABLE public.routers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.isp_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT,
  manufacturer TEXT,
  ip_address INET NOT NULL,
  api_port INTEGER,
  username TEXT,
  password TEXT,
  api_type api_type NOT NULL DEFAULT 'mikrotik_api',
  location TEXT,
  status router_status NOT NULL DEFAULT 'offline',
  last_seen TIMESTAMPTZ,
  firmware_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.router_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  cpu_load DECIMAL(5,2),
  memory_usage DECIMAL(5,2),
  uptime_seconds BIGINT,
  active_users INTEGER,
  bandwidth_in_mbps DECIMAL(10,2),
  bandwidth_out_mbps DECIMAL(10,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. BILLING & PAYMENTS
-- ============================================================

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status invoice_status NOT NULL DEFAULT 'draft',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  transaction_id TEXT,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status payment_status NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. NETWORK MONITORING
-- ============================================================

CREATE TABLE public.customer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  ip_address INET,
  mac_address TEXT,
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  data_uploaded_mb DECIMAL(10,2) DEFAULT 0,
  data_downloaded_mb DECIMAL(10,2) DEFAULT 0,
  status session_status NOT NULL DEFAULT 'active',
  disconnect_reason TEXT
);

CREATE TABLE public.bandwidth_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  hour INTEGER CHECK (hour >= 0 AND hour <= 23),
  upload_mb DECIMAL(10,2) DEFAULT 0,
  download_mb DECIMAL(10,2) DEFAULT 0,
  total_mb DECIMAL(10,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. COMMUNICATION & NOTIFICATIONS
-- ============================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.isp_providers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  send_via send_via NOT NULL DEFAULT 'email',
  status notification_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. AUDIT & LOGS
-- ============================================================

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.isp_providers(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_isp_providers_owner_id ON public.isp_providers(owner_id);
CREATE INDEX idx_service_packages_provider_id ON public.service_packages(provider_id);
CREATE INDEX idx_customers_provider_id ON public.customers(provider_id);
CREATE INDEX idx_customer_subscriptions_customer_id ON public.customer_subscriptions(customer_id);
CREATE INDEX idx_routers_provider_id ON public.routers(provider_id);
CREATE INDEX idx_router_stats_router_id ON public.router_stats(router_id);
CREATE INDEX idx_router_stats_recorded_at ON public.router_stats(recorded_at);
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_customer_sessions_customer_id ON public.customer_sessions(customer_id);
CREATE INDEX idx_bandwidth_usage_customer_id ON public.bandwidth_usage(customer_id);
CREATE INDEX idx_bandwidth_usage_date ON public.bandwidth_usage(usage_date);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_provider_id ON public.activity_logs(provider_id);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.isp_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.router_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bandwidth_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function to get user's provider_id
CREATE OR REPLACE FUNCTION public.get_user_provider_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.isp_providers
  WHERE owner_id = _user_id
  LIMIT 1;
$$;

-- Function to check if user is provider owner
CREATE OR REPLACE FUNCTION public.is_provider_owner(_user_id UUID, _provider_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.isp_providers
    WHERE id = _provider_id AND owner_id = _user_id
  );
$$;

-- ============================================================
-- RLS POLICIES - PROFILES
-- ============================================================

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- RLS POLICIES - USER ROLES
-- ============================================================

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Platform owners can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Platform owners can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Platform owners can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Platform owners can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'platform_owner'));

-- ============================================================
-- RLS POLICIES - ISP PROVIDERS
-- ============================================================

CREATE POLICY "Platform owners can view all providers"
  ON public.isp_providers FOR SELECT
  USING (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "ISP providers can view own provider"
  ON public.isp_providers FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Platform owners can insert providers"
  ON public.isp_providers FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "Platform owners can update providers"
  ON public.isp_providers FOR UPDATE
  USING (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "ISP providers can update own provider"
  ON public.isp_providers FOR UPDATE
  USING (owner_id = auth.uid());

-- ============================================================
-- RLS POLICIES - SERVICE PACKAGES
-- ============================================================

CREATE POLICY "ISP providers can view own packages"
  ON public.service_packages FOR SELECT
  USING (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can insert own packages"
  ON public.service_packages FOR INSERT
  WITH CHECK (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can update own packages"
  ON public.service_packages FOR UPDATE
  USING (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can delete own packages"
  ON public.service_packages FOR DELETE
  USING (public.is_provider_owner(auth.uid(), provider_id));

-- ============================================================
-- RLS POLICIES - CUSTOMERS
-- ============================================================

CREATE POLICY "ISP providers can view own customers"
  ON public.customers FOR SELECT
  USING (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "Customers can view own profile"
  ON public.customers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "ISP providers can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can update own customers"
  ON public.customers FOR UPDATE
  USING (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can delete own customers"
  ON public.customers FOR DELETE
  USING (public.is_provider_owner(auth.uid(), provider_id));

-- ============================================================
-- RLS POLICIES - CUSTOMER SUBSCRIPTIONS
-- ============================================================

CREATE POLICY "ISP providers can view subscriptions"
  ON public.customer_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_subscriptions.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

CREATE POLICY "Customers can view own subscriptions"
  ON public.customer_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_subscriptions.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "ISP providers can insert subscriptions"
  ON public.customer_subscriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_subscriptions.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

CREATE POLICY "ISP providers can update subscriptions"
  ON public.customer_subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_subscriptions.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

-- ============================================================
-- RLS POLICIES - ROUTERS
-- ============================================================

CREATE POLICY "ISP providers can view own routers"
  ON public.routers FOR SELECT
  USING (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can insert routers"
  ON public.routers FOR INSERT
  WITH CHECK (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can update own routers"
  ON public.routers FOR UPDATE
  USING (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "ISP providers can delete own routers"
  ON public.routers FOR DELETE
  USING (public.is_provider_owner(auth.uid(), provider_id));

-- ============================================================
-- RLS POLICIES - ROUTER STATS
-- ============================================================

CREATE POLICY "ISP providers can view router stats"
  ON public.router_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.routers
      WHERE routers.id = router_stats.router_id
      AND public.is_provider_owner(auth.uid(), routers.provider_id)
    )
  );

CREATE POLICY "ISP providers can insert router stats"
  ON public.router_stats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routers
      WHERE routers.id = router_stats.router_id
      AND public.is_provider_owner(auth.uid(), routers.provider_id)
    )
  );

-- ============================================================
-- RLS POLICIES - INVOICES
-- ============================================================

CREATE POLICY "ISP providers can view customer invoices"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = invoices.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

CREATE POLICY "Customers can view own invoices"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = invoices.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "ISP providers can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = invoices.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

CREATE POLICY "ISP providers can update invoices"
  ON public.invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = invoices.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

-- ============================================================
-- RLS POLICIES - PAYMENTS
-- ============================================================

CREATE POLICY "ISP providers can view customer payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = payments.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

CREATE POLICY "Customers can view own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = payments.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "ISP providers can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = payments.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

-- ============================================================
-- RLS POLICIES - CUSTOMER SESSIONS & BANDWIDTH
-- ============================================================

CREATE POLICY "ISP providers can view sessions"
  ON public.customer_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_sessions.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

CREATE POLICY "ISP providers can view bandwidth usage"
  ON public.bandwidth_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = bandwidth_usage.customer_id
      AND public.is_provider_owner(auth.uid(), customers.provider_id)
    )
  );

-- ============================================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================================

CREATE POLICY "ISP providers can view own notifications"
  ON public.notifications FOR SELECT
  USING (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "Customers can view own notifications"
  ON public.notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = notifications.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "ISP providers can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_provider_owner(auth.uid(), provider_id));

-- ============================================================
-- RLS POLICIES - ACTIVITY LOGS
-- ============================================================

CREATE POLICY "Platform owners can view all logs"
  ON public.activity_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'platform_owner'));

CREATE POLICY "ISP providers can view own logs"
  ON public.activity_logs FOR SELECT
  USING (public.is_provider_owner(auth.uid(), provider_id));

CREATE POLICY "Users can insert own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_isp_providers_updated_at BEFORE UPDATE ON public.isp_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON public.service_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_subscriptions_updated_at BEFORE UPDATE ON public.customer_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routers_updated_at BEFORE UPDATE ON public.routers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Create trigger for invoice number generation
CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invoice_number();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();