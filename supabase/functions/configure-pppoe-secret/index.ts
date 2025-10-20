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
    const { routerId, customerId, name, password, service, profile, localAddress, remoteAddress, comment } = await req.json();
    console.log(`Configuring PPPoE secret on router: ${routerId}`);

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

    const apiUrl = `${router.ip_address}${router.api_endpoint || '/rest'}/ppp/secret`;
    const auth = btoa(`${router.username}:${router.password}`);

    const secretConfig = {
      name,
      password,
      service: service || 'any',
      profile: profile || 'default',
      'local-address': localAddress || '',
      'remote-address': remoteAddress || '',
      comment: comment || '',
    };

    console.log(`Creating PPPoE secret on MikroTik:`, secretConfig);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(secretConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MikroTik API error: ${response.status} - ${errorText}`);
    }

    // Store in database
    await supabase.from('pppoe_secrets').upsert({
      router_id: routerId,
      customer_id: customerId || null,
      name,
      password,
      service: service || 'any',
      profile: profile || 'default',
      local_address: localAddress || null,
      remote_address: remoteAddress || null,
      comment: comment || null,
      enabled: true,
    }, {
      onConflict: 'router_id,name',
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `PPPoE secret ${name} configured successfully`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error configuring PPPoE secret:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
