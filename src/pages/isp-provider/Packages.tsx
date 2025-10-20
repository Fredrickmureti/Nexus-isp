import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Wifi, DollarSign, Users, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AddPackageDialog from "@/components/isp/AddPackageDialog";
import EditPackageDialog from "@/components/isp/EditPackageDialog";

export default function Packages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const { data: provider } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_providers")
        .select("*")
        .eq("owner_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages", provider?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_packages")
        .select("*")
        .eq("provider_id", provider?.id)
        .order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!provider?.id,
  });

  const handleToggleActive = async (packageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("service_packages")
        .update({ is_active: !currentStatus })
        .eq("id", packageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package status updated",
      });

      queryClient.invalidateQueries({ queryKey: ["packages"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update package status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Packages</h1>
          <p className="text-muted-foreground">Manage your internet service plans</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages?.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Wifi className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {pkg.billing_cycle.charAt(0).toUpperCase() + pkg.billing_cycle.slice(1)}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pkg.is_active}
                  onCheckedChange={() => handleToggleActive(pkg.id, pkg.is_active)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4 border-y">
                <div className="text-3xl font-bold text-primary">
                  ${Number(pkg.price).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">per {pkg.billing_cycle}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    <strong>{pkg.speed_mbps} Mbps</strong> speed
                  </span>
                </div>
                {pkg.bandwidth_limit_gb && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      <strong>{pkg.bandwidth_limit_gb} GB</strong> data limit
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">Unlimited devices</span>
                </div>
              </div>

              {pkg.description && (
                <p className="text-sm text-muted-foreground pt-2 border-t">
                  {pkg.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Badge variant={pkg.is_active ? "default" : "secondary"}>
                  {pkg.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setEditingPackage(pkg)}>
                  Edit Package
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages?.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-2">
            <Wifi className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No packages yet</h3>
            <p className="text-muted-foreground">
              Create your first service package to get started
            </p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </div>
        </Card>
      )}

      {provider && (
        <>
          <AddPackageDialog 
            open={showAddDialog} 
            onOpenChange={setShowAddDialog}
            providerId={provider.id}
          />
          <EditPackageDialog
            open={!!editingPackage}
            onOpenChange={(open) => !open && setEditingPackage(null)}
            packageData={editingPackage}
          />
        </>
      )}
    </div>
  );
}
