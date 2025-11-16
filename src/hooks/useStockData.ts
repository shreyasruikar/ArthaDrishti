import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  currency?: string;
}

export const useStockData = (symbols: string[]) => {
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }

    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: functionError } = await supabase.functions.invoke(
          "get-stock-data",
          {
            body: { symbols },
          }
        );

        if (functionError) throw functionError;

        if (data?.stocks) {
          const dataMap: Record<string, StockData> = {};
          data.stocks.forEach((stock: StockData) => {
            dataMap[stock.symbol] = stock;
          });
          setStockData(dataMap);
        }
      } catch (err: any) {
        console.error("Error fetching stock data:", err);
        setError(err.message || "Failed to fetch stock data");
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();

    // Refresh data every 60 seconds
    const interval = setInterval(fetchStockData, 60000);

    return () => clearInterval(interval);
  }, [JSON.stringify(symbols)]);

  return { stockData, loading, error };
};
