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
    console.log(`Syncing NAT rules for router: ${routerId}`);

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

    const apiUrl = `${router.ip_address}${router.api_endpoint || '/rest'}/ip/firewall/nat`;
    const auth = btoa(`${router.username}:${router.password}`);

    console.log(`Fetching NAT rules from: ${apiUrl}`);

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

    const rules = await response.json();
    console.log(`Found ${rules.length} NAT rules`);

    for (const rule of rules) {
      const ruleData = {
        router_id: routerId,
        chain: rule.chain,
        action: rule.action,
        src_address: rule['src-address'] || rule.srcAddress || null,
        dst_address: rule['dst-address'] || rule.dstAddress || null,
        protocol: rule.protocol || null,
        src_port: rule['src-port'] || rule.srcPort || null,
        dst_port: rule['dst-port'] || rule.dstPort || null,
        to_addresses: rule['to-addresses'] || rule.toAddresses || null,
        to_ports: rule['to-ports'] || rule.toPorts || null,
        out_interface: rule['out-interface'] || rule.outInterface || null,
        in_interface: rule['in-interface'] || rule.inInterface || null,
        comment: rule.comment || null,
        enabled: rule.disabled !== 'true' && rule.disabled !== true,
      };

      await supabase
        .from('nat_rules')
        .upsert(ruleData, {
          onConflict: 'router_id,chain',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: rules.length,
        message: `Synced ${rules.length} NAT rules`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing NAT rules:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
