import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchlistButton from "@/components/WatchlistButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, AlertTriangle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useStockData } from "@/hooks/useStockData";
import { apiUrl } from "@/lib/api";

// Mock historical/quarterly data - would come from backend in production
const historicalData = [
  { month: "Jan", price: 2156, volume: 12500 },
  { month: "Feb", price: 2234, volume: 14200 },
  { month: "Mar", price: 2198, volume: 13800 },
  { month: "Apr", price: 2287, volume: 15600 },
  { month: "May", price: 2345, volume: 16200 },
  { month: "Jun", price: 2401, volume: 14900 },
  { month: "Jul", price: 2378, volume: 13400 },
  { month: "Aug", price: 2423, volume: 15800 },
  { month: "Sep", price: 2389, volume: 14600 },
  { month: "Oct", price: 2434, volume: 16500 },
  { month: "Nov", price: 2412, volume: 15200 },
  { month: "Dec", price: 2457, volume: 17800 },
];

const quarterlyResults = [
  { quarter: "Q4 2024", revenue: 245680, netProfit: 18945, eps: 28.4, yoyGrowth: 12.5 },
  { quarter: "Q3 2024", revenue: 238920, netProfit: 17234, eps: 25.8, yoyGrowth: 10.2 },
  { quarter: "Q2 2024", revenue: 231450, netProfit: 16890, eps: 25.3, yoyGrowth: 8.9 },
  { quarter: "Q1 2024", revenue: 226780, netProfit: 15678, eps: 23.5, yoyGrowth: 9.4 },
  { quarter: "Q4 2023", revenue: 218520, netProfit: 14234, eps: 21.3, yoyGrowth: 11.8 },
];

const performanceMetrics = [
  { period: "1 Week", value: 2.3 },
  { period: "1 Month", value: 5.7 },
  { period: "3 Months", value: 8.4 },
  { period: "6 Months", value: 12.8 },
  { period: "1 Year", value: 18.5 },
  { period: "3 Years", value: 45.2 },
];

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  
  // Fetch stock data from backend
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [peerComparison, setPeerComparison] = useState<any[]>([]);

  // Fetch real-time data
  const { stockData } = useStockData(symbol ? [symbol.toUpperCase()] : []);
  const realTimeData = symbol ? stockData[symbol.toUpperCase()] : null;

  // AI Risk Assessment state
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  // Fetch stock detail from backend
  useEffect(() => {
    if (!symbol) return;

    const fetchStock = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl(`/api/stocks/detail/${symbol.toUpperCase()}`));
        if (!res.ok) throw new Error('Stock not found');
        const data = await res.json();
        setStock(data);
      } catch (err) {
        console.error('Error fetching stock:', err);
        setStock(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [symbol]);

  // Fetch peers for comparison
  useEffect(() => {
    if (!stock?.sector) return;

    const fetchPeers = async () => {
      try {
        const res = await fetch(apiUrl('/api/stocks/all'));
        const data = await res.json();
        const peers = data.stocks
          .filter((s: any) => s.sector === stock.sector)
          .slice(0, 4)
          .map((s: any) => ({
            name: s.name,
            symbol: s.symbol,
            pe: s.pe,
            roe: s.roe,
            debtRatio: s.debtRatio,
            marketCap: s.marketCap,
          }));
        setPeerComparison(peers);
      } catch (err) {
        console.error('Error fetching peers:', err);
      }
    };

    fetchPeers();
  }, [stock]);

  // Fetch AI risk assessment
  useEffect(() => {
    if (!symbol) return;

    const fetchRisk = async () => {
      setLoadingRisk(true);
      try {
        const res = await fetch(apiUrl(`/api/risk/assess/${symbol.toUpperCase()}`));
        const data = await res.json();
        setRiskAssessment(data.risk);
      } catch (err) {
        console.error('Risk assessment error:', err);
      } finally {
        setLoadingRisk(false);
      }
    };

    fetchRisk();
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading stock data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Stock Not Found</h1>
          <p className="text-muted-foreground mb-6">The stock symbol you're looking for doesn't exist.</p>
          <Link to="/screener">
            <Button>Back to Screener</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Link to="/screener">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Screener
          </Button>
        </Link>

        {/* Stock Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{stock.name}</h1>
                <Badge variant="secondary" className="text-sm">{stock.sector}</Badge>
              </div>
              <p className="text-muted-foreground">NSE: {stock.symbol}</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                ₹{realTimeData ? realTimeData.price.toFixed(2) : stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <div className={`flex items-center gap-1 text-lg ${(realTimeData ? realTimeData.changePercent : stock.changePercent) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {(realTimeData ? realTimeData.changePercent : stock.changePercent) >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  <span>
                    {(realTimeData ? realTimeData.changePercent : stock.changePercent) >= 0 ? '+' : ''}
                    {realTimeData ? realTimeData.changePercent.toFixed(2) : stock.changePercent.toFixed(2)}%
                  </span>
                </div>
                <WatchlistButton symbol={stock.symbol} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Risk Assessment Card */}
        <Card className="mb-6 border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              🤖 AI Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRisk ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Analyzing fundamentals...</span>
              </div>
            ) : riskAssessment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Risk Level:</span>
                  <Badge
                    variant={
                      riskAssessment.level === "Low"
                        ? "default"
                        : riskAssessment.level === "Moderate"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-sm"
                  >
                    {riskAssessment.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Score: {riskAssessment.score}/10
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{riskAssessment.explanation}</p>
                <p className="text-xs text-muted-foreground italic">
                  Powered by AI • Based on fundamental metrics
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unable to generate AI assessment. Please check fundamentals manually.</p>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
              <div className="text-xl font-bold">₹{(stock.marketCap / 1000).toFixed(1)}L Cr</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">P/E Ratio</div>
              <div className="text-xl font-bold">{stock.pe.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">ROE</div>
              <div className="text-xl font-bold text-success">{stock.roe.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Debt Ratio</div>
              <div className="text-xl font-bold">{stock.debtRatio.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">EPS</div>
              <div className="text-xl font-bold">₹{stock.eps?.toFixed(2) || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Dividend Yield</div>
              <div className="text-xl font-bold">{stock.dividendYield?.toFixed(2) || '0.00'}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="peers">Peers</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Price Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Trend (12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)"
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Volume Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Trading Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)"
                        }} 
                      />
                      <Bar dataKey="volume" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Financial Metrics Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Key Financial Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
                    <div className="text-2xl font-bold">₹{(stock.marketCap / 1000).toFixed(1)}L Cr</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">P/E Ratio</div>
                    <div className="text-2xl font-bold">{stock.pe.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">ROE</div>
                    <div className="text-2xl font-bold text-success">{stock.roe.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Debt Ratio</div>
                    <div className="text-2xl font-bold">{stock.debtRatio.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quarter</TableHead>
                        <TableHead className="text-right">Revenue (Cr)</TableHead>
                        <TableHead className="text-right">Net Profit (Cr)</TableHead>
                        <TableHead className="text-right">EPS (₹)</TableHead>
                        <TableHead className="text-right">YoY Growth (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quarterlyResults.map((quarter, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{quarter.quarter}</TableCell>
                          <TableCell className="text-right">{quarter.revenue.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">{quarter.netProfit.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">{quarter.eps.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <span className={quarter.yoyGrowth >= 0 ? "text-success" : "text-destructive"}>
                              {quarter.yoyGrowth >= 0 ? '+' : ''}{quarter.yoyGrowth.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={[...quarterlyResults].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)"
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Revenue (Cr)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netProfit" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      name="Net Profit (Cr)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historical Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border bg-card">
                      <div className="text-sm text-muted-foreground mb-1">{metric.period}</div>
                      <div className={`text-2xl font-bold ${metric.value >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {metric.value >= 0 ? '+' : ''}{metric.value.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)"
                      }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--success))" name="Returns (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Peers Tab */}
          <TabsContent value="peers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Peer Comparison - {stock.sector} Sector</CardTitle>
              </CardHeader>
              <CardContent>
                {peerComparison.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead className="text-right">Market Cap (Cr)</TableHead>
                          <TableHead className="text-right">P/E Ratio</TableHead>
                          <TableHead className="text-right">ROE (%)</TableHead>
                          <TableHead className="text-right">Debt Ratio</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {peerComparison.map((peer, index) => (
                          <TableRow key={index} className={peer.symbol === stock.symbol ? "bg-accent/10" : ""}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{peer.name}</div>
                                <div className="text-sm text-muted-foreground">{peer.symbol}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{(peer.marketCap / 1000).toFixed(1)}L</TableCell>
                            <TableCell className="text-right">{peer.pe.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <span className={peer.roe >= 15 ? "text-success font-medium" : ""}>
                                {peer.roe.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={peer.debtRatio <= 0.5 ? "text-success" : peer.debtRatio > 1 ? "text-destructive" : ""}>
                                {peer.debtRatio.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {peer.symbol !== stock.symbol ? (
                                <Link to={`/stock/${peer.symbol}`}>
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </Link>
                              ) : (
                                <Badge variant="secondary">Current</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No peer data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default StockDetail;
