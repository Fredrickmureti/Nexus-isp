import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, Plus, Edit, Trash2, Router, Users, Settings, Activity } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreateVLANDialog } from "@/components/router-details/CreateVLANDialog";
import { toast } from "sonner";

const VLANConfiguration = () => {
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

  const { data: vlans, isLoading: vlansLoading, refetch: refetchVlans } = useQuery({
    queryKey: ["vlans", provider?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vlans")
        .select(`
          *,
          routers (
            name,
            ip_address,
            status
          )
        `)
        .eq("router_id", routers?.[0]?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!provider?.id && !!routers?.[0]?.id,
  });

  const { data: networkSettings, isLoading: settingsLoading, refetch: refetchSettings } = useQuery({
    queryKey: ["network_settings", routers?.[0]?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("network_settings")
        .select("*")
        .eq("router_id", routers?.[0]?.id)
        .eq("setting_type", "vlan");
      if (error) throw error;
      return data || [];
    },
    enabled: !!routers?.[0]?.id,
  });

  // Mutation to sync VLANs from router
  const syncVlansMutation = useMutation({
    mutationFn: async (routerId: string) => {
      const response = await supabase.functions.invoke('sync-vlans', {
        body: { routerId }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vlans"] });
      toast.success(data?.message || "VLANs synced successfully");
    },
    onError: (error: Error) => {
      console.error('Error syncing VLANs:', error);
      toast.error(`Failed to sync VLANs: ${error.message}`);
    }
  });

  // Mutation to delete VLAN
  const deleteVlanMutation = useMutation({
    mutationFn: async ({ routerId, vlanId }: { routerId: string; vlanId: string }) => {
      const response = await supabase.functions.invoke('configure-vlan', {
        body: { 
          routerId,
          action: 'delete',
          vlanData: { id: vlanId }
        }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vlans"] });
      toast.success("VLAN deleted successfully");
    },
    onError: (error: Error) => {
      console.error('Error deleting VLAN:', error);
      toast.error(`Failed to delete VLAN: ${error.message}`);
    }
  });

  const handleDeleteVlan = async (vlan: any) => {
    if (!routers?.[0]?.id) return;
    
    if (confirm(`Are you sure you want to delete VLAN "${vlan.name}"?`)) {
      deleteVlanMutation.mutate({ 
        routerId: routers[0].id, 
        vlanId: vlan.id 
      });
    }
  };

  // Mutation to update network settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const promises = Object.entries(settingsData).map(([key, value]) => {
        return supabase
          .from("network_settings")
          .upsert({
            provider_id: provider?.id,
            router_id: routers?.[0]?.id,
            setting_type: "vlan",
            setting_key: key,
            setting_value: value,
            updated_at: new Date().toISOString()
          } as any);
      });
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update settings: ${errors[0].error?.message}`);
      }
    },
    onSuccess: () => {
      refetchSettings();
      toast.success("Network settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  const getSettingValue = (key: string, defaultValue: any) => {
    const setting = networkSettings?.find(s => s.setting_key === key);
    return setting?.setting_value || defaultValue;
  };

  const handleUpdateSettings = () => {
    if (!routers?.[0]?.id) return;
    
    // For now, we'll update with the current values
    // In a real implementation, you'd have form inputs for these
    const newSettings = {
      default_range: { min: 100, max: 4000 },
      management_vlan: { vlan_id: 100, network: "192.168.100.0/24" },
      inter_vlan_routing: { enabled: true },
      tagging_protocol: { protocol: "IEEE 802.1Q" }
    };
    
    updateSettingsMutation.mutate(newSettings);
  };

  if (vlansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">VLAN Configuration</h1>
          </div>
          <p className="text-muted-foreground">Manage virtual local area networks across your routers</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vlans">Manage VLANs</TabsTrigger>
            <TabsTrigger value="settings">VLAN Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total VLANs</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vlans?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {vlans?.filter(v => v.enabled).length || 0} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Connected Routers</CardTitle>
                  <Router className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{routers?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {routers?.filter(r => r.status === 'online').length || 0} online
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network Segments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Isolated networks</p>
                </CardContent>
              </Card>
            </div>

            {/* VLAN Summary */}
            <Card>
              <CardHeader>
                <CardTitle>VLAN Summary</CardTitle>
                <CardDescription>Overview of your VLAN configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>VLAN ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Router</TableHead>
                      <TableHead>IP Range</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vlans && vlans.length > 0 ? vlans.map((vlan) => (
                      <TableRow key={vlan.id}>
                        <TableCell className="font-medium">{vlan.vlan_id}</TableCell>
                        <TableCell>{vlan.name}</TableCell>
                        <TableCell>{vlan.routers?.name || 'Unknown'}</TableCell>
                        <TableCell>{vlan.interface || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={vlan.enabled ? 'default' : 'secondary'}>
                            {vlan.enabled ? 'active' : 'inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          {vlansLoading ? 'Loading VLANs...' : 'No VLANs found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vlans" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">VLAN Management</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => routers?.[0]?.id && syncVlansMutation.mutate(routers[0].id)}
                  disabled={!routers?.[0]?.id || vlansLoading || syncVlansMutation.isPending}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  {syncVlansMutation.isPending ? "Syncing..." : "Sync from Router"}
                </Button>
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  disabled={!routers?.[0]?.id}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create VLAN
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>VLAN ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Interface</TableHead>
                      <TableHead>Router</TableHead>
                      <TableHead>IP Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vlans && vlans.length > 0 ? vlans.map((vlan) => (
                      <TableRow key={vlan.id}>
                        <TableCell className="font-medium">{vlan.vlan_id}</TableCell>
                        <TableCell>{vlan.name}</TableCell>
                        <TableCell>{vlan.comment || 'No description'}</TableCell>
                        <TableCell>{vlan.interface}</TableCell>
                        <TableCell>{vlan.routers?.name || 'Unknown'}</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>
                          <Badge variant={vlan.enabled ? 'default' : 'secondary'}>
                            {vlan.enabled ? 'active' : 'inactive'}
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
                              onClick={() => handleDeleteVlan(vlan)}
                              disabled={deleteVlanMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          {vlansLoading ? 'Loading VLANs...' : 'No VLANs configured. Sync from router or create new ones.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  VLAN Configuration Settings
                </CardTitle>
                <CardDescription>Global VLAN settings for your network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium">Default VLAN Range</h4>
                        <p className="text-sm text-muted-foreground">
                          VLAN IDs: {getSettingValue('default_range', { min: 100, max: 4000 }).min}-{getSettingValue('default_range', { min: 100, max: 4000 }).max}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Management VLAN</h4>
                        <p className="text-sm text-muted-foreground">
                          VLAN {getSettingValue('management_vlan', { vlan_id: 100, network: "192.168.100.0/24" }).vlan_id} ({getSettingValue('management_vlan', { vlan_id: 100, network: "192.168.100.0/24" }).network})
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Inter-VLAN Routing</h4>
                        <p className="text-sm text-muted-foreground">
                          {getSettingValue('inter_vlan_routing', { enabled: true }).enabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">VLAN Tagging</h4>
                        <p className="text-sm text-muted-foreground">
                          {getSettingValue('tagging_protocol', { protocol: "IEEE 802.1Q" }).protocol}
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="mt-4"
                      onClick={handleUpdateSettings}
                      disabled={updateSettingsMutation.isPending || !routers?.[0]?.id}
                    >
                      {updateSettingsMutation.isPending ? "Updating..." : "Update Settings"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create VLAN Dialog */}
        {routers?.[0]?.id && (
          <CreateVLANDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            routerId={routers[0].id}
          />
        )}
      </div>
    </div>
  );
};

export default VLANConfiguration;