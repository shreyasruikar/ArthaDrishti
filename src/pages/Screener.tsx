import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createScreen } from "@/lib/db";
import { useAuthContext } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchlistButton from "@/components/WatchlistButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, X, GitCompare } from "lucide-react";
import AISearchBox from "@/components/AISearchBox";
import { apiUrl } from "@/lib/api";

// All sectors available in the backend
const sectors = [
  "All",
  "Banking",
  "IT Services",
  "Energy",
  "FMCG",
  "Telecom",
  "Construction",
  "Paints",
  "Automobile",
  "Pharma",
  "Finance",
  "Insurance",
  "Cement",
  "Infrastructure",
  "Chemicals",
  "Metals",
  "Mining",
  "Power",
  "Consumer Durables",
  "Retail",
  "Media",
  "Entertainment",
  "Real Estate",
  "Diversified",
];

type SortField = "name" | "price" | "pe" | "marketCap" | "roe" | "debtRatio" | "change";
type SortDirection = "asc" | "desc" | null;

const Screener = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState({
    sector: "All",
    peMin: "",
    peMax: "",
    marketCapMin: "",
    marketCapMax: "",
    roeMin: "",
    roeMax: "",
    debtRatioMin: "",
    debtRatioMax: "",
  });

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const { user } = useAuthContext();
  const [saveOpen, setSaveOpen] = useState(false);
  const [screenName, setScreenName] = useState("");

  // State to store live stock data from backend
  const [liveStockData, setLiveStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Apply smart screen from URL (?screen=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const screen = params.get("screen");

    if (!screen) return;

    setFilters((prev) => {
      const base = {
        ...prev,
        sector: "All",
        peMin: "",
        peMax: "",
        marketCapMin: "",
        marketCapMax: "",
        roeMin: "",
        roeMax: "",
        debtRatioMin: "",
        debtRatioMax: "",
      };

      switch (screen) {
        case "high-roe-winners":
          return {
            ...base,
            roeMin: "20",
            debtRatioMax: "0.5",
          };
        case "value-picks":
          return {
            ...base,
            peMax: "15",
            roeMin: "15",
          };
        case "low-debt-stable":
          return {
            ...base,
            debtRatioMax: "0.3",
          };
        case "large-cap-quality":
          return {
            ...base,
            marketCapMin: "50000",
            roeMin: "18",
          };
        case "dividend-stocks":
          return {
            ...base,
            roeMin: "12",
            peMax: "25",
          };
        default:
          return prev;
      }
    });

    setSortField(null);
    setSortDirection(null);
  }, [location.search]);

  // Fetch all stocks from backend on component mount
  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl("/api/stocks/"));
        const data = await response.json();
        console.log("✅ Loaded stocks from backend:", data.stocks.length);
        setLiveStockData(data.stocks);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching stocks:", error);
        setLoading(false);
      }
    };

    fetchAllStocks();

    const interval = setInterval(fetchAllStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveScreen = async () => {
    if (!user) {
      alert("Please sign in first!");
      return;
    }

    if (!screenName.trim()) {
      alert("Please enter a name for this screen.");
      return;
    }

    try {
      const currentConfig = {
        filters,
        sort: {
          field: sortField,
          direction: sortDirection,
        },
        selection: selectedStocks,
        savedAt: new Date().toISOString(),
      };

      await createScreen(user.id, screenName.trim(), currentConfig);

      alert("Screen saved!");
      setSaveOpen(false);
      setScreenName("");
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Failed to save screen");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setFilters({
      sector: "All",
      peMin: "",
      peMax: "",
      marketCapMin: "",
      marketCapMax: "",
      roeMin: "",
      roeMax: "",
      debtRatioMin: "",
      debtRatioMax: "",
    });
    setSortField(null);
    setSortDirection(null);
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedStocks((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const handleSelectAll = () => {
    if (selectedStocks.length === filteredAndSortedData.length) {
      setSelectedStocks([]);
    } else {
      setSelectedStocks(filteredAndSortedData.map((stock) => stock.symbol));
    }
  };

  const handleCompare = () => {
    navigate(`/compare?stocks=${selectedStocks.join(",")}`);
  };

  const filteredAndSortedData = useMemo(() => {
    let result = liveStockData.filter((stock) => {
      if (filters.sector !== "All" && stock.sector !== filters.sector) return false;
      if (filters.peMin && (stock.pe ?? 0) < parseFloat(filters.peMin)) return false;
      if (filters.peMax && (stock.pe ?? 0) > parseFloat(filters.peMax)) return false;
      if (filters.marketCapMin && (stock.marketCap ?? 0) < parseFloat(filters.marketCapMin)) return false;
      if (filters.marketCapMax && (stock.marketCap ?? 0) > parseFloat(filters.marketCapMax)) return false;
      if (filters.roeMin && (stock.roe ?? 0) < parseFloat(filters.roeMin)) return false;
      if (filters.roeMax && (stock.roe ?? 0) > parseFloat(filters.roeMax)) return false;
      if (filters.debtRatioMin && (stock.debtRatio ?? 0) < parseFloat(filters.debtRatioMin)) return false;
      if (filters.debtRatioMax && (stock.debtRatio ?? 0) > parseFloat(filters.debtRatioMax)) return false;
      return true;
    });

    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    return result;
  }, [filters, sortField, sortDirection, liveStockData]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    if (sortDirection === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Stock Screener</h1>
          <p className="text-muted-foreground">
            Filter and analyze stocks based on fundamental metrics
          </p>
        </div>

        {/* AI Search Box */}
        <AISearchBox onSearch={(aiFilters) => setFilters((prev) => ({ ...prev, ...aiFilters }))} />

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear All
                </Button>

                <Button size="sm" onClick={() => setSaveOpen(true)}>
                  Save Screen
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sector Filter */}
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select
                  value={filters.sector}
                  onValueChange={(value) => setFilters({ ...filters, sector: value })}
                >
                  <SelectTrigger id="sector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* P/E Ratio Filter */}
              <div className="space-y-2">
                <Label>P/E Ratio</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.peMin}
                    onChange={(e) => setFilters({ ...filters, peMin: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.peMax}
                    onChange={(e) => setFilters({ ...filters, peMax: e.target.value })}
                  />
                </div>
              </div>

              {/* Market Cap Filter */}
              <div className="space-y-2">
                <Label>Market Cap (Cr)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.marketCapMin}
                    onChange={(e) => setFilters({ ...filters, marketCapMin: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.marketCapMax}
                    onChange={(e) => setFilters({ ...filters, marketCapMax: e.target.value })}
                  />
                </div>
              </div>

              {/* ROE Filter */}
              <div className="space-y-2">
                <Label>ROE (%)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.roeMin}
                    onChange={(e) => setFilters({ ...filters, roeMin: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.roeMax}
                    onChange={(e) => setFilters({ ...filters, roeMax: e.target.value })}
                  />
                </div>
              </div>

              {/* Debt Ratio Filter */}
              <div className="space-y-2">
                <Label>Debt Ratio</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Min"
                    value={filters.debtRatioMin}
                    onChange={(e) => setFilters({ ...filters, debtRatioMin: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Max"
                    value={filters.debtRatioMax}
                    onChange={(e) => setFilters({ ...filters, debtRatioMax: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Results{" "}
                <span className="text-muted-foreground">
                  ({loading ? "..." : filteredAndSortedData.length} stocks)
                </span>
              </CardTitle>
              {selectedStocks.length > 0 && (
                <Button onClick={handleCompare} className="gap-2">
                  <GitCompare className="h-4 w-4" />
                  Compare ({selectedStocks.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedStocks.length === filteredAndSortedData.length &&
                          filteredAndSortedData.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="font-semibold hover:bg-muted"
                      >
                        Company
                        <SortIcon field="name" />
                      </Button>
                    </TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("price")}
                        className="font-semibold hover:bg-muted"
                      >
                        Price (₹)
                        <SortIcon field="price" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("change")}
                        className="font-semibold hover:bg-muted"
                      >
                        Change (%)
                        <SortIcon field="change" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("pe")}
                        className="font-semibold hover:bg-muted"
                      >
                        P/E
                        <SortIcon field="pe" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("marketCap")}
                        className="font-semibold hover:bg-muted"
                      >
                        Market Cap (Cr)
                        <SortIcon field="marketCap" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("roe")}
                        className="font-semibold hover:bg-muted"
                      >
                        ROE (%)
                        <SortIcon field="roe" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("debtRatio")}
                        className="font-semibold hover:bg-muted"
                      >
                        Debt Ratio
                        <SortIcon field="debtRatio" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Loading stocks...
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No stocks match your criteria. Try adjusting the filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedData.map((stock, index) => (
                      <TableRow
                        key={stock.symbol || index}
                        className="hover:bg-muted/50"
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedStocks.includes(stock.symbol)}
                            onCheckedChange={() => handleSelectStock(stock.symbol)}
                          />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <WatchlistButton symbol={stock.symbol} />
                        </TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => navigate(`/stock/${stock.symbol}`)}
                        >
                          <div>
                            <div className="font-medium">{stock.name}</div>
                            <div className="text-sm text-muted-foreground">{stock.symbol}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{stock.sector ?? 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {stock.price?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              (stock.changePercent ?? 0) >= 0 ? "text-success" : "text-destructive"
                            }
                          >
                            {(stock.changePercent ?? 0) >= 0 ? "+" : ""}
                            {stock.changePercent?.toFixed(2) ?? '0.00'}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{stock.pe?.toFixed(1) ?? 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {stock.marketCap ? (stock.marketCap / 1000).toFixed(1) : 'N/A'}L
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={(stock.roe ?? 0) >= 15 ? "text-success font-medium" : ""}>
                            {stock.roe?.toFixed(1) ?? 'N/A'}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              (stock.debtRatio ?? 0) <= 0.5
                                ? "text-success"
                                : (stock.debtRatio ?? 0) > 1
                                ? "text-destructive"
                                : ""
                            }
                          >
                            {stock.debtRatio?.toFixed(2) ?? 'N/A'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Screen Modal */}
      {saveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSaveOpen(false)} />

          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Save Screen</h3>

            <input
              type="text"
              placeholder="Screen name"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSaveOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveScreen}>Save</Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Screener;
