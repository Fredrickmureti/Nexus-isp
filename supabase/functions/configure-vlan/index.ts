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
    const { routerId, vlanId, name, interfaceName, comment } = await req.json();
    console.log(`Configuring VLAN on router: ${routerId}`);

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

    const apiUrl = `${router.ip_address}${router.api_endpoint || '/rest'}/interface/vlan`;
    const auth = btoa(`${router.username}:${router.password}`);

    const vlanConfig = {
      name,
      'vlan-id': vlanId.toString(),
      interface: interfaceName,
      comment: comment || '',
    };

    console.log(`Creating VLAN on MikroTik:`, vlanConfig);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vlanConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MikroTik API error: ${response.status} - ${errorText}`);
    }

    // Store in database
    await supabase.from('vlans').upsert({
      router_id: routerId,
      vlan_id: vlanId,
      name,
      interface: interfaceName,
      comment,
    }, {
      onConflict: 'router_id,vlan_id',
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `VLAN ${name} configured successfully`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error configuring VLAN:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});