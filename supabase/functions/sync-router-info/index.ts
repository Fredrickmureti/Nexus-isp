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
      response = await fetch(`${baseUrl}/rest/system/resource`, { headers });
      if (!response.ok) throw new Error('HTTP failed, trying HTTPS');
    } catch {
      baseUrl = `https://${cleanIpAddress}:${router.api_port || 443}`;
      response = await fetch(`${baseUrl}/rest/system/resource`, { headers });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch system info: ${response.statusText}`);
    }

    const systemInfo = await response.json();

    // Fetch board info
    const boardResponse = await fetch(`${baseUrl}/rest/system/routerboard`, { headers });
    const boardInfo = boardResponse.ok ? await boardResponse.json() : {};

    // Update router with enhanced information
    const { error: updateError } = await supabase
      .from('routers')
      .update({
        board_name: boardInfo.model || systemInfo['board-name'] || null,
        architecture: systemInfo.architecture || null,
        cpu_count: systemInfo['cpu-count'] || null,
        total_memory: systemInfo['total-memory'] || null,
        disk_size: systemInfo['total-hdd-space'] || null,
        router_os_version: systemInfo.version || null,
        firmware_version: boardInfo['current-firmware'] || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', routerId);

    if (updateError) throw updateError;

    // Update router stats
    await supabase.from('router_stats').insert({
      router_id: routerId,
      cpu_load: systemInfo['cpu-load'] || 0,
      memory_usage: systemInfo['total-memory'] && systemInfo['free-memory']
        ? ((systemInfo['total-memory'] - systemInfo['free-memory']) / systemInfo['total-memory']) * 100
        : 0,
      uptime_seconds: parseUptime(systemInfo.uptime || '0s'),
      active_users: 0, // Will be updated by session sync
    });

    console.log(`Successfully synced router info for: ${router.name}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Router information synchronized successfully',
        data: {
          boardName: boardInfo.model || systemInfo['board-name'],
          architecture: systemInfo.architecture,
          cpuCount: systemInfo['cpu-count'],
          totalMemory: systemInfo['total-memory'],
          routerOsVersion: systemInfo.version,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing router info:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseUptime(uptime: string): number {
  const matches = uptime.match(/(\d+)w(\d+)d(\d+)h(\d+)m(\d+)s/);
  if (!matches) return 0;
  
  const [, weeks, days, hours, minutes, seconds] = matches.map(Number);
  return (weeks * 7 * 24 * 3600) + (days * 24 * 3600) + (hours * 3600) + (minutes * 60) + seconds;
}
