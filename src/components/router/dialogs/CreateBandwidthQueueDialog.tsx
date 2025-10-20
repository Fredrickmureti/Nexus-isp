import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfigureBandwidthQueue } from "@/hooks/useNetworkConfig";

interface CreateBandwidthQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routerId: string;
}

export default function CreateBandwidthQueueDialog({
  open,
  onOpenChange,
  routerId,
}: CreateBandwidthQueueDialogProps) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [maxUpload, setMaxUpload] = useState("");
  const [maxDownload, setMaxDownload] = useState("");
  const [priority, setPriority] = useState("8");
  const configureQueue = useConfigureBandwidthQueue();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await configureQueue.mutateAsync({
      routerId,
      name,
      target,
      maxUpload: parseInt(maxUpload),
      maxDownload: parseInt(maxDownload),
      priority: parseInt(priority),
    });

    onOpenChange(false);
    setName("");
    setTarget("");
    setMaxUpload("");
    setMaxDownload("");
    setPriority("8");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Bandwidth Queue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Queue Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., customer-queue-1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target (IP Address)</Label>
            <Input
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 10.0.0.5/32"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUpload">Max Upload (bps)</Label>
              <Input
                id="maxUpload"
                type="number"
                value={maxUpload}
                onChange={(e) => setMaxUpload(e.target.value)}
                placeholder="e.g., 10000000 (10 Mbps)"
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDownload">Max Download (bps)</Label>
              <Input
                id="maxDownload"
                type="number"
                value={maxDownload}
                onChange={(e) => setMaxDownload(e.target.value)}
                placeholder="e.g., 50000000 (50 Mbps)"
                required
                min="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority (1-8)</Label>
            <Input
              id="priority"
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="8"
              required
              min="1"
              max="8"
            />
            <p className="text-xs text-muted-foreground">
              Lower number = higher priority
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={configureQueue.isPending}>
              {configureQueue.isPending ? "Creating..." : "Create Queue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
