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
      response = await fetch(`${baseUrl}/rest/ppp/active`, { headers });
      if (!response.ok) throw new Error('HTTP failed, trying HTTPS');
    } catch {
      baseUrl = `https://${cleanIpAddress}:${router.api_port || 443}`;
      response = await fetch(`${baseUrl}/rest/ppp/active`, { headers });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch PPPoE sessions: ${response.statusText}`);
    }

    const sessions = await response.json();
    console.log(`Fetched ${sessions.length} active PPPoE sessions from router: ${router.name}`);

    // Mark all existing sessions as inactive first
    await supabase
      .from('pppoe_sessions')
      .update({ status: 'disconnected' })
      .eq('router_id', routerId)
      .eq('status', 'active');

    // Process each active session
    for (const session of sessions) {
      // Try to find matching customer by username or IP
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', session.name)
        .maybeSingle();

      const sessionData = {
        router_id: routerId,
        customer_id: customer?.id || null,
        username: session.name,
        caller_id: session['caller-id'] || null,
        address: session.address || null,
        uptime: session.uptime || null,
        encoding: session.encoding || null,
        session_id: session['.id'] || session.name, // Use .id or username as unique identifier
        service: session.service || 'pppoe',
        rx_bytes: parseInt(session['rx-byte']) || 0,
        tx_bytes: parseInt(session['tx-byte']) || 0,
        status: 'active',
        last_sync: new Date().toISOString(),
      };

      // Upsert session
      const { error: upsertError } = await supabase
        .from('pppoe_sessions')
        .upsert(sessionData, {
          onConflict: 'router_id,session_id',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error(`Error upserting session ${session.name}:`, upsertError);
      }
    }

    // Update router stats with active user count
    await supabase.from('router_stats').insert({
      router_id: routerId,
      active_users: sessions.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronized ${sessions.length} PPPoE sessions`,
        activeSessions: sessions.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing PPPoE sessions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
