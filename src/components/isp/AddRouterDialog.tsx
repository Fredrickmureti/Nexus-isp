import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddRouter } from "@/hooks/useRouters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface AddRouterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddRouterDialog = ({ open, onOpenChange }: AddRouterDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    ip_address: "",
    manufacturer: "",
    model: "",
    location: "",
    api_type: "mikrotik_api",
    username: "",
    password: "",
    api_port: "",
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const addRouter = useAddRouter();

  const testConnection = async () => {
    if (!formData.ip_address || !formData.username) {
      toast.error("Please fill in IP address and username first");
      return;
    }

    // Prevent cloud test for private/LAN IPs — edge functions can't reach it
    const isPrivateLan = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|169\.254\.|127\.)/.test(formData.ip_address);
    if (isPrivateLan) {
      setConnectionTestResult({ success: false, message: 'Private/LAN IPs cannot be tested from cloud. Use a publicly reachable IP/hostname or configure secure HTTPS port forwarding.' });
      toast.error('Private/LAN IP not reachable from cloud. Provide a public IP or HTTPS port forward.');
      return;
    }

    setIsTestingConnection(true);
    setConnectionTestResult(null);
    
    toast.info("Testing connection...", { id: "test-connection" });

    try {
      const { data, error } = await supabase.functions.invoke('test-router-connection', {
        body: {
          routerConfig: {
            ip_address: formData.ip_address,
            api_port: formData.api_port || 80,
            api_type: formData.api_type,
            username: formData.username,
            password: formData.password,
          }
        }
      });

      toast.dismiss("test-connection");

      if (error) {
        setConnectionTestResult({
          success: false,
          message: `Connection test failed: ${error.message}`
        });
        toast.error(`Connection test failed: ${error.message}`);
        return;
      }

      if (data.success) {
        setConnectionTestResult({
          success: true,
          message: data.message
        });
        toast.success(data.message);
      } else {
        setConnectionTestResult({
          success: false,
          message: data.message
        });
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.dismiss("test-connection");
      
      const message = `Connection error: ${error.message}`;
      setConnectionTestResult({
        success: false,
        message
      });
      toast.error(message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRouter.mutate({
      ...formData,
      api_port: formData.api_port ? parseInt(formData.api_port) : undefined,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          name: "",
          ip_address: "",
          manufacturer: "",
          model: "",
          location: "",
          api_type: "mikrotik_api",
          username: "",
          password: "",
          api_port: "",
        });
        setConnectionTestResult(null);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Router</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Router Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Main Router"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip_address">IP Address or Hostname *</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                placeholder="192.168.1.1 or hostname.ngrok.io"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="MikroTik"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="RB4011"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Main Office"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_type">API Type *</Label>
              <Select
                value={formData.api_type}
                onValueChange={(value) => setFormData({ ...formData, api_type: value })}
              >
                <SelectTrigger id="api_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mikrotik_api">MikroTik API</SelectItem>
                  <SelectItem value="rest_api">REST API</SelectItem>
                  <SelectItem value="snmp">SNMP</SelectItem>
                  <SelectItem value="ssh">SSH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_port">API Port</Label>
              <Input
                id="api_port"
                type="number"
                value={formData.api_port}
                onChange={(e) => setFormData({ ...formData, api_port: e.target.value })}
                placeholder={formData.api_type === "mikrotik_api" ? "80" : "80"}
              />
              {formData.api_type === "mikrotik_api" && (
                <p className="text-xs text-muted-foreground">
                  MikroTik REST API uses port 80 (HTTP) or 443 (HTTPS). Enable in: IP → Services → www
                </p>
              )}
            </div>
          </div>

          {/* Connection Test Section */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Connection Test</Label>
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection || !formData.ip_address}
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
            
            {connectionTestResult && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                connectionTestResult.success 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {connectionTestResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{connectionTestResult.message}</span>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Test the connection to verify your router credentials before adding it.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addRouter.isPending}>
              {addRouter.isPending ? "Adding..." : "Add Router"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
