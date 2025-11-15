import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  sector: string;
  marketCap: number | null;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  dividendYield: number | null;
  eps: number | null;
  beta: number | null;
  week52High: number | null;
  week52Low: number | null;
  description: string;
}

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const useStockQuote = (symbol: string | undefined) => {
  const [data, setData] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: result, error: err } = await supabase.functions.invoke('get-stock-quote', {
          body: { symbol },
        });

        if (err) {
          setError(err.message);
          return;
        }

        if (result.error) {
          setError(result.error);
          return;
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock quote');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [symbol]);

  return { data, loading, error };
};

export const useStockHistory = (symbol: string | undefined, interval: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: result, error: err } = await supabase.functions.invoke('get-stock-history', {
          body: { symbol, interval },
        });

        if (err) {
          setError(err.message);
          return;
        }

        if (result.error) {
          setError(result.error);
          return;
        }

        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [symbol, interval]);

  return { data, loading, error };
};

export const useStockSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (keywords: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: err } = await supabase.functions.invoke('search-stocks', {
        body: { keywords },
      });

      if (err) {
        setError(err.message);
        return [];
      }

      if (result.error) {
        setError(result.error);
        return [];
      }

      return result.results || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search stocks');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { search, loading, error };
};
