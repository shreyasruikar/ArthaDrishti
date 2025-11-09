import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const sampleStocks = [
  {
    name: "Reliance Industries",
    symbol: "RELIANCE",
    sector: "Energy",
    price: "2,456.80",
    change: "+2.34",
    changePercent: "+0.96",
    pe: "23.5",
    marketCap: "16.5L Cr",
    positive: true,
  },
  {
    name: "HDFC Bank",
    symbol: "HDFCBANK",
    sector: "Banking",
    price: "1,678.50",
    change: "-8.20",
    changePercent: "-0.49",
    pe: "19.2",
    marketCap: "9.2L Cr",
    positive: false,
  },
  {
    name: "Infosys",
    symbol: "INFY",
    sector: "IT Services",
    price: "1,432.30",
    change: "+15.60",
    changePercent: "+1.10",
    pe: "26.8",
    marketCap: "5.9L Cr",
    positive: true,
  },
];

const StockPreview = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Live Market Overview
          </h2>
          <p className="text-lg text-muted-foreground">
            Sample insights from top stocks with real-time fundamental metrics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {sampleStocks.map((stock, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{stock.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{stock.symbol}</span>
                      <Badge variant="secondary" className="text-xs">
                        {stock.sector}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      ₹{stock.price}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${stock.positive ? 'text-success' : 'text-destructive'}`}>
                      {stock.positive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span>{stock.change}</span>
                      <span>({stock.changePercent}%)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">P/E Ratio</div>
                      <div className="font-semibold text-foreground">{stock.pe}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                      <div className="font-semibold text-foreground">{stock.marketCap}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StockPreview;
