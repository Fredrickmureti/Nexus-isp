import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Shield } from "lucide-react";
import { useFirewallRules, useSyncFirewallRules } from "@/hooks/useNetworkConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FirewallTabProps {
  routerId: string;
}

export default function FirewallTab({ routerId }: FirewallTabProps) {
  const { data: rules, isLoading } = useFirewallRules(routerId);
  const syncRules = useSyncFirewallRules();

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Firewall Rules</h2>
        <Button
          variant="outline"
          onClick={() => syncRules.mutate(routerId)}
          disabled={syncRules.isPending}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncRules.isPending ? 'animate-spin' : ''}`} />
          Sync Rules
        </Button>
      </div>

      {!rules || rules.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No firewall rules configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Sync Rules" to fetch data from the router
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured Firewall Rules ({rules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>{rule.position !== null ? rule.position + 1 : "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.chain}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rule.action === "accept" ? "default" :
                          rule.action === "drop" ? "destructive" :
                          "secondary"
                        }
                      >
                        {rule.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {rule.protocol || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {rule.src_address || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {rule.dst_address || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.enabled ? "default" : "secondary"}>
                        {rule.enabled ? "Enabled" : "Disabled"}
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
