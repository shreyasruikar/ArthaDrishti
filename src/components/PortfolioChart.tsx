import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Holding {
  symbol: string;
  name: string;
  currentValue: number;
  sector: string;
}

interface PortfolioChartProps {
  holdings: Holding[];
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

const PortfolioChart = ({ holdings }: PortfolioChartProps) => {
  // Group by sector
  const sectorData = holdings.reduce((acc: any, holding) => {
    const sector = holding.sector || 'Other';
    if (!acc[sector]) {
      acc[sector] = 0;
    }
    acc[sector] += holding.currentValue;
    return acc;
  }, {});

  const chartData = Object.entries(sectorData).map(([name, value]) => ({
    name,
    value: Math.round(value as number),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No holdings to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PortfolioChart;
