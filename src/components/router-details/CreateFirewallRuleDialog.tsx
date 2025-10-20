import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFirewallRules } from "@/hooks/useFirewallRules";
import { toast } from "sonner";

interface CreateFirewallRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routerId: string;
}

const COMMON_PROTOCOLS = [
  { value: "tcp", label: "TCP" },
  { value: "udp", label: "UDP" },
  { value: "icmp", label: "ICMP" },
  { value: "any", label: "Any" }
];

const FIREWALL_CHAINS = [
  { value: "input", label: "INPUT", description: "Traffic to the router" },
  { value: "output", label: "OUTPUT", description: "Traffic from the router" },
  { value: "forward", label: "FORWARD", description: "Traffic through the router" },
  { value: "prerouting", label: "PREROUTING", description: "Before routing" },
  { value: "postrouting", label: "POSTROUTING", description: "After routing" }
];

const FIREWALL_ACTIONS = [
  { value: "accept", label: "ACCEPT", description: "Allow the traffic" },
  { value: "drop", label: "DROP", description: "Silently discard the traffic" },
  { value: "reject", label: "REJECT", description: "Reject and send error" },
  { value: "log", label: "LOG", description: "Log the traffic" }
];

const COMMON_PORTS = [
  { value: "22", label: "SSH (22)" },
  { value: "53", label: "DNS (53)" },
  { value: "80", label: "HTTP (80)" },
  { value: "443", label: "HTTPS (443)" },
  { value: "8080", label: "HTTP Alt (8080)" },
  { value: "8291", label: "WinBox (8291)" },
  { value: "8728", label: "API (8728)" },
  { value: "8729", label: "API-SSL (8729)" }
];

export function CreateFirewallRuleDialog({ open, onOpenChange, routerId }: CreateFirewallRuleDialogProps) {
  const [formData, setFormData] = useState({
    chain: "input",
    action: "accept",
    source_address: "",
    destination_address: "",
    source_port: "",
    destination_port: "",
    protocol: "tcp",
    priority: 100,
    description: "",
    enabled: true
  });

  

  const validateIPAddress = (ip: string): boolean => {
    if (!ip) return true; // Optional field
    // Allow CIDR notation
    const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
    return cidrRegex.test(ip) || ip === "any" || ip === "0.0.0.0/0";
  };

  const validatePort = (port: string): boolean => {
    if (!port) return true; // Optional field
    const portNum = parseInt(port);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.chain || !formData.action) {
      toast.error("Please select chain and action");
      return;
    }

    if (!validateIPAddress(formData.source_address)) {
      toast.error("Invalid source address format");
      return;
    }

    if (!validateIPAddress(formData.destination_address)) {
      toast.error("Invalid destination address format");
      return;
    }

    if (!validatePort(formData.source_port)) {
      toast.error("Invalid source port (1-65535)");
      return;
    }

    if (!validatePort(formData.destination_port)) {
      toast.error("Invalid destination port (1-65535)");
      return;
    }

    try {
      // TODO: Implement edge function to create firewall rule on MikroTik
      toast.success("Firewall rule will be created via edge function (to be implemented)");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        chain: "input",
        action: "accept",
        source_address: "",
        destination_address: "",
        source_port: "",
        destination_port: "",
        protocol: "tcp",
        priority: 100,
        description: "",
        enabled: true
      });
    } catch (error) {
      toast.error("Failed to create firewall rule");
    }
  };

  const handleCommonPortSelect = (port: string, type: 'source' | 'destination') => {
    if (type === 'source') {
      setFormData(prev => ({ ...prev, source_port: port }));
    } else {
      setFormData(prev => ({ ...prev, destination_port: port }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Firewall Rule</DialogTitle>
          <DialogDescription>
            Configure a new firewall rule to control network traffic
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Rule Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Configuration</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chain">Chain *</Label>
                <Select
                  value={formData.chain}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, chain: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIREWALL_CHAINS.map((chain) => (
                      <SelectItem key={chain.value} value={chain.value}>
                        <div>
                          <div className="font-medium">{chain.label}</div>
                          <div className="text-xs text-muted-foreground">{chain.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="action">Action *</Label>
                <Select
                  value={formData.action}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIREWALL_ACTIONS.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div>
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="9999"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 100 }))}
                />
                <p className="text-xs text-muted-foreground">Lower numbers = higher priority</p>
              </div>
            </div>
          </div>

          {/* Traffic Matching */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Traffic Matching</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-address">Source Address</Label>
                <Input
                  id="source-address"
                  placeholder="e.g., 192.168.1.0/24, any"
                  value={formData.source_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, source_address: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  IP address or network (CIDR). Leave empty for any.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination-address">Destination Address</Label>
                <Input
                  id="destination-address"
                  placeholder="e.g., 10.0.0.1, 172.16.0.0/12"
                  value={formData.destination_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination_address: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  IP address or network (CIDR). Leave empty for any.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Select
                value={formData.protocol}
                onValueChange={(value) => setFormData(prev => ({ ...prev, protocol: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PROTOCOLS.map((protocol) => (
                    <SelectItem key={protocol.value} value={protocol.value}>
                      {protocol.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-port">Source Port</Label>
                <div className="flex gap-2">
                  <Input
                    id="source-port"
                    placeholder="e.g., 80, 1024-65535"
                    value={formData.source_port}
                    onChange={(e) => setFormData(prev => ({ ...prev, source_port: e.target.value }))}
                  />
                  <Select onValueChange={(value) => handleCommonPortSelect(value, 'source')}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Common" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_PORTS.map((port) => (
                        <SelectItem key={port.value} value={port.value}>
                          {port.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination-port">Destination Port</Label>
                <div className="flex gap-2">
                  <Input
                    id="destination-port"
                    placeholder="e.g., 443, 8000-8080"
                    value={formData.destination_port}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination_port: e.target.value }))}
                  />
                  <Select onValueChange={(value) => handleCommonPortSelect(value, 'destination')}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Common" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_PORTS.map((port) => (
                        <SelectItem key={port.value} value={port.value}>
                          {port.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Rule Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this rule does and why it's needed"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="enabled-switch" className="font-medium">
                Enable Rule
              </Label>
              <p className="text-sm text-muted-foreground">
                Activate this rule immediately after creation
              </p>
            </div>
            <Switch
              id="enabled-switch"
              checked={formData.enabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}