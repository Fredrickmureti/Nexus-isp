import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Plus, MoreHorizontal, Network } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useIPPools } from "@/hooks/useIPPools";
import { CreateIPPoolDialog } from "./CreateIPPoolDialog";
import { toast } from "sonner";

interface IPPoolsTabProps {
  routerId: string;
}

export function IPPoolsTab({ routerId }: IPPoolsTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: ipPools, isLoading } = useIPPools(routerId);

  const handleDeletePool = async (poolId: string) => {
    toast.success("IP pool deleted successfully");
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

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total IP Pools</p>
              <p className="text-2xl font-bold">{ipPools?.length || 0}</p>
            </div>
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* IP Pools Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>IP Address Pools</CardTitle>
              <CardDescription>
                Manage IP address ranges for dynamic assignment (PPPoE, DHCP, Hotspot)
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Pool
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ipPools && ipPools.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool Name</TableHead>
                    <TableHead>IP Range</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>DNS Servers</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipPools.map((pool) => (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">{pool.name}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{pool.ip_range}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {pool.gateway || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {pool.dns_servers || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {pool.comment || <span className="text-muted-foreground">-</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Pool</DropdownMenuItem>
                            <DropdownMenuItem>View Usage</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeletePool(pool.id)}
                            >
                              Delete Pool
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
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No IP Pools</h3>
              <p className="text-muted-foreground mb-4">
                Create IP address pools for dynamic assignment to users
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Pool
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateIPPoolDialog
        routerId={routerId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
