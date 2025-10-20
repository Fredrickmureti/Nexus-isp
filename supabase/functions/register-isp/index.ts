import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegistrationRequest {
  email: string;
  password: string;
  full_name: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  address?: string;
  registration_number?: string;
  plan_name: string;
  billing_cycle: "monthly" | "yearly";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const registrationData: RegistrationRequest = await req.json();
    
    console.log('Processing ISP registration for:', registrationData.email);

    let userId: string;

    // 1. Check if user already exists (for platform owners registering ISPs)
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users?.find(u => u.email === registrationData.email);

    if (userExists) {
      console.log('User already exists, using existing user:', userExists.id);
      userId = userExists.id;

      // Check if user already has an ISP provider
      const { data: existingProvider } = await supabaseAdmin
        .from('isp_providers')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle();

      if (existingProvider) {
        throw new Error('This user already has an ISP provider registered');
      }
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: registrationData.email,
        password: registrationData.password,
        email_confirm: false,
        user_metadata: {
          full_name: registrationData.full_name,
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Failed to create user: ${authError.message}`);
      }

      userId = authData.user.id;
      console.log('Created new auth user:', userId);
    }

    // 2. Get subscription plan details
    const { data: planData, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('plan_name', registrationData.plan_name)
      .single();

    if (planError) {
      console.error('Plan error:', planError);
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Failed to fetch plan: ${planError.message}`);
    }

    console.log('Found plan:', planData.display_name);

    // 3. Calculate subscription dates
    const today = new Date();
    let trialEndDate = null;
    let nextBillingDate = null;
    let subscriptionStatus: 'trial' | 'active' | 'pending_payment' = 'pending_payment';

    if (planData.trial_days > 0) {
      trialEndDate = new Date(today);
      trialEndDate.setDate(trialEndDate.getDate() + planData.trial_days);
      nextBillingDate = trialEndDate;
      subscriptionStatus = 'trial';
    } else {
      const billingDate = new Date(today);
      if (registrationData.billing_cycle === 'yearly') {
        billingDate.setFullYear(billingDate.getFullYear() + 1);
      } else {
        billingDate.setMonth(billingDate.getMonth() + 1);
      }
      nextBillingDate = billingDate;
    }

    // 4. Create ISP provider record
    const { data: providerData, error: providerError } = await supabaseAdmin
      .from('isp_providers')
      .insert({
        owner_id: userId,
        company_name: registrationData.company_name,
        company_email: registrationData.company_email,
        company_phone: registrationData.company_phone,
        address: registrationData.address,
        registration_number: registrationData.registration_number,
        subscription_plan: registrationData.plan_name,
        subscription_status: subscriptionStatus,
        registration_status: subscriptionStatus === 'trial' ? 'active' : 'pending_payment',
        trial_end_date: trialEndDate ? trialEndDate.toISOString().split('T')[0] : null,
        next_billing_date: nextBillingDate ? nextBillingDate.toISOString().split('T')[0] : null,
        monthly_fee: registrationData.billing_cycle === 'yearly' 
          ? planData.yearly_price 
          : planData.monthly_price,
        max_customers: planData.max_customers,
        max_routers: planData.max_routers,
        payment_status: subscriptionStatus === 'trial' ? 'verified' : 'pending',
      })
      .select()
      .single();

    if (providerError) {
      console.error('Provider error:', providerError);
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Failed to create provider: ${providerError.message}`);
    }

    console.log('Created ISP provider:', providerData.id);

    // 5. Assign isp_provider role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'isp_provider',
      });

    if (roleError) {
      console.error('Role error:', roleError);
      // Rollback: delete provider and auth user
      await supabaseAdmin.from('isp_providers').delete().eq('id', providerData.id);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Failed to assign role: ${roleError.message}`);
    }

    console.log('Assigned isp_provider role');

    // 6. Create default notification preferences
    const { error: notificationError } = await supabaseAdmin
      .from('notification_preferences')
      .insert({
        provider_id: providerData.id,
        email_on_payment: true,
        email_on_customer_signup: true,
        email_on_router_offline: true,
        sms_on_critical: false,
      });

    if (notificationError) {
      console.error('Notification preferences error:', notificationError);
      // Non-critical, continue execution
    } else {
      console.log('Created default notification preferences');
    }

    // 7. Log activity
    await supabaseAdmin.from('activity_logs').insert({
      user_id: userId,
      provider_id: providerData.id,
      action_type: 'registration',
      entity_type: 'provider',
      entity_id: providerData.id,
      description: `ISP provider registered: ${registrationData.company_name} on ${planData.display_name} plan`,
    });

    // 8. Log email (for tracking purposes)
    await supabaseAdmin.from('email_logs').insert({
      user_id: userId,
      provider_id: providerData.id,
      email_type: 'registration',
      recipient_email: registrationData.email,
      subject: 'Welcome to ISP Management Platform',
      status: 'sent',
    });

    console.log('Registration completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        provider_id: providerData.id,
        trial_days: planData.trial_days,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
