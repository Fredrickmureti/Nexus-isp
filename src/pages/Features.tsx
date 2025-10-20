import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import {
  Server,
  Users,
  DollarSign,
  Wifi,
  BarChart3,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  ArrowRight,
  Settings,
  Bell,
  CreditCard,
  Lock,
  Cloud,
  TrendingUp,
} from "lucide-react";
import billingAutomation from "@/assets/billing-automation.jpg";

const Features = () => {
  const navigate = useNavigate();

  const featureCategories = [
    {
      title: "Customer Management",
      icon: Users,
      features: [
        "Complete customer lifecycle management",
        "Automated provisioning and onboarding",
        "Customer portal with self-service",
        "Custom fields and metadata",
        "Bulk import/export capabilities",
        "Advanced search and filtering",
      ],
    },
    {
      title: "Router Control",
      icon: Server,
      features: [
        "MikroTik, Cisco, Ubiquiti support",
        "API, SSH, and SNMP integration",
        "Real-time bandwidth control",
        "VLAN and IP pool management",
        "Firewall rule configuration",
        "PPPoE secret management",
      ],
    },
    {
      title: "Billing & Invoicing",
      icon: DollarSign,
      features: [
        "Automated invoice generation",
        "Multiple payment gateways",
        "Recurring billing cycles",
        "Pro-rata calculations",
        "Tax and discount management",
        "Payment reminder automation",
      ],
    },
    {
      title: "Network Monitoring",
      icon: BarChart3,
      features: [
        "Real-time bandwidth tracking",
        "Active user monitoring",
        "Usage reports and analytics",
        "Network health dashboard",
        "Performance metrics",
        "Historical data analysis",
      ],
    },
    {
      title: "Security & Compliance",
      icon: Shield,
      features: [
        "Multi-tenant isolation",
        "Role-based access control",
        "Encrypted data storage",
        "Audit logs and trails",
        "GDPR compliance ready",
        "Two-factor authentication",
      ],
    },
    {
      title: "Automation",
      icon: Zap,
      features: [
        "Auto-suspend unpaid accounts",
        "Scheduled task execution",
        "Email notification triggers",
        "Bandwidth limit enforcement",
        "Contract renewal reminders",
        "Custom workflow automation",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold">
            Powerful Features for
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Modern ISPs
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to manage, automate, and scale your internet service business—all in one platform.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary shadow-glow"
            onClick={() => navigate("/register-isp")}
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureCategories.map((category) => (
            <Card key={category.title} className="p-8 hover:shadow-xl transition-shadow">
              <div className="p-3 rounded-xl bg-gradient-primary w-fit mb-6">
                <category.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-6">{category.title}</h3>
              <ul className="space-y-3">
                {category.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Billing Automation Highlight */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Automated Billing That Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Stop chasing payments and managing spreadsheets. Our automated billing system handles everything for you.
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: CreditCard,
                  title: "Multiple Payment Methods",
                  description: "Accept payments via M-Pesa, Stripe, bank transfer, and more",
                },
                {
                  icon: Bell,
                  title: "Smart Reminders",
                  description: "Automatic payment reminders before and after due dates",
                },
                {
                  icon: Lock,
                  title: "Automatic Suspension",
                  description: "Auto-suspend unpaid accounts based on your policies",
                },
                {
                  icon: TrendingUp,
                  title: "Revenue Analytics",
                  description: "Real-time revenue tracking and financial reports",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 h-fit">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img 
              src={billingAutomation} 
              alt="Billing Automation" 
              className="rounded-2xl shadow-xl border border-border"
            />
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Works With Your Stack</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Seamlessly integrate with the tools and platforms you already use
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Server,
              title: "Router Platforms",
              items: ["MikroTik RouterOS", "Cisco IOS", "Ubiquiti EdgeOS", "OpenWRT", "Generic API/SSH"],
            },
            {
              icon: CreditCard,
              title: "Payment Gateways",
              items: ["M-Pesa Integration", "Stripe", "PayPal", "Bank Transfer", "Custom Gateway API"],
            },
            {
              icon: Cloud,
              title: "Cloud Services",
              items: ["AWS", "Google Cloud", "Azure", "DigitalOcean", "On-Premise"],
            },
          ].map((integration) => (
            <Card key={integration.title} className="p-8">
              <div className="p-3 rounded-lg bg-gradient-accent w-fit mb-4">
                <integration.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{integration.title}</h3>
              <ul className="space-y-2">
                {integration.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-primary text-primary-foreground">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl opacity-90">
              Start your 14-day free trial. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/register-isp")}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => navigate("/pricing")}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
