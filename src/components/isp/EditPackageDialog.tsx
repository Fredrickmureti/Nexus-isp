import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdatePackage, useDeletePackage } from "@/hooks/usePackages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Package {
  id: string;
  package_name: string;
  speed_mbps: number;
  price: number;
  billing_cycle: string;
  bandwidth_limit_gb: number | null;
  description: string | null;
  is_active: boolean;
}

interface EditPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: Package | null;
}

export default function EditPackageDialog({ open, onOpenChange, packageData }: EditPackageDialogProps) {
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    package_name: "",
    speed_mbps: "",
    price: "",
    billing_cycle: "monthly",
    bandwidth_limit_gb: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (packageData) {
      setFormData({
        package_name: packageData.package_name,
        speed_mbps: packageData.speed_mbps.toString(),
        price: packageData.price.toString(),
        billing_cycle: packageData.billing_cycle,
        bandwidth_limit_gb: packageData.bandwidth_limit_gb?.toString() || "",
        description: packageData.description || "",
        is_active: packageData.is_active,
      });
    }
  }, [packageData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageData) return;

    const updates = {
      id: packageData.id,
      package_name: formData.package_name,
      speed_mbps: parseInt(formData.speed_mbps),
      price: parseFloat(formData.price),
      billing_cycle: formData.billing_cycle,
      bandwidth_limit_gb: formData.bandwidth_limit_gb ? parseInt(formData.bandwidth_limit_gb) : null,
      description: formData.description || null,
      is_active: formData.is_active,
    };

    await updatePackage.mutateAsync(updates);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!packageData) return;
    await deletePackage.mutateAsync(packageData.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  if (!packageData) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit_package_name">Package Name *</Label>
                <Input
                  id="edit_package_name"
                  value={formData.package_name}
                  onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_speed_mbps">Speed (Mbps) *</Label>
                <Input
                  id="edit_speed_mbps"
                  type="number"
                  min="1"
                  value={formData.speed_mbps}
                  onChange={(e) => setFormData({ ...formData, speed_mbps: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_price">Price *</Label>
                <Input
                  id="edit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_billing_cycle">Billing Cycle *</Label>
                <Select
                  value={formData.billing_cycle}
                  onValueChange={(value) => setFormData({ ...formData, billing_cycle: value })}
                >
                  <SelectTrigger id="edit_billing_cycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_bandwidth_limit_gb">Bandwidth Limit (GB)</Label>
                <Input
                  id="edit_bandwidth_limit_gb"
                  type="number"
                  min="1"
                  value={formData.bandwidth_limit_gb}
                  onChange={(e) => setFormData({ ...formData, bandwidth_limit_gb: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="space-y-2 flex items-center justify-between">
                <Label htmlFor="edit_is_active">Active Package</Label>
                <Switch
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Package
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePackage.isPending}>
                  {updatePackage.isPending ? "Updating..." : "Update Package"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the package "{packageData.package_name}". 
              Customers currently subscribed to this package will not be affected, but new subscriptions will not be possible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletePackage.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
