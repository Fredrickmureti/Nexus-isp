import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAddPackage } from "@/hooks/usePackages";

interface AddPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
}

export default function AddPackageDialog({ open, onOpenChange, providerId }: AddPackageDialogProps) {
  const addPackage = useAddPackage();
  const [formData, setFormData] = useState({
    package_name: "",
    speed_mbps: "",
    price: "",
    billing_cycle: "monthly",
    bandwidth_limit_gb: "",
    description: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData = {
      provider_id: providerId,
      package_name: formData.package_name,
      speed_mbps: parseInt(formData.speed_mbps),
      price: parseFloat(formData.price),
      billing_cycle: formData.billing_cycle,
      bandwidth_limit_gb: formData.bandwidth_limit_gb ? parseInt(formData.bandwidth_limit_gb) : null,
      description: formData.description || null,
      is_active: formData.is_active,
    };

    await addPackage.mutateAsync(packageData);
    onOpenChange(false);
    setFormData({
      package_name: "",
      speed_mbps: "",
      price: "",
      billing_cycle: "monthly",
      bandwidth_limit_gb: "",
      description: "",
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Package</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="package_name">Package Name *</Label>
              <Input
                id="package_name"
                value={formData.package_name}
                onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                placeholder="e.g., Basic Plan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="speed_mbps">Speed (Mbps) *</Label>
              <Input
                id="speed_mbps"
                type="number"
                min="1"
                value={formData.speed_mbps}
                onChange={(e) => setFormData({ ...formData, speed_mbps: e.target.value })}
                placeholder="e.g., 100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 29.99"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle *</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value) => setFormData({ ...formData, billing_cycle: value })}
              >
                <SelectTrigger id="billing_cycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bandwidth_limit_gb">Bandwidth Limit (GB)</Label>
              <Input
                id="bandwidth_limit_gb"
                type="number"
                min="1"
                value={formData.bandwidth_limit_gb}
                onChange={(e) => setFormData({ ...formData, bandwidth_limit_gb: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="space-y-2 flex items-center justify-between">
              <Label htmlFor="is_active">Active Package</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional package description..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addPackage.isPending}>
              {addPackage.isPending ? "Creating..." : "Create Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
