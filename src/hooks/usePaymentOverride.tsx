import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePaymentOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      providerId,
      override,
      reason,
      overrideUntil,
    }: {
      customerId: string;
      providerId: string;
      override: boolean;
      reason?: string;
      overrideUntil?: string;
    }) => {
      // Update customer
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          payment_override: override,
          override_reason: reason || null,
          override_until: overrideUntil || null,
        })
        .eq("id", customerId);

      if (updateError) throw updateError;

      // Log the override action
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: logError } = await supabase
        .from("payment_override_log")
        .insert({
          customer_id: customerId,
          provider_id: providerId,
          override_status: override,
          reason: reason || null,
          override_until: overrideUntil || null,
          performed_by: user?.id,
        });

      if (logError) console.error("Failed to log override:", logError);

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      
      if (variables.override) {
        toast.success("Payment override enabled", {
          description: "Customer will not be auto-disconnected",
        });
      } else {
        toast.success("Payment override removed", {
          description: "Normal billing rules apply",
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment override: ${error.message}`);
    },
  });
};

export const useToggleAutoDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      enabled,
    }: {
      customerId: string;
      enabled: boolean;
    }) => {
      const { error } = await supabase
        .from("customers")
        .update({ auto_disconnect_enabled: enabled })
        .eq("id", customerId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(
        variables.enabled
          ? "Auto-disconnect enabled"
          : "Auto-disconnect disabled"
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle auto-disconnect: ${error.message}`);
    },
  });
};
