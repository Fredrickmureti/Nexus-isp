import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface RecentActivitySectionProps {
  providerId?: string;
}

export const RecentActivitySection = ({ providerId }: RecentActivitySectionProps) => {
  const queryClient = useQueryClient();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activity-logs", providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("provider_id", providerId!)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const { error } = await supabase
        .from("activity_logs")
        .delete()
        .eq("id", activityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      toast.success("Activity log deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete activity: ${error.message}`);
    },
  });

  const getActivityColor = (actionType: string) => {
    switch (actionType) {
      case "router_online":
      case "customer_activated":
        return "bg-green-500";
      case "bandwidth_updated":
      case "customer_added":
        return "bg-blue-500";
      case "router_offline":
      case "payment_overdue":
        return "bg-orange-500";
      case "customer_suspended":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading activities...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      <Card>
        <CardContent className="p-6">
          {activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 group">
                  <div className={`w-2 h-2 ${getActivityColor(activity.action_type)} rounded-full mt-2 flex-shrink-0`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteActivityMutation.mutate(activity.id)}
                    disabled={deleteActivityMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No recent activity to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};