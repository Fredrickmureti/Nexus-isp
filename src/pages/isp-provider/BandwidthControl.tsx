import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gauge, Plus, Edit, Trash2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CreateBandwidthQueueDialog } from "@/components/router-details/CreateBandwidthQueueDialog";

const BandwidthControl = () => {
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

  const { data: bandwidthQueues, isLoading: queuesLoading, refetch: refetchQueues } = useQuery({
    queryKey: ["bandwidth_queues", routers?.[0]?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bandwidth_queues")
        .select(`
          *,
          routers (
            name,
            ip_address,
            status
          ),
          customers (
            full_name,
            email
          )
        `)
        .eq("router_id", routers?.[0]?.id)
        .order("priority", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!routers?.[0]?.id,
  });

  // Real-time router statistics
  const { data: routerStats, isLoading: statsLoading } = useQuery({
    queryKey: ["router_stats", routers?.[0]?.id],
    queryFn: async () => {
      const response = await supabase.functions.invoke('get-router-stats', {
        body: { routerId: routers?.[0]?.id }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!routers?.[0]?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation to sync bandwidth queues from router
  const syncQueuesMutation = useMutation({
    mutationFn: async (routerId: string) => {
      const response = await supabase.functions.invoke('sync-bandwidth-queues', {
        body: { routerId }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth_queues"] });
      toast.success(data?.message || "Bandwidth queues synced successfully");
    },
    onError: (error: Error) => {
      console.error('Error syncing bandwidth queues:', error);
      toast.error(`Failed to sync bandwidth queues: ${error.message}`);
    }
  });

  // Mutation to delete bandwidth queue
  const deleteQueueMutation = useMutation({
    mutationFn: async ({ routerId, queueId }: { routerId: string; queueId: string }) => {
      const response = await supabase.functions.invoke('configure-bandwidth', {
        body: { 
          routerId,
          action: 'delete',
          queueData: { id: queueId }
        }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth_queues"] });
      toast.success("Bandwidth queue deleted successfully");
    },
    onError: (error: Error) => {
      console.error('Error deleting bandwidth queue:', error);
      toast.error(`Failed to delete bandwidth queue: ${error.message}`);
    }
  });

  const handleDeleteQueue = async (queue: any) => {
    if (!routers?.[0]?.id) return;
    
    if (confirm(`Are you sure you want to delete bandwidth queue "${queue.name}"?`)) {
      deleteQueueMutation.mutate({ 
        routerId: routers[0].id, 
        queueId: queue.id 
      });
    }
  };

  // Get real queue usage from router statistics
  const getQueueUsage = (queueName: string) => {
    if (!routerStats?.statistics?.queues) return 0;
    const queueStat = routerStats.statistics.queues.find((q: any) => q.name === queueName);
    return queueStat?.usage || 0;
  };

  // Format bandwidth from bytes/Kbps to readable format
  const formatBandwidth = (kbps: number) => {
    if (kbps >= 1000000) return `${Math.round(kbps / 1000000)}G`;
    if (kbps >= 1000) return `${Math.round(kbps / 1000)}M`;
    return `${kbps}K`;
  };

  // Get real traffic statistics from router
  const trafficStats = routerStats?.statistics?.traffic || {
    totalBandwidth: 1000,
    usedBandwidth: 0,
    peakUsage: 0,
    averageUsage: 0
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return "bg-red-500";
    if (usage >= 70) return "bg-orange-500";
    if (usage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPriorityBadge = (priority: number): "default" | "secondary" | "outline" | "destructive" => {
    const colors: Record<number, "default" | "secondary" | "outline" | "destructive"> = {
      1: "default",
      2: "secondary", 
      3: "outline",
      4: "destructive"
    };
    return colors[priority] || "outline";
  };

  if (queuesLoading) {
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
            <Gauge className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Bandwidth Control</h1>
          </div>
          <p className="text-muted-foreground">Manage traffic shaping and quality of service</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queues">Queue Management</TabsTrigger>
            <TabsTrigger value="shaping">Traffic Shaping</TabsTrigger>
            <TabsTrigger value="monitoring">Real-time Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Traffic Overview Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bandwidth</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-2xl font-bold">Loading...</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{trafficStats.totalBandwidth} Mbps</div>
                      <p className="text-xs text-muted-foreground">Available capacity</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Usage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-2xl font-bold">Loading...</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{trafficStats.usedBandwidth} Mbps</div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((trafficStats.usedBandwidth / trafficStats.totalBandwidth) * 100)}% of capacity
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peak Usage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-2xl font-bold">Loading...</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{trafficStats.peakUsage} Mbps</div>
                      <p className="text-xs text-muted-foreground">24h peak</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Queues</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bandwidthQueues?.filter(q => q.enabled).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of {bandwidthQueues?.length || 0} total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bandwidth Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Bandwidth Utilization</CardTitle>
                <CardDescription>Current bandwidth usage by customer tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bandwidthQueues && bandwidthQueues.length > 0 ? bandwidthQueues.filter(q => q.enabled).map((queue) => {
                    const usage = getQueueUsage(queue.name);
                    return (
                      <div key={queue.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{queue.name}</span>
                          <span>{statsLoading ? '...' : `${Math.round(usage)}%`}</span>
                        </div>
                        <Progress 
                          value={usage} 
                          className={`h-2 ${getUsageColor(usage)}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{queue.target}</span>
                          <span>↑ {formatBandwidth(queue.max_upload)} / ↓ {formatBandwidth(queue.max_download)}</span>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center text-muted-foreground py-4">
                      {queuesLoading ? 'Loading bandwidth queues...' : 'No active bandwidth queues found.'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queues" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Queue Management</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => routers?.[0]?.id && syncQueuesMutation.mutate(routers[0].id)}
                  disabled={!routers?.[0]?.id || queuesLoading || syncQueuesMutation.isPending}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  {syncQueuesMutation.isPending ? "Syncing..." : "Sync Queues"}
                </Button>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  disabled={!routers?.[0]?.id}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Queue
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Max Upload</TableHead>
                      <TableHead>Max Download</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bandwidthQueues && bandwidthQueues.length > 0 ? bandwidthQueues.map((queue) => {
                      return (
                        <TableRow key={queue.id}>
                          <TableCell className="font-medium">{queue.name}</TableCell>
                          <TableCell>{queue.target}</TableCell>
                          <TableCell>{formatBandwidth(queue.max_upload)}</TableCell>
                          <TableCell>{formatBandwidth(queue.max_download)}</TableCell>
                          <TableCell>
                            <Badge variant={getPriorityBadge(queue.priority)}>
                              P{queue.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{queue.customers?.full_name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={queue.enabled ? 'default' : 'secondary'}>
                              {queue.enabled ? 'active' : 'inactive'}
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
                                onClick={() => handleDeleteQueue(queue)}
                                disabled={deleteQueueMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          {queuesLoading ? 'Loading bandwidth queues...' : 'No bandwidth queues configured. Sync from router or create new ones.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shaping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Shaping Rules</CardTitle>
                <CardDescription>Configure bandwidth allocation and QoS policies</CardDescription>
              </CardHeader>
              <CardContent>
                {queuesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-medium">Upload Policies</h4>
                      <div className="space-y-2">
                        {bandwidthQueues && bandwidthQueues.length > 0 ? 
                          [...new Set(bandwidthQueues.map(q => q.priority))].sort().map(priority => {
                            const queuesWithPriority = bandwidthQueues.filter(q => q.priority === priority);
                            const avgUpload = queuesWithPriority.reduce((sum, q) => sum + (q.max_upload || 0), 0) / queuesWithPriority.length;
                            return (
                              <div key={`upload-${priority}`} className="flex justify-between p-3 border rounded">
                                <span>Priority {priority} ({formatBandwidth(avgUpload)} avg)</span>
                                <Badge variant={getPriorityBadge(priority)}>Priority {priority}</Badge>
                              </div>
                            );
                          })
                        : (
                          <div className="text-center text-muted-foreground p-4">
                            No bandwidth policies configured
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Download Policies</h4>
                      <div className="space-y-2">
                        {bandwidthQueues && bandwidthQueues.length > 0 ? 
                          [...new Set(bandwidthQueues.map(q => q.priority))].sort().map(priority => {
                            const queuesWithPriority = bandwidthQueues.filter(q => q.priority === priority);
                            const avgDownload = queuesWithPriority.reduce((sum, q) => sum + (q.max_download || 0), 0) / queuesWithPriority.length;
                            return (
                              <div key={`download-${priority}`} className="flex justify-between p-3 border rounded">
                                <span>Priority {priority} ({formatBandwidth(avgDownload)} avg)</span>
                                <Badge variant={getPriorityBadge(priority)}>Priority {priority}</Badge>
                              </div>
                            );
                          })
                        : (
                          <div className="text-center text-muted-foreground p-4">
                            No bandwidth policies configured
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Real-time Monitoring</h2>
                <p className="text-muted-foreground">Live network statistics updated every 30 seconds</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["router_stats"] })}
                disabled={statsLoading}
              >
                <Activity className="mr-2 h-4 w-4" />
                {statsLoading ? "Refreshing..." : "Refresh Now"}
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Traffic Statistics</CardTitle>
                <CardDescription>Real-time bandwidth usage and queue performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-4">Queue Statistics</h4>
                    <div className="space-y-3">
                      {bandwidthQueues && bandwidthQueues.length > 0 ? bandwidthQueues.filter(q => q.enabled).map((queue) => {
                        const usage = getQueueUsage(queue.name);
                        return (
                          <div key={queue.id} className="p-3 border rounded">
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">{queue.name}</span>
                              <span className="text-sm">{statsLoading ? '...' : `${Math.round(usage)}%`}</span>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Target: {queue.target}</div>
                              <div>Priority: {queue.priority}</div>
                              <div>Customer: {queue.customers?.full_name || 'Global'}</div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="text-center text-muted-foreground py-4">
                          No active queues
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Network Performance</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Total Throughput</span>
                          <span>{statsLoading ? 'Loading...' : `${trafficStats.usedBandwidth} Mbps`}</span>
                        </div>
                        <Progress 
                          value={statsLoading ? 0 : (trafficStats.usedBandwidth / trafficStats.totalBandwidth) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      {statsLoading ? (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Latency</div>
                            <div className="font-medium">Loading...</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Packet Loss</div>
                            <div className="font-medium">Loading...</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Jitter</div>
                            <div className="font-medium">Loading...</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Connections</div>
                            <div className="font-medium">Loading...</div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Latency</div>
                            <div className="font-medium">{Math.round(routerStats?.statistics?.performance?.latency || 0)}ms</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Packet Loss</div>
                            <div className="font-medium">{(routerStats?.statistics?.performance?.packetLoss || 0).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Jitter</div>
                            <div className="font-medium">{Math.round(routerStats?.statistics?.performance?.jitter || 0)}ms</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Connections</div>
                            <div className="font-medium">{routerStats?.statistics?.performance?.connections || 0}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interface Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Interface Statistics</CardTitle>
                <CardDescription>Real-time interface traffic and status</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {routerStats?.statistics?.interfaces?.length > 0 ? 
                      routerStats.statistics.interfaces.map((iface: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">{iface.name}</h4>
                            <Badge variant={iface.running && !iface.disabled ? "default" : "secondary"}>
                              {iface.running && !iface.disabled ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Type:</span>
                              <span>{iface.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">RX Bytes:</span>
                              <span>{formatBandwidth(Math.round(iface.rxBytes / 1024))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">TX Bytes:</span>
                              <span>{formatBandwidth(Math.round(iface.txBytes / 1024))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Packets:</span>
                              <span>↓{iface.rxPackets} ↑{iface.txPackets}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    : (
                      <div className="col-span-full text-center text-muted-foreground py-8">
                        No interface data available
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Router system status and resource usage</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-medium">System Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <span>{routerStats?.statistics?.system?.version || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Architecture:</span>
                          <span>{routerStats?.statistics?.system?.architecture || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span>{routerStats?.statistics?.system?.uptime || '0s'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span>{routerStats?.timestamp ? new Date(routerStats.timestamp).toLocaleTimeString() : 'Never'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Resource Usage</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CPU Load:</span>
                          <span>{routerStats?.statistics?.system?.cpu || '0%'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Memory:</span>
                          <span>{routerStats?.statistics?.system?.memory || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Queues:</span>
                          <span>{routerStats?.statistics?.queues?.filter((q: any) => q.enabled)?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Connections:</span>
                          <span>{routerStats?.statistics?.performance?.connections || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Bandwidth Queue Dialog */}
        {routers?.[0]?.id && (
          <CreateBandwidthQueueDialog
            routerId={routers[0].id}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
        )}
      </div>
    </div>
  );
};

export default BandwidthControl;
