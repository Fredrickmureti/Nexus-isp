import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fetch bandwidth queues for a specific router
export const useBandwidthQueues = (routerId: string) => {
  return useQuery({
    queryKey: ["bandwidth-queues", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bandwidth_queues")
        .select(`
          *,
          customer:customers(full_name, email)
        `)
        .eq("router_id", routerId)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

// Sync bandwidth queues from router
export const useSyncBandwidthQueues = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: string) => {
      const { data, error } = await supabase.functions.invoke("sync-bandwidth-queues", {
        body: { routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, routerId) => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth-queues", routerId] });
      toast.success(data.message || "Bandwidth queues synced successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync bandwidth queues: ${error.message}`);
    },
  });
};

// Create bandwidth queue
export const useCreateBandwidthQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (queueData: {
      router_id: string;
      customer_id?: string;
      name: string;
      target: string;
      max_upload: number;
      max_download: number;
      priority?: number;
      enabled?: boolean;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from("bandwidth_queues")
        .insert(queueData)
        .select(`
          *,
          customer:customers(full_name, email)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth-queues", data.router_id] });
      toast.success("Bandwidth queue created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create bandwidth queue: ${error.message}`);
    },
  });
};

// Update bandwidth queue
export const useUpdateBandwidthQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      router_id?: string;
      customer_id?: string;
      name?: string;
      target?: string;
      max_upload?: number;
      max_download?: number;
      priority?: number;
      enabled?: boolean;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from("bandwidth_queues")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          customer:customers(full_name, email)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth-queues", data.router_id] });
      toast.success("Bandwidth queue updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bandwidth queue: ${error.message}`);
    },
  });
};

// Delete bandwidth queue
export const useDeleteBandwidthQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, routerId }: { id: string; routerId: string }) => {
      const { error } = await supabase
        .from("bandwidth_queues")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, routerId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth-queues", data.routerId] });
      toast.success("Bandwidth queue deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete bandwidth queue: ${error.message}`);
    },
  });
};

// Auto-create bandwidth queue for customer based on package
export const useCreateCustomerBandwidthQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, routerId, packageSpeed }: {
      customerId: string;
      routerId: string;
      packageSpeed: number; // in Mbps
    }) => {
      // Get customer details first
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("full_name, email")
        .eq("id", customerId)
        .single();

      if (customerError) throw customerError;

      // Create bandwidth queue
      const queueData = {
        router_id: routerId,
        customer_id: customerId,
        name: `${customer.full_name}-${packageSpeed}M`,
        target: customerId, // Will be replaced with IP when customer connects
        max_upload: packageSpeed * 1000, // Convert to Kbps
        max_download: packageSpeed * 1000, // Convert to Kbps
        priority: 8,
        enabled: true,
        comment: `Auto-created for ${customer.full_name} (${customer.email})`,
      };

      const { data, error } = await supabase
        .from("bandwidth_queues")
        .insert(queueData)
        .select(`
          *,
          customer:customers(full_name, email)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth-queues", data.router_id] });
      toast.success(`Bandwidth limit created for customer`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create customer bandwidth limit: ${error.message}`);
    },
  });
};