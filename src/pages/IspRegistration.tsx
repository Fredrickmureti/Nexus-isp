import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Building2, User, CreditCard, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";

type RegistrationStep = 1 | 2 | 3 | 4 | 5;

interface SubscriptionPlan {
  id: string;
  plan_name: string;
  display_name: string;
  monthly_price: number;
  yearly_price: number | null;
  max_customers: number;
  max_routers: number;
  max_bandwidth_gb: number | null;
  features: string[];
  trial_days: number;
}

const IspRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Account Details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Step 2: Company Information
  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [address, setAddress] = useState("");

  // Step 3: Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Step 4: Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Fetch subscription plans
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("monthly_price");
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  const progress = (currentStep / 5) * 100;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!email || !password || !confirmPassword || !fullName) {
        toast.error("Please fill in all fields");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }

    if (currentStep === 2) {
      if (!companyName || !companyEmail || !companyPhone) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    if (currentStep === 3) {
      if (!selectedPlan) {
        toast.error("Please select a subscription plan");
        return;
      }
    }

    if (currentStep === 4) {
      if (!acceptedTerms) {
        toast.error("Please accept the terms and conditions");
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as RegistrationStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as RegistrationStep);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Call the registration edge function
      const { data, error } = await supabase.functions.invoke("register-isp", {
        body: {
          email,
          password,
          full_name: fullName,
          company_name: companyName,
          company_email: companyEmail,
          company_phone: companyPhone,
          address,
          registration_number: registrationNumber,
          plan_name: selectedPlan,
          billing_cycle: billingCycle,
        },
      });

      if (error) throw error;

      toast.success("Registration successful! Please check your email to verify your account.");
      
      // Redirect to auth page after 2 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans?.find((p) => p.plan_name === selectedPlan);
  const planPrice = billingCycle === "yearly" 
    ? selectedPlanData?.yearly_price || 0
    : selectedPlanData?.monthly_price || 0;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl">ISP Provider Registration</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Back to Login
            </Button>
          </div>
          <CardDescription>
            Step {currentStep} of 5: {
              currentStep === 1 ? "Account Details" :
              currentStep === 2 ? "Company Information" :
              currentStep === 3 ? "Plan Selection" :
              currentStep === 4 ? "Review & Accept" : "Complete"
            }
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>

        <CardContent>
          {/* Step 1: Account Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Account Details</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name *</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          )}

          {/* Step 2: Company Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Company Information</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ABC Internet Services"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration-number">Registration Number</Label>
                <Input
                  id="registration-number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Company Email *</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="info@abcisp.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Company Phone *</Label>
                <Input
                  id="company-phone"
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, Country"
                />
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Choose Your Plan</h3>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Button
                  variant={billingCycle === "monthly" ? "default" : "outline"}
                  onClick={() => setBillingCycle("monthly")}
                  className="flex-1"
                >
                  Monthly
                </Button>
                <Button
                  variant={billingCycle === "yearly" ? "default" : "outline"}
                  onClick={() => setBillingCycle("yearly")}
                  className="flex-1"
                >
                  Yearly (Save 17%)
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {plans?.map((plan) => {
                  const price = billingCycle === "yearly" ? plan.yearly_price || 0 : plan.monthly_price;
                  const isTrial = plan.plan_name === "trial";
                  
                  return (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        selectedPlan === plan.plan_name
                          ? "border-primary ring-2 ring-primary"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedPlan(plan.plan_name)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {plan.display_name}
                          {isTrial && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {plan.trial_days} Days Free
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          <span className="text-2xl font-bold">${price}</span>
                          <span className="text-sm">/{billingCycle === "yearly" ? "year" : "month"}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Review & Accept */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Your Information</h3>
              
              <div className="space-y-4 bg-muted p-4 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">Account</h4>
                  <p className="text-sm text-muted-foreground">{fullName}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Company</h4>
                  <p className="text-sm text-muted-foreground">{companyName}</p>
                  <p className="text-sm text-muted-foreground">{companyEmail}</p>
                  <p className="text-sm text-muted-foreground">{companyPhone}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlanData?.display_name} - ${planPrice}/{billingCycle === "yearly" ? "year" : "month"}
                  </p>
                  {selectedPlanData?.plan_name === "trial" && (
                    <p className="text-sm text-primary">Includes {selectedPlanData.trial_days} days free trial</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I accept the Terms and Conditions and Privacy Policy. I understand that I will receive 
                  a verification email and my account will be activated upon email confirmation.
                </Label>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">Registration Successful!</h3>
              <p className="text-muted-foreground">
                Please check your email at <strong>{email}</strong> to verify your account.
              </p>
              <p className="text-sm text-muted-foreground">
                You will be redirected to the login page shortly...
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creating Account..." : "Complete Registration"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IspRegistration;
