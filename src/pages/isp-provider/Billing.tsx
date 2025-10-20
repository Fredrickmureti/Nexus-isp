import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, FileText, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { GenerateInvoiceDialog } from "@/components/isp/GenerateInvoiceDialog";

export default function Billing() {
  const { user } = useAuth();

  const { data: provider } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isp_providers")
        .select("*")
        .eq("owner_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: billingData, isLoading } = useQuery({
    queryKey: ["billing", provider?.id],
    queryFn: async () => {
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*, customers(full_name)")
        .in(
          "customer_id",
          await supabase
            .from("customers")
            .select("id")
            .eq("provider_id", provider?.id)
            .then(({ data }) => data?.map((c) => c.id) || [])
        )
        .order("payment_date", { ascending: false })
        .limit(10);

      if (paymentsError) throw paymentsError;

      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("*, customers(full_name)")
        .in(
          "customer_id",
          await supabase
            .from("customers")
            .select("id")
            .eq("provider_id", provider?.id)
            .then(({ data }) => data?.map((c) => c.id) || [])
        )
        .in("status", ["draft", "issued", "overdue"])
        .order("due_date", { ascending: true });

      if (invoicesError) throw invoicesError;

      const monthlyRevenue = payments?.reduce((acc: any, payment: any) => {
        const month = new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short' });
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += Number(payment.amount);
        return acc;
      }, {});

      return {
        payments,
        invoices,
        revenueData: Object.entries(monthlyRevenue || {}).map(([month, amount]) => ({
          month,
          amount
        })),
        totalRevenue: payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        pendingAmount: invoices?.reduce((sum, i) => sum + Number(i.amount), 0) || 0,
      };
    },
    enabled: !!provider?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage invoices and track revenue</p>
        </div>
        <GenerateInvoiceDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData?.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData?.invoices?.length || 0}</div>
            <p className="text-xs text-muted-foreground">${billingData?.pendingAmount.toFixed(2)} outstanding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData?.payments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Last 10 transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={billingData?.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="hsl(var(--primary))" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingData?.payments?.slice(0, 5).map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.customers?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.payment_method}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingData?.invoices?.slice(0, 5).map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.customers?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>${Number(invoice.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{invoice.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
