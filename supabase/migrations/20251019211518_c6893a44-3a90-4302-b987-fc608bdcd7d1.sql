-- Change ip_address column from inet to text to support both IP addresses and hostnames
ALTER TABLE public.routers 
ALTER COLUMN ip_address TYPE text USING ip_address::text;

COMMENT ON COLUMN public.routers.ip_address IS 'IP address or hostname (e.g., ngrok URL) of the router';