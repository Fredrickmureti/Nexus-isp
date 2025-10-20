import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Database, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PlatformSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your platform settings have been updated successfully",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Platform Name</Label>
              <Input defaultValue="ISP Management Platform" />
            </div>
            <div className="grid gap-2">
              <Label>Support Email</Label>
              <Input type="email" defaultValue="support@platform.com" />
            </div>
            <div className="grid gap-2">
              <Label>Platform Description</Label>
              <Textarea
                defaultValue="Comprehensive ISP management solution"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important events
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Payment Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when providers make payments
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Provider Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when new providers sign up
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>Manage security and access controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for admin accounts
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Auto logout after inactivity
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label>Maximum Login Attempts</Label>
              <Input type="number" defaultValue="3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Subscription Plans</CardTitle>
            </div>
            <CardDescription>Configure subscription tiers and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Trial Plan</Label>
                  <Input type="number" placeholder="0" defaultValue="0" />
                  <p className="text-xs text-muted-foreground">Free trial period</p>
                </div>
                <div className="space-y-2">
                  <Label>Basic Plan</Label>
                  <Input type="number" placeholder="29.99" defaultValue="29.99" />
                  <p className="text-xs text-muted-foreground">Per month</p>
                </div>
                <div className="space-y-2">
                  <Label>Professional Plan</Label>
                  <Input type="number" placeholder="99.99" defaultValue="99.99" />
                  <p className="text-xs text-muted-foreground">Per month</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max Customers (Trial)</Label>
                  <Input type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label>Max Customers (Basic)</Label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label>Max Customers (Pro)</Label>
                  <Input type="number" defaultValue="1000" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Templates</CardTitle>
            </div>
            <CardDescription>Customize email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Welcome Email Subject</Label>
              <Input defaultValue="Welcome to ISP Management Platform" />
            </div>
            <div className="grid gap-2">
              <Label>Welcome Email Body</Label>
              <Textarea
                defaultValue="Thank you for joining our platform. We're excited to have you on board!"
                rows={4}
              />
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label>Payment Confirmation Subject</Label>
              <Input defaultValue="Payment Received - Thank You" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
