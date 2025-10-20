-- Fix foreign key constraints for isp_providers deletion

-- Drop existing foreign key constraints and recreate with proper CASCADE rules

-- 1. email_logs - SET NULL on delete (keep logs for audit)
ALTER TABLE public.email_logs 
  DROP CONSTRAINT IF EXISTS email_logs_provider_id_fkey,
  ADD CONSTRAINT email_logs_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.isp_providers(id) 
    ON DELETE SET NULL;

-- 2. activity_logs - SET NULL on delete (keep logs for audit)
ALTER TABLE public.activity_logs 
  DROP CONSTRAINT IF EXISTS activity_logs_provider_id_fkey,
  ADD CONSTRAINT activity_logs_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.isp_providers(id) 
    ON DELETE SET NULL;

-- 3. payment_transactions - SET NULL on delete (keep transaction history)
ALTER TABLE public.payment_transactions 
  DROP CONSTRAINT IF EXISTS payment_transactions_provider_id_fkey,
  ADD CONSTRAINT payment_transactions_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.isp_providers(id) 
    ON DELETE SET NULL;

-- 4. customers - CASCADE delete (remove customers when provider is deleted)
ALTER TABLE public.customers 
  DROP CONSTRAINT IF EXISTS customers_provider_id_fkey,
  ADD CONSTRAINT customers_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.isp_providers(id) 
    ON DELETE CASCADE;

-- 5. routers - CASCADE delete (remove routers when provider is deleted)
ALTER TABLE public.routers 
  DROP CONSTRAINT IF EXISTS routers_provider_id_fkey,
  ADD CONSTRAINT routers_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.isp_providers(id) 
    ON DELETE CASCADE;

-- 6. service_packages - CASCADE delete (remove packages when provider is deleted)
ALTER TABLE public.service_packages 
  DROP CONSTRAINT IF EXISTS service_packages_provider_id_fkey,
  ADD CONSTRAINT service_packages_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.isp_providers(id) 
    ON DELETE CASCADE;

-- 7. notification_preferences - CASCADE delete (remove preferences when provider is deleted)
ALTER TABLE public.notification_preferences 
  DROP CONSTRAINT IF EXISTS notification_preferences_provider_id_fkey,
  ADD CONSTRAINT notification_preferences_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.isp_providers(id) 
    ON DELETE CASCADE;

-- 8. notifications - SET NULL on delete (keep notification history)
ALTER TABLE public.notifications 
  DROP CONSTRAINT IF EXISTS notifications_provider_id_fkey,
  ADD CONSTRAINT notifications_provider_id_fkey 
    FOREIGN KEY (provider_id) 
    REFERENCES public.isp_providers(id) 
    ON DELETE SET NULL;