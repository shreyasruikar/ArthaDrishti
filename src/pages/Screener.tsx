import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

import { useStockData } from "@/hooks/useStockData";

// Sample stock data
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

const sectors = ["All", "Banking", "IT Services", "Energy", "FMCG", "Telecom", "Construction", "Paints", "Automobile", "Pharma"];

type SortField = "name" | "price" | "pe" | "marketCap" | "roe" | "debtRatio" | "change";
type SortDirection = "asc" | "desc" | null;

const Screener = () => {
  const navigate = useNavigate();

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

  // Realtime data
  const allSymbols = stockData.map((s) => s.symbol);
  const { stockData: realTimeStockData } = useStockData(allSymbols);

  // Auth + Save Screen
  const { user } = useAuthContext();
  const [saveOpen, setSaveOpen] = useState(false);
  const [screenName, setScreenName] = useState("");

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
        sort: { field: sortField, direction: sortDirection },
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
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      } else setSortDirection("asc");
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
    if (selectedStocks.length === filteredAndSortedData.length) setSelectedStocks([]);
    else setSelectedStocks(filteredAndSortedData.map((stock) => stock.symbol));
  };

  const handleCompare = () => {
    navigate(`/compare?stocks=${selectedStocks.join(",")}`);
  };

  const filteredAndSortedData = useMemo(() => {
    let result = stockData
      .map((stock) => {
        const rt = realTimeStockData?.[stock.symbol];
        return {
          ...stock,
          price: rt?.price ?? stock.price,
          change: rt?.change ?? stock.change,
          changePercent:
            rt?.changePercent ?? (stock.change / stock.price) * 100,
        };
      })
      .filter((stock) => {
        if (filters.sector !== "All" && stock.sector !== filters.sector) return false;
        if (filters.peMin && stock.pe < parseFloat(filters.peMin)) return false;
        if (filters.peMax && stock.pe > parseFloat(filters.peMax)) return false;
        if (filters.marketCapMin && stock.marketCap < parseFloat(filters.marketCapMin)) return false;
        if (filters.marketCapMax && stock.marketCap > parseFloat(filters.marketCapMax)) return false;
        if (filters.roeMin && stock.roe < parseFloat(filters.roeMin)) return false;
        if (filters.roeMax && stock.roe > parseFloat(filters.roeMax)) return false;
        if (filters.debtRatioMin && stock.debtRatio < parseFloat(filters.debtRatioMin)) return false;
        if (filters.debtRatioMax && stock.debtRatio > parseFloat(filters.debtRatioMax)) return false;
        return true;
      });

    if (sortField && sortDirection) {
  result = [...result].sort((a, b) => {
    const aVal = a[sortField] as string | number | undefined;
    const bVal = b[sortField] as string | number | undefined;

    // both strings -> localeCompare
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    // both numbers -> numeric compare
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    // fallback: convert to string and compare
    const aStr = String(aVal ?? "");
    const bStr = String(bVal ?? "");
    return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
}


    return result;
  }, [filters, sortField, sortDirection, realTimeStockData]);

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

              {/* P/E Ratio */}
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

              {/* Market Cap */}
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

              {/* ROE */}
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

              {/* Debt Ratio */}
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

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Results{" "}
                <span className="text-muted-foreground">
                  ({filteredAndSortedData.length} stocks)
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
                        className="font-semibold hover:bg-muted"
                        onClick={() => handleSort("name")}
                      >
                        Company
                        <SortIcon field="name" />
                      </Button>
                    </TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="font-semibold hover:bg-muted"
                        onClick={() => handleSort("price")}
                      >
                        Price (₹)
                        <SortIcon field="price" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="font-semibold hover:bg-muted"
                        onClick={() => handleSort("change")}
                      >
                        Change (%)
                        <SortIcon field="change" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="font-semibold hover:bg-muted"
                        onClick={() => handleSort("pe")}
                      >
                        P/E
                        <SortIcon field="pe" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="font-semibold hover:bg-muted"
                        onClick={() => handleSort("marketCap")}
                      >
                        Market Cap (Cr)
                        <SortIcon field="marketCap" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="font-semibold hover:bg-muted"
                        onClick={() => handleSort("roe")}
                      >
                        ROE (%)
                        <SortIcon field="roe" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="font-semibold hover:bg-muted"
                        onClick={() => handleSort("debtRatio")}
                      >
                        Debt Ratio
                        <SortIcon field="debtRatio" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredAndSortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                        No stocks match your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedData.map((stock) => (
                      <TableRow key={stock.id} className="hover:bg-muted/50">
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedStocks.includes(stock.symbol)}
                            onCheckedChange={() => handleSelectStock(stock.symbol)}
                          />
                        </TableCell>

                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <WatchlistButton symbol={stock.symbol} variant="ghost" size="icon" />
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
                          <Badge variant="secondary">{stock.sector}</Badge>
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>

                        <TableCell className="text-right">
                          <span className={stock.change >= 0 ? "text-success" : "text-destructive"}>
                            {stock.change >= 0 ? "+" : ""}
                            {stock.change.toFixed(2)}%
                          </span>
                        </TableCell>

                        <TableCell className="text-right">{stock.pe.toFixed(1)}</TableCell>

                        <TableCell className="text-right">
                          {(stock.marketCap / 1000).toFixed(1)}L
                        </TableCell>

                        <TableCell className="text-right">
                          <span className={stock.roe >= 15 ? "text-success font-medium" : ""}>
                            {stock.roe.toFixed(1)}%
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <span
                            className={
                              stock.debtRatio <= 0.5
                                ? "text-success"
                                : stock.debtRatio > 1
                                ? "text-destructive"
                                : ""
                            }
                          >
                            {stock.debtRatio.toFixed(2)}
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
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSaveOpen(false)}
          />

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
