import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Activity, 
  Wifi, 
  Cable, 
  Radio,
  MoreHorizontal,
  ArrowUpDown,
  Signal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface Interface {
  id: string;
  name: string;
  type: 'ethernet' | 'wireless' | 'bridge' | 'vlan' | 'pppoe';
  status: 'running' | 'disabled' | 'error';
  ip_address?: string;
  mac_address: string;
  rx_bytes: number;
  tx_bytes: number;
  rx_packets: number;
  tx_packets: number;
  mtu: number;
  speed?: string;
  description?: string;
  last_link_up?: string;
  link_downs: number;
}

interface InterfacesTabProps {
  routerId: string;
}

// Mock data - replace with actual API call
const mockInterfaces: Interface[] = [
  {
    id: "1",
    name: "ether1",
    type: "ethernet",
    status: "running",
    ip_address: "192.168.1.1/24",
    mac_address: "00:11:22:33:44:55",
    rx_bytes: 1024000000,
    tx_bytes: 512000000,
    rx_packets: 500000,
    tx_packets: 250000,
    mtu: 1500,
    speed: "1Gbps",
    description: "WAN Interface",
    last_link_up: "2024-01-15T10:30:00Z",
    link_downs: 0
  },
  {
    id: "2", 
    name: "ether2",
    type: "ethernet",
    status: "running",
    ip_address: "10.0.1.1/24",
    mac_address: "00:11:22:33:44:56",
    rx_bytes: 2048000000,
    tx_bytes: 1024000000,
    rx_packets: 1000000,
    tx_packets: 500000,
    mtu: 1500,
    speed: "1Gbps",
    description: "LAN Interface",
    last_link_up: "2024-01-15T08:15:00Z",
    link_downs: 2
  },
  {
    id: "3",
    name: "wlan1",
    type: "wireless",
    status: "running",
    mac_address: "00:11:22:33:44:57",
    rx_bytes: 512000000,
    tx_bytes: 256000000,
    rx_packets: 250000,
    tx_packets: 125000,
    mtu: 1500,
    description: "Wireless 2.4GHz",
    last_link_up: "2024-01-15T09:00:00Z",
    link_downs: 1
  },
  {
    id: "4",
    name: "bridge1",
    type: "bridge",
    status: "running",
    ip_address: "172.16.1.1/24",
    mac_address: "00:11:22:33:44:58",
    rx_bytes: 3072000000,
    tx_bytes: 1536000000,
    rx_packets: 1500000,
    tx_packets: 750000,
    mtu: 1500,
    description: "Main Bridge",
    last_link_up: "2024-01-15T08:00:00Z",
    link_downs: 0
  }
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getInterfaceIcon(type: Interface['type']) {
  switch (type) {
    case 'ethernet':
      return <Cable className="h-4 w-4" />;
    case 'wireless':
      return <Wifi className="h-4 w-4" />;
    case 'bridge':
      return <Radio className="h-4 w-4" />;
    case 'vlan':
      return <Signal className="h-4 w-4" />;
    case 'pppoe':
      return <Activity className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getStatusBadge(status: Interface['status']) {
  switch (status) {
    case 'running':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Running</Badge>;
    case 'disabled':
      return <Badge variant="secondary">Disabled</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

export function InterfacesTab({ routerId }: InterfacesTabProps) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Interfaces</p>
                <p className="text-2xl font-bold">{mockInterfaces.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockInterfaces.filter(i => i.status === 'running').length}
                </p>
              </div>
              <Signal className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total RX</p>
                <p className="text-2xl font-bold">
                  {formatBytes(mockInterfaces.reduce((acc, i) => acc + i.rx_bytes, 0))}
                </p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total TX</p>
                <p className="text-2xl font-bold">
                  {formatBytes(mockInterfaces.reduce((acc, i) => acc + i.tx_bytes, 0))}
                </p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interfaces Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Network Interfaces</CardTitle>
              <CardDescription>
                Manage and monitor all network interfaces on this router
              </CardDescription>
            </div>
            <Button>
              Configure Interface
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interface</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>RX/TX</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Link Downs</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInterfaces.map((iface) => (
                <TableRow key={iface.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getInterfaceIcon(iface.type)}
                      <div>
                        <div className="font-medium">{iface.name}</div>
                        {iface.description && (
                          <div className="text-sm text-muted-foreground">
                            {iface.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{iface.type}</TableCell>
                  <TableCell>{getStatusBadge(iface.status)}</TableCell>
                  <TableCell>
                    {iface.ip_address || (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{iface.mac_address}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>↓ {formatBytes(iface.rx_bytes)}</div>
                      <div>↑ {formatBytes(iface.tx_bytes)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {iface.speed || (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={iface.link_downs > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                      {iface.link_downs}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Configure</DropdownMenuItem>
                        <DropdownMenuItem>Reset Statistics</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {iface.status === 'running' ? (
                          <DropdownMenuItem>Disable</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>Enable</DropdownMenuItem>
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
    </div>
  );
}