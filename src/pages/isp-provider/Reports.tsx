import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, DollarSign, Users, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const reportTemplates = [
  {
    id: 1,
    name: "Monthly Revenue Report",
    description: "Comprehensive revenue breakdown by customer and package",
    icon: DollarSign,
    frequency: "Monthly",
  },
  {
    id: 2,
    name: "Customer Activity Report",
    description: "Active users, new registrations, and churn analysis",
    icon: Users,
    frequency: "Weekly",
  },
  {
    id: 3,
    name: "Network Usage Report",
    description: "Bandwidth consumption and network performance metrics",
    icon: Activity,
    frequency: "Daily",
  },
  {
    id: 4,
    name: "Payment Collection Report",
    description: "Invoice status, payments received, and outstanding balances",
    icon: FileText,
    frequency: "Monthly",
  },
];

export default function Reports() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and export business reports</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Export</CardTitle>
            <CardDescription>Export current data in various formats</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        <Calendar className="mr-1 h-3 w-3" />
                        {template.frequency}
                      </Badge>
                      <Button size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automatically generate and email reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Monthly Revenue Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Sent every 1st of the month at 9:00 AM
                  </p>
                </div>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Weekly Customer Report</p>
                  <p className="text-sm text-muted-foreground">
                    Sent every Monday at 8:00 AM
                  </p>
                </div>
                <Badge variant="secondary">Paused</Badge>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              + Schedule New Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
