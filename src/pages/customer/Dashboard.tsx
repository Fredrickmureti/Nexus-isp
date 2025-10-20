import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wifi, Package, DollarSign, Activity, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: subscription } = useQuery({
    queryKey: ["customer-subscription", customer?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select(`
          *,
          service_packages (
            package_name,
            speed_mbps,
            bandwidth_limit_gb,
            price,
            billing_cycle
          )
        `)
        .eq("customer_id", customer?.id)
        .eq("status", "active")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!customer?.id,
  });

  const { data: latestInvoice } = useQuery({
    queryKey: ["latest-invoice", customer?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", customer?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!customer?.id,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/customer/login");
  };

  if (customerLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {customer?.full_name}!</h1>
            <p className="text-muted-foreground">Manage your internet service</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Account Status</CardTitle>
              <Badge variant={customer?.account_status === "active" ? "default" : "secondary"}>
                {customer?.account_status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{customer?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {customer?.registration_date ? new Date(customer.registration_date).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Package */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Package</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {subscription ? (
                <>
                  <div className="text-2xl font-bold">{subscription.service_packages?.package_name}</div>
                  <p className="text-xs text-muted-foreground">
                    {subscription.service_packages?.speed_mbps} Mbps • ${subscription.service_packages?.price}/{subscription.service_packages?.billing_cycle}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No active package</p>
              )}
            </CardContent>
          </Card>

          {/* Latest Invoice */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Invoice</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {latestInvoice ? (
                <>
                  <div className="text-2xl font-bold">${latestInvoice.amount}</div>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(latestInvoice.due_date).toLocaleDateString()} • {latestInvoice.status}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No invoices yet</p>
              )}
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                Router: {customer?.assigned_router_id ? "Assigned" : "Not assigned"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate("/customer/package")}>
            <Package className="h-6 w-6" />
            <span>My Package</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate("/customer/billing")}>
            <DollarSign className="h-6 w-6" />
            <span>Billing</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate("/customer/usage")}>
            <Activity className="h-6 w-6" />
            <span>Usage Stats</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate("/customer/settings")}>
            <Settings className="h-6 w-6" />
            <span>Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
