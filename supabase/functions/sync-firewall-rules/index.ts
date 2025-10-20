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
    console.log(`Syncing firewall rules for router: ${routerId}`);

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

    const apiUrl = `${router.ip_address}${router.api_endpoint || '/rest'}/ip/firewall/filter`;
    const auth = btoa(`${router.username}:${router.password}`);

    console.log(`Fetching firewall rules from: ${apiUrl}`);

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
    console.log(`Found ${rules.length} firewall rules`);

    // Delete existing rules for this router
    await supabase
      .from('firewall_rules')
      .delete()
      .eq('router_id', routerId);

    // Insert new rules
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const ruleData = {
        router_id: routerId,
        chain: rule.chain,
        action: rule.action,
        protocol: rule.protocol || null,
        src_address: rule['src-address'] || rule.srcAddress || null,
        dst_address: rule['dst-address'] || rule.dstAddress || null,
        comment: rule.comment || null,
        position: i,
        enabled: rule.disabled !== 'true' && rule.disabled !== true,
      };

      await supabase
        .from('firewall_rules')
        .insert(ruleData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: rules.length,
        message: `Synced ${rules.length} firewall rules`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing firewall rules:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});