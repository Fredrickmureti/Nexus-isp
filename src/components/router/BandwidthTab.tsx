import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Gauge } from "lucide-react";
import { useBandwidthQueues, useSyncBandwidthQueues } from "@/hooks/useNetworkConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CreateBandwidthQueueDialog from "@/components/router/dialogs/CreateBandwidthQueueDialog";

interface BandwidthTabProps {
  routerId: string;
}

export default function BandwidthTab({ routerId }: BandwidthTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: queues, isLoading } = useBandwidthQueues(routerId);
  const syncQueues = useSyncBandwidthQueues();

  const formatSpeed = (bps: number) => {
    if (bps === 0) return '0';
    const k = 1000;
    const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
    const i = Math.floor(Math.log(bps) / Math.log(k));
    return Math.round(bps / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bandwidth Queues</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => syncQueues.mutate(routerId)}
            disabled={syncQueues.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncQueues.isPending ? 'animate-spin' : ''}`} />
            Sync Queues
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Queue
          </Button>
        </div>
      </div>

      {!queues || queues.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Gauge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No bandwidth queues configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create a queue to limit customer bandwidth
            </p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Queue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured Bandwidth Queues</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Upload Limit</TableHead>
                  <TableHead>Download Limit</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queues.map((queue) => (
                  <TableRow key={queue.id}>
                    <TableCell className="font-medium">{queue.name}</TableCell>
                    <TableCell>
                      {queue.customers?.full_name || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{queue.target}</TableCell>
                    <TableCell>{formatSpeed(Number(queue.max_upload))}</TableCell>
                    <TableCell>{formatSpeed(Number(queue.max_download))}</TableCell>
                    <TableCell>{queue.priority}</TableCell>
                    <TableCell>
                      <Badge variant={queue.enabled ? "default" : "secondary"}>
                        {queue.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CreateBandwidthQueueDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        routerId={routerId}
      />
    </div>
  );
}
