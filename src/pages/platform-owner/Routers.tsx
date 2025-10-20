import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Wifi, Search, Activity, Plus, Router, WifiOff, Clock, RefreshCw, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRouterDialog } from "@/components/isp/AddRouterDialog";
import { ConfigureRouterDialog } from "@/components/isp/ConfigureRouterDialog";
import { useTestRouterConnection } from "@/hooks/useRouterControl";

export default function Routers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [configureRouterId, setConfigureRouterId] = useState<string | null>(null);
  const testConnection = useTestRouterConnection();

  // Fetch platform owner's own provider
  const { data: ownProvider } = useQuery({
    queryKey: ["own-provider", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_providers")
        .select("id, company_name")
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch own routers
  const { data: ownRouters, isLoading: ownLoading } = useQuery({
    queryKey: ["own-routers", ownProvider?.id],
    queryFn: async () => {
      if (!ownProvider?.id) return [];
      
      const { data, error } = await supabase
        .from("routers")
        .select("*")
        .eq("provider_id", ownProvider.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!ownProvider?.id,
  });

  // Fetch all routers across platform
  const { data: allRouters, isLoading: allLoading } = useQuery({
    queryKey: ["all-routers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routers")
        .select(`
          *,
          isp_providers!inner(
            id,
            company_name,
            company_email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredAllRouters = allRouters?.filter((router) => {
    const matchesSearch =
      router.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(router.ip_address).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (router.isp_providers?.company_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || router.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredOwnRouters = ownRouters?.filter((router) => {
    const matchesSearch =
      router.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(router.ip_address).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || router.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderRouterCard = (router: any, showProvider = false) => (
    <Card 
      key={router.id} 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/isp-provider/routers/${router.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Router className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{router.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{String(router.ip_address)}</p>
            </div>
          </div>
          {router.status === "online" ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-destructive" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge
            variant={
              router.status === "online"
                ? "default"
                : router.status === "offline"
                ? "secondary"
                : "destructive"
            }
          >
            {router.status}
          </Badge>
          {router.connection_test_status && (
            <Badge variant="outline">{router.connection_test_status}</Badge>
          )}
        </div>

        <div className="space-y-2">
          {showProvider && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ISP Provider</span>
              <span className="font-semibold">{String(router.isp_providers?.company_name || "N/A")}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Manufacturer</span>
            <span className="font-semibold">{router.manufacturer || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Model</span>
            <span className="font-semibold">{router.model || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="font-semibold">{router.location || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">API Type</span>
            <span className="font-semibold">{router.api_type}</span>
          </div>
          {router.last_seen && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2 border-t">
              <Clock className="h-3 w-3" />
              Last seen: {new Date(router.last_seen).toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {!showProvider && (
            <>
              <Button 
                variant="outline" 
                className="flex-1" 
                size="sm"
                onClick={() => testConnection.mutate(router.id)}
                disabled={testConnection.isPending}
              >
                {testConnection.isPending && testConnection.variables === router.id ? (
                  <>
                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Test
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setConfigureRouterId(router.id)}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </>
          )}
          {showProvider && (
            <Button variant="outline" className="flex-1" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              View Stats
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (ownLoading || allLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Router Management</h1>
          <p className="text-muted-foreground">
            {ownProvider ? "Manage your routers and monitor all routers across the platform" : "Monitor all routers across ISP providers"}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search routers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue={ownProvider ? "my-routers" : "all-routers"} className="w-full">
        <TabsList>
          {ownProvider && <TabsTrigger value="my-routers">My Routers</TabsTrigger>}
          <TabsTrigger value="all-routers">All Platform Routers</TabsTrigger>
        </TabsList>

        {ownProvider && (
          <TabsContent value="my-routers" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Router
              </Button>
            </div>

            {filteredOwnRouters && filteredOwnRouters.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOwnRouters.map((router) => renderRouterCard(router, false))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center space-y-2">
                  <Router className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No routers configured</h3>
                  <p className="text-muted-foreground">
                    Add your first router to start monitoring your network
                  </p>
                  <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Router
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        )}

        <TabsContent value="all-routers" className="space-y-6">
          {filteredAllRouters && filteredAllRouters.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAllRouters.map((router) => renderRouterCard(router, true))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-2">
                <Wifi className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">No routers found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {ownProvider && (
        <>
          <AddRouterDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
          <ConfigureRouterDialog 
            open={!!configureRouterId} 
            onOpenChange={() => setConfigureRouterId(null)}
            router={ownRouters?.find(r => r.id === configureRouterId)}
          />
        </>
      )}
    </div>
  );
}
