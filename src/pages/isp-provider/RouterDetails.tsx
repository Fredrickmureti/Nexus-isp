import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Router, Wifi, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import InterfacesTab from "@/components/router/InterfacesTab";
import VLANsTab from "@/components/router/VLANsTab";
import PPPoETab from "@/components/router/PPPoETab";
import DHCPTab from "@/components/router/DHCPTab";
import IPPoolsTab from "@/components/router/IPPoolsTab";
import FirewallTab from "@/components/router/FirewallTab";
import BandwidthTab from "@/components/router/BandwidthTab";

export default function RouterDetails() {
  const { routerId } = useParams();
  const navigate = useNavigate();

  const { data: router, isLoading } = useQuery({
    queryKey: ["router", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routers")
        .select("*")
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
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!router) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Router not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/isp-provider/routers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Router className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{router.name}</h1>
              <p className="text-muted-foreground">{String(router.ip_address)}</p>
            </div>
          </div>
        </div>
        <Badge
          variant={router.status === "online" ? "default" : "destructive"}
          className="h-fit"
        >
          {router.status === "online" ? (
            <Wifi className="h-3 w-3 mr-1" />
          ) : (
            <WifiOff className="h-3 w-3 mr-1" />
          )}
          {router.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Router Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Manufacturer</p>
            <p className="font-medium">{router.manufacturer || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Model</p>
            <p className="font-medium">{router.model || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">{router.location || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">API Type</p>
            <p className="font-medium">{router.api_type}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="interfaces" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
          <TabsTrigger value="vlans">VLANs</TabsTrigger>
          <TabsTrigger value="pppoe">PPPoE</TabsTrigger>
          <TabsTrigger value="dhcp">DHCP</TabsTrigger>
          <TabsTrigger value="ip-pools">IP Pools</TabsTrigger>
          <TabsTrigger value="firewall">Firewall</TabsTrigger>
          <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
        </TabsList>

        <TabsContent value="interfaces" className="mt-6">
          <InterfacesTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="vlans" className="mt-6">
          <VLANsTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="pppoe" className="mt-6">
          <PPPoETab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="dhcp" className="mt-6">
          <DHCPTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="ip-pools" className="mt-6">
          <IPPoolsTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="firewall" className="mt-6">
          <FirewallTab routerId={routerId!} />
        </TabsContent>

        <TabsContent value="bandwidth" className="mt-6">
          <BandwidthTab routerId={routerId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
