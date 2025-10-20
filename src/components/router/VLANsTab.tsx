import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Network } from "lucide-react";
import { useVLANs, useSyncVLANs } from "@/hooks/useNetworkConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CreateVLANDialog from "@/components/router/dialogs/CreateVLANDialog";

interface VLANsTabProps {
  routerId: string;
}

export default function VLANsTab({ routerId }: VLANsTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: vlans, isLoading } = useVLANs(routerId);
  const syncVLANs = useSyncVLANs();

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">VLANs</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => syncVLANs.mutate(routerId)}
            disabled={syncVLANs.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncVLANs.isPending ? 'animate-spin' : ''}`} />
            Sync VLANs
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create VLAN
          </Button>
        </div>
      </div>

      {!vlans || vlans.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No VLANs configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create a VLAN to segment your network
            </p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create VLAN
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured VLANs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VLAN ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Interface</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vlans.map((vlan) => (
                  <TableRow key={vlan.id}>
                    <TableCell>
                      <Badge variant="outline">{vlan.vlan_id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{vlan.name}</TableCell>
                    <TableCell>{vlan.interface}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vlan.comment || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CreateVLANDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        routerId={routerId}
      />
    </div>
  );
}
