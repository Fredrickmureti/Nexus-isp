import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useDHCPServers } from "@/hooks/useDHCPServers";
import { toast } from "sonner";

interface CreateDHCPServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routerId: string;
}

export function CreateDHCPServerDialog({ open, onOpenChange, routerId }: CreateDHCPServerDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    interface_name: "",
    address_pool: "",
    gateway_address: "",
    dns_servers: ["8.8.8.8", "8.8.4.4"],
    lease_time: "24h",
    status: "enabled",
    description: ""
  });

  const availableInterfaces = [
    "ether1", "ether2", "ether3", "ether4", "ether5",
    "bridge1", "wlan1", "wlan2", "vlan10", "vlan20"
  ];

  const commonLeaseTime = [
    { value: "30m", label: "30 minutes" },
    { value: "1h", label: "1 hour" },
    { value: "3h", label: "3 hours" },
    { value: "12h", label: "12 hours" },
    { value: "24h", label: "24 hours" },
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" }
  ];

  const validateIPAddress = (ip: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const validateIPRange = (range: string): boolean => {
    // Accept formats like: 192.168.1.100-192.168.1.200 or 192.168.1.0/24
    const rangeRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[-\/](?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
    return rangeRegex.test(range);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.interface_name || !formData.address_pool) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateIPRange(formData.address_pool)) {
      toast.error("Invalid address pool format. Use format like '192.168.1.100-192.168.1.200' or '192.168.1.0/24'");
      return;
    }

    if (formData.gateway_address && !validateIPAddress(formData.gateway_address)) {
      toast.error("Invalid gateway address format");
      return;
    }

    // Validate DNS servers
    const invalidDNS = formData.dns_servers.some(dns => dns && !validateIPAddress(dns));
    if (invalidDNS) {
      toast.error("One or more DNS server addresses are invalid");
      return;
    }

    try {
      // TODO: Implement edge function to create DHCP server on MikroTik
      toast.success("DHCP server will be created via edge function (to be implemented)");
      onOpenChange(false);
      setFormData({
        name: "",
        interface_name: "",
        address_pool: "",
        gateway_address: "",
        dns_servers: ["8.8.8.8", "8.8.4.4"],
        lease_time: "24h",
        status: "enabled",
        description: ""
      });
    } catch (error) {
      toast.error("Failed to create DHCP server");
    }
  };

  const updateDNSServer = (index: number, value: string) => {
    const newDNS = [...formData.dns_servers];
    newDNS[index] = value;
    setFormData(prev => ({ ...prev, dns_servers: newDNS }));
  };

  const addDNSServer = () => {
    if (formData.dns_servers.length < 4) {
      setFormData(prev => ({ 
        ...prev, 
        dns_servers: [...prev.dns_servers, ""] 
      }));
    }
  };

  const removeDNSServer = (index: number) => {
    if (formData.dns_servers.length > 1) {
      const newDNS = formData.dns_servers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, dns_servers: newDNS }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create DHCP Server</DialogTitle>
          <DialogDescription>
            Configure a new DHCP server to automatically assign IP addresses
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="server-name">Server Name *</Label>
              <Input
                id="server-name"
                placeholder="e.g., LAN-DHCP"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interface">Interface *</Label>
              <Select
                value={formData.interface_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, interface_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interface" />
                </SelectTrigger>
                <SelectContent>
                  {availableInterfaces.map((iface) => (
                    <SelectItem key={iface} value={iface}>{iface}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-pool">Address Pool *</Label>
            <Input
              id="address-pool"
              placeholder="e.g., 192.168.1.100-192.168.1.200 or 192.168.1.0/24"
              value={formData.address_pool}
              onChange={(e) => setFormData(prev => ({ ...prev, address_pool: e.target.value }))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Specify IP range (192.168.1.100-192.168.1.200) or subnet (192.168.1.0/24)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gateway">Gateway Address</Label>
              <Input
                id="gateway"
                placeholder="e.g., 192.168.1.1"
                value={formData.gateway_address}
                onChange={(e) => setFormData(prev => ({ ...prev, gateway_address: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lease-time">Lease Time</Label>
              <Select
                value={formData.lease_time}
                onValueChange={(value) => setFormData(prev => ({ ...prev, lease_time: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lease time" />
                </SelectTrigger>
                <SelectContent>
                  {commonLeaseTime.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">DNS Servers</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addDNSServer}
                disabled={formData.dns_servers.length >= 4}
              >
                Add DNS
              </Button>
            </div>
            <div className="space-y-2">
              {formData.dns_servers.map((dns, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder={`DNS Server ${index + 1}`}
                    value={dns}
                    onChange={(e) => updateDNSServer(index, e.target.value)}
                  />
                  {formData.dns_servers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDNSServer(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description for this DHCP server"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <Label htmlFor="enabled-switch" className="font-medium">
                Enable Server
              </Label>
              <p className="text-sm text-muted-foreground">
                Start serving DHCP requests immediately
              </p>
            </div>
            <Switch
              id="enabled-switch"
              checked={formData.status === "enabled"}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, status: checked ? "enabled" : "disabled" }))
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Server
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}