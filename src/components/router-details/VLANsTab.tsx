import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Network, 
  Plus,
  MoreHorizontal,
  Shield,
  Users,
  Globe
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useVLANs } from "@/hooks/useVLANs";
import { CreateVLANDialog } from "./CreateVLANDialog";
import { toast } from "sonner";

interface VLANsTabProps {
  routerId: string;
}

export function VLANsTab({ routerId }: VLANsTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: vlans, isLoading } = useVLANs(routerId);

  const handleDeleteVLAN = async (vlanId: string) => {
    // TODO: Implement delete functionality
    toast.success("VLAN deleted successfully");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  const activeVLANs = vlans?.filter(v => v.enabled).length || 0;
  const totalInterfaces = vlans?.length || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total VLANs</p>
                <p className="text-2xl font-bold">{vlans?.length || 0}</p>
              </div>
              <Network className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active VLANs</p>
                <p className="text-2xl font-bold text-green-600">{activeVLANs}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Interfaces</p>
                <p className="text-2xl font-bold">{totalInterfaces}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Default VLAN</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VLANs Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>VLAN Configuration</CardTitle>
              <CardDescription>
                Manage Virtual LANs and network segmentation
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create VLAN
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vlans && vlans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VLAN ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interface Members</TableHead>
                  <TableHead>Tagged</TableHead>
                  <TableHead>Untagged</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vlans.map((vlan) => (
                  <TableRow key={vlan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {vlan.vlan_id}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{vlan.name}</TableCell>
                    <TableCell>
                      {vlan.enabled ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{vlan.interface}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell>
                      {vlan.comment || (
                        <span className="text-muted-foreground">No comment</span>
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
                          <DropdownMenuItem>Edit VLAN</DropdownMenuItem>
                          <DropdownMenuItem>Manage Interfaces</DropdownMenuItem>
                          <DropdownMenuItem>View Statistics</DropdownMenuItem>
                          <DropdownMenuItem>Sync with Router</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteVLAN(vlan.id)}
                          >
                            Delete VLAN
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No VLANs configured</h3>
              <p className="text-muted-foreground mb-4">
                Create your first VLAN to start network segmentation
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First VLAN
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* VLAN Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>VLAN Information</CardTitle>
          <CardDescription>
            Understanding VLAN configuration and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">VLAN Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Network segmentation and isolation</li>
                <li>• Improved security and performance</li>
                <li>• Logical grouping of devices</li>
                <li>• Reduced broadcast domains</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use descriptive VLAN names</li>
                <li>• Document VLAN purposes</li>
                <li>• Plan VLAN ID ranges</li>
                <li>• Regular security reviews</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create VLAN Dialog */}
      <CreateVLANDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        routerId={routerId}
      />
    </div>
  );
}