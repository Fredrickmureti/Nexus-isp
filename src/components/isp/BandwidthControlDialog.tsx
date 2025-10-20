import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSetBandwidthLimit } from "@/hooks/useRouterControl";
import { useRouters } from "@/hooks/useRouters";

interface BandwidthControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
}

export const BandwidthControlDialog = ({
  open,
  onOpenChange,
  customerId,
  customerName,
}: BandwidthControlDialogProps) => {
  const [routerId, setRouterId] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [downloadSpeed, setDownloadSpeed] = useState("");
  
  const { data: routers } = useRouters();
  const setBandwidth = useSetBandwidthLimit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBandwidth.mutate(
      {
        customerId,
        routerId,
        uploadSpeed: parseInt(uploadSpeed),
        downloadSpeed: parseInt(downloadSpeed),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRouterId("");
          setUploadSpeed("");
          setDownloadSpeed("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Bandwidth Limit - {customerName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="router">Select Router *</Label>
            <Select value={routerId} onValueChange={setRouterId} required>
              <SelectTrigger id="router">
                <SelectValue placeholder="Choose router..." />
              </SelectTrigger>
              <SelectContent>
                {routers?.filter(r => r.status === 'online').map((router) => (
                  <SelectItem key={router.id} value={router.id}>
                    {router.name} ({String(router.ip_address)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload">Upload Speed (Mbps) *</Label>
            <Input
              id="upload"
              type="number"
              value={uploadSpeed}
              onChange={(e) => setUploadSpeed(e.target.value)}
              placeholder="10"
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="download">Download Speed (Mbps) *</Label>
            <Input
              id="download"
              type="number"
              value={downloadSpeed}
              onChange={(e) => setDownloadSpeed(e.target.value)}
              placeholder="50"
              min="1"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={setBandwidth.isPending}>
              {setBandwidth.isPending ? "Setting..." : "Set Bandwidth"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
