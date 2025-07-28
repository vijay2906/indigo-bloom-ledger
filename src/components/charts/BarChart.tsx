import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartData {
  name: string;
  income: number;
  expenses: number;
}

interface CustomBarChartProps {
  data: BarChartData[];
  title?: string;
}

export function CustomBarChart({ data, title }: CustomBarChartProps) {
  return (
    <div className="finance-card p-6">
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      )}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`, 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="income" 
              fill="hsl(var(--success))" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="expenses" 
              fill="hsl(var(--destructive))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}