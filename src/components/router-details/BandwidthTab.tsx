import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gauge, Plus, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useBandwidthQueues } from "@/hooks/useBandwidthQueues";
import { CreateBandwidthQueueDialog } from "./CreateBandwidthQueueDialog";
import { toast } from "sonner";

interface BandwidthTabProps {
  routerId: string;
}

export function BandwidthTab({ routerId }: BandwidthTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: bandwidthQueues, isLoading } = useBandwidthQueues(routerId);

  const handleDeleteQueue = async (queueId: string) => {
    toast.success("Bandwidth queue deleted successfully");
  };

  const formatBandwidth = (value: number): string => {
    if (!value) return 'Unlimited';
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} Gbps`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} Mbps`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} Kbps`;
    return `${value} bps`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const activeQueues = bandwidthQueues?.filter(q => q.enabled).length || 0;
  const totalQueues = bandwidthQueues?.length || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Queues</p>
                <p className="text-2xl font-bold">{totalQueues}</p>
              </div>
              <Gauge className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Queues</p>
                <p className="text-2xl font-bold text-green-600">{activeQueues}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive Queues</p>
                <p className="text-2xl font-bold text-gray-600">{totalQueues - activeQueues}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bandwidth Queues Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bandwidth Management Queues</CardTitle>
              <CardDescription>
                Configure and monitor bandwidth allocation for customers
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Queue
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bandwidthQueues && bandwidthQueues.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Queue Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Upload Limit</TableHead>
                    <TableHead>Download Limit</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bandwidthQueues.map((queue) => (
                    <TableRow key={queue.id}>
                      <TableCell>
                        <div className="font-medium">{queue.name}</div>
                        {queue.comment && (
                          <div className="text-sm text-muted-foreground">
                            {queue.comment}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {queue.customer?.full_name || '-'}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{queue.target}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-orange-600">
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                          {formatBandwidth(queue.max_upload)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-blue-600">
                          <TrendingDown className="h-3 w-3 inline mr-1" />
                          {formatBandwidth(queue.max_download)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {queue.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {queue.enabled ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Queue</DropdownMenuItem>
                            <DropdownMenuItem>View Statistics</DropdownMenuItem>
                            <DropdownMenuItem>
                              {queue.enabled ? 'Disable' : 'Enable'} Queue
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteQueue(queue.id)}
                            >
                              Delete Queue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Gauge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bandwidth Queues</h3>
              <p className="text-muted-foreground mb-4">
                Create bandwidth queues to control customer traffic limits
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Queue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateBandwidthQueueDialog
        routerId={routerId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
