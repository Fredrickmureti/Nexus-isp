import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fetch firewall rules for a specific router
export const useFirewallRules = (routerId: string) => {
  return useQuery({
    queryKey: ["firewall-rules", routerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("firewall_rules")
        .select("*")
        .eq("router_id", routerId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!routerId,
  });
};

// Create firewall rule
export const useCreateFirewallRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleData: {
      router_id: string;
      chain: "input" | "forward" | "output";
      action: "accept" | "drop" | "reject" | "return" | "jump";
      protocol?: string;
      src_address?: string;
      dst_address?: string;
      src_port?: string;
      dst_port?: string;
      comment?: string;
      enabled?: boolean;
      position?: number;
    }) => {
      // If no position specified, put at end
      if (!ruleData.position) {
        const { count } = await supabase
          .from("firewall_rules")
          .select("*", { count: "exact" })
          .eq("router_id", ruleData.router_id);

        ruleData.position = (count || 0) + 1;
      }

      const { data, error } = await supabase
        .from("firewall_rules")
        .insert(ruleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["firewall-rules", data.router_id] });
      toast.success("Firewall rule created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create firewall rule: ${error.message}`);
    },
  });
};

// Update firewall rule
export const useUpdateFirewallRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      router_id?: string;
      chain?: "input" | "forward" | "output";
      action?: "accept" | "drop" | "reject" | "return" | "jump";
      protocol?: string;
      src_address?: string;
      dst_address?: string;
      src_port?: string;
      dst_port?: string;
      comment?: string;
      enabled?: boolean;
      position?: number;
    }) => {
      const { data, error } = await supabase
        .from("firewall_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["firewall-rules", data.router_id] });
      toast.success("Firewall rule updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update firewall rule: ${error.message}`);
    },
  });
};

// Delete firewall rule
export const useDeleteFirewallRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, routerId }: { id: string; routerId: string }) => {
      const { error } = await supabase
        .from("firewall_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, routerId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["firewall-rules", data.routerId] });
      toast.success("Firewall rule deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete firewall rule: ${error.message}`);
    },
  });
};

// Move firewall rule position
export const useMoveFirewallRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      routerId, 
      newPosition 
    }: { 
      id: string; 
      routerId: string; 
      newPosition: number; 
    }) => {
      // Get current rule
      const { data: currentRule, error: getCurrentError } = await supabase
        .from("firewall_rules")
        .select("position")
        .eq("id", id)
        .single();

      if (getCurrentError) throw getCurrentError;

      const currentPosition = currentRule.position;

      // Update positions of other rules
      if (newPosition > currentPosition) {
        // Moving down: shift rules - handle this via edge function
      } else if (newPosition < currentPosition) {
        // Moving up: shift rules - handle this via edge function
      }

      // Update target rule position
      const { data, error } = await supabase
        .from("firewall_rules")
        .update({ position: newPosition })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["firewall-rules", data.router_id] });
      toast.success("Firewall rule position updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to move firewall rule: ${error.message}`);
    },
  });
};

// Toggle firewall rule (enable/disable)
export const useToggleFirewallRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from("firewall_rules")
        .update({ enabled })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["firewall-rules", data.router_id] });
      toast.success(`Firewall rule ${data.enabled ? "enabled" : "disabled"}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle firewall rule: ${error.message}`);
    },
  });
};