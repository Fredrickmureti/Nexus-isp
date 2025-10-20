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
    const { routerId, chain, action, outInterface, srcAddress, dstAddress, comment } = await req.json();
    console.log(`Configuring NAT rule on router: ${routerId}`);

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

    const natConfig = {
      chain: chain || 'srcnat',
      action: action || 'masquerade',
      'out-interface': outInterface || '',
      'src-address': srcAddress || '',
      'dst-address': dstAddress || '',
      comment: comment || '',
    };

    console.log(`Creating NAT rule on MikroTik:`, natConfig);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(natConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MikroTik API error: ${response.status} - ${errorText}`);
    }

    // Store in database
    await supabase.from('nat_rules').insert({
      router_id: routerId,
      chain: chain || 'srcnat',
      action: action || 'masquerade',
      out_interface: outInterface || null,
      src_address: srcAddress || null,
      dst_address: dstAddress || null,
      comment: comment || null,
      enabled: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `NAT rule configured successfully`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error configuring NAT rule:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
