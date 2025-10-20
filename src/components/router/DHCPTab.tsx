import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Network } from "lucide-react";
import { useDHCPServers, useSyncDHCPServers } from "@/hooks/useNetworkConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DHCPTabProps {
  routerId: string;
}

export default function DHCPTab({ routerId }: DHCPTabProps) {
  const { data: servers, isLoading } = useDHCPServers(routerId);
  const syncServers = useSyncDHCPServers();

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">DHCP Servers</h2>
        <Button
          variant="outline"
          onClick={() => syncServers.mutate(routerId)}
          disabled={syncServers.isPending}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncServers.isPending ? 'animate-spin' : ''}`} />
          Sync DHCP Servers
        </Button>
      </div>

      {!servers || servers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No DHCP servers configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Sync DHCP Servers" to fetch data from the router
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured DHCP Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Interface</TableHead>
                  <TableHead>Address Pool</TableHead>
                  <TableHead>Lease Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell className="font-medium">{server.name}</TableCell>
                    <TableCell>{server.interface}</TableCell>
                    <TableCell>{server.address_pool}</TableCell>
                    <TableCell>{server.lease_time}</TableCell>
                    <TableCell>
                      <Badge variant={server.enabled ? "default" : "secondary"}>
                        {server.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
