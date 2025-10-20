-- Create ISP provider entry for test user
INSERT INTO public.isp_providers (
  owner_id,
  company_name,
  company_email,
  company_phone,
  address,
  subscription_plan,
  subscription_status,
  monthly_fee,
  max_customers,
  max_routers
)
VALUES (
  '138a4b0f-f88a-449e-8a3c-7f09880c383a',
  'Test ISP Provider',
  'fredrickmureti612@gmail.com',
  '+1234567890',
  '123 Test Street, Test City',
  'professional',
  'active',
  99.99,
  1000,
  50
);