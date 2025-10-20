import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RoleSwitcher() {
  const { hasPlatformOwnerRole, hasIspProviderRole, userRole } = useAuth();
  const navigate = useNavigate();

  // Only show if user has multiple roles
  if (!hasPlatformOwnerRole() || !hasIspProviderRole()) {
    return null;
  }

  const handleRoleSwitch = (role: "platform_owner" | "isp_provider") => {
    if (role === "platform_owner") {
      navigate("/platform-owner");
    } else {
      navigate("/isp-provider");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          {userRole === "platform_owner" ? (
            <>
              <Shield className="h-4 w-4" />
              <span>Platform Owner</span>
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4" />
              <span>ISP Provider</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleRoleSwitch("platform_owner")}>
          <Shield className="h-4 w-4 mr-2" />
          Platform Owner
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleSwitch("isp_provider")}>
          <Building2 className="h-4 w-4 mr-2" />
          ISP Provider
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
