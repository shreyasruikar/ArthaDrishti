import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, Trash2, RefreshCw } from "lucide-react";
import AddHoldingModal from "@/components/AddHoldingModal";
import PortfolioChart from "@/components/PortfolioChart";
import { usePortfolio } from "@/hooks/usePortfolio";

const Portfolio = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { holdings, summary, loading, addHolding, deleteHolding, refreshPortfolio } = usePortfolio();

  const handleAddHolding = async (symbol: string, quantity: number, buyPrice: number, buyDate: string) => {
    await addHolding(symbol, quantity, buyPrice, buyDate);
  };

  const handleDeleteHolding = async (id: string) => {
    if (confirm("Are you sure you want to delete this holding?")) {
      await deleteHolding(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">My Portfolio</h1>
            <p className="text-muted-foreground">Track your stock investments and performance</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={refreshPortfolio} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Stock
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalInvested.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalCurrent.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center gap-1 ${summary.totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {summary.totalProfitLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                ₹{Math.abs(summary.totalProfitLoss).toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.totalProfitLossPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                {summary.totalProfitLossPercent >= 0 ? '+' : ''}{summary.totalProfitLossPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table and Chart */}
        {holdings.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Holdings Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Holdings ({holdings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stock</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Buy Price</TableHead>
                          <TableHead className="text-right">Current</TableHead>
                          <TableHead className="text-right">Invested</TableHead>
                          <TableHead className="text-right">Current Value</TableHead>
                          <TableHead className="text-right">P&L</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holdings.map((holding) => (
                          <TableRow key={holding.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{holding.name}</div>
                                <div className="text-sm text-muted-foreground">{holding.symbol}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{holding.quantity}</TableCell>
                            <TableCell className="text-right">₹{holding.buyPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">₹{holding.currentPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">₹{holding.investedValue.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-right">₹{holding.currentValue.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-right">
                              <div className={holding.profitLoss >= 0 ? 'text-success' : 'text-destructive'}>
                                <div className="font-medium">
                                  {holding.profitLoss >= 0 ? '+' : ''}₹{Math.abs(holding.profitLoss).toLocaleString('en-IN')}
                                </div>
                                <div className="text-xs">
                                  ({holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%)
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteHolding(holding.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Chart */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Sector Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <PortfolioChart holdings={holdings} />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">No Holdings Yet</h3>
                <p className="text-muted-foreground">Start building your portfolio by adding your first stock</p>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Stock
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />

      {/* Add Holding Modal */}
      <AddHoldingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHolding}
      />
    </div>
  );
};

export default Portfolio;
