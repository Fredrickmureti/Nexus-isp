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

    const { routerId, routerConfig } = await req.json();

    let router;
    let shouldUpdateDatabase = false;

    if (routerId) {
      // Test existing router from database
      const { data, error: routerError } = await supabase
        .from('routers')
        .select('*')
        .eq('id', routerId)
        .single();

      if (routerError) throw routerError;
      router = data;
      shouldUpdateDatabase = true;
      console.log(`Testing connection to router: ${router.name} (${router.ip_address})`);
    } else if (routerConfig) {
      // Test router configuration before saving
      router = routerConfig;
      console.log(`Testing router configuration: ${router.ip_address}`);
    } else {
      throw new Error('Either routerId or routerConfig must be provided');
    }

    // Quick validation: refuse private LAN IPs (not reachable from Edge Functions)
    const isPrivateLan = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|169\.254\.|127\.)/.test(router.ip_address);
    if (isPrivateLan) {
      const message = `Router IP ${router.ip_address} is a private/LAN address. Cloud edge functions cannot reach local networks. Use a publicly reachable address or set up secure port forwarding (HTTPS) to test from cloud.`;
      if (shouldUpdateDatabase && routerId) {
        await supabase.from('routers').update({ status: 'offline' }).eq('id', routerId);
      }
      return new Response(
        JSON.stringify({ success: false, message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test connection based on API type
    let connectionResult;
    switch (router.api_type) {
      case 'mikrotik_api':
        connectionResult = await testMikroTikConnection(router);
        break;
      case 'rest_api':
        connectionResult = await testRestApiConnection(router);
        break;
      case 'snmp':
        connectionResult = await testSnmpConnection(router);
        break;
      case 'ssh':
        connectionResult = await testSshConnection(router);
        break;
      default:
        throw new Error(`Unsupported API type: ${router.api_type}`);
    }

    // Update router status only if testing an existing router
    if (shouldUpdateDatabase && routerId) {
      const { error: updateError } = await supabase
        .from('routers')
        .update({
          status: connectionResult.success ? 'online' : 'offline',
          last_seen: connectionResult.success ? new Date().toISOString() : null,
        })
        .eq('id', routerId);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert({
        provider_id: router.provider_id,
        action_type: 'router_test',
        entity_type: 'router',
        entity_id: routerId,
        description: `Router connection test: ${connectionResult.success ? 'successful' : 'failed'}`,
      });
    }

    return new Response(
      JSON.stringify({
        success: connectionResult.success,
        message: connectionResult.message,
        stats: connectionResult.stats,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error testing router connection:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function testMikroTikConnection(router: any) {
  try {
    // Strip protocol from IP address if present
    let cleanIpAddress = router.ip_address.replace(/^https?:\/\//, '');
    
    // Try both HTTP and HTTPS with shorter per-attempt timeouts
    const explicitPort = router.api_port;
    const candidates: Array<{ scheme: 'http' | 'https'; port: number }> = [];

    if (explicitPort) {
      if (explicitPort === 443) {
        candidates.push({ scheme: 'https', port: 443 }, { scheme: 'http', port: 80 });
      } else {
        candidates.push({ scheme: 'http', port: explicitPort }, { scheme: 'https', port: 443 });
      }
    } else {
      candidates.push({ scheme: 'http', port: 80 }, { scheme: 'https', port: 443 });
    }

    const headers = {
      'Authorization': 'Basic ' + btoa(`${router.username}:${router.password}`),
    };

    const fetchWithTimeout = async (url: string, timeoutMs: number) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { method: 'GET', headers, signal: controller.signal });
        return res;
      } finally {
        clearTimeout(timeoutId);
      }
    };

    let lastError: any = null;
    for (const c of candidates) {
      const identityUrl = `${c.scheme}://${cleanIpAddress}:${c.port}/rest/system/identity`;
      console.log(`Testing MikroTik REST API at: ${identityUrl}`);

      try {
        const response = await fetchWithTimeout(identityUrl, 5000);
        if (response.ok) {
          const data = await response.json();
          // Resource stats
          const resourceUrl = `${c.scheme}://${cleanIpAddress}:${c.port}/rest/system/resource`;
          let stats: Record<string, any> = {};
          try {
            const resourceResponse = await fetchWithTimeout(resourceUrl, 5000);
            if (resourceResponse.ok) {
              const resourceData = await resourceResponse.json();
              stats = {
                cpuLoad: resourceData['cpu-load'] || 0,
                freeMemory: resourceData['free-memory'] || 0,
                uptime: resourceData.uptime || '0s',
              };
            }
          } catch (_) { /* ignore stats error */ }

          return {
            success: true,
            message: `Successfully connected to MikroTik router: ${data.name || 'Unknown'}`,
            stats,
          };
        } else {
          const errorText = await response.text();
          console.error('MikroTik connection failed:', response.status, errorText);
          lastError = { status: response.status, text: errorText };
          // Try next candidate
        }
      } catch (err: any) {
        lastError = err;
        console.error('MikroTik attempt error:', err?.message || err);
        // Try next candidate
      }
    }

    // If all attempts failed
    const msgBase = 'Connection failed. Ensure REST API is enabled (IP > Services > www).';
    const extra = ' If the router is on a private/LAN IP, cloud cannot reach it. Use a public IP/hostname with HTTPS and proper firewall rules.';
    const timeoutHint = ' Also verify that port 80 or 443 is open from the internet if testing from cloud.';
    return {
      success: false,
      message: `${msgBase}${extra}${timeoutHint}`,
    };
  } catch (error: any) {
    console.error('MikroTik connection error:', error);
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timeout. Check that REST API is enabled and reachable (HTTP 80 or HTTPS 443).',
      };
    }
    return {
      success: false,
      message: `Connection error: ${error.message}. Ensure REST API is enabled (IP > Services > www).`,
    };
  }
}

async function testRestApiConnection(router: any) {
  try {
    // Strip protocol from IP address if present
    const cleanIpAddress = router.ip_address.replace(/^https?:\/\//, '');
    const url = `http://${cleanIpAddress}:${router.api_port || 80}/api/status`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${router.password}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        success: true,
        message: 'Successfully connected via REST API',
      };
    } else {
      return {
        success: false,
        message: `Connection failed: ${response.statusText}`,
      };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timeout: Router did not respond within 10 seconds',
      };
    }
    return {
      success: false,
      message: `Connection error: ${error.message}`,
    };
  }
}

async function testSnmpConnection(router: any) {
  // SNMP would require a different approach
  // For now, return a mock response
  return {
    success: false,
    message: 'SNMP support coming soon',
  };
}

async function testSshConnection(router: any) {
  // SSH would require a different approach  
  // For now, return a mock response
  return {
    success: false,
    message: 'SSH support coming soon',
  };
}
