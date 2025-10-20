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
    console.log(`Syncing bandwidth queues for router: ${routerId}`);

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

    console.log(`Fetching bandwidth queues from: ${apiUrl}`);

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

    const queues = await response.json();
    console.log(`Found ${queues.length} bandwidth queues`);

    for (const queue of queues) {
      const queueData = {
        router_id: routerId,
        name: queue.name,
        target: queue.target,
        max_upload: parseInt(queue['max-limit']?.split('/')[0] || '0'),
        max_download: parseInt(queue['max-limit']?.split('/')[1] || '0'),
        priority: parseInt(queue.priority || '8'),
        enabled: queue.disabled !== 'true' && queue.disabled !== true,
      };

      await supabase
        .from('bandwidth_queues')
        .upsert(queueData, {
          onConflict: 'router_id,name',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: queues.length,
        message: `Synced ${queues.length} bandwidth queues`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing bandwidth queues:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});