-- Assign platform_owner role to test user
INSERT INTO public.user_roles (user_id, role)
VALUES ('138a4b0f-f88a-449e-8a3c-7f09880c383a', 'platform_owner')
ON CONFLICT (user_id, role) DO NOTHING;