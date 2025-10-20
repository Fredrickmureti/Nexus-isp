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
    const { routerId, customerId, name, target, maxUpload, maxDownload, priority } = await req.json();
    console.log(`Configuring bandwidth queue on router: ${routerId}`);

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

    const apiUrl = `${router.ip_address}${router.api_endpoint || '/rest'}/queue/simple`;
    const auth = btoa(`${router.username}:${router.password}`);

    const queueConfig = {
      name,
      target,
      'max-limit': `${maxUpload}/${maxDownload}`,
      priority: priority?.toString() || '8',
    };

    console.log(`Creating bandwidth queue on MikroTik:`, queueConfig);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queueConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MikroTik API error: ${response.status} - ${errorText}`);
    }

    // Store in database
    await supabase.from('bandwidth_queues').upsert({
      router_id: routerId,
      customer_id: customerId || null,
      name,
      target,
      max_upload: maxUpload,
      max_download: maxDownload,
      priority: priority || 8,
      enabled: true,
    }, {
      onConflict: 'router_id,name',
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Bandwidth queue ${name} configured successfully`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error configuring bandwidth queue:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});