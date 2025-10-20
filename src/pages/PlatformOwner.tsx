import { Card } from "@/components/ui/card";
import { Users, DollarSign, Server, TrendingUp, Activity } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ProvidersTable } from "@/components/dashboard/ProvidersTable";
import { useProviderStats } from "@/hooks/useProviders";

const PlatformOwner = () => {
  const { data: stats, isLoading } = useProviderStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">Platform Overview</h1>
          <p className="text-muted-foreground">Manage ISP providers and monitor platform performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active ISPs"
            value={stats?.activeProviders.toString() || "0"}
            change={`${stats?.totalProviders || 0} total`}
            icon={Server}
            trend="up"
          />
          <StatsCard
            title="Total Users"
            value={stats?.totalCustomers.toLocaleString() || "0"}
            change="All customers"
            icon={Users}
            trend="up"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats?.monthlyRevenue.toLocaleString() || "0"}`}
            change="This month"
            icon={DollarSign}
            trend="up"
          />
          <StatsCard
            title="Platform Health"
            value="99.8%"
            change="Uptime"
            icon={Activity}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Revenue Overview</h2>
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <RevenueChart />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Trial ISPs</span>
                <span className="font-semibold text-accent">
                  {stats?.activeProviders || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Avg. Customers per ISP</span>
                <span className="font-semibold">
                  {stats?.totalProviders && stats.totalProviders > 0 
                    ? Math.round(stats.totalCustomers / stats.totalProviders) 
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Growth Rate</span>
                <span className="font-semibold text-success">Growing</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Platform Status</span>
                <span className="font-semibold text-success">Operational</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active ISP Providers</h2>
          <ProvidersTable />
        </Card>
      </div>
    </div>
  );
};

export default PlatformOwner;
