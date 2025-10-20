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

    const { customerId, routerId } = await req.json();

    // Get customer and router details
    const { data: customer } = await supabase
      .from('customers')
      .select('*, provider_id')
      .eq('id', customerId)
      .single();

    const { data: router } = await supabase
      .from('routers')
      .select('*')
      .eq('id', routerId)
      .single();

    if (!customer || !router) {
      throw new Error('Customer or router not found');
    }

    console.log(`Disconnecting customer ${customer.full_name} from router ${router.name}`);

    // Find active session
    const { data: session } = await supabase
      .from('customer_sessions')
      .select('*')
      .eq('customer_id', customerId)
      .eq('router_id', routerId)
      .eq('status', 'active')
      .order('session_start', { ascending: false })
      .limit(1)
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'No active session found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Disconnect based on router API type
    let disconnectResult;
    switch (router.api_type) {
      case 'mikrotik_api':
        disconnectResult = await disconnectMikroTik(router, session);
        break;
      case 'rest_api':
        disconnectResult = await disconnectRestApi(router, session);
        break;
      default:
        disconnectResult = { success: false, message: 'API type not supported yet' };
    }

    if (disconnectResult.success) {
      // Update session status
      await supabase
        .from('customer_sessions')
        .update({
          status: 'disconnected',
          session_end: new Date().toISOString(),
          disconnect_reason: 'Manual disconnect by ISP',
        })
        .eq('id', session.id);

      // Log activity
      await supabase.from('activity_logs').insert({
        provider_id: customer.provider_id,
        action_type: 'disconnect_customer',
        entity_type: 'customer',
        entity_id: customerId,
        description: `Disconnected ${customer.full_name} from router ${router.name}`,
      });
    }

    return new Response(
      JSON.stringify({
        success: disconnectResult.success,
        message: disconnectResult.message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error disconnecting customer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function disconnectMikroTik(router: any, session: any) {
  try {
    // Remove active connection from MikroTik
    const url = `http://${router.ip_address}:${router.api_port || 8728}/rest/ip/hotspot/active/remove`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${router.username}:${router.password}`),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        '.id': session.mac_address, // Using MAC as identifier
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Customer disconnected successfully',
      };
    } else {
      return {
        success: false,
        message: `Disconnect failed: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Disconnect error: ${error.message}`,
    };
  }
}

async function disconnectRestApi(router: any, session: any) {
  try {
    const url = `http://${router.ip_address}:${router.api_port || 80}/api/disconnect`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${router.password}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip: session.ip_address,
        mac: session.mac_address,
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Customer disconnected successfully',
      };
    } else {
      return {
        success: false,
        message: `Disconnect failed: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Disconnect error: ${error.message}`,
    };
  }
}
