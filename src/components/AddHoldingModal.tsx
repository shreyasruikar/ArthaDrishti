import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string, quantity: number, buyPrice: number, buyDate: string) => Promise<void>;
}

const AddHoldingModal = ({ isOpen, onClose, onAdd }: AddHoldingModalProps) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!symbol || !quantity || !buyPrice) {
      setError("All fields are required");
      return;
    }

    const qty = parseInt(quantity);
    const price = parseFloat(buyPrice);

    if (qty <= 0 || price <= 0) {
      setError("Quantity and price must be positive numbers");
      return;
    }

    try {
      setLoading(true);
      await onAdd(symbol.toUpperCase(), qty, price, buyDate);
      
      // Reset form
      setSymbol("");
      setQuantity("");
      setBuyPrice("");
      setBuyDate(new Date().toISOString().split('T')[0]);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add holding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Stock to Portfolio</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Stock Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g., RELIANCE, TCS, HDFCBANK"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Number of shares"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyPrice">Buy Price (₹)</Label>
            <Input
              id="buyPrice"
              type="number"
              step="0.01"
              placeholder="Price per share"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyDate">Buy Date</Label>
            <Input
              id="buyDate"
              type="date"
              value={buyDate}
              onChange={(e) => setBuyDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Holding"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHoldingModal;
