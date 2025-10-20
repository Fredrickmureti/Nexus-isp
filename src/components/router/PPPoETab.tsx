import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Users, Activity } from "lucide-react";
import { usePPPoESessions, useSyncPPPoESessions } from "@/hooks/useRouterSync";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PPPoETabProps {
  routerId: string;
}

export default function PPPoETab({ routerId }: PPPoETabProps) {
  const { data: sessions, isLoading } = usePPPoESessions(routerId);
  const syncSessions = useSyncPPPoESessions();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">PPPoE Sessions</h2>
        <Button
          variant="outline"
          onClick={() => syncSessions.mutate(routerId)}
          disabled={syncSessions.isPending}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncSessions.isPending ? 'animate-spin' : ''}`} />
          Sync Sessions
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Download</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(sessions?.reduce((sum, s) => sum + (s.rx_bytes || 0), 0) || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Upload</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(sessions?.reduce((sum, s) => sum + (s.tx_bytes || 0), 0) || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {!sessions || sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active PPPoE sessions</p>
            <p className="text-sm text-muted-foreground mt-2">
              Sessions will appear here when customers connect
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Download</TableHead>
                  <TableHead>Upload</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.username}</TableCell>
                    <TableCell>
                      {session.customers?.full_name || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{session.address || "-"}</TableCell>
                    <TableCell>{session.uptime || "-"}</TableCell>
                    <TableCell>{formatBytes(session.rx_bytes || 0)}</TableCell>
                    <TableCell>{formatBytes(session.tx_bytes || 0)}</TableCell>
                    <TableCell>
                      <Badge variant="default">{session.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
