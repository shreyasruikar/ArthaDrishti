import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchlistButton from "@/components/WatchlistButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useStockQuote, useStockHistory } from "@/hooks/useStockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { data: stock, loading: quoteLoading, error: quoteError } = useStockQuote(symbol);
  const { data: historicalData, loading: historyLoading, error: historyError } = useStockHistory(symbol);

  if (quoteLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (quoteError || !stock) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Link to="/screener">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Screener
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {quoteError || 'Stock not found. Please try a different symbol.'}
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  const chartData = historicalData.slice(-30).map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: point.close,
    volume: point.volume,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/screener">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Screener
          </Button>
        </Link>

        {/* Stock Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl mb-2">{stock.name}</CardTitle>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl text-muted-foreground">{stock.symbol}</span>
                  <Badge variant="secondary">{stock.sector}</Badge>
                </div>
              </div>
              <WatchlistButton symbol={stock.symbol} size="default" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-4xl font-bold text-foreground mb-2">
                  ${stock.price.toFixed(2)}
                </div>
                <div className={`flex items-center gap-2 text-lg ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
                  <span>({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open:</span>
                  <span className="font-semibold">${stock.open.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High:</span>
                  <span className="font-semibold">${stock.high.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low:</span>
                  <span className="font-semibold">${stock.low.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prev Close:</span>
                  <span className="font-semibold">${stock.previousClose.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-semibold">{stock.volume.toLocaleString()}</span>
                </div>
                {stock.beta && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beta:</span>
                    <span className="font-semibold">{stock.beta.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {stock.week52High && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">52W High:</span>
                    <span className="font-semibold">${stock.week52High.toFixed(2)}</span>
                  </div>
                )}
                {stock.week52Low && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">52W Low:</span>
                    <span className="font-semibold">${stock.week52Low.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="chart" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">Price Chart</TabsTrigger>
            <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Price History (30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <Skeleton className="h-96 w-full" />
                ) : historyError ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{historyError}</AlertDescription>
                  </Alert>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fundamentals">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stock.marketCap && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
                      <div className="text-2xl font-bold">${(stock.marketCap / 1e9).toFixed(2)}B</div>
                    </div>
                  )}
                  {stock.pe && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">P/E Ratio</div>
                      <div className="text-2xl font-bold">{stock.pe.toFixed(2)}</div>
                    </div>
                  )}
                  {stock.pb && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">P/B Ratio</div>
                      <div className="text-2xl font-bold">{stock.pb.toFixed(2)}</div>
                    </div>
                  )}
                  {stock.eps && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">EPS</div>
                      <div className="text-2xl font-bold">${stock.eps.toFixed(2)}</div>
                    </div>
                  )}
                  {stock.roe && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">ROE</div>
                      <div className="text-2xl font-bold">{stock.roe.toFixed(2)}%</div>
                    </div>
                  )}
                  {stock.dividendYield && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Dividend Yield</div>
                      <div className="text-2xl font-bold">{stock.dividendYield.toFixed(2)}%</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {stock.description ? (
                  <p className="text-muted-foreground leading-relaxed">{stock.description}</p>
                ) : (
                  <p className="text-muted-foreground">No company description available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default StockDetail;
