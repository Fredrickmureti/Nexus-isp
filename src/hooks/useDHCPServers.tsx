import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fetch DHCP servers for a specific router
export const useDHCPServers = (routerId: string) => {
  return useQuery({
    queryKey: ["dhcp-servers", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dhcp_servers")
        .select("*")
        .eq("router_id", routerId)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

// Sync DHCP servers from router
export const useSyncDHCPServers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: string) => {
      const { data, error } = await supabase.functions.invoke("sync-dhcp-servers", {
        body: { routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, routerId) => {
      queryClient.invalidateQueries({ queryKey: ["dhcp-servers", routerId] });
      toast.success(data.message || "DHCP servers synced successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync DHCP servers: ${error.message}`);
    },
  });
};

// Create DHCP server
export const useCreateDHCPServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dhcpData: {
      router_id: string;
      name: string;
      interface: string;
      address_pool: string;
      lease_time?: string;
      dns_servers?: string;
      gateway?: string;
      enabled?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("dhcp_servers")
        .insert(dhcpData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dhcp-servers", data.router_id] });
      toast.success("DHCP server created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create DHCP server: ${error.message}`);
    },
  });
};

// Update DHCP server
export const useUpdateDHCPServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      router_id?: string;
      name?: string;
      interface?: string;
      address_pool?: string;
      lease_time?: string;
      dns_servers?: string;
      gateway?: string;
      enabled?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("dhcp_servers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dhcp-servers", data.router_id] });
      toast.success("DHCP server updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update DHCP server: ${error.message}`);
    },
  });
};

// Delete DHCP server
export const useDeleteDHCPServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, routerId }: { id: string; routerId: string }) => {
      const { error } = await supabase
        .from("dhcp_servers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, routerId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dhcp-servers", data.routerId] });
      toast.success("DHCP server deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete DHCP server: ${error.message}`);
    },
  });
};