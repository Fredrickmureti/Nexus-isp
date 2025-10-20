import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Plus, Edit, Trash2, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CreateFirewallRuleDialog } from "@/components/router-details/CreateFirewallRuleDialog";

const FirewallRules = () => {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: provider } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_providers")
        .select("id")
        .eq("owner_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: routers } = useQuery({
    queryKey: ["routers", provider?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routers")
        .select("*")
        .eq("provider_id", provider?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!provider?.id,
  });

  const { data: firewallRules, isLoading: rulesLoading, refetch: refetchRules } = useQuery({
    queryKey: ["firewall_rules", routers?.[0]?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("firewall_rules")
        .select(`
          *,
          routers (
            name,
            ip_address,
            status
          )
        `)
        .eq("router_id", routers?.[0]?.id)
        .order("position", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!routers?.[0]?.id,
  });

  // Mutation to sync firewall rules from router
  const syncRulesMutation = useMutation({
    mutationFn: async (routerId: string) => {
      const response = await supabase.functions.invoke('sync-firewall-rules', {
        body: { routerId }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["firewall_rules"] });
      toast.success(data?.message || "Firewall rules synced successfully");
    },
    onError: (error: Error) => {
      console.error('Error syncing firewall rules:', error);
      toast.error(`Failed to sync firewall rules: ${error.message}`);
    }
  });

  // Mutation to delete firewall rule
  const deleteRuleMutation = useMutation({
    mutationFn: async ({ routerId, ruleId }: { routerId: string; ruleId: string }) => {
      const response = await supabase.functions.invoke('configure-firewall', {
        body: { 
          routerId,
          action: 'delete',
          ruleData: { id: ruleId }
        }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["firewall_rules"] });
      toast.success("Firewall rule deleted successfully");
    },
    onError: (error: Error) => {
      console.error('Error deleting firewall rule:', error);
      toast.error(`Failed to delete firewall rule: ${error.message}`);
    }
  });

  const handleDeleteRule = async (rule: any) => {
    if (!routers?.[0]?.id) return;
    
    if (confirm(`Are you sure you want to delete this firewall rule?`)) {
      deleteRuleMutation.mutate({ 
        routerId: routers[0].id, 
        ruleId: rule.id 
      });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'accept':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'drop':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'reject':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'accept':
        return 'default';
      case 'drop':
        return 'destructive';
      case 'reject':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Firewall Rules</h1>
          </div>
          <p className="text-muted-foreground">Manage network security and traffic filtering</p>
        </div>

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Firewall Rules</TabsTrigger>
            <TabsTrigger value="chains">Rule Chains</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Active Firewall Rules</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => routers?.[0]?.id && syncRulesMutation.mutate(routers[0].id)}
                  disabled={!routers?.[0]?.id || rulesLoading || syncRulesMutation.isPending}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  {syncRulesMutation.isPending ? "Syncing..." : "Sync Rules"}
                </Button>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  disabled={!routers?.[0]?.id}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{firewallRules?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {firewallRules?.filter(r => r.enabled).length || 0} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accept Rules</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {firewallRules?.filter(r => r.action === 'accept').length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Allow traffic</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Drop Rules</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {firewallRules?.filter(r => r.action === 'drop').length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Block traffic</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reject Rules</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {firewallRules?.filter(r => r.action === 'reject').length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Reject with response</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead>Chain</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Port</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {firewallRules && firewallRules.length > 0 ? firewallRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.position || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.chain}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(rule.action)}
                            <Badge variant={getActionVariant(rule.action)}>
                              {rule.action}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{rule.src_address || 'any'}</TableCell>
                        <TableCell>{rule.dst_address || 'any'}</TableCell>
                        <TableCell>{rule.protocol || 'any'}</TableCell>
                        <TableCell>
                          {rule.src_port && rule.dst_port 
                            ? `${rule.src_port}→${rule.dst_port}` 
                            : rule.src_port || rule.dst_port || 'any'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                            {rule.enabled ? 'active' : 'inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toast.info("Edit functionality coming soon")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteRule(rule)}
                              disabled={deleteRuleMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          {rulesLoading ? 'Loading firewall rules...' : 'No firewall rules configured. Sync from router or create new ones.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chains" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rule Chains</CardTitle>
                <CardDescription>Firewall rule processing chains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Input Chain</CardTitle>
                      <CardDescription>Traffic destined for the router</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {firewallRules?.filter(r => r.chain === 'input').length || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">rules configured</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Forward Chain</CardTitle>
                      <CardDescription>Traffic passing through the router</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {firewallRules?.filter(r => r.chain === 'forward').length || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">rules configured</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Output Chain</CardTitle>
                      <CardDescription>Traffic originating from the router</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {firewallRules?.filter(r => r.chain === 'output').length || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">rules configured</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Firewall Statistics</CardTitle>
                <CardDescription>Real-time firewall statistics will be available once connected to router</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Firewall statistics are fetched in real-time from the router.</p>
                  <p className="text-sm mt-2">Ensure your router is online and synced to view statistics.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Firewall Rule Dialog */}
        {routers?.[0]?.id && (
          <CreateFirewallRuleDialog
            routerId={routers[0].id}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
        )}
      </div>
    </div>
  );
};

export default FirewallRules;