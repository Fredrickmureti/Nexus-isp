import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSyncRouterInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: string) => {
      const { data, error } = await supabase.functions.invoke("sync-router-info", {
        body: { routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routers"] });
      toast.success("Router info synchronized", {
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });
};

export const useSyncRouterInterfaces = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: string) => {
      const { data, error } = await supabase.functions.invoke("sync-router-interfaces", {
        body: { routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["router-interfaces"] });
      toast.success(`Synchronized ${data.count} interfaces`);
    },
    onError: (error: Error) => {
      toast.error(`Interface sync failed: ${error.message}`);
    },
  });
};

export const useSyncPPPoESessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: string) => {
      const { data, error } = await supabase.functions.invoke("sync-pppoe-sessions", {
        body: { routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pppoe-sessions"] });
      toast.success(`Found ${data.activeSessions} active sessions`);
    },
    onError: (error: Error) => {
      toast.error(`Session sync failed: ${error.message}`);
    },
  });
};

export const useRouterInterfaces = (routerId?: string) => {
  return useQuery({
    queryKey: ["router-interfaces", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("router_interfaces")
        .select("*")
        .eq("router_id", routerId!)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

export const usePPPoESessions = (routerId?: string) => {
  return useQuery({
    queryKey: ["pppoe-sessions", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pppoe_sessions")
        .select(`
          *,
          customers (
            full_name,
            email
          )
        `)
        .eq("router_id", routerId!)
        .eq("status", "active")
        .order("connected_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};
