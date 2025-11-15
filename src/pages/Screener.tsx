import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchlistButton from "@/components/WatchlistButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useStockSearch } from "@/hooks/useStockData";
import { toast } from "sonner";

// Popular stocks to display by default
const popularStocks = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Automotive" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services" },
  { symbol: "V", name: "Visa Inc.", sector: "Financial Services" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive" },
  { symbol: "PG", name: "Procter & Gamble Co.", sector: "Consumer Defensive" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financial Services" },
  { symbol: "UNH", name: "UnitedHealth Group Inc.", sector: "Healthcare" },
  { symbol: "HD", name: "The Home Depot Inc.", sector: "Consumer Cyclical" },
];

const Screener = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { search, loading } = useStockSearch();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearching(true);
    const results = await search(searchQuery);
    
    if (results.length === 0) {
      toast.info("No stocks found. Try a different search term.");
    }
    
    setSearchResults(results);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const displayedStocks = isSearching ? searchResults : popularStocks;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-12 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Stock Screener
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Search and analyze stocks with real-time market data
              </p>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by symbol or company name (e.g., AAPL, Apple)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  {isSearching && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsSearching(false);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="mt-2"
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isSearching ? 'Search Results' : 'Popular Stocks'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayedStocks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No stocks found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Company Name</TableHead>
                          <TableHead>Sector</TableHead>
                          {isSearching && <TableHead>Region</TableHead>}
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedStocks.map((stock) => (
                          <TableRow
                            key={stock.symbol}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/stock/${stock.symbol}`)}
                          >
                            <TableCell className="font-bold text-primary">
                              {stock.symbol}
                            </TableCell>
                            <TableCell className="font-medium">{stock.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{stock.sector || stock.type}</Badge>
                            </TableCell>
                            {isSearching && (
                              <TableCell>{stock.region || 'US'}</TableCell>
                            )}
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <WatchlistButton symbol={stock.symbol} variant="outline" size="sm" />
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-8 p-6 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">About the Data</h3>
              <p className="text-muted-foreground text-sm">
                Stock data is provided by Alpha Vantage API with real-time quotes and historical information.
                Click on any stock to view detailed analysis including price charts, fundamentals, and company information.
                Use the search feature to find specific stocks or browse popular stocks above.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Screener;
