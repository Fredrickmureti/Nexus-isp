import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Mail, Phone, MapPin, Calendar, ShieldCheck, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddCustomerDialog } from "@/components/isp/AddCustomerDialog";
import { usePaymentOverride, useToggleAutoDisconnect } from "@/hooks/usePaymentOverride";

export default function Customers() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [overrideCustomerId, setOverrideCustomerId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideUntil, setOverrideUntil] = useState("");
  const { toast } = useToast();
  
  const paymentOverrideMutation = usePaymentOverride();
  const toggleAutoDisconnect = useToggleAutoDisconnect();

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

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", provider?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("provider_id", provider?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!provider?.id,
  });

  const filteredCustomers = customers?.filter((customer) =>
    customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        <AddCustomerDialog />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Override</TableHead>
              <TableHead>Auto-Disconnect</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="font-medium">{customer.full_name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground max-w-xs truncate">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {customer.address || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={
                        customer.account_status === "active"
                          ? "default"
                          : customer.account_status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {customer.account_status}
                    </Badge>
                    {customer.payment_override && (
                      <Badge variant="outline" className="text-xs">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Override Active
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant={customer.payment_override ? "default" : "outline"}
                        size="sm"
                        onClick={() => setOverrideCustomerId(customer.id)}
                      >
                        {customer.payment_override ? (
                          <>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Active
                          </>
                        ) : (
                          <>
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Enable
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {customer.payment_override ? "Disable" : "Enable"} Payment Override
                        </DialogTitle>
                        <DialogDescription>
                          {customer.payment_override
                            ? "Remove payment override and restore normal billing rules."
                            : "Override automatic payment verification and prevent auto-disconnection."}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {!customer.payment_override && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Override</Label>
                            <Textarea
                              id="reason"
                              placeholder="Enter reason for manual override..."
                              value={overrideReason}
                              onChange={(e) => setOverrideReason(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="until">Override Until (Optional)</Label>
                            <Input
                              id="until"
                              type="date"
                              value={overrideUntil}
                              onChange={(e) => setOverrideUntil(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                      
                      {customer.payment_override && (
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm">
                            <strong>Current Override Reason:</strong><br />
                            {customer.override_reason || "No reason provided"}
                          </p>
                          {customer.override_until && (
                            <p className="text-sm mt-2">
                              <strong>Valid Until:</strong><br />
                              {new Date(customer.override_until).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button
                          variant={customer.payment_override ? "destructive" : "default"}
                          onClick={() => {
                            paymentOverrideMutation.mutate({
                              customerId: customer.id,
                              providerId: customer.provider_id,
                              override: !customer.payment_override,
                              reason: overrideReason || undefined,
                              overrideUntil: overrideUntil || undefined,
                            });
                            setOverrideReason("");
                            setOverrideUntil("");
                          }}
                        >
                          {customer.payment_override ? "Disable Override" : "Enable Override"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {customer.override_until && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Until {new Date(customer.override_until).toLocaleDateString()}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={customer.auto_disconnect_enabled}
                      onCheckedChange={(checked) => {
                        toggleAutoDisconnect.mutate({
                          customerId: customer.id,
                          enabled: checked,
                        });
                      }}
                    />
                    <Label className="text-xs">
                      {customer.auto_disconnect_enabled ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredCustomers?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No customers found</p>
        </div>
      )}
    </div>
  );
}
