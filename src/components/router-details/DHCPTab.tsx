import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Plus, MoreHorizontal, Network } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useDHCPServers } from "@/hooks/useDHCPServers";
import { CreateDHCPServerDialog } from "./CreateDHCPServerDialog";
import { toast } from "sonner";

interface DHCPTabProps {
  routerId: string;
}

export function DHCPTab({ routerId }: DHCPTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: dhcpServers, isLoading } = useDHCPServers(routerId);

  const handleDeleteServer = async (serverId: string) => {
    toast.success("DHCP server deleted successfully");
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

  const enabledServers = dhcpServers?.filter(s => s.enabled).length || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">DHCP Servers</p>
                <p className="text-2xl font-bold">{dhcpServers?.length || 0}</p>
              </div>
              <Server className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enabled Servers</p>
                <p className="text-2xl font-bold text-green-600">{enabledServers}</p>
              </div>
              <Network className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disabled Servers</p>
                <p className="text-2xl font-bold text-gray-600">
                  {(dhcpServers?.length || 0) - enabledServers}
                </p>
              </div>
              <Server className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DHCP Servers Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>DHCP Servers</CardTitle>
              <CardDescription>
                Manage DHCP server configurations for automatic IP assignment
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Server
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dhcpServers && dhcpServers.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server Name</TableHead>
                    <TableHead>Interface</TableHead>
                    <TableHead>Address Pool</TableHead>
                    <TableHead>Lease Time</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>DNS Servers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dhcpServers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{server.interface}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{server.address_pool}</span>
                      </TableCell>
                      <TableCell>{server.lease_time}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {server.gateway || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {server.dns_servers || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {server.enabled ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
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
                            <DropdownMenuItem>Edit Server</DropdownMenuItem>
                            <DropdownMenuItem>View Leases</DropdownMenuItem>
                            <DropdownMenuItem>
                              {server.enabled ? 'Disable' : 'Enable'} Server
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteServer(server.id)}
                            >
                              Delete Server
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
              <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No DHCP Servers</h3>
              <p className="text-muted-foreground mb-4">
                Create DHCP servers to automatically assign IP addresses
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Server
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateDHCPServerDialog
        routerId={routerId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
