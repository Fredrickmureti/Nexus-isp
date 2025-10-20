import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small ISPs just getting started",
      features: [
        "Up to 100 customers",
        "5 routers",
        "Basic billing & invoicing",
        "Email support",
        "Customer portal",
        "Basic analytics",
      ],
      limitations: ["Limited bandwidth monitoring", "No white-label"],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "For growing ISPs with advanced needs",
      features: [
        "Up to 1,000 customers",
        "20 routers",
        "Advanced billing automation",
        "Priority email & chat support",
        "White-label branding",
        "Advanced analytics & reports",
        "Custom fields & metadata",
        "API access",
      ],
      limitations: [],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large ISPs requiring maximum flexibility",
      features: [
        "Unlimited customers",
        "Unlimited routers",
        "Enterprise billing features",
        "24/7 phone & email support",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantees",
        "On-premise deployment option",
        "Custom contracts & terms",
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Is there a free trial?",
      answer: "Yes! All plans come with a 14-day free trial. No credit card required to start.",
    },
    {
      question: "Can I change plans later?",
      answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes are prorated.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, M-Pesa, and bank transfers for annual plans.",
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees. You only pay for your monthly or annual subscription.",
    },
    {
      question: "What happens if I exceed my customer limit?",
      answer: "You'll be prompted to upgrade to the next tier. We'll notify you before any charges.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for annual plans.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold">
            Simple, Transparent
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your ISP. All plans include 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`p-8 relative ${
                plan.popular 
                  ? "border-2 border-primary shadow-glow scale-105" 
                  : "border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary text-primary-foreground text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? "bg-gradient-primary shadow-glow" 
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => 
                    plan.name === "Enterprise" 
                      ? window.location.href = "mailto:sales@cloudisp.com"
                      : navigate("/register-isp")
                  }
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="pt-6 border-t space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <div key={limitation} className="flex items-start gap-3 opacity-50">
                      <div className="h-5 w-5 flex-shrink-0 mt-0.5">
                        <div className="h-3 w-3 rounded-full border-2 border-muted-foreground mx-auto mt-1"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Starter</th>
                  <th className="text-center p-4 font-semibold">Professional</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: "Customers", starter: "100", pro: "1,000", enterprise: "Unlimited" },
                  { feature: "Routers", starter: "5", pro: "20", enterprise: "Unlimited" },
                  { feature: "Billing Automation", starter: "✓", pro: "✓", enterprise: "✓" },
                  { feature: "Customer Portal", starter: "✓", pro: "✓", enterprise: "✓" },
                  { feature: "Analytics", starter: "Basic", pro: "Advanced", enterprise: "Custom" },
                  { feature: "White-label", starter: "—", pro: "✓", enterprise: "✓" },
                  { feature: "API Access", starter: "—", pro: "✓", enterprise: "✓" },
                  { feature: "Support", starter: "Email", pro: "Email & Chat", enterprise: "24/7 Phone" },
                  { feature: "SLA", starter: "—", pro: "—", enterprise: "99.9%" },
                ].map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="p-4 text-muted-foreground">{row.feature}</td>
                    <td className="p-4 text-center">{row.starter}</td>
                    <td className="p-4 text-center">{row.pro}</td>
                    <td className="p-4 text-center">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="p-6">
                <div className="flex gap-4">
                  <HelpCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-primary text-primary-foreground">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold">Still Have Questions?</h2>
            <p className="text-xl opacity-90">
              Our team is here to help you choose the right plan for your ISP.
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
                onClick={() => window.location.href = "mailto:sales@cloudisp.com"}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
