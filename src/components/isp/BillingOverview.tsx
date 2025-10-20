import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRecentPayments, useRevenueStats, useOutstandingBalance } from "@/hooks/useInvoices";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BillingOverview = () => {
  const { user } = useAuth();

  const { data: provider } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_providers")
        .select("id")
        .eq("owner_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: recentPayments, isLoading: paymentsLoading } = useRecentPayments(provider?.id);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueStats(provider?.id);
  const { data: outstanding, isLoading: outstandingLoading } = useOutstandingBalance(provider?.id);

  if (paymentsLoading || revenueLoading || outstandingLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="text-2xl font-bold text-destructive">
            ${outstanding?.total.toLocaleString() || 0}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {outstanding?.count || 0} overdue invoice{outstanding?.count !== 1 ? 's' : ''}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Collected</p>
          <p className="text-2xl font-bold text-success">
            ${revenueData?.[revenueData.length - 1]?.revenue.toLocaleString() || 0}
          </p>
          <p className="text-sm text-muted-foreground mt-1">This month</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Avg. Monthly</p>
          <p className="text-2xl font-bold">
            ${Math.round(revenueData?.reduce((sum, d) => sum + d.revenue, 0) / (revenueData?.length || 1)).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Last 6 months</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem'
              }}
            />
            <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Payments</h3>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments?.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.customers?.full_name || 'Unknown'}</TableCell>
                  <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{payment.payment_method.replace('_', ' ')}</TableCell>
                  <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
