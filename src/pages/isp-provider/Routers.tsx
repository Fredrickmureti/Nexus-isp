import { useState } from "react";
import { useRouters } from "@/hooks/useRouters";
import { useTestRouterConnection } from "@/hooks/useRouterControl";
import { useSyncRouterInfo, useSyncRouterInterfaces, useSyncPPPoESessions, useRouterInterfaces, usePPPoESessions } from "@/hooks/useRouterSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Router, Plus, Wifi, WifiOff, Activity, Clock, RefreshCw, Settings, Trash2, Network, Users, Cpu, HardDrive, Database } from "lucide-react";
import { AddRouterDialog } from "@/components/isp/AddRouterDialog";
import { ConfigureRouterDialog } from "@/components/isp/ConfigureRouterDialog";

export default function Routers() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [configureRouterId, setConfigureRouterId] = useState<string | null>(null);
  const [selectedRouterId, setSelectedRouterId] = useState<string | null>(null);
  const { data: routers, isLoading } = useRouters();
  const testConnection = useTestRouterConnection();
  const syncRouterInfo = useSyncRouterInfo();
  const syncInterfaces = useSyncRouterInterfaces();
  const syncSessions = useSyncPPPoESessions();
  
  const { data: interfaces } = useRouterInterfaces(selectedRouterId || undefined);
  const { data: sessions } = usePPPoESessions(selectedRouterId || undefined);

  const handleSyncAll = (routerId: string) => {
    syncRouterInfo.mutate(routerId);
    syncInterfaces.mutate(routerId);
    syncSessions.mutate(routerId);
  };

  if (isLoading) {
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
          <p className="text-muted-foreground">Monitor and configure your network routers</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Router
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routers?.map((router) => (
          <Card key={router.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Router className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{router.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{router.manufacturer}</p>
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
                      : router.status === "maintenance"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {router.status}
                </Badge>
                <Badge variant="outline">{router.api_type.replace("_", " ")}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">IP Address</span>
                  <span className="font-mono">{String(router.ip_address)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-semibold">{router.model ?? "N/A"}</span>
                </div>
                {router.board_name && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Board</span>
                    <span className="font-semibold">{router.board_name}</span>
                  </div>
                )}
                {router.router_os_version && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">RouterOS</span>
                    <span className="font-semibold">{router.router_os_version}</span>
                  </div>
                )}
                {router.architecture && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Cpu className="h-3 w-3" />
                    {router.architecture}
                    {router.cpu_count && ` (${router.cpu_count} cores)`}
                  </div>
                )}
                {router.total_memory && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Database className="h-3 w-3" />
                    {(router.total_memory / (1024 * 1024)).toFixed(0)} MB RAM
                  </div>
                )}
                {router.last_seen && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2 border-t">
                    <Clock className="h-3 w-3" />
                    Last seen: {new Date(router.last_seen).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
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
                      <Activity className="mr-1 h-3 w-3" />
                      Test
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSyncAll(router.id)}
                  disabled={syncRouterInfo.isPending}
                >
                  {syncRouterInfo.isPending ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setConfigureRouterId(router.id)}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 bg-muted rounded">
                  <Network className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="font-semibold">
                    {interfaces?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Interfaces</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="font-semibold">
                    {sessions?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <Activity className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="font-semibold">
                    {router.status === "online" ? "Up" : "Down"}
                  </div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {routers?.length === 0 && (
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

      <AddRouterDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <ConfigureRouterDialog 
        open={!!configureRouterId} 
        onOpenChange={() => setConfigureRouterId(null)}
        router={routers?.find(r => r.id === configureRouterId)}
      />
    </div>
  );
}
