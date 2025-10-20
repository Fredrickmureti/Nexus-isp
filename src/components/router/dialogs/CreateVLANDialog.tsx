import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfigureVLAN } from "@/hooks/useNetworkConfig";

interface CreateVLANDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routerId: string;
}

export default function CreateVLANDialog({ open, onOpenChange, routerId }: CreateVLANDialogProps) {
  const [vlanId, setVlanId] = useState("");
  const [name, setName] = useState("");
  const [interfaceName, setInterfaceName] = useState("");
  const [comment, setComment] = useState("");
  const configureVLAN = useConfigureVLAN();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await configureVLAN.mutateAsync({
      routerId,
      vlanId: parseInt(vlanId),
      name,
      interfaceName,
      comment,
    });

    onOpenChange(false);
    setVlanId("");
    setName("");
    setInterfaceName("");
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create VLAN</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vlanId">VLAN ID</Label>
            <Input
              id="vlanId"
              type="number"
              value={vlanId}
              onChange={(e) => setVlanId(e.target.value)}
              placeholder="e.g., 10"
              required
              min="1"
              max="4094"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., office-vlan"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interface">Interface</Label>
            <Input
              id="interface"
              value={interfaceName}
              onChange={(e) => setInterfaceName(e.target.value)}
              placeholder="e.g., bridge or ether2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Description or notes"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={configureVLAN.isPending}>
              {configureVLAN.isPending ? "Creating..." : "Create VLAN"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
