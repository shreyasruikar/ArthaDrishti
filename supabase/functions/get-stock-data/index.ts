import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StockDataRequest {
  symbols: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols }: StockDataRequest = await req.json();

    if (!symbols || symbols.length === 0) {
      throw new Error("No symbols provided");
    }

    // Fetch data for each symbol from Yahoo Finance
    const stockDataPromises = symbols.map(async (symbol) => {
      try {
        // Yahoo Finance query API
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.chart?.error || !data.chart?.result?.[0]) {
          console.warn(`No data found for ${symbol}`);
          return null;
        }

        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        
        const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
        const previousClose = meta.previousClose || meta.chartPreviousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        return {
          symbol: symbol,
          name: meta.longName || symbol,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: quote.volume[quote.volume.length - 1],
          marketCap: meta.marketCap,
          currency: meta.currency,
        };
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(stockDataPromises);
    const validResults = results.filter(r => r !== null);

    return new Response(JSON.stringify({ stocks: validResults }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in get-stock-data function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
