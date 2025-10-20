import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Bell, Lock, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function IspSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_providers")
        .select("*")
        .eq("owner_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">ISP Settings</h1>
        <p className="text-muted-foreground">Manage your provider account settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Company Profile</CardTitle>
            </div>
            <CardDescription>Update your company information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Company Name</Label>
              <Input defaultValue={provider?.company_name} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" defaultValue={provider?.company_email} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input defaultValue={provider?.company_phone || ""} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Textarea defaultValue={provider?.address || ""} rows={3} />
            </div>
            <div className="grid gap-2">
              <Label>Logo URL</Label>
              <Input defaultValue={provider?.logo_url || ""} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Customer Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new customers sign up
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Payment Received</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when customers make payments
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Router Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when routers go offline
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bandwidth Warnings</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when customers exceed limits
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              <CardTitle>Router API Configuration</CardTitle>
            </div>
            <CardDescription>Configure router management settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Default API Type</Label>
              <Input defaultValue="MikroTik API" disabled />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Default API Port</Label>
                <Input type="number" defaultValue="8728" />
              </div>
              <div className="grid gap-2">
                <Label>Connection Timeout (seconds)</Label>
                <Input type="number" defaultValue="30" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>Manage account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div className="grid gap-2">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
