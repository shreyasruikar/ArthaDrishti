import { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  buyDate: string;
  sector: string;
}

interface PortfolioSummary {
  totalInvested: number;
  totalCurrent: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}

export const usePortfolio = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalInvested: 0,
    totalCurrent: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/portfolio/holdings'));

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const data = await response.json();
      console.log("Portfolio API data:", data);

      setHoldings(data.holdings);
      setSummary(data.summary);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addHolding = async (symbol: string, quantity: number, buyPrice: number, buyDate?: string) => {
    try {
      const response = await fetch(apiUrl('/api/portfolio/holdings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          quantity,
          buyPrice,
          buyDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to add holding');
      }

      await fetchPortfolio();
      return true;
    } catch (err: any) {
      console.error('Error adding holding:', err);
      throw err;
    }
  };

  const deleteHolding = async (id: string) => {
    try {
      const response = await fetch(apiUrl(`/api/portfolio/holdings/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete holding');
      }

      await fetchPortfolio();
    } catch (err: any) {
      console.error('Error deleting holding:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPortfolio();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchPortfolio, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    holdings,
    summary,
    loading,
    error,
    addHolding,
    deleteHolding,
    refreshPortfolio: fetchPortfolio,
  };
};
