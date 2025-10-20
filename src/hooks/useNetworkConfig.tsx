import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// VLANs
export const useVLANs = (routerId?: string) => {
  return useQuery({
    queryKey: ["vlans", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vlans")
        .select("*")
        .eq("router_id", routerId!)
        .order("vlan_id");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vlans"] });
      toast.success(`Synced ${data.count} VLANs`);
    },
    onError: (error: Error) => {
      toast.error(`VLAN sync failed: ${error.message}`);
    },
  });
};

export const useConfigureVLAN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      routerId,
      vlanId,
      name,
      interfaceName,
      comment,
    }: {
      routerId: string;
      vlanId: number;
      name: string;
      interfaceName: string;
      comment?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("configure-vlan", {
        body: { routerId, vlanId, name, interfaceName, comment },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vlans"] });
      toast.success("VLAN configured successfully");
    },
    onError: (error: Error) => {
      toast.error(`VLAN configuration failed: ${error.message}`);
    },
  });
};

// DHCP Servers
export const useDHCPServers = (routerId?: string) => {
  return useQuery({
    queryKey: ["dhcp-servers", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dhcp_servers")
        .select("*")
        .eq("router_id", routerId!)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dhcp-servers"] });
      toast.success(`Synced ${data.count} DHCP servers`);
    },
    onError: (error: Error) => {
      toast.error(`DHCP sync failed: ${error.message}`);
    },
  });
};

// IP Pools
export const useIPPools = (routerId?: string) => {
  return useQuery({
    queryKey: ["ip-pools", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_address_pools")
        .select("*")
        .eq("router_id", routerId!)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

export const useSyncIPPools = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: string) => {
      const { data, error } = await supabase.functions.invoke("sync-ip-pools", {
        body: { routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ip-pools"] });
      toast.success(`Synced ${data.count} IP pools`);
    },
    onError: (error: Error) => {
      toast.error(`IP pool sync failed: ${error.message}`);
    },
  });
};

// Firewall Rules
export const useFirewallRules = (routerId?: string) => {
  return useQuery({
    queryKey: ["firewall-rules", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("firewall_rules")
        .select("*")
        .eq("router_id", routerId!)
        .order("position");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

export const useSyncFirewallRules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: string) => {
      const { data, error } = await supabase.functions.invoke("sync-firewall-rules", {
        body: { routerId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["firewall-rules"] });
      toast.success(`Synced ${data.count} firewall rules`);
    },
    onError: (error: Error) => {
      toast.error(`Firewall sync failed: ${error.message}`);
    },
  });
};

// Bandwidth Queues
export const useBandwidthQueues = (routerId?: string) => {
  return useQuery({
    queryKey: ["bandwidth-queues", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bandwidth_queues")
        .select("*, customers(full_name)")
        .eq("router_id", routerId!)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth-queues"] });
      toast.success(`Synced ${data.count} bandwidth queues`);
    },
    onError: (error: Error) => {
      toast.error(`Bandwidth queue sync failed: ${error.message}`);
    },
  });
};

export const useConfigureBandwidthQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      routerId,
      customerId,
      name,
      target,
      maxUpload,
      maxDownload,
      priority,
    }: {
      routerId: string;
      customerId?: string;
      name: string;
      target: string;
      maxUpload: number;
      maxDownload: number;
      priority?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("configure-bandwidth-queue", {
        body: { routerId, customerId, name, target, maxUpload, maxDownload, priority },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bandwidth-queues"] });
      toast.success("Bandwidth queue configured successfully");
    },
    onError: (error: Error) => {
      toast.error(`Bandwidth queue configuration failed: ${error.message}`);
    },
  });
};
