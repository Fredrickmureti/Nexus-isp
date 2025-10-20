import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { CheckCircle2, ArrowRight, Play } from "lucide-react";
import routerSetup from "@/assets/router-setup.jpg";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      title: "Sign Up & Configure",
      duration: "5 minutes",
      description: "Create your account, set up your company profile, and configure basic settings. No technical knowledge required.",
      details: [
        "Quick registration process",
        "Company branding setup",
        "User roles and permissions",
        "Initial system configuration",
      ],
    },
    {
      number: "02",
      title: "Connect Your Routers",
      duration: "10 minutes",
      description: "Add your MikroTik, Cisco, or Ubiquiti routers by entering IP address and credentials. We support API, SSH, and SNMP.",
      details: [
        "Add router connection details",
        "Test connectivity automatically",
        "Sync existing configurations",
        "Map interfaces and IP pools",
      ],
    },
    {
      number: "03",
      title: "Create Service Packages",
      duration: "5 minutes",
      description: "Define your internet packages with pricing, bandwidth limits, and billing cycles. Our system handles the rest.",
      details: [
        "Set package names and descriptions",
        "Define bandwidth limits (up/down)",
        "Configure pricing and billing cycles",
        "Assign to specific routers",
      ],
    },
    {
      number: "04",
      title: "Add Your Customers",
      duration: "2 minutes per customer",
      description: "Import existing customers or add new ones. The system automatically provisions their accounts on your routers.",
      details: [
        "Enter customer details",
        "Assign service package",
        "Automatic router provisioning",
        "Generate first invoice",
      ],
    },
    {
      number: "05",
      title: "Automate & Monitor",
      duration: "Ongoing",
      description: "Let CloudISP handle billing, suspensions, and monitoring while you focus on growing your business.",
      details: [
        "Automated invoice generation",
        "Payment tracking and reminders",
        "Auto-suspend unpaid accounts",
        "Real-time network monitoring",
      ],
    },
  ];

  const videoDemo = {
    thumbnail: routerSetup,
    title: "Watch Our 3-Minute Demo",
    description: "See how easy it is to set up and manage your entire ISP operation with CloudISP.",
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold">
            Setup Your ISP Management
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              In Under 30 Minutes
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            No complex integrations. No technical hassles. Just a simple, step-by-step process to get you up and running.
          </p>
        </div>
      </section>

      {/* Video Demo */}
      <section className="container mx-auto px-4 py-12">
        <Card className="relative overflow-hidden max-w-4xl mx-auto group cursor-pointer hover:shadow-2xl transition-shadow">
          <div className="relative aspect-video">
            <img 
              src={videoDemo.thumbnail} 
              alt={videoDemo.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                  <Play className="h-8 w-8 text-primary-foreground ml-1" />
                </div>
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">{videoDemo.title}</h3>
                  <p className="text-white/80">{videoDemo.description}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Steps */}
      <section className="container mx-auto px-4 py-20">
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div 
              key={step.number} 
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="text-6xl font-bold text-primary/20">{step.number}</div>
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-2">
                      {step.duration}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">{step.title}</h2>
                  </div>
                </div>
                <p className="text-xl text-muted-foreground">{step.description}</p>
                <ul className="space-y-3">
                  {step.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className={`p-8 bg-muted/50 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="aspect-video bg-gradient-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="text-6xl font-bold mb-2">{step.number}</div>
                    <div className="text-sm">Screenshot or demo</div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Details */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Technical Requirements</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Supported Routers",
                items: [
                  "MikroTik RouterOS v6+",
                  "Cisco IOS",
                  "Ubiquiti EdgeOS",
                  "Any device with API/SSH",
                ],
              },
              {
                title: "Network Requirements",
                items: [
                  "Internet connectivity",
                  "Router API access enabled",
                  "Firewall rules configured",
                  "Static IP recommended",
                ],
              },
              {
                title: "What We Handle",
                items: [
                  "Cloud infrastructure",
                  "Database management",
                  "Security & backups",
                  "99.9% uptime SLA",
                ],
              },
            ].map((section) => (
              <Card key={section.title} className="p-6">
                <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-primary text-primary-foreground">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl opacity-90">
              Start your free trial today and have your ISP management system running in under 30 minutes.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/register-isp")}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
