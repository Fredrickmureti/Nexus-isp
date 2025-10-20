import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useIPPools } from "@/hooks/useIPPools";
import { toast } from "sonner";

interface CreateIPPoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routerId: string;
}

export function CreateIPPoolDialog({ open, onOpenChange, routerId }: CreateIPPoolDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    ip_range: "",
    description: "",
    status: "active"
  });

  const validateIPRange = (range: string): boolean => {
    // Accept formats like: 192.168.1.100-192.168.1.200 or 192.168.1.0/24
    const patterns = [
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, // Range
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/ // CIDR
    ];
    return patterns.some(pattern => pattern.test(range));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.ip_range) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateIPRange(formData.ip_range)) {
      toast.error("Invalid IP range format. Use format like '192.168.1.100-192.168.1.200' or '192.168.1.0/24'");
      return;
    }

    try {
      toast.success("IP pool will be created via edge function (to be implemented)");
      onOpenChange(false);
      setFormData({
        name: "",
        ip_range: "",
        description: "",
        status: "active"
      });
    } catch (error) {
      toast.error("Failed to create IP pool");
    }
  };

  const getExampleRange = (type: string) => {
    switch (type) {
      case "cidr":
        setFormData(prev => ({ ...prev, ip_range: "192.168.1.0/24" }));
        break;
      case "range":
        setFormData(prev => ({ ...prev, ip_range: "192.168.1.100-192.168.1.200" }));
        break;
      case "pppoe":
        setFormData(prev => ({ ...prev, ip_range: "100.64.0.0/16" }));
        break;
      case "guest":
        setFormData(prev => ({ ...prev, ip_range: "172.16.1.0/24" }));
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create IP Address Pool</DialogTitle>
          <DialogDescription>
            Configure a new IP address pool for network services
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pool-name">Pool Name *</Label>
            <Input
              id="pool-name"
              placeholder="e.g., PPPoE-Pool, Guest-Network"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip-range">IP Range *</Label>
            <Input
              id="ip-range"
              placeholder="e.g., 192.168.1.100-192.168.1.200 or 192.168.1.0/24"
              value={formData.ip_range}
              onChange={(e) => setFormData(prev => ({ ...prev, ip_range: e.target.value }))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Specify IP range (start-end) or subnet (CIDR notation)
            </p>
          </div>

          {/* Quick Range Templates */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => getExampleRange("cidr")}
              >
                Standard LAN (192.168.1.0/24)
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => getExampleRange("range")}
              >
                DHCP Range (100-200)
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => getExampleRange("pppoe")}
              >
                PPPoE Pool (100.64.0.0/16)
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => getExampleRange("guest")}
              >
                Guest Network (172.16.1.0/24)
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description for this IP pool"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <Label htmlFor="active-switch" className="font-medium">
                Activate Pool
              </Label>
              <p className="text-sm text-muted-foreground">
                Make this pool available for address assignment
              </p>
            </div>
            <Switch
              id="active-switch"
              checked={formData.status === "active"}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, status: checked ? "active" : "inactive" }))
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Pool
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}