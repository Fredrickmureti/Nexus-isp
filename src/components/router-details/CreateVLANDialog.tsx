import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateVLAN } from "@/hooks/useVLANs";
import { toast } from "sonner";

interface CreateVLANDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routerId: string;
}

export function CreateVLANDialog({ open, onOpenChange, routerId }: CreateVLANDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    vlan_id: "",
    description: "",
    tagged_interfaces: [] as string[],
    untagged_interfaces: [] as string[],
    status: "active"
  });

  const { mutateAsync: createVLAN, isPending } = useCreateVLAN();

  const availableInterfaces = [
    "ether1", "ether2", "ether3", "ether4", "ether5",
    "wlan1", "wlan2", "bridge1", "sfp1"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.vlan_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    const vlanId = parseInt(formData.vlan_id);
    if (isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
      toast.error("VLAN ID must be between 1 and 4094");
      return;
    }

    try {
      await createVLAN({
        routerId,
        vlanData: {
          vlan_id: vlanId,
          name: formData.name,
          description: formData.description || null,
          interface: formData.tagged_interfaces?.[0] || 'bridge1',
          tagged_interfaces: formData.tagged_interfaces,
          untagged_interfaces: formData.untagged_interfaces,
          enabled: formData.status === 'active'
        }
      });
      
      toast.success("VLAN created successfully");
      onOpenChange(false);
      setFormData({
        name: "",
        vlan_id: "",
        description: "",
        tagged_interfaces: [],
        untagged_interfaces: [],
        status: "active"
      });
    } catch (error) {
      toast.error("Failed to create VLAN");
    }
  };

  const handleInterfaceToggle = (interfaceName: string, type: 'tagged' | 'untagged') => {
    const currentList = type === 'tagged' ? formData.tagged_interfaces : formData.untagged_interfaces;
    const otherList = type === 'tagged' ? formData.untagged_interfaces : formData.tagged_interfaces;
    
    // Remove from other list if it exists there
    const updatedOtherList = otherList.filter(iface => iface !== interfaceName);
    
    // Toggle in current list
    const updatedCurrentList = currentList.includes(interfaceName)
      ? currentList.filter(iface => iface !== interfaceName)
      : [...currentList, interfaceName];

    setFormData(prev => ({
      ...prev,
      [type === 'tagged' ? 'tagged_interfaces' : 'untagged_interfaces']: updatedCurrentList,
      [type === 'tagged' ? 'untagged_interfaces' : 'tagged_interfaces']: updatedOtherList
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New VLAN</DialogTitle>
          <DialogDescription>
            Configure a new Virtual LAN for network segmentation
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vlan-name">VLAN Name *</Label>
              <Input
                id="vlan-name"
                placeholder="e.g., Guest-Network"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vlan-id">VLAN ID *</Label>
              <Input
                id="vlan-id"
                type="number"
                min="1"
                max="4094"
                placeholder="e.g., 100"
                value={formData.vlan_id}
                onChange={(e) => setFormData(prev => ({ ...prev, vlan_id: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description for this VLAN"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Interface Configuration</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Configure which interfaces belong to this VLAN
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tagged Interfaces</Label>
                <p className="text-xs text-muted-foreground">
                  Traffic will be tagged with VLAN ID
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {availableInterfaces.map((iface) => (
                    <div key={`tagged-${iface}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tagged-${iface}`}
                        checked={formData.tagged_interfaces.includes(iface)}
                        onCheckedChange={() => handleInterfaceToggle(iface, 'tagged')}
                      />
                      <Label htmlFor={`tagged-${iface}`} className="text-sm font-mono">
                        {iface}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Untagged Interfaces</Label>
                <p className="text-xs text-muted-foreground">
                  Traffic will not be tagged (access ports)
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {availableInterfaces.map((iface) => (
                    <div key={`untagged-${iface}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`untagged-${iface}`}
                        checked={formData.untagged_interfaces.includes(iface)}
                        onCheckedChange={() => handleInterfaceToggle(iface, 'untagged')}
                      />
                      <Label htmlFor={`untagged-${iface}`} className="text-sm font-mono">
                        {iface}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create VLAN"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}