-- Add DELETE RLS policy for platform owners on isp_providers table
CREATE POLICY "Platform owners can delete providers"
ON public.isp_providers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'platform_owner'));
