import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTestRouterConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: string) => {
      // Show immediate feedback that test is starting
      toast.info("Testing router connection...", {
        id: `test-${routerId}`,
        duration: 30000, // Keep this toast until test completes
      });

      const { data, error } = await supabase.functions.invoke('test-router-connection', {
        body: { routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, routerId) => {
      queryClient.invalidateQueries({ queryKey: ["routers"] });
      
      // Dismiss the loading toast
      toast.dismiss(`test-${routerId}`);
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error, routerId) => {
      // Dismiss the loading toast
      toast.dismiss(`test-${routerId}`);
      toast.error(`Connection test failed: ${error.message}`);
    },
  });
};

export const useDisconnectCustomer = () => {
  return useMutation({
    mutationFn: async ({ customerId, routerId }: { customerId: string; routerId: string }) => {
      const { data, error } = await supabase.functions.invoke('disconnect-customer-session', {
        body: { customerId, routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(`Disconnect failed: ${error.message}`);
    },
  });
};

export const useSetBandwidthLimit = () => {
  return useMutation({
    mutationFn: async ({
      customerId,
      routerId,
      uploadSpeed,
      downloadSpeed,
    }: {
      customerId: string;
      routerId: string;
      uploadSpeed: number;
      downloadSpeed: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('set-bandwidth-limit', {
        body: { customerId, routerId, uploadSpeed, downloadSpeed },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(`Bandwidth update failed: ${error.message}`);
    },
  });
};
