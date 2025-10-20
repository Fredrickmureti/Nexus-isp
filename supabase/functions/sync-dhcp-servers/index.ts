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
    console.log(`Syncing DHCP servers for router: ${routerId}`);

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

    const apiUrl = `${router.ip_address}${router.api_endpoint || '/rest'}/ip/dhcp-server`;
    const auth = btoa(`${router.username}:${router.password}`);

    console.log(`Fetching DHCP servers from: ${apiUrl}`);

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

    const servers = await response.json();
    console.log(`Found ${servers.length} DHCP servers`);

    for (const server of servers) {
      const serverData = {
        router_id: routerId,
        name: server.name,
        interface: server.interface,
        address_pool: server['address-pool'] || server.addressPool || '',
        lease_time: server['lease-time'] || server.leaseTime || '24h',
        enabled: server.disabled !== 'true' && server.disabled !== true,
      };

      await supabase
        .from('dhcp_servers')
        .upsert(serverData, {
          onConflict: 'router_id,name',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: servers.length,
        message: `Synced ${servers.length} DHCP servers`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing DHCP servers:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});