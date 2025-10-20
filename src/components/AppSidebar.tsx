import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Wifi,
  Activity,
  FileText,
  Settings,
  Building2,
  LogOut,
  BarChart3,
  CreditCard,
  Network,
  Shield,
  Gauge,
  Server,
  Globe,
  Router,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "./RoleSwitcher";

interface AppSidebarProps {
  userRole: "platform_owner" | "isp_provider" | "customer" | null;
}

const platformOwnerItems = [
  { title: "Dashboard", url: "/platform-owner", icon: LayoutDashboard },
  { title: "ISP Providers", url: "/platform-owner/providers", icon: Building2 },
  { title: "Routers", url: "/platform-owner/routers", icon: Wifi },
  { title: "Analytics", url: "/platform-owner/analytics", icon: BarChart3 },
  { title: "Settings", url: "/platform-owner/settings", icon: Settings },
];

const ispProviderItems = [
  { title: "Dashboard", url: "/isp-provider", icon: LayoutDashboard },
  { title: "Customers", url: "/isp-provider/customers", icon: Users },
  { title: "Packages", url: "/isp-provider/packages", icon: Package },
];

const networkItems = [
  { title: "Router Management", url: "/isp-provider/routers", icon: Router },
  { title: "Network Monitor", url: "/isp-provider/network", icon: Activity },
  { title: "VLAN Configuration", url: "/isp-provider/network/vlans", icon: Network },
  { title: "Firewall Rules", url: "/isp-provider/network/firewall", icon: Shield },
  { title: "Bandwidth Control", url: "/isp-provider/network/bandwidth", icon: Gauge },
];

const businessItems = [
  { title: "Billing", url: "/isp-provider/billing", icon: CreditCard },
  { title: "Reports", url: "/isp-provider/reports", icon: FileText },
  { title: "Settings", url: "/isp-provider/settings", icon: Settings },
];

export function AppSidebar({ userRole }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const mainItems = userRole === "platform_owner" ? platformOwnerItems : ispProviderItems;
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    }
  };

  return (
    <Sidebar collapsible="icon" className="z-20 bg-background border-r">
      <SidebarHeader className="border-b p-4 space-y-3 bg-background">
        <div className="flex items-center gap-2">
          <Wifi className="h-6 w-6 text-primary" />
          <span className="font-semibold">ISP System</span>
        </div>
        <RoleSwitcher />
      </SidebarHeader>

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel>{userRole === "platform_owner" ? "Platform" : "Main"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === "isp_provider" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Network Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {networkItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink to={item.url} end>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Business</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {businessItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink to={item.url} end>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4 bg-background">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-2">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
