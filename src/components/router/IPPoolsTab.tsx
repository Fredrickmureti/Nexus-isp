import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Network } from "lucide-react";
import { useIPPools, useSyncIPPools } from "@/hooks/useNetworkConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface IPPoolsTabProps {
  routerId: string;
}

export default function IPPoolsTab({ routerId }: IPPoolsTabProps) {
  const { data: pools, isLoading } = useIPPools(routerId);
  const syncPools = useSyncIPPools();

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">IP Address Pools</h2>
        <Button
          variant="outline"
          onClick={() => syncPools.mutate(routerId)}
          disabled={syncPools.isPending}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncPools.isPending ? 'animate-spin' : ''}`} />
          Sync IP Pools
        </Button>
      </div>

      {!pools || pools.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No IP pools configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Sync IP Pools" to fetch data from the router
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured IP Pools</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>IP Range</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>DNS Servers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pools.map((pool) => (
                  <TableRow key={pool.id}>
                    <TableCell className="font-medium">{pool.name}</TableCell>
                    <TableCell className="font-mono text-sm">{pool.ip_range}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {pool.gateway || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {pool.dns_servers || "-"}
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
