import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomers = (providerId?: string) => {
  return useQuery({
    queryKey: ["customers", providerId],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (providerId) {
        query = query.eq("provider_id", providerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });
};

export const useCustomerStats = (providerId?: string) => {
  return useQuery({
    queryKey: ["customer-stats", providerId],
    queryFn: async () => {
      let customersQuery = supabase.from("customers").select("account_status", { count: "exact" });
      
      if (providerId) {
        customersQuery = customersQuery.eq("provider_id", providerId);
      }

      const { data: customers, error: customersError, count } = await customersQuery;
      if (customersError) throw customersError;

      const activeCustomers = customers?.filter(c => c.account_status === "active").length || 0;

      let paymentsQuery = supabase
        .from("payments")
        .select("amount, customer_id")
        .gte("payment_date", new Date(new Date().setDate(1)).toISOString());

      if (providerId) {
        const { data: providerCustomers } = await supabase
          .from("customers")
          .select("id")
          .eq("provider_id", providerId);
        
        const customerIds = providerCustomers?.map(c => c.id) || [];
        paymentsQuery = paymentsQuery.in("customer_id", customerIds);
      }

      const { data: payments, error: paymentsError } = await paymentsQuery;
      if (paymentsError) throw paymentsError;

      const monthlyRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalCustomers: count || 0,
        activeCustomers,
        monthlyRevenue,
      };
    },
    enabled: !!providerId,
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete customer: ${error.message}`);
    },
  });
};
