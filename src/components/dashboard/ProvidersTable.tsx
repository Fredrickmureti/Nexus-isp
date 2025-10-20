import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { useProviders } from "@/hooks/useProviders";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ProvidersTable = () => {
  const { data: providers, isLoading } = useProviders();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  const { data: providerStats } = useQuery({
    queryKey: ["provider-customer-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("provider_id");
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((customer) => {
        counts[customer.provider_id] = (counts[customer.provider_id] || 0) + 1;
      });
      
      return counts;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", providers?.find(p => p.id === providerId)?.owner_id);

      if (rolesError) throw rolesError;

      const { error } = await supabase
        .from("isp_providers")
        .delete()
        .eq("id", providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isp-providers"] });
      queryClient.invalidateQueries({ queryKey: ["provider-stats"] });
      toast({
        title: "Success",
        description: "ISP provider deleted successfully",
      });
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete provider: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (providerId: string) => {
    setProviderToDelete(providerId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (providerToDelete) {
      deleteMutation.mutate(providerToDelete);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading providers...</div>;
  }

  if (!providers || providers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No ISP providers yet</div>;
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Customers</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.company_name}</TableCell>
                <TableCell>{provider.company_email}</TableCell>
                <TableCell>{providerStats?.[provider.id] || 0}</TableCell>
                <TableCell>
                  <Badge variant="outline">{provider.subscription_plan}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={provider.subscription_status === "active" ? "default" : "secondary"}>
                    {provider.subscription_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate("/platform-owner/providers")}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(provider.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Provider
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ISP Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this provider? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
