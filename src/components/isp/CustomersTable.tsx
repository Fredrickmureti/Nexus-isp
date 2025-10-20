import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, MoreVertical } from "lucide-react";

const customers = [
  { id: 1, name: "John Smith", email: "john@example.com", package: "Premium 100Mbps", status: "active", balance: "$0" },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", package: "Standard 50Mbps", status: "active", balance: "$0" },
  { id: 3, name: "Mike Wilson", email: "mike@example.com", package: "Basic 25Mbps", status: "suspended", balance: "$89" },
  { id: 4, name: "Emily Brown", email: "emily@example.com", package: "Premium 100Mbps", status: "active", balance: "$0" },
  { id: 5, name: "David Lee", email: "david@example.com", package: "Standard 50Mbps", status: "pending", balance: "$45" },
];

export const CustomersTable = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Customer Management</h2>
        <Button className="bg-gradient-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.package}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      customer.status === "active" ? "default" : 
                      customer.status === "suspended" ? "destructive" : 
                      "secondary"
                    }
                  >
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className={customer.balance !== "$0" ? "text-warning font-semibold" : ""}>
                  {customer.balance}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
