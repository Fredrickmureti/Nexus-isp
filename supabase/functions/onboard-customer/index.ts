import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardCustomerRequest {
  customerId: string;
  email: string;
  fullName: string;
  packageId?: string;
  routerId?: string;
  sendWelcomeEmail?: boolean;
  redirectTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { customerId, email, fullName, packageId, routerId, sendWelcomeEmail = true, redirectTo }: OnboardCustomerRequest = await req.json();

    console.log("Onboarding customer:", { customerId, email, fullName });

    // Generate activation token
    const activationToken = crypto.randomUUID();
    const activationExpiresAt = new Date();
    activationExpiresAt.setHours(activationExpiresAt.getHours() + 48); // 48 hour expiry

    // Create Supabase Auth user with email confirmation disabled
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true, // Auto-confirm email to avoid confirmation issues
      user_metadata: {
        full_name: fullName,
        customer_id: customerId,
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    console.log("Auth user created:", authUser.user.id);

    // Update customer record with user_id and activation token
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        user_id: authUser.user.id,
        activation_token: activationToken,
        activation_expires_at: activationExpiresAt.toISOString(),
      })
      .eq("id", customerId);

    if (updateError) {
      console.error("Error updating customer:", updateError);
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to update customer: ${updateError.message}`);
    }

    // Insert customer role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authUser.user.id,
        role: "customer",
      });

    if (roleError) {
      console.error("Error inserting customer role:", roleError);
      // Continue anyway, role can be added manually
    }

    // Create customer portal settings
    const { error: settingsError } = await supabase
      .from("customer_portal_settings")
      .insert({
        customer_id: customerId,
      });

    if (settingsError) {
      console.error("Error creating portal settings:", settingsError);
      // Continue anyway
    }

    // Create subscription if package provided
    if (packageId) {
      const { error: subscriptionError } = await supabase
        .from("customer_subscriptions")
        .insert({
          customer_id: customerId,
          package_id: packageId,
          status: "active",
          start_date: new Date().toISOString().split('T')[0],
        });

      if (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError);
        // Continue anyway
      }
    }

    // Update router assignment if provided
    if (routerId) {
      const { error: routerError } = await supabase
        .from("customers")
        .update({ assigned_router_id: routerId })
        .eq("id", customerId);

      if (routerError) {
        console.error("Error assigning router:", routerError);
      }
    }

    // Send welcome email
    if (sendWelcomeEmail) {
      const activationUrl = `${Deno.env.get("SITE_URL") || "https://e2463744-1364-42f0-822f-b5af6cdfb9c1.lovableproject.com"}/customer/activate/${activationToken}`;
      
      try {
        await resend.emails.send({
          from: "ISP Management <onboarding@resend.dev>",
          to: [email],
          subject: "Welcome to Your ISP Account - Activate Your Account",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Welcome, ${fullName}!</h1>
              <p>Your ISP account has been created successfully.</p>
              <p>To activate your account and set your password, please click the button below:</p>
              <div style="margin: 30px 0;">
                <a href="${activationUrl}" 
                   style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Activate Account
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link into your browser:<br/>
                <a href="${activationUrl}">${activationUrl}</a>
              </p>
              <p style="color: #666; font-size: 14px;">
                This activation link will expire in 48 hours.
              </p>
              <p>Once activated, you'll be able to:</p>
              <ul>
                <li>View your service package and usage</li>
                <li>Access billing and payment information</li>
                <li>Monitor your bandwidth usage</li>
                <li>Manage your account settings</li>
              </ul>
              <p>If you didn't expect this email, please ignore it.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;"/>
              <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
          `,
        });
        console.log("Welcome email sent successfully");
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't fail the whole operation if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: authUser.user.id,
        activationToken,
        message: "Customer onboarded successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in onboard-customer function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
