import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useInvoices = (providerId?: string) => {
  return useQuery({
    queryKey: ["invoices", providerId],
    queryFn: async () => {
      const { data: customers } = await supabase
        .from("customers")
        .select("id")
        .eq("provider_id", providerId);

      const customerIds = customers?.map(c => c.id) || [];

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          customers (
            full_name,
            email
          )
        `)
        .in("customer_id", customerIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });
};

export const useRecentPayments = (providerId?: string) => {
  return useQuery({
    queryKey: ["recent-payments", providerId],
    queryFn: async () => {
      const { data: customers } = await supabase
        .from("customers")
        .select("id")
        .eq("provider_id", providerId);

      const customerIds = customers?.map(c => c.id) || [];

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          customers (
            full_name
          )
        `)
        .in("customer_id", customerIds)
        .order("payment_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });
};

export const useRevenueStats = (providerId?: string) => {
  return useQuery({
    queryKey: ["revenue-stats", providerId],
    queryFn: async () => {
      const { data: customers } = await supabase
        .from("customers")
        .select("id")
        .eq("provider_id", providerId);

      const customerIds = customers?.map(c => c.id) || [];

      // Get last 6 months of revenue
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: payments, error } = await supabase
        .from("payments")
        .select("amount, payment_date")
        .in("customer_id", customerIds)
        .gte("payment_date", sixMonthsAgo.toISOString());

      if (error) throw error;

      // Group by month
      const monthlyData: { [key: string]: number } = {};
      payments?.forEach(payment => {
        const month = new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[month] = (monthlyData[month] || 0) + Number(payment.amount);
      });

      return Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue: Math.round(revenue),
      }));
    },
    enabled: !!providerId,
  });
};

export const useOutstandingBalance = (providerId?: string) => {
  return useQuery({
    queryKey: ["outstanding-balance", providerId],
    queryFn: async () => {
      const { data: customers } = await supabase
        .from("customers")
        .select("id")
        .eq("provider_id", providerId);

      const customerIds = customers?.map(c => c.id) || [];

      const { data, error } = await supabase
        .from("invoices")
        .select("amount")
        .in("customer_id", customerIds)
        .eq("status", "overdue");

      if (error) throw error;

      const total = data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const count = data?.length || 0;

      return { total, count };
    },
    enabled: !!providerId,
  });
};
