import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePackages } from "@/hooks/usePackages";
import { useRouters } from "@/hooks/useRouters";

export const AddCustomerDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    installation_address: "",
    notes: "",
    package_id: "",
    router_id: "",
  });
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch provider first to get provider_id
  const { data: providerData } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("isp_providers")
        .select("id")
        .eq("owner_id", user?.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: packages } = usePackages(providerData?.id);
  const { data: routers } = useQuery({
    queryKey: ["routers-list", providerData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routers")
        .select("*")
        .eq("provider_id", providerData?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!providerData?.id,
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: provider } = await supabase
        .from("isp_providers")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!provider) throw new Error("Provider not found");

      // Create customer record
      const { data: customer, error } = await supabase
        .from("customers")
        .insert([{
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          installation_address: data.installation_address,
          notes: data.notes,
          assigned_router_id: data.router_id || null,
          provider_id: provider.id,
          account_status: "pending",
        }])
        .select()
        .single();

      if (error) throw error;

      // Call onboard-customer edge function with redirectTo to avoid email confirmation issues
      const { error: onboardError } = await supabase.functions.invoke("onboard-customer", {
        body: {
          customerId: customer.id,
          email: data.email,
          fullName: data.full_name,
          packageId: data.package_id || null,
          routerId: data.router_id || null,
          sendWelcomeEmail,
          redirectTo: `${window.location.origin}/customer/activate`,
        },
      });

      if (onboardError) {
        console.error("Onboarding error:", onboardError);
        throw new Error(`Customer created but onboarding failed: ${onboardError.message}`);
      }

      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer added and activation email sent!");
      setOpen(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        installation_address: "",
        notes: "",
        package_id: "",
        router_id: "",
      });
      setSendWelcomeEmail(true);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomerMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="installation_address">Installation Address</Label>
            <Textarea
              id="installation_address"
              value={formData.installation_address}
              onChange={(e) => setFormData({ ...formData, installation_address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="package_id">Service Package (Optional)</Label>
              <Select 
                value={formData.package_id} 
                onValueChange={(value) => setFormData({ ...formData, package_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {packages?.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.package_name} - {pkg.speed_mbps}Mbps - ${pkg.price}/{pkg.billing_cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="router_id">Assign Router (Optional)</Label>
              <Select 
                value={formData.router_id} 
                onValueChange={(value) => setFormData({ ...formData, router_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a router" />
                </SelectTrigger>
                <SelectContent>
                  {routers?.map((router) => (
                    <SelectItem key={router.id} value={router.id}>
                      {router.name} ({String(router.ip_address)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="send_welcome_email" 
              checked={sendWelcomeEmail}
              onCheckedChange={(checked) => setSendWelcomeEmail(Boolean(checked))}
            />
            <label htmlFor="send_welcome_email" className="text-sm font-medium cursor-pointer">
              Send welcome email with activation link
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addCustomerMutation.isPending}>
              {addCustomerMutation.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
