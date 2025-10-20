import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Server, Users, DollarSign, Wifi, BarChart3, Shield, Zap, Globe, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import routerSetup from "@/assets/router-setup.jpg";
import networkDiagram from "@/assets/network-diagram.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, hasPlatformOwnerRole, hasIspProviderRole, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      if (hasPlatformOwnerRole()) {
        navigate("/platform-owner");
      } else if (hasIspProviderRole()) {
        navigate("/isp-provider");
      }
    }
  }, [user, loading, hasPlatformOwnerRole, hasIspProviderRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Trusted by 500+ ISPs Worldwide
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Manage Your ISP
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                In The Cloud
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Complete billing, customer management, and router control platform. 
              Automate operations, scale effortlessly, and focus on growing your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary shadow-glow text-lg px-8"
                onClick={() => navigate("/register-isp")}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8"
                onClick={() => navigate("/how-it-works")}
              >
                See How It Works
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
            <img 
              src={heroDashboard} 
              alt="ISP Management Dashboard" 
              className="relative rounded-2xl shadow-2xl border border-border"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "500+", label: "Active ISPs" },
            { number: "50K+", label: "Managed Customers" },
            { number: "99.9%", label: "Uptime SLA" },
            { number: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Setup in Minutes, Not Days</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get your ISP management system running in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Connect Your Router",
              description: "Add your MikroTik, Cisco, or Ubiquiti routers with just IP address and credentials. Supports API, SSH, and SNMP.",
              icon: Server,
            },
            {
              step: "02",
              title: "Configure Packages",
              description: "Create service packages with pricing and bandwidth limits. Our system automatically applies them to your routers.",
              icon: Zap,
            },
            {
              step: "03",
              title: "Start Managing",
              description: "Add customers, generate invoices, monitor networks, and control bandwidth—all from one dashboard.",
              icon: BarChart3,
            },
          ].map((item) => (
            <Card key={item.step} className="p-8 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 text-8xl font-bold text-muted/5 group-hover:text-primary/5 transition-colors">
                {item.step}
              </div>
              <div className="relative space-y-4">
                <div className="p-3 rounded-xl bg-gradient-primary w-fit">
                  <item.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <img 
            src={routerSetup} 
            alt="Router Setup Process" 
            className="rounded-2xl shadow-xl border border-border mx-auto"
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Everything You Need</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to run and scale your ISP business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              title: "Customer Management",
              description: "Complete lifecycle management with automated provisioning and controls.",
            },
            {
              icon: DollarSign,
              title: "Automated Billing",
              description: "Smart invoicing, payment tracking, and gateway integration.",
            },
            {
              icon: Server,
              title: "Router Control",
              description: "Direct integration with major router platforms and APIs.",
            },
            {
              icon: BarChart3,
              title: "Real-Time Analytics",
              description: "Monitor bandwidth, usage, and network performance instantly.",
            },
            {
              icon: Shield,
              title: "Multi-Tenant Security",
              description: "Enterprise-grade security with complete data isolation.",
            },
            {
              icon: Zap,
              title: "Instant Automation",
              description: "Auto-suspend accounts, send reminders, manage renewals.",
            },
            {
              icon: Globe,
              title: "White-Label Ready",
              description: "Fully customizable branding for your ISP business.",
            },
            {
              icon: Wifi,
              title: "Network Monitoring",
              description: "Live tracking of online users and bandwidth consumption.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="p-6 hover:shadow-lg transition-all group">
              <div className="p-3 rounded-lg bg-gradient-primary w-fit mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Network Diagram */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <img 
              src={networkDiagram} 
              alt="Network Architecture" 
              className="rounded-2xl shadow-xl border border-border"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Cloud-Native Architecture
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Built on modern cloud infrastructure for maximum scalability, reliability, and performance.
            </p>
            <ul className="space-y-4">
              {[
                "Multi-region deployment for low latency",
                "Automatic scaling based on demand",
                "Real-time data synchronization",
                "99.9% uptime SLA guarantee",
                "Encrypted data at rest and in transit",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" variant="outline" onClick={() => navigate("/features")}>
              Explore All Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 md:p-16 text-center bg-gradient-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your ISP Business?
            </h2>
            <p className="text-xl opacity-90">
              Join hundreds of ISPs already managing their networks with our platform. 
              Start your free trial today—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8"
                onClick={() => navigate("/register-isp")}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8"
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

export default Index;
