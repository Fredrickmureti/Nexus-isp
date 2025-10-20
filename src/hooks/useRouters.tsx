import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useRouters = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["routers", user?.id],
    queryFn: async () => {
      // Get provider first
      const { data: provider } = await supabase
        .from("isp_providers")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!provider) throw new Error("Provider not found");

      const { data, error } = await supabase
        .from("routers")
        .select("*")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useAddRouter = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (router: {
      name: string;
      ip_address: string;
      manufacturer: string;
      model?: string;
      location?: string;
      api_type: string;
      username?: string;
      password?: string;
      api_port?: number;
    }) => {
      // Get provider ID
      const { data: provider } = await supabase
        .from("isp_providers")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!provider) throw new Error("Provider not found");

      const { data, error } = await supabase
        .from("routers")
        .insert([{
          name: router.name,
          ip_address: router.ip_address,
          manufacturer: router.manufacturer,
          model: router.model,
          location: router.location,
          api_type: router.api_type as any,
          username: router.username,
          password: router.password,
          api_port: router.api_port,
          provider_id: provider.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routers"] });
      toast.success("Router added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateRouter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from("routers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routers"] });
      toast.success("Router updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteRouter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("routers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routers"] });
      toast.success("Router deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
