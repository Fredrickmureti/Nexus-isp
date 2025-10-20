import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["customer-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCustomerSubscription = (customerId?: string) => {
  return useQuery({
    queryKey: ["customer-subscription", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select(`
          *,
          service_packages (*)
        `)
        .eq("customer_id", customerId)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });
};

export const useCustomerInvoices = (customerId?: string) => {
  return useQuery({
    queryKey: ["customer-invoices", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });
};

export const useCustomerPayments = (customerId?: string) => {
  return useQuery({
    queryKey: ["customer-payments", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", customerId)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });
};

export const useCustomerUsage = (customerId?: string) => {
  return useQuery({
    queryKey: ["customer-usage", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bandwidth_usage")
        .select("*")
        .eq("customer_id", customerId)
        .order("recorded_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });
};

export const useCustomerRouter = (routerId?: string) => {
  return useQuery({
    queryKey: ["customer-router", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routers")
        .select("*")
        .eq("id", routerId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};
