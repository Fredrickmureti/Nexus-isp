import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useConfigureBandwidthQueue } from "@/hooks/useNetworkConfig";

interface CreateBandwidthQueueDialogProps {
  routerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBandwidthQueueDialog({ routerId, open, onOpenChange }: CreateBandwidthQueueDialogProps) {
  const queryClient = useQueryClient();
  const configureMutation = useConfigureBandwidthQueue();
  
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    maxUpload: "",
    maxDownload: "",
    priority: "8",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await configureMutation.mutateAsync({
        routerId,
        name: formData.name,
        target: formData.target,
        maxUpload: parseInt(formData.maxUpload) * 1000000, // Convert Mbps to bps
        maxDownload: parseInt(formData.maxDownload) * 1000000,
        priority: parseInt(formData.priority),
      });
      
      toast.success("Bandwidth queue created successfully");
      onOpenChange(false);
      setFormData({
        name: "",
        target: "",
        maxUpload: "",
        maxDownload: "",
        priority: "8",
      });
    } catch (error) {
      toast.error("Failed to create bandwidth queue");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Bandwidth Queue</DialogTitle>
          <DialogDescription>
            Configure bandwidth limits for a specific target (IP address or customer)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Queue Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Customer-John-Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="target">Target IP/Network</Label>
            <Input
              id="target"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              placeholder="e.g., 192.168.1.100 or 192.168.1.0/24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxUpload">Max Upload (Mbps)</Label>
              <Input
                id="maxUpload"
                type="number"
                value={formData.maxUpload}
                onChange={(e) => setFormData({ ...formData, maxUpload: e.target.value })}
                placeholder="10"
                required
              />
            </div>

            <div>
              <Label htmlFor="maxDownload">Max Download (Mbps)</Label>
              <Input
                id="maxDownload"
                type="number"
                value={formData.maxDownload}
                onChange={(e) => setFormData({ ...formData, maxDownload: e.target.value })}
                placeholder="50"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority (1-8, lower is better)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="8"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={configureMutation.isPending}>
              {configureMutation.isPending ? "Creating..." : "Create Queue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
