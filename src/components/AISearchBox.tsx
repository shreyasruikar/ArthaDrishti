import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AISearchBoxProps {
  onSearch: (filters: any) => void;
}

const AISearchBox = ({ onSearch }: AISearchBoxProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [parsedFilters, setParsedFilters] = useState<any>(null);

  const exampleQueries = [
    "Banking stocks with high ROE",
    "IT companies with low debt",
    "Stocks with PE < 20",
    "Energy sector with market cap > 50000",
    "Low debt ratio and high profitability",
    "FMCG stocks with ROE > 15%",
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setParsedFilters(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/stocks/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.filters && Object.keys(data.filters).length > 0) {
        setParsedFilters(data.filters);
        onSearch(data.filters);
        setLastQuery(query);
      } else {
        alert("Could not understand query. Try: 'banking stocks with high ROE'");
      }
    } catch (error) {
      console.error('AI search error:', error);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSearch();
    }
  };

  const setExampleQuery = (example: string) => {
    setQuery(example);
  };

  const formatFilterValue = (key: string, value: any) => {
    const labels: Record<string, string> = {
      sector: "Sector",
      peMin: "P/E Min",
      peMax: "P/E Max",
      roeMin: "ROE Min",
      roeMax: "ROE Max",
      debtRatioMin: "Debt Min",
      debtRatioMax: "Debt Max",
      marketCapMin: "Market Cap Min",
      marketCapMax: "Market Cap Max",
    };
    return `${labels[key] || key}: ${value}`;
  };

  return (
    <Card className="mb-6 border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">AI-Powered Query Search</CardTitle>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Info className="h-3 w-3" />
            Natural Language
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Describe what you're looking for in plain English, and AI will filter stocks for you
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Query Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Example: Market capitalization > 50000 AND Price to earning < 15 AND Return on equity > 22%"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className="min-h-[100px] text-base resize-none"
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              size="lg"
              className="px-8 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Tip: Press <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Enter</kbd> to search
          </p>
        </div>

        {/* Parsed Filters Display */}
        {parsedFilters && (
          <Alert className="bg-primary/5 border-primary/20">
            <AlertDescription>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Applied Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(parsedFilters).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    {formatFilterValue(key, value)}
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Last Query Display */}
        {lastQuery && !parsedFilters && (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
            <span className="font-medium">Last query:</span> "{lastQuery}"
          </div>
        )}

        {/* Example Queries */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Example Queries
            </span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {exampleQueries.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setExampleQuery(example)}
                className="text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
              >
                <span className="group-hover:text-primary">{example}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Query Syntax Help */}
        <details className="group">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            Advanced: Custom Query Syntax
          </summary>
          <div className="mt-2 text-xs space-y-1 bg-muted/30 rounded-md p-3 border">
            <p><strong>Market Cap:</strong> "market cap &gt; 50000" or "large cap companies"</p>
            <p><strong>P/E Ratio:</strong> "PE &lt; 20" or "price to earning less than 15"</p>
            <p><strong>ROE:</strong> "ROE &gt; 15%" or "return on equity above 20"</p>
            <p><strong>Debt:</strong> "low debt" or "debt ratio &lt; 0.5"</p>
            <p><strong>Sector:</strong> "banking sector" or "IT companies"</p>
            <p><strong>Combine:</strong> Use "AND" to combine conditions</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};

export default AISearchBox;
