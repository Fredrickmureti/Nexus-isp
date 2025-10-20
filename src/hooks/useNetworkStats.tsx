import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNetworkStats = (providerId?: string) => {
  return useQuery({
    queryKey: ["network-stats", providerId],
    queryFn: async () => {
      // Get active sessions
      const { data: activeSessions, error: sessionsError } = await supabase
        .from("customer_sessions")
        .select(`
          *,
          customers!inner (
            provider_id,
            full_name
          )
        `)
        .eq("customers.provider_id", providerId)
        .eq("status", "active");

      if (sessionsError) throw sessionsError;

      // Get total customers
      const { count: totalCustomers } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("provider_id", providerId);

      // Get bandwidth usage for last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: bandwidthData, error: bandwidthError } = await supabase
        .from("bandwidth_usage")
        .select(`
          *,
          customers!inner (
            provider_id
          )
        `)
        .eq("customers.provider_id", providerId)
        .gte("recorded_at", yesterday.toISOString())
        .order("recorded_at", { ascending: true });

      if (bandwidthError) throw bandwidthError;

      // Calculate total traffic
      const totalTraffic = bandwidthData?.reduce(
        (sum, record) => sum + Number(record.total_mb || 0),
        0
      ) || 0;

      // Group bandwidth by hour for chart
      const bandwidthByHour: { [key: string]: number } = {};
      bandwidthData?.forEach(record => {
        const hour = new Date(record.recorded_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          hour12: false 
        });
        bandwidthByHour[hour] = (bandwidthByHour[hour] || 0) + Number(record.total_mb || 0);
      });

      const chartData = Object.entries(bandwidthByHour).map(([time, usage]) => ({
        time,
        usage: Math.round(usage),
      }));

      return {
        onlineUsers: activeSessions?.length || 0,
        offlineUsers: (totalCustomers || 0) - (activeSessions?.length || 0),
        totalTraffic: Math.round(totalTraffic),
        activeSessions: activeSessions || [],
        chartData,
      };
    },
    enabled: !!providerId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useRouterStatus = (providerId?: string) => {
  return useQuery({
    queryKey: ["router-status", providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routers")
        .select("id, status")
        .eq("provider_id", providerId);

      if (error) throw error;

      const onlineCount = data?.filter(r => r.status === "online").length || 0;
      const totalCount = data?.length || 0;

      return {
        onlineCount,
        totalCount,
        status: onlineCount === totalCount ? "Online" : onlineCount > 0 ? "Warning" : "Offline",
      };
    },
    enabled: !!providerId,
    refetchInterval: 30000,
  });
};

export const usePendingIssues = (providerId?: string) => {
  return useQuery({
    queryKey: ["pending-issues", providerId],
    queryFn: async () => {
      const { data: customers } = await supabase
        .from("customers")
        .select("id")
        .eq("provider_id", providerId);

      const customerIds = customers?.map(c => c.id) || [];

      // Count overdue invoices
      const { count: overdueInvoices } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .in("customer_id", customerIds)
        .eq("status", "overdue");

      // Count offline routers
      const { count: offlineRouters } = await supabase
        .from("routers")
        .select("*", { count: "exact", head: true })
        .eq("provider_id", providerId)
        .eq("status", "offline");

      const total = (overdueInvoices || 0) + (offlineRouters || 0);

      return {
        count: total,
        message: total === 0 ? "No issues" : `${total} issue${total > 1 ? 's' : ''}`,
      };
    },
    enabled: !!providerId,
  });
};
