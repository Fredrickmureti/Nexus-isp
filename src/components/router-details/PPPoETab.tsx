import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Plus,
  MoreHorizontal,
  Activity,
  Clock,
  Wifi,
  UserCheck
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface PPPoESession {
  id: string;
  username: string;
  customer_name: string;
  ip_address: string;
  mac_address: string;
  session_id: string;
  interface: string;
  uptime: string;
  rx_bytes: number;
  tx_bytes: number;
  rx_packets: number;
  tx_packets: number;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  connect_time: string;
  last_disconnect?: string;
  caller_id?: string;
  service?: string;
}

interface PPPoETabProps {
  routerId: string;
}

// Mock data - replace with actual API call
const mockSessions: PPPoESession[] = [
  {
    id: "1",
    username: "customer001@isp.local",
    customer_name: "John Doe",
    ip_address: "100.64.1.10",
    mac_address: "aa:bb:cc:dd:ee:01",
    session_id: "0x1001",
    interface: "ether2",
    uptime: "2024-01-15T08:30:00Z",
    rx_bytes: 1073741824, // 1GB
    tx_bytes: 536870912,  // 512MB
    rx_packets: 750000,
    tx_packets: 500000,
    status: "connected",
    connect_time: "2024-01-15T08:30:00Z",
    caller_id: "aa:bb:cc:dd:ee:01",
    service: "internet"
  },
  {
    id: "2",
    username: "customer002@isp.local", 
    customer_name: "Jane Smith",
    ip_address: "100.64.1.11",
    mac_address: "aa:bb:cc:dd:ee:02",
    session_id: "0x1002",
    interface: "ether2",
    uptime: "2024-01-15T10:15:00Z",
    rx_bytes: 2147483648, // 2GB
    tx_bytes: 1073741824, // 1GB
    rx_packets: 1500000,
    tx_packets: 750000,
    status: "connected",
    connect_time: "2024-01-15T10:15:00Z",
    caller_id: "aa:bb:cc:dd:ee:02",
    service: "premium"
  },
  {
    id: "3",
    username: "customer003@isp.local",
    customer_name: "Bob Wilson", 
    ip_address: "",
    mac_address: "aa:bb:cc:dd:ee:03",
    session_id: "",
    interface: "",
    uptime: "",
    rx_bytes: 0,
    tx_bytes: 0,
    rx_packets: 0,
    tx_packets: 0,
    status: "disconnected",
    connect_time: "2024-01-15T09:00:00Z",
    last_disconnect: "2024-01-15T12:30:00Z",
    caller_id: "aa:bb:cc:dd:ee:03"
  },
  {
    id: "4",
    username: "customer004@isp.local",
    customer_name: "Alice Johnson",
    ip_address: "100.64.1.12",
    mac_address: "aa:bb:cc:dd:ee:04", 
    session_id: "0x1003",
    interface: "ether3",
    uptime: "2024-01-15T14:00:00Z",
    rx_bytes: 536870912, // 512MB
    tx_bytes: 268435456, // 256MB
    rx_packets: 400000,
    tx_packets: 200000,
    status: "connected",
    connect_time: "2024-01-15T14:00:00Z",
    caller_id: "aa:bb:cc:dd:ee:04",
    service: "basic"
  }
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStatusBadge(status: PPPoESession['status']) {
  switch (status) {
    case 'connected':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
    case 'disconnected':
      return <Badge variant="secondary">Disconnected</Badge>;
    case 'connecting':
      return <Badge variant="default">Connecting</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

function getUptime(connectTime: string): string {
  if (!connectTime) return 'N/A';
  const startTime = new Date(connectTime);
  return formatDistanceToNow(startTime, { addSuffix: false });
}

export function PPPoETab({ routerId }: PPPoETabProps) {
  const connectedSessions = mockSessions.filter(s => s.status === 'connected');
  const totalRxBytes = connectedSessions.reduce((acc, s) => acc + s.rx_bytes, 0);
  const totalTxBytes = connectedSessions.reduce((acc, s) => acc + s.tx_bytes, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{mockSessions.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">
                  {connectedSessions.length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Download</p>
                <p className="text-2xl font-bold">{formatBytes(totalRxBytes)}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Upload</p>
                <p className="text-2xl font-bold">{formatBytes(totalTxBytes)}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PPPoE Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>PPPoE Sessions</CardTitle>
              <CardDescription>
                Monitor and manage Point-to-Point Protocol over Ethernet connections
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                Refresh Sessions
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Force Connect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Session ID</TableHead>
                <TableHead>Interface</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>RX/TX</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-medium">{session.username}</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {session.mac_address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{session.customer_name}</div>
                    {session.caller_id && (
                      <div className="text-sm text-muted-foreground">
                        Caller ID: {session.caller_id}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell>
                    {session.ip_address ? (
                      <span className="font-mono">{session.ip_address}</span>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {session.session_id ? (
                      <span className="font-mono text-sm">{session.session_id}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {session.interface || (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">
                        {session.status === 'connected' 
                          ? getUptime(session.connect_time)
                          : 'Offline'
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>↓ {formatBytes(session.rx_bytes)}</div>
                      <div>↑ {formatBytes(session.tx_bytes)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.service ? (
                      <Badge variant="outline" className="capitalize">
                        {session.service}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Default</span>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Session Statistics</DropdownMenuItem>
                        <DropdownMenuItem>Reset Counters</DropdownMenuItem>
                        {session.status === 'connected' ? (
                          <DropdownMenuItem className="text-red-600">
                            Disconnect Session
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            Force Reconnect
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PPPoE Server Status */}
      <Card>
        <CardHeader>
          <CardTitle>PPPoE Server Status</CardTitle>
          <CardDescription>
            Server configuration and operational status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Server Configuration
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Name:</span>
                  <span>ISP-PPPoE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interface:</span>
                  <span>ether2,ether3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Sessions:</span>
                  <span>1000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authentication:</span>
                  <span>CHAP, PAP</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Session Limits
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Per User:</span>
                  <span>1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Idle Timeout:</span>
                  <span>30 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session Timeout:</span>
                  <span>24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Keepalive:</span>
                  <span>10 seconds</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Statistics
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Connects:</span>
                  <span>1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed Logins:</span>
                  <span>23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Session Time:</span>
                  <span>4.2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Server Uptime:</span>
                  <span>15 days</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}