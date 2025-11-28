import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AISearchBoxProps {
  onSearch: (filters: any) => void;
}

const AISearchBox = ({ onSearch }: AISearchBoxProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
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
        onSearch(data.filters);
        setLastQuery(query);
        setQuery("");
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
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold">AI Stock Search</h3>
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder='Try: "banking stocks with high ROE" or "IT companies with low debt"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          disabled={loading || !query.trim()}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {lastQuery && (
        <div className="mt-2 text-sm text-muted-foreground">
          Showing results for: <span className="font-medium">"{lastQuery}"</span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Examples:</span>
        <button
          onClick={() => setQuery("banking stocks with high ROE")}
          className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
        >
          Banking stocks with high ROE
        </button>
        <button
          onClick={() => setQuery("IT companies with low debt")}
          className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          IT companies with low debt
        </button>
        <button
          onClick={() => setQuery("stocks with PE less than 20")}
          className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
        >
          Stocks with PE &lt; 20
        </button>
      </div>
    </Card>
  );
};

export default AISearchBox;
