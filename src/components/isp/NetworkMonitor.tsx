import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { useDisconnectCustomer } from "@/hooks/useRouterControl";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Power } from "lucide-react";

export const NetworkMonitor = () => {
  const { user } = useAuth();
  const disconnectMutation = useDisconnectCustomer();

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

  const { data: networkStats, isLoading } = useNetworkStats(provider?.id);

  const handleDisconnect = (customerId: string, routerId: string) => {
    disconnectMutation.mutate({ customerId, routerId });
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Online Users</p>
          <p className="text-3xl font-bold text-success">{networkStats?.onlineUsers || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Offline Users</p>
          <p className="text-3xl font-bold text-muted-foreground">{networkStats?.offlineUsers || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Traffic (24h)</p>
          <p className="text-3xl font-bold">{((networkStats?.totalTraffic || 0) / 1024).toFixed(2)} GB</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">24-Hour Bandwidth Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={networkStats?.chartData || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="time" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="usage" 
              stroke="hsl(var(--accent))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--accent))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Active Connections</h3>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {networkStats?.activeSessions?.map((session: any) => (
                <TableRow key={session.id}>
                  <TableCell>{session.customers?.full_name || 'Unknown'}</TableCell>
                  <TableCell>{session.ip_address || 'N/A'}</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>
                    <Badge variant="default">{session.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {((Number(session.data_uploaded_mb) + Number(session.data_downloaded_mb)) / 1024).toFixed(2)} GB
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDisconnect(session.customer_id, session.router_id)}
                      disabled={disconnectMutation.isPending}
                    >
                      <Power className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
