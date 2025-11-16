import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, interval = 'daily' } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching historical data for symbol: ${symbol}, interval: ${interval}`);

    // Map interval to Yahoo Finance range
    const rangeMap = {
      'daily': '3mo',
      'weekly': '1y',
      'monthly': '5y'
    };
    const yahooInterval = interval === 'weekly' ? '1wk' : interval === 'monthly' ? '1mo' : '1d';
    const range = rangeMap[interval as keyof typeof rangeMap] || '3mo';

    // Fetch historical data from Yahoo Finance
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${yahooInterval}&range=${range}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.chart?.error) {
      return new Response(
        JSON.stringify({ error: 'Invalid symbol or API error' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = data.chart?.result?.[0];
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'No time series data found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];

    if (!quote) {
      return new Response(
        JSON.stringify({ error: 'No quote data found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const historicalData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: quote.open?.[index] || 0,
      high: quote.high?.[index] || 0,
      low: quote.low?.[index] || 0,
      close: quote.close?.[index] || 0,
      volume: quote.volume?.[index] || 0,
    })).filter((item: any) => item.close > 0);

    console.log(`Successfully fetched ${historicalData.length} data points`);

    return new Response(
      JSON.stringify({ data: historicalData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
