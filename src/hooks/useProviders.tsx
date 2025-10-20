import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProviders = () => {
  return useQuery({
    queryKey: ["isp-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_providers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useProviderStats = () => {
  return useQuery({
    queryKey: ["provider-stats"],
    queryFn: async () => {
      const { data: providers, error: providersError } = await supabase
        .from("isp_providers")
        .select("id, subscription_status");

      if (providersError) throw providersError;

      const { count: customersCount, error: customersError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      if (customersError) throw customersError;

      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount")
        .gte("payment_date", new Date(new Date().setDate(1)).toISOString());

      if (paymentsError) throw paymentsError;

      const monthlyRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const activeProviders = providers?.filter(p => p.subscription_status === "active").length || 0;

      return {
        totalProviders: providers?.length || 0,
        activeProviders,
        totalCustomers: customersCount || 0,
        monthlyRevenue,
      };
    },
  });
};
