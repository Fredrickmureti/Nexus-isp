import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "platform_owner" | "isp_provider" | "customer" | null;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
        setUserRoles([]);
      } else if (data && data.length > 0) {
        const roles = data.map(r => r.role as UserRole);
        console.log("User roles found:", roles);
        setUserRoles(roles);
        // Set primary role (prefer platform_owner, then isp_provider, then customer)
        const primaryRole = roles.includes("platform_owner") 
          ? "platform_owner" 
          : roles.includes("isp_provider") 
          ? "isp_provider" 
          : roles[0];
        setUserRole(primaryRole);
      } else {
        console.warn("No role assigned to user:", userId);
        setUserRole(null);
        setUserRoles([]);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole(null);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole) => userRoles.includes(role);
  const hasPlatformOwnerRole = () => hasRole("platform_owner");
  const hasIspProviderRole = () => hasRole("isp_provider");

  return { 
    user, 
    session, 
    userRole, 
    userRoles, 
    loading, 
    hasRole, 
    hasPlatformOwnerRole, 
    hasIspProviderRole 
  };
};
