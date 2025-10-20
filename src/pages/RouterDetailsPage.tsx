import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Server, 
  Network, 
  Wifi, 
  Shield, 
  Gauge,
  Users,
  Globe,
  Settings
} from "lucide-react";

// Import tab components (we'll create these next)
import { InterfacesTab } from "@/components/router-details/InterfacesTab";
import { VLANsTab } from "@/components/router-details/VLANsTab";
import { PPPoETab } from "@/components/router-details/PPPoETab";
import { DHCPTab } from "@/components/router-details/DHCPTab";
import { IPPoolsTab } from "@/components/router-details/IPPoolsTab";
import { FirewallTab } from "@/components/router-details/FirewallTab";
import { BandwidthTab } from "@/components/router-details/BandwidthTab";

export default function RouterDetailsPage() {
  const { routerId } = useParams<{ routerId: string }>();
  const navigate = useNavigate();

  // Fetch router details
  const { data: router, isLoading } = useQuery({
    queryKey: ["router", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routers")
        .select(`
          *,
          provider:isp_providers(company_name)
        `)
        .eq("id", routerId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!router) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Router Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The router you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/isp-provider/routers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Routers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate("/isp-provider/routers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Server className="h-8 w-8" />
            {router.name}
          </h1>
          <p className="text-muted-foreground">
            {router.provider?.company_name} • {router.ip_address} • {router.location}
          </p>
        </div>
      </div>

      {/* Router Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Router Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={router.status === "online" ? "default" : "destructive"}>
                {router.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-semibold">{router.manufacturer} {router.model}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">API Type</p>
              <p className="font-semibold">{router.api_type}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Last Seen</p>
              <p className="font-semibold">
                {router.last_seen 
                  ? new Date(router.last_seen).toLocaleString()
                  : "Never"
                }
              </p>
            </div>
            {router.router_os_version && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">RouterOS Version</p>
                <p className="font-semibold">{router.router_os_version}</p>
              </div>
            )}
            {router.board_name && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Board</p>
                <p className="font-semibold">{router.board_name}</p>
              </div>
            )}
            {router.cpu_count && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">CPU Cores</p>
                <p className="font-semibold">{router.cpu_count}</p>
              </div>
            )}
            {router.total_memory && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Memory</p>
                <p className="font-semibold">
                  {(router.total_memory / (1024 * 1024 * 1024)).toFixed(1)} GB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different router management sections */}
      <Tabs defaultValue="interfaces" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="interfaces" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Interfaces</span>
          </TabsTrigger>
          <TabsTrigger value="vlans" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">VLANs</span>
          </TabsTrigger>
          <TabsTrigger value="pppoe" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">PPPoE</span>
          </TabsTrigger>
          <TabsTrigger value="dhcp" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">DHCP</span>
          </TabsTrigger>
          <TabsTrigger value="ip-pools" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">IP Pools</span>
          </TabsTrigger>
          <TabsTrigger value="firewall" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Firewall</span>
          </TabsTrigger>
          <TabsTrigger value="bandwidth" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline">Bandwidth</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interfaces">
          <InterfacesTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="vlans">
          <VLANsTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="pppoe">
          <PPPoETab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="dhcp">
          <DHCPTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="ip-pools">
          <IPPoolsTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="firewall">
          <FirewallTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="bandwidth">
          <BandwidthTab routerId={routerId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}