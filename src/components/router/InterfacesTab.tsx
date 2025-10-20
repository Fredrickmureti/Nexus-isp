import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Network } from "lucide-react";
import { useRouterInterfaces, useSyncRouterInterfaces } from "@/hooks/useRouterSync";
import { Skeleton } from "@/components/ui/skeleton";

interface InterfacesTabProps {
  routerId: string;
}

export default function InterfacesTab({ routerId }: InterfacesTabProps) {
  const { data: interfaces, isLoading } = useRouterInterfaces(routerId);
  const syncInterfaces = useSyncRouterInterfaces();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Network Interfaces</h2>
        <Button
          onClick={() => syncInterfaces.mutate(routerId)}
          disabled={syncInterfaces.isPending}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncInterfaces.isPending ? 'animate-spin' : ''}`} />
          Sync Interfaces
        </Button>
      </div>

      {!interfaces || interfaces.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No interfaces found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Sync Interfaces" to fetch data from the router
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interfaces.map((iface) => (
            <Card key={iface.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{iface.name}</CardTitle>
                  <Badge variant={iface.status === 'running' ? 'default' : 'secondary'}>
                    {iface.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{iface.type}</span>
                </div>
                {iface.mac_address && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAC Address</span>
                    <span className="font-mono text-xs">{iface.mac_address}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RX</span>
                    <span className="font-medium">{formatBytes(iface.rx_bytes || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TX</span>
                    <span className="font-medium">{formatBytes(iface.tx_bytes || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
