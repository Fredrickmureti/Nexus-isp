import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function CustomerActivate() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("email, activation_expires_at, user_id")
        .eq("activation_token", token)
        .single();

      if (error || !data) {
        setValidToken(false);
        toast.error("Invalid activation link");
        return;
      }

      // Check if token is expired
      if (new Date(data.activation_expires_at) < new Date()) {
        setValidToken(false);
        toast.error("This activation link has expired");
        return;
      }

      // Check if already activated
      const { data: customer } = await supabase
        .from("customers")
        .select("first_login_at")
        .eq("activation_token", token)
        .single();

      if (customer?.first_login_at) {
        toast.error("This account has already been activated");
        navigate("/customer/login");
        return;
      }

      setCustomerEmail(data.email);
      setValidToken(true);
    } catch (error: any) {
      console.error("Error verifying token:", error);
      setValidToken(false);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setActivating(true);

    try {
      // Get customer with user_id
      const { data: customer } = await supabase
        .from("customers")
        .select("user_id, id")
        .eq("activation_token", token)
        .single();

      if (!customer?.user_id) {
        throw new Error("Customer account not found");
      }

      // Update password using Supabase Admin API
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        customer.user_id,
        { password }
      );

      if (passwordError) throw passwordError;

      // Confirm email
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        customer.user_id,
        { email_confirm: true }
      );

      if (confirmError) throw confirmError;

      // Update customer record
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          activation_token: null,
          activation_expires_at: null,
          first_login_at: new Date().toISOString(),
          account_status: "active",
        })
        .eq("id", customer.id);

      if (updateError) throw updateError;

      toast.success("Account activated successfully! Please sign in.");
      navigate("/customer/login");
    } catch (error: any) {
      console.error("Activation error:", error);
      toast.error(error.message || "Failed to activate account");
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <XCircle className="h-12 w-12 text-destructive mb-2" />
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription>
              This activation link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Please contact your ISP provider for a new activation link
            </p>
            <Button onClick={() => navigate("/customer/login")} variant="outline">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <CheckCircle2 className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Activate Your Account</CardTitle>
          <CardDescription>Set your password to complete activation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={activating}>
              {activating ? "Activating..." : "Activate Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
