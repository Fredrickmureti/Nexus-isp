import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Target, Users, Zap, Shield, ArrowRight } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Target,
      title: "Customer-Focused",
      description: "We build solutions that solve real ISP challenges, driven by feedback from providers like you.",
    },
    {
      icon: Users,
      title: "Community-Driven",
      description: "Growing together with the ISP community, sharing knowledge and best practices.",
    },
    {
      icon: Zap,
      title: "Innovation First",
      description: "Constantly improving our platform with cutting-edge technology and automation.",
    },
    {
      icon: Shield,
      title: "Security & Reliability",
      description: "Enterprise-grade security with 99.9% uptime to keep your business running smoothly.",
    },
  ];

  const stats = [
    { number: "500+", label: "Active ISPs" },
    { number: "50K+", label: "Managed Customers" },
    { number: "15+", label: "Countries" },
    { number: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold">
            Empowering ISPs
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Around The World
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            We're on a mission to make ISP management simple, automated, and accessible for service providers of all sizes.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="p-12">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                CloudISP was founded in 2020 by a team of network engineers and software developers who experienced firsthand 
                the challenges of managing an internet service provider. We spent years using spreadsheets, disconnected tools, 
                and manual processes to run our operations.
              </p>
              <p>
                We knew there had to be a better way. So we built CloudISP—a platform that brings together billing, customer 
                management, router control, and network monitoring into one seamless experience.
              </p>
              <p>
                Today, CloudISP serves over 500 ISPs across 15 countries, managing more than 50,000 customers and helping 
                providers automate their operations and focus on growth.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Our Mission</h2>
          <Card className="p-12 text-center bg-gradient-primary text-primary-foreground">
            <p className="text-2xl leading-relaxed">
              To democratize enterprise-grade ISP management tools, making them accessible and affordable for 
              internet service providers of all sizes—from small local providers to large regional networks.
            </p>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="p-8">
                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-gradient-primary w-fit h-fit">
                    <value.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Built By ISP Experts</h2>
          <p className="text-xl text-muted-foreground">
            Our team combines decades of experience in network engineering, software development, and ISP operations. 
            We understand your challenges because we've lived them.
          </p>
          <div className="grid md:grid-cols-3 gap-8 pt-8">
            {[
              { role: "Network Engineers", count: "8+" },
              { role: "Software Developers", count: "12+" },
              { role: "Support Specialists", count: "6+" },
            ].map((team) => (
              <Card key={team.role} className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">{team.count}</div>
                <div className="text-sm text-muted-foreground">{team.role}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-primary text-primary-foreground">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold">Join Our Growing Community</h2>
            <p className="text-xl opacity-90">
              Start your free trial today and see why hundreds of ISPs trust CloudISP to power their operations.
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

export default About;
