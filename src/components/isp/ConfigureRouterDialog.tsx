import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateRouter, useDeleteRouter } from "@/hooks/useRouters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Server, Trash2, Settings2 } from "lucide-react";

interface ConfigureRouterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  router?: any;
}

export const ConfigureRouterDialog = ({ open, onOpenChange, router }: ConfigureRouterDialogProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  const updateRouter = useUpdateRouter();
  const deleteRouter = useDeleteRouter();

  useEffect(() => {
    if (router) {
      setFormData({
        name: router.name || "",
        ip_address: String(router.ip_address) || "",
        manufacturer: router.manufacturer || "",
        model: router.model || "",
        location: router.location || "",
        api_type: router.api_type || "mikrotik_api",
        username: router.username || "",
        password: router.password || "",
        api_port: router.api_port?.toString() || "",
      });
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!router) return;

    updateRouter.mutate({
      id: router.id,
      ...formData,
      api_port: formData.api_port ? parseInt(formData.api_port) : undefined,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleDelete = () => {
    if (!router) return;
    deleteRouter.mutate(router.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        onOpenChange(false);
      },
    });
  };

  if (!router) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Configure Router - {router.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Router Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer *</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Router
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateRouter.isPending}>
                      {updateRouter.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="connection" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip_address">IP Address *</Label>
                    <Input
                      id="ip_address"
                      value={formData.ip_address}
                      onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                      required
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
                    <Label htmlFor="api_port">API Port</Label>
                    <Input
                      id="api_port"
                      type="number"
                      value={formData.api_port}
                      onChange={(e) => setFormData({ ...formData, api_port: e.target.value })}
                      placeholder="8728"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateRouter.isPending}>
                    {updateRouter.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Router Status</CardTitle>
                  <CardDescription>Current router information and statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={router.status === "online" ? "default" : "destructive"}>
                      {router.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Connection Test Status</span>
                    <Badge variant="outline">{router.connection_test_status || "untested"}</Badge>
                  </div>
                  {router.last_test_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Test</span>
                      <span className="text-sm">{new Date(router.last_test_date).toLocaleString()}</span>
                    </div>
                  )}
                  {router.last_seen && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Seen</span>
                      <span className="text-sm">{new Date(router.last_seen).toLocaleString()}</span>
                    </div>
                  )}
                  {router.router_os_version && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">OS Version</span>
                      <span className="text-sm">{router.router_os_version}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{new Date(router.created_at).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Router</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{router.name}</strong>? This action cannot be undone.
              All associated data and statistics will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
