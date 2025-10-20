import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { routerId } = await req.json();

    // Get router details
    const { data: router, error: routerError } = await supabase
      .from('routers')
      .select('*')
      .eq('id', routerId)
      .single();

    if (routerError) throw routerError;

    const cleanIpAddress = router.ip_address.replace(/^https?:\/\//, '');
    const headers = {
      'Authorization': 'Basic ' + btoa(`${router.username}:${router.password}`),
    };

    // Try both HTTP and HTTPS
    let baseUrl = `http://${cleanIpAddress}:${router.api_port || 80}`;
    let response;

    try {
      response = await fetch(`${baseUrl}/rest/interface`, { headers });
      if (!response.ok) throw new Error('HTTP failed, trying HTTPS');
    } catch {
      baseUrl = `https://${cleanIpAddress}:${router.api_port || 443}`;
      response = await fetch(`${baseUrl}/rest/interface`, { headers });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch interfaces: ${response.statusText}`);
    }

    const interfaces = await response.json();
    console.log(`Fetched ${interfaces.length} interfaces from router: ${router.name}`);

    // Process each interface
    for (const iface of interfaces) {
      const interfaceData = {
        router_id: routerId,
        name: iface.name,
        type: iface.type || 'unknown',
        mac_address: iface['mac-address'] || null,
        status: iface.running ? 'up' : 'down',
        rx_bytes: parseInt(iface['rx-byte']) || 0,
        tx_bytes: parseInt(iface['tx-byte']) || 0,
        rx_packets: parseInt(iface['rx-packet']) || 0,
        tx_packets: parseInt(iface['tx-packet']) || 0,
        last_sync: new Date().toISOString(),
      };

      // Upsert interface (insert or update if exists)
      const { error: upsertError } = await supabase
        .from('router_interfaces')
        .upsert(interfaceData, {
          onConflict: 'router_id,name',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error(`Error upserting interface ${iface.name}:`, upsertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronized ${interfaces.length} interfaces`,
        count: interfaces.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing interfaces:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
