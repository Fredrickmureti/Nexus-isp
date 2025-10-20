import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fetch IP address pools for a specific router
export const useIPPools = (routerId: string) => {
  return useQuery({
    queryKey: ["ip-pools", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_address_pools")
        .select("*")
        .eq("router_id", routerId)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

// Create IP address pool
export const useCreateIPPool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (poolData: {
      router_id: string;
      name: string;
      ip_range_start?: string;
      ip_range_end?: string;
      gateway?: string;
      dns_servers?: string;
    }) => {
      // Use the ip_range format for now (we'll update schema later if needed)
      const ip_range = poolData.ip_range_start && poolData.ip_range_end 
        ? `${poolData.ip_range_start}-${poolData.ip_range_end}`
        : `${poolData.ip_range_start || '192.168.1.1'}-${poolData.ip_range_end || '192.168.1.254'}`;

      const insertData = {
        router_id: poolData.router_id,
        name: poolData.name,
        ip_range,
        gateway: poolData.gateway,
        dns_servers: poolData.dns_servers,
      };

      const { data, error } = await supabase
        .from("ip_address_pools")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ip-pools", data.router_id] });
      toast.success("IP address pool created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create IP pool: ${error.message}`);
    },
  });
};

// Update IP address pool
export const useUpdateIPPool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      router_id?: string;
      name?: string;
      ip_range?: string;
      ip_range_start?: string;
      ip_range_end?: string;
      gateway?: string;
      dns_servers?: string;
    }) => {
      // Build the update object with current schema fields
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.gateway) updateData.gateway = updates.gateway;
      if (updates.dns_servers) updateData.dns_servers = updates.dns_servers;
      
      // Handle ip_range update
      if (updates.ip_range_start && updates.ip_range_end) {
        updateData.ip_range = `${updates.ip_range_start}-${updates.ip_range_end}`;
      } else if (updates.ip_range) {
        updateData.ip_range = updates.ip_range;
      }

      const { data, error } = await supabase
        .from("ip_address_pools")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ip-pools", data.router_id] });
      toast.success("IP address pool updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update IP pool: ${error.message}`);
    },
  });
};

// Delete IP address pool
export const useDeleteIPPool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, routerId }: { id: string; routerId: string }) => {
      const { error } = await supabase
        .from("ip_address_pools")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, routerId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ip-pools", data.routerId] });
      toast.success("IP address pool deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete IP pool: ${error.message}`);
    },
  });
};