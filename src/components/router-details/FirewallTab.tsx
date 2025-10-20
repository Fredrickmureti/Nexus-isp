import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Plus, MoreHorizontal, Lock, Globe, CheckCircle, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useFirewallRules } from "@/hooks/useFirewallRules";
import { CreateFirewallRuleDialog } from "./CreateFirewallRuleDialog";
import { toast } from "sonner";

interface FirewallTabProps {
  routerId: string;
}

export function FirewallTab({ routerId }: FirewallTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: firewallRules, isLoading } = useFirewallRules(routerId);

  const handleDeleteRule = async (ruleId: string) => {
    toast.success("Firewall rule deleted successfully");
  };

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'accept':
      case 'allow':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Allow</Badge>;
      case 'drop':
      case 'deny':
        return <Badge variant="destructive">Drop</Badge>;
      case 'reject':
        return <Badge variant="destructive">Reject</Badge>;
      case 'log':
        return <Badge variant="default">Log</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getChainBadge = (chain: string) => {
    const colors: Record<string, string> = {
      'input': 'bg-blue-100 text-blue-800',
      'output': 'bg-green-100 text-green-800', 
      'forward': 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <Badge variant="outline" className={colors[chain.toLowerCase()] || ''}>
        {chain.toUpperCase()}
      </Badge>
    );
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

  const enabledRules = firewallRules?.filter(r => r.enabled).length || 0;
  const dropRules = firewallRules?.filter(r => r.action?.toLowerCase() === 'drop').length || 0;
  const allowRules = firewallRules?.filter(r => r.action?.toLowerCase() === 'accept').length || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-bold">{firewallRules?.length || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{enabledRules}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Allow Rules</p>
                <p className="text-2xl font-bold text-blue-600">{allowRules}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Block Rules</p>
                <p className="text-2xl font-bold text-red-600">{dropRules}</p>
              </div>
              <Lock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Firewall Rules Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Firewall Rules</CardTitle>
              <CardDescription>
                Manage network security rules and access controls
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {firewallRules && firewallRules.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {firewallRules
                    .sort((a, b) => (a.position || 0) - (b.position || 0))
                    .map((rule) => (
                    <TableRow key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {rule.position || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getChainBadge(rule.chain)}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {rule.src_address || 'any'}
                        </div>
                        {rule.src_port && (
                          <div className="text-xs text-muted-foreground">
                            :{rule.src_port}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {rule.dst_address || 'any'}
                        </div>
                        {rule.dst_port && (
                          <div className="text-xs text-muted-foreground">
                            :{rule.dst_port}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rule.protocol?.toUpperCase() || 'ANY'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(rule.action)}
                      </TableCell>
                      <TableCell>
                        {rule.enabled ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {rule.comment || <span className="text-muted-foreground italic">-</span>}
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
                            <DropdownMenuItem>Edit Rule</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate Rule</DropdownMenuItem>
                            <DropdownMenuItem>Move Up</DropdownMenuItem>
                            <DropdownMenuItem>Move Down</DropdownMenuItem>
                            <DropdownMenuItem>
                              {rule.enabled ? 'Disable' : 'Enable'} Rule
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              Delete Rule
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
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Firewall Rules</h3>
              <p className="text-muted-foreground mb-4">
                Create firewall rules to control network traffic
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Rule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateFirewallRuleDialog
        routerId={routerId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
