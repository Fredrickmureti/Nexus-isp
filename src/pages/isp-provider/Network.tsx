import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Wifi, TrendingUp, AlertCircle, Network as NetworkIcon, Shield, Gauge, Router, ArrowRight } from "lucide-react";

export default function Network() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: provider } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_providers")
        .select("*")
        .eq("owner_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: networkStats, isLoading } = useQuery({
    queryKey: ["network-stats", provider?.id],
    queryFn: async () => {
      const { data: routers, error: routersError } = await supabase
        .from("routers")
        .select("id, name, status")
        .eq("provider_id", provider?.id);

      if (routersError) throw routersError;

      const { data: sessions, error: sessionsError } = await supabase
        .from("customer_sessions")
        .select("*")
        .eq("status", "active");

      if (sessionsError) throw sessionsError;

      const { data: bandwidth, error: bandwidthError } = await supabase
        .from("bandwidth_usage")
        .select("*")
        .gte("usage_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("usage_date", { ascending: true });

      if (bandwidthError) throw bandwidthError;

      const dailyUsage = bandwidth?.reduce((acc: any, item: any) => {
        const date = new Date(item.usage_date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, upload: 0, download: 0 };
        }
        acc[date].upload += Number(item.upload_mb);
        acc[date].download += Number(item.download_mb);
        return acc;
      }, {});

      return {
        routers,
        activeSessions: sessions?.length || 0,
        bandwidthData: Object.values(dailyUsage || {}),
      };
    },
    enabled: !!provider?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const onlineRouters = networkStats?.routers?.filter(r => r.status === "online").length || 0;
  const totalRouters = networkStats?.routers?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Network Management</h1>
        <p className="text-muted-foreground">Comprehensive network configuration and monitoring</p>
      </div>

      {/* Network Management Navigation */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/isp-provider/network/vlans")}
        >
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <NetworkIcon className="mr-2 h-4 w-4" />
              VLAN Configuration
            </CardTitle>
            <CardDescription>Manage virtual networks and segmentation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Configure VLANs <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/isp-provider/network/firewall")}
        >
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Firewall Rules
            </CardTitle>
            <CardDescription>Security rules and traffic filtering</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Manage Rules <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/isp-provider/network/bandwidth")}
        >
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Gauge className="mr-2 h-4 w-4" />
              Bandwidth Control
            </CardTitle>
            <CardDescription>Traffic shaping and QoS management</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Control Traffic <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/isp-provider/routers")}
        >
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Router className="mr-2 h-4 w-4" />
              Router Management
            </CardTitle>
            <CardDescription>Configure and monitor routers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Manage Routers <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Network Monitoring Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Network Monitoring</h2>
        <p className="text-muted-foreground mb-6">Real-time network status and performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Router Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineRouters}/{totalRouters}</div>
            <p className="text-xs text-muted-foreground">Online routers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats?.activeSessions}</div>
            <p className="text-xs text-muted-foreground">Connected users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Network Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRouters > 0 ? Math.round((onlineRouters / totalRouters) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Uptime rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRouters - onlineRouters}</div>
            <p className="text-xs text-muted-foreground">Offline routers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bandwidth Usage (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={networkStats?.bandwidthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="upload" stroke="hsl(var(--primary))" name="Upload (MB)" />
              <Line type="monotone" dataKey="download" stroke="hsl(var(--secondary))" name="Download (MB)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Router Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {networkStats?.routers?.map((router) => (
              <div key={router.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{router.name}</p>
                    <p className="text-sm text-muted-foreground">Router ID: {router.id.slice(0, 8)}</p>
                  </div>
                </div>
                <Badge variant={router.status === "online" ? "default" : "destructive"}>
                  {router.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
