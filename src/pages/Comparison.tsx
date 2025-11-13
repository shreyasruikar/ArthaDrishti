import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

// Sample stock data (same as Screener)
const stockData = [
  { id: 1, name: "Reliance Industries", symbol: "RELIANCE", sector: "Energy", price: 2456.80, pe: 23.5, marketCap: 1650000, roe: 14.2, debtRatio: 0.45, change: 2.34 },
  { id: 2, name: "HDFC Bank", symbol: "HDFCBANK", sector: "Banking", price: 1678.50, pe: 19.2, marketCap: 920000, roe: 16.8, debtRatio: 0.12, change: -0.49 },
  { id: 3, name: "Infosys", symbol: "INFY", sector: "IT Services", price: 1432.30, pe: 26.8, marketCap: 590000, roe: 22.5, debtRatio: 0.08, change: 1.10 },
  { id: 4, name: "TCS", symbol: "TCS", sector: "IT Services", price: 3589.25, pe: 28.4, marketCap: 1310000, roe: 41.2, debtRatio: 0.05, change: 0.85 },
  { id: 5, name: "ICICI Bank", symbol: "ICICIBANK", sector: "Banking", price: 1034.60, pe: 17.5, marketCap: 725000, roe: 15.3, debtRatio: 0.15, change: 1.42 },
  { id: 6, name: "Bharti Airtel", symbol: "BHARTIARTL", sector: "Telecom", price: 1289.40, pe: 35.2, marketCap: 745000, roe: 12.8, debtRatio: 1.25, change: -1.20 },
  { id: 7, name: "ITC", symbol: "ITC", sector: "FMCG", price: 456.70, pe: 24.3, marketCap: 570000, roe: 26.4, debtRatio: 0.02, change: 0.65 },
  { id: 8, name: "Larsen & Toubro", symbol: "LT", sector: "Construction", price: 3245.80, pe: 31.6, marketCap: 445000, roe: 18.7, debtRatio: 0.68, change: 2.10 },
  { id: 9, name: "Asian Paints", symbol: "ASIANPAINT", sector: "Paints", price: 2978.50, pe: 54.2, marketCap: 285000, roe: 28.3, debtRatio: 0.01, change: -0.35 },
  { id: 10, name: "HCL Technologies", symbol: "HCLTECH", sector: "IT Services", price: 1456.90, pe: 22.7, marketCap: 395000, roe: 19.8, debtRatio: 0.11, change: 1.55 },
  { id: 11, name: "Wipro", symbol: "WIPRO", sector: "IT Services", price: 456.30, pe: 21.4, marketCap: 245000, roe: 17.2, debtRatio: 0.09, change: -0.88 },
  { id: 12, name: "Axis Bank", symbol: "AXISBANK", sector: "Banking", price: 1089.75, pe: 12.8, marketCap: 335000, roe: 13.5, debtRatio: 0.18, change: 1.92 },
  { id: 13, name: "Mahindra & Mahindra", symbol: "M&M", sector: "Automobile", price: 2134.20, pe: 27.9, marketCap: 265000, roe: 19.4, debtRatio: 0.42, change: 3.25 },
  { id: 14, name: "Sun Pharma", symbol: "SUNPHARMA", sector: "Pharma", price: 1567.40, pe: 38.5, marketCap: 375000, roe: 14.6, debtRatio: 0.06, change: 0.42 },
  { id: 15, name: "Maruti Suzuki", symbol: "MARUTI", sector: "Automobile", price: 12456.80, pe: 29.3, marketCap: 375000, roe: 16.8, debtRatio: 0.03, change: -1.15 },
];

// Generate mock historical data for comparison
const generateHistoricalData = (symbols: string[]) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month, idx) => {
    const dataPoint: any = { month };
    symbols.forEach(symbol => {
      const stock = stockData.find(s => s.symbol === symbol);
      if (stock) {
        dataPoint[symbol] = (stock.price * (1 + (Math.random() - 0.5) * 0.1 * (idx + 1))).toFixed(2);
      }
    });
    return dataPoint;
  });
};

const generateFinancialData = (symbols: string[]) => {
  return symbols.map(symbol => {
    const stock = stockData.find(s => s.symbol === symbol);
    if (!stock) return null;
    return {
      symbol,
      revenue: (stock.marketCap * 0.3).toFixed(0),
      profit: (stock.marketCap * 0.05).toFixed(0),
      eps: (stock.price / stock.pe).toFixed(2),
    };
  }).filter(Boolean);
};

const chartConfig = {
  RELIANCE: { label: "Reliance", color: "hsl(var(--chart-1))" },
  HDFCBANK: { label: "HDFC Bank", color: "hsl(var(--chart-2))" },
  INFY: { label: "Infosys", color: "hsl(var(--chart-3))" },
  TCS: { label: "TCS", color: "hsl(var(--chart-4))" },
  ICICIBANK: { label: "ICICI Bank", color: "hsl(var(--chart-5))" },
  BHARTIARTL: { label: "Bharti Airtel", color: "hsl(var(--chart-1))" },
  ITC: { label: "ITC", color: "hsl(var(--chart-2))" },
  LT: { label: "L&T", color: "hsl(var(--chart-3))" },
  ASIANPAINT: { label: "Asian Paints", color: "hsl(var(--chart-4))" },
  HCLTECH: { label: "HCL Tech", color: "hsl(var(--chart-5))" },
  WIPRO: { label: "Wipro", color: "hsl(var(--chart-1))" },
  AXISBANK: { label: "Axis Bank", color: "hsl(var(--chart-2))" },
  "M&M": { label: "M&M", color: "hsl(var(--chart-3))" },
  SUNPHARMA: { label: "Sun Pharma", color: "hsl(var(--chart-4))" },
  MARUTI: { label: "Maruti", color: "hsl(var(--chart-5))" },
};

const Comparison = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stockSymbols = searchParams.get("stocks")?.split(",") || [];
  
  const selectedStocks = stockData.filter(stock => stockSymbols.includes(stock.symbol));
  const historicalData = generateHistoricalData(stockSymbols);
  const financialData = generateFinancialData(stockSymbols);

  if (selectedStocks.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">No stocks selected</h2>
              <p className="text-muted-foreground mb-6">Please select stocks from the screener to compare.</p>
              <Button onClick={() => navigate("/screener")}>Go to Screener</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/screener")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Stock Comparison</h1>
              <p className="text-muted-foreground">Comparing {selectedStocks.length} stocks</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 mb-6">
          {/* Stock Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedStocks.map(stock => (
              <Card key={stock.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/stock/${stock.symbol}`)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{stock.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                    </div>
                    <Badge variant={stock.change >= 0 ? "default" : "destructive"} className="gap-1">
                      {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stock.change >= 0 ? "+" : ""}{stock.change}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground mb-4">₹{stock.price.toLocaleString()}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sector</p>
                      <p className="font-medium">{stock.sector}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Market Cap</p>
                      <p className="font-medium">₹{stock.marketCap.toLocaleString()}Cr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Tabs */}
          <Card>
            <Tabs defaultValue="metrics" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                  <TabsTrigger value="price">Price Trends</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="metrics" className="mt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold">Metric</TableHead>
                          {selectedStocks.map(stock => (
                            <TableHead key={stock.id} className="text-center font-bold">{stock.symbol}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Current Price</TableCell>
                          {selectedStocks.map(stock => (
                            <TableCell key={stock.id} className="text-center">₹{stock.price.toLocaleString()}</TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">P/E Ratio</TableCell>
                          {selectedStocks.map(stock => (
                            <TableCell key={stock.id} className="text-center">{stock.pe}</TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Market Cap (Cr)</TableCell>
                          {selectedStocks.map(stock => (
                            <TableCell key={stock.id} className="text-center">₹{stock.marketCap.toLocaleString()}</TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ROE (%)</TableCell>
                          {selectedStocks.map(stock => (
                            <TableCell key={stock.id} className="text-center">
                              <span className={stock.roe > 15 ? "text-success font-medium" : ""}>{stock.roe}%</span>
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Debt Ratio</TableCell>
                          {selectedStocks.map(stock => (
                            <TableCell key={stock.id} className="text-center">
                              <span className={stock.debtRatio > 0.5 ? "text-destructive font-medium" : ""}>{stock.debtRatio}</span>
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Day Change (%)</TableCell>
                          {selectedStocks.map(stock => (
                            <TableCell key={stock.id} className="text-center">
                              <Badge variant={stock.change >= 0 ? "default" : "destructive"}>
                                {stock.change >= 0 ? "+" : ""}{stock.change}%
                              </Badge>
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Sector</TableCell>
                          {selectedStocks.map(stock => (
                            <TableCell key={stock.id} className="text-center">{stock.sector}</TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="price" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">6-Month Price Trend Comparison</h3>
                      <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="month" className="text-xs" />
                            <YAxis className="text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            {stockSymbols.map((symbol, idx) => (
                              <Line
                                key={symbol}
                                type="monotone"
                                dataKey={symbol}
                                stroke={chartConfig[symbol as keyof typeof chartConfig]?.color || `hsl(var(--chart-${(idx % 5) + 1}))`}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name={chartConfig[symbol as keyof typeof chartConfig]?.label || symbol}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financials" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Revenue Comparison (₹ Crores)</h3>
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="symbol" className="text-xs" />
                            <YAxis className="text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Profit Comparison (₹ Crores)</h3>
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="symbol" className="text-xs" />
                            <YAxis className="text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="profit" fill="hsl(var(--success))" name="Profit" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">EPS Comparison (₹)</h3>
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="symbol" className="text-xs" />
                            <YAxis className="text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="eps" fill="hsl(var(--accent))" name="EPS" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Comparison;
