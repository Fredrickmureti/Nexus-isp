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
    console.log(`Syncing PPPoE secrets for router: ${routerId}`);

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

    console.log(`Fetching PPPoE secrets from: ${apiUrl}`);

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

    const secrets = await response.json();
    console.log(`Found ${secrets.length} PPPoE secrets`);

    for (const secret of secrets) {
      const secretData = {
        router_id: routerId,
        name: secret.name,
        password: secret.password || '',
        service: secret.service || 'any',
        profile: secret.profile || 'default',
        local_address: secret['local-address'] || secret.localAddress || null,
        remote_address: secret['remote-address'] || secret.remoteAddress || null,
        routes: secret.routes || null,
        comment: secret.comment || null,
        enabled: secret.disabled !== 'true' && secret.disabled !== true,
      };

      await supabase
        .from('pppoe_secrets')
        .upsert(secretData, {
          onConflict: 'router_id,name',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: secrets.length,
        message: `Synced ${secrets.length} PPPoE secrets`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing PPPoE secrets:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
