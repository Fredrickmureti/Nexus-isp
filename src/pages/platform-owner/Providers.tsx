import { useState } from "react";
import { useProviders } from "@/hooks/useProviders";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Plus, Search, Settings, Trash2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

export default function Providers() {
  const { data: providers, isLoading } = useProviders();
  const { user, hasIspProviderRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteProviderId, setDeleteProviderId] = useState<string | null>(null);
  const [viewDetailsProvider, setViewDetailsProvider] = useState<any>(null);
  const [editProvider, setEditProvider] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current platform owner is also an ISP provider
  const { data: platformOwnerIsIsp } = useQuery({
    queryKey: ["platform-owner-is-isp", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .from("isp_providers")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    company_name: "",
    company_email: "",
    company_phone: "",
    address: "",
    registration_number: "",
    plan_name: "trial",
    billing_cycle: "monthly" as "monthly" | "yearly",
  });

  // Fetch subscription plans
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const filteredProviders = providers?.filter((provider) => {
    const matchesSearch = provider.company_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || provider.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProvider = async () => {
    if (!formData.email || !formData.password || !formData.full_name || 
        !formData.company_name || !formData.company_email || !formData.company_phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("register-isp", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message || "ISP Provider created successfully",
      });

      setIsDialogOpen(false);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        company_name: "",
        company_email: "",
        company_phone: "",
        address: "",
        registration_number: "",
        plan_name: "trial",
        billing_cycle: "monthly",
      });
      queryClient.invalidateQueries({ queryKey: ["isp-providers"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create provider",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusUpdate = async (
    providerId: string,
    newStatus: "active" | "cancelled" | "suspended" | "trial"
  ) => {
    try {
      const { error } = await supabase
        .from("isp_providers")
        .update({ subscription_status: newStatus })
        .eq("id", providerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Provider status updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["isp-providers"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update provider status",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProvider = async () => {
    if (!editProvider) return;

    try {
      const { error } = await supabase
        .from("isp_providers")
        .update({
          company_name: editProvider.company_name,
          company_email: editProvider.company_email,
          company_phone: editProvider.company_phone,
          address: editProvider.address,
          registration_number: editProvider.registration_number,
          subscription_plan: editProvider.subscription_plan,
          subscription_status: editProvider.subscription_status,
          monthly_fee: editProvider.monthly_fee,
          max_customers: editProvider.max_customers,
          max_routers: editProvider.max_routers,
        })
        .eq("id", editProvider.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Provider updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["isp-providers"] });
      setEditProvider(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update provider",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProvider = async () => {
    if (!deleteProviderId) return;

    try {
      // First, get the provider to find the owner_id
      const { data: provider } = await supabase
        .from("isp_providers")
        .select("owner_id")
        .eq("id", deleteProviderId)
        .single();

      if (!provider) throw new Error("Provider not found");

      // Delete the provider record (this will cascade delete related records)
      const { error: providerError } = await supabase
        .from("isp_providers")
        .delete()
        .eq("id", deleteProviderId);

      if (providerError) throw providerError;

      // Delete the user's ISP provider role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", provider.owner_id)
        .eq("role", "isp_provider");

      if (roleError) console.error("Role deletion error:", roleError);

      toast({
        title: "Success",
        description: "Provider deleted successfully",
      });

      // Force refetch to update UI
      await queryClient.invalidateQueries({ queryKey: ["isp-providers"] });
      await queryClient.refetchQueries({ queryKey: ["isp-providers"] });
      setDeleteProviderId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete provider",
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
          <h1 className="text-3xl font-bold text-foreground">ISP Providers</h1>
          <p className="text-muted-foreground">Manage all ISP providers on the platform</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New ISP Provider</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Full Name *</Label>
                <Input 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Email (Login) *</Label>
                <Input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Password *</Label>
                <Input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Min. 6 characters" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Company Name *</Label>
                <Input 
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="ISP Company Ltd" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Company Email *</Label>
                <Input 
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setFormData({...formData, company_email: e.target.value})}
                  placeholder="contact@company.com" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Company Phone *</Label>
                <Input 
                  value={formData.company_phone}
                  onChange={(e) => setFormData({...formData, company_phone: e.target.value})}
                  placeholder="+1234567890" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Main St, City" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Registration Number</Label>
                <Input 
                  value={formData.registration_number}
                  onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                  placeholder="REG123456" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Subscription Plan *</Label>
                <Select 
                  value={formData.plan_name}
                  onValueChange={(value) => setFormData({...formData, plan_name: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.plan_name}>
                        {plan.display_name} - ${plan.monthly_price}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Billing Cycle *</Label>
                <Select 
                  value={formData.billing_cycle}
                  onValueChange={(value) => setFormData({...formData, billing_cycle: value as "monthly" | "yearly"})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreateProvider} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Provider"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {!platformOwnerIsIsp && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Want to run your own ISP?</strong> As a platform owner, you can also register yourself as an ISP provider. 
            Simply click "Add Provider" and use your own email to create your ISP account. You'll have both platform owner and ISP provider access.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProviders?.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{provider.company_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{provider.company_email}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    provider.subscription_status === "active"
                      ? "default"
                      : provider.subscription_status === "trial"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {provider.subscription_status}
                </Badge>
                <Badge variant="outline">{provider.subscription_plan}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Fee</span>
                  <span className="font-semibold">${provider.monthly_fee || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max Customers</span>
                  <span className="font-semibold">{provider.max_customers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max Routers</span>
                  <span className="font-semibold">{provider.max_routers}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  size="sm"
                  onClick={() => setViewDetailsProvider(provider)}
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditProvider(provider)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteProviderId(provider.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProviders?.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-2">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No providers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        </Card>
      )}

      <AlertDialog open={!!deleteProviderId} onOpenChange={() => setDeleteProviderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ISP provider? This action cannot be undone.
              All associated data including customers, routers, and transactions will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProvider}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewDetailsProvider} onOpenChange={() => setViewDetailsProvider(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          {viewDetailsProvider && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Company Name</Label>
                  <p className="font-semibold">{viewDetailsProvider.company_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company Email</Label>
                  <p className="font-semibold">{viewDetailsProvider.company_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company Phone</Label>
                  <p className="font-semibold">{viewDetailsProvider.company_phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Registration Number</Label>
                  <p className="font-semibold">{viewDetailsProvider.registration_number || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-semibold">{viewDetailsProvider.address || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Subscription Plan</Label>
                  <Badge variant="outline">{viewDetailsProvider.subscription_plan}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    variant={
                      viewDetailsProvider.subscription_status === "active"
                        ? "default"
                        : viewDetailsProvider.subscription_status === "trial"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {viewDetailsProvider.subscription_status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Monthly Fee</Label>
                  <p className="font-semibold">${viewDetailsProvider.monthly_fee || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Max Customers</Label>
                  <p className="font-semibold">{viewDetailsProvider.max_customers}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Max Routers</Label>
                  <p className="font-semibold">{viewDetailsProvider.max_routers}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Status</Label>
                  <Badge variant="outline">{viewDetailsProvider.payment_status}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Registration Status</Label>
                  <Badge variant="outline">{viewDetailsProvider.registration_status}</Badge>
                </div>
                {viewDetailsProvider.trial_end_date && (
                  <div>
                    <Label className="text-muted-foreground">Trial End Date</Label>
                    <p className="font-semibold">{new Date(viewDetailsProvider.trial_end_date).toLocaleDateString()}</p>
                  </div>
                )}
                {viewDetailsProvider.next_billing_date && (
                  <div>
                    <Label className="text-muted-foreground">Next Billing Date</Label>
                    <p className="font-semibold">{new Date(viewDetailsProvider.next_billing_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog open={!!editProvider} onOpenChange={() => setEditProvider(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Provider Settings</DialogTitle>
          </DialogHeader>
          {editProvider && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Company Name</Label>
                  <Input
                    value={editProvider.company_name}
                    onChange={(e) => setEditProvider({ ...editProvider, company_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Company Email</Label>
                  <Input
                    type="email"
                    value={editProvider.company_email}
                    onChange={(e) => setEditProvider({ ...editProvider, company_email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Company Phone</Label>
                  <Input
                    value={editProvider.company_phone}
                    onChange={(e) => setEditProvider({ ...editProvider, company_phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Input
                    value={editProvider.address || ""}
                    onChange={(e) => setEditProvider({ ...editProvider, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Registration Number</Label>
                  <Input
                    value={editProvider.registration_number || ""}
                    onChange={(e) => setEditProvider({ ...editProvider, registration_number: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Subscription Plan</Label>
                  <Select
                    value={editProvider.subscription_plan}
                    onValueChange={(value) => setEditProvider({ ...editProvider, subscription_plan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.plan_name}>
                          {plan.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Subscription Status</Label>
                  <Select
                    value={editProvider.subscription_status}
                    onValueChange={(value) => setEditProvider({ ...editProvider, subscription_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Monthly Fee ($)</Label>
                  <Input
                    type="number"
                    value={editProvider.monthly_fee || 0}
                    onChange={(e) => setEditProvider({ ...editProvider, monthly_fee: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Max Customers</Label>
                  <Input
                    type="number"
                    value={editProvider.max_customers}
                    onChange={(e) => setEditProvider({ ...editProvider, max_customers: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Max Routers</Label>
                  <Input
                    type="number"
                    value={editProvider.max_routers}
                    onChange={(e) => setEditProvider({ ...editProvider, max_routers: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditProvider(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProvider}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
