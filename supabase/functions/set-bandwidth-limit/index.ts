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

    const { customerId, routerId, uploadSpeed, downloadSpeed } = await req.json();

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

    console.log(`Setting bandwidth limit for ${customer.full_name}: ${uploadSpeed}/${downloadSpeed} Mbps`);

    // Set bandwidth based on router API type
    let result;
    switch (router.api_type) {
      case 'mikrotik_api':
        result = await setBandwidthMikroTik(router, customer, uploadSpeed, downloadSpeed);
        break;
      case 'rest_api':
        result = await setBandwidthRestApi(router, customer, uploadSpeed, downloadSpeed);
        break;
      default:
        result = { success: false, message: 'API type not supported yet' };
    }

    if (result.success) {
      // Log activity
      await supabase.from('activity_logs').insert({
        provider_id: customer.provider_id,
        action_type: 'set_bandwidth',
        entity_type: 'customer',
        entity_id: customerId,
        description: `Set bandwidth limit for ${customer.full_name}: ${uploadSpeed}/${downloadSpeed} Mbps`,
      });
    }

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error setting bandwidth limit:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function setBandwidthMikroTik(router: any, customer: any, uploadSpeed: number, downloadSpeed: number) {
  try {
    // Create or update queue for bandwidth limiting
    const url = `http://${router.ip_address}:${router.api_port || 8728}/rest/queue/simple/add`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${router.username}:${router.password}`),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `customer-${customer.id}`,
        target: customer.installation_address || '0.0.0.0/32', // IP address
        'max-limit': `${uploadSpeed}M/${downloadSpeed}M`,
        comment: `Bandwidth limit for ${customer.full_name}`,
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: `Bandwidth limit set: ${uploadSpeed}/${downloadSpeed} Mbps`,
      };
    } else {
      return {
        success: false,
        message: `Failed to set bandwidth: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
}

async function setBandwidthRestApi(router: any, customer: any, uploadSpeed: number, downloadSpeed: number) {
  try {
    const url = `http://${router.ip_address}:${router.api_port || 80}/api/bandwidth`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${router.password}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customer.id,
        upload_speed: uploadSpeed,
        download_speed: downloadSpeed,
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: `Bandwidth limit set: ${uploadSpeed}/${downloadSpeed} Mbps`,
      };
    } else {
      return {
        success: false,
        message: `Failed to set bandwidth: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
}
