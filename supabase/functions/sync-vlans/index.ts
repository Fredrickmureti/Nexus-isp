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
    console.log(`Syncing VLANs for router: ${routerId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get router details
    const { data: router, error: routerError } = await supabase
      .from('routers')
      .select('*')
      .eq('id', routerId)
      .single();

    if (routerError || !router) {
      throw new Error('Router not found');
    }

    // Construct MikroTik API URL
    const apiUrl = `${router.ip_address}${router.api_endpoint || '/rest'}/interface/vlan`;
    const auth = btoa(`${router.username}:${router.password}`);

    console.log(`Fetching VLANs from: ${apiUrl}`);

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

    const vlans = await response.json();
    console.log(`Found ${vlans.length} VLANs`);

    // Store VLANs in database
    for (const vlan of vlans) {
      const vlanData = {
        router_id: routerId,
        vlan_id: parseInt(vlan['vlan-id'] || vlan.vlanId || '0'),
        name: vlan.name,
        interface: vlan.interface,
        comment: vlan.comment || null,
      };

      await supabase
        .from('vlans')
        .upsert(vlanData, {
          onConflict: 'router_id,vlan_id',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: vlans.length,
        message: `Synced ${vlans.length} VLANs`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing VLANs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});