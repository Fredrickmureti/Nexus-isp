import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fetch VLANs for a specific router
export const useVLANs = (routerId: string) => {
  return useQuery({
    queryKey: ["vlans", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vlans")
        .select("*")
        .eq("router_id", routerId)
        .order("vlan_id");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

// Sync VLANs from router
export const useSyncVLANs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: string) => {
      const { data, error } = await supabase.functions.invoke("sync-vlans", {
        body: { routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, routerId) => {
      queryClient.invalidateQueries({ queryKey: ["vlans", routerId] });
      toast.success(data.message || "VLANs synced successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync VLANs: ${error.message}`);
    },
  });
};

// Configure VLAN (create/update/delete)
export const useConfigureVLAN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routerId, action, vlanData }: {
      routerId: string;
      action: "create" | "update" | "delete";
      vlanData: any;
    }) => {
      const { data, error } = await supabase.functions.invoke("configure-vlan", {
        body: { routerId, action, vlanData },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vlans", variables.routerId] });
      const actionText = variables.action === "create" ? "created" : 
                        variables.action === "update" ? "updated" : "deleted";
      toast.success(`VLAN ${actionText} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to configure VLAN: ${error.message}`);
    },
  });
};

// Create VLAN (shortcut for configure)
export const useCreateVLAN = () => {
  const configure = useConfigureVLAN();

  return {
    ...configure,
    mutate: (data: { routerId: string; vlanData: any }) =>
      configure.mutate({ ...data, action: "create" }),
    mutateAsync: (data: { routerId: string; vlanData: any }) =>
      configure.mutateAsync({ ...data, action: "create" }),
  };
};

// Update VLAN (shortcut for configure)
export const useUpdateVLAN = () => {
  const configure = useConfigureVLAN();

  return {
    ...configure,
    mutate: (data: { routerId: string; vlanData: any }) =>
      configure.mutate({ ...data, action: "update" }),
    mutateAsync: (data: { routerId: string; vlanData: any }) =>
      configure.mutateAsync({ ...data, action: "update" }),
  };
};

// Delete VLAN (shortcut for configure)
export const useDeleteVLAN = () => {
  const configure = useConfigureVLAN();

  return {
    ...configure,
    mutate: (data: { routerId: string; vlanData: any }) =>
      configure.mutate({ ...data, action: "delete" }),
    mutateAsync: (data: { routerId: string; vlanData: any }) =>
      configure.mutateAsync({ ...data, action: "delete" }),
  };
};