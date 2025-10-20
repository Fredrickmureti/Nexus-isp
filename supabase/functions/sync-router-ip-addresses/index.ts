import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { routerId } = await req.json();
    console.log(`Syncing router IP addresses for router: ${routerId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: router, error: routerError } = await supabase
      .from('routers')
      .select('*')
      .eq('id', routerId)
      .single();

    if (routerError || !router) {
      throw new Error('Router not found');
    }

    const apiUrl = `${router.ip_address}${router.api_endpoint || '/rest'}/ip/address`;
    const auth = btoa(`${router.username}:${router.password}`);

    console.log(`Fetching IP addresses from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`MikroTik API error: ${response.status}`);
    }

    const addresses = await response.json();
    console.log(`Found ${addresses.length} IP addresses`);

    for (const addr of addresses) {
      const addrData = {
        router_id: routerId,
        interface: addr.interface,
        address: addr.address,
        network: addr.network || null,
        comment: addr.comment || null,
        enabled: addr.disabled !== 'true' && addr.disabled !== true,
      };

      await supabase
        .from('router_ip_addresses')
        .upsert(addrData, {
          onConflict: 'router_id,interface,address',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: addresses.length,
        message: `Synced ${addresses.length} IP addresses`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing IP addresses:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
