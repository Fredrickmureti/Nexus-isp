import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 32400 },
  { month: 'Feb', revenue: 35800 },
  { month: 'Mar', revenue: 38200 },
  { month: 'Apr', revenue: 41500 },
  { month: 'May', revenue: 44800 },
  { month: 'Jun', revenue: 48392 },
];

export const RevenueChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="hsl(var(--accent))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--accent))', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
