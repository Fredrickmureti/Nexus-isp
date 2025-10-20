import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Server, Activity, Wifi, Trash2, RefreshCw, Settings, ExternalLink } from "lucide-react";
import { useRouters, useDeleteRouter } from "@/hooks/useRouters";
import { useTestRouterConnection } from "@/hooks/useRouterControl";
import { AddRouterDialog } from "./AddRouterDialog";
import { Skeleton } from "@/components/ui/skeleton";
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

export const RouterManagement = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteRouterId, setDeleteRouterId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: routers, isLoading } = useRouters();
  const deleteRouter = useDeleteRouter();
  const testConnection = useTestRouterConnection();

  const handleDelete = () => {
    if (deleteRouterId) {
      deleteRouter.mutate(deleteRouterId, {
        onSuccess: () => setDeleteRouterId(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Router Management</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Router
        </Button>
      </div>

      {routers && routers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routers.map((router) => (
            <Card key={router.id} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{router.name}</h3>
                    <p className="text-sm text-muted-foreground">{router.manufacturer}</p>
                  </div>
                </div>
                <Badge 
                  variant={
                    router.status === "online" ? "default" : 
                    router.status === "maintenance" ? "secondary" : 
                    "destructive"
                  }
                >
                  {router.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">IP Address</span>
                  <span className="font-medium font-mono text-sm">{String(router.ip_address)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Model</span>
                  <span className="font-medium text-sm">{router.model || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="font-medium text-sm">{router.location || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Type</span>
                  <span className="font-medium text-sm">{router.api_type.replace("_", " ")}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/isp-provider/routers/${router.id}`)}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testConnection.mutate(router.id)}
                  disabled={testConnection.isPending}
                >
                  {testConnection.isPending && testConnection.variables === router.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDeleteRouterId(router.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-2">
            <Server className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No routers configured</h3>
            <p className="text-muted-foreground">
              Add your first router to start monitoring your network
            </p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Router
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Server className="h-6 w-6" />
            <span>Reboot All</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Activity className="h-6 w-6" />
            <span>View Logs</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Wifi className="h-6 w-6" />
            <span>Bandwidth Test</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Plus className="h-6 w-6" />
            <span>Backup Config</span>
          </Button>
        </div>
      </Card>

      <AddRouterDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      <AlertDialog open={!!deleteRouterId} onOpenChange={() => setDeleteRouterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Router</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this router? This action cannot be undone.
              All associated data and statistics will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
