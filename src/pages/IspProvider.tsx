import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Wifi, AlertCircle, Router, Network, Shield, Gauge, Activity, ArrowRight, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerStats } from "@/hooks/useCustomers";
import { useRouterStatus, usePendingIssues } from "@/hooks/useNetworkStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RecentActivitySection } from "@/components/dashboard/RecentActivitySection";

const IspProvider = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: provider } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_providers")
        .select("id")
        .eq("owner_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: stats, isLoading } = useCustomerStats(provider?.id);
  const { data: routerStatus } = useRouterStatus(provider?.id);
  const { data: pendingIssues } = usePendingIssues(provider?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">ISP Dashboard</h1>
          <p className="text-muted-foreground">Manage your customers, network, and billing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Customers"
            value={stats?.activeCustomers.toString() || "0"}
            change={`${stats?.totalCustomers || 0} total`}
            icon={Users}
            trend="up"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats?.monthlyRevenue.toLocaleString() || "0"}`}
            change="This month"
            icon={DollarSign}
            trend="up"
          />
          <StatsCard
            title="Network Status"
            value={routerStatus?.status || "Unknown"}
            change={`${routerStatus?.onlineCount || 0}/${routerStatus?.totalCount || 0} routers online`}
            icon={Wifi}
            trend={routerStatus?.onlineCount === routerStatus?.totalCount ? "up" : "down"}
          />
          <StatsCard
            title="Pending Issues"
            value={pendingIssues?.count.toString() || "0"}
            change={pendingIssues?.message || "No issues"}
            icon={AlertCircle}
            trend={pendingIssues?.count === 0 ? "down" : "up"}
          />
        </div>

        {/* Network Management Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Network Management</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/isp-provider/routers")}
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => navigate("/isp-provider/routers")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Routers</CardTitle>
                <Router className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routerStatus?.totalCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {routerStatus?.onlineCount || 0} online, {(routerStatus?.totalCount || 0) - (routerStatus?.onlineCount || 0)} offline
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/isp-provider/network/vlans")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VLANs</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">8 configured</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/isp-provider/network/firewall")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Firewall Rules</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">Active protection</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/isp-provider/network/bandwidth")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bandwidth Usage</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">Peak: 890 Mbps</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/isp-provider/routers")}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Router
                </CardTitle>
                <CardDescription>Configure a new MikroTik router</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/isp-provider/network")}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Network Configuration
                </CardTitle>
                <CardDescription>Manage VLANs, DHCP, and routing</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/isp-provider/network")}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Activity className="mr-2 h-4 w-4" />
                  Network Monitor
                </CardTitle>
                <CardDescription>Real-time network monitoring</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivitySection providerId={provider?.id} />
      </div>
    </div>
  );
};

export default IspProvider;
