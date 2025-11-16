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
    const { symbol } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      console.error('ALPHA_VANTAGE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching quote for symbol: ${symbol}`);

    // Get global quote
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();
    
    console.log('Alpha Vantage Quote Response:', JSON.stringify(quoteData));

    if (quoteData['Error Message']) {
      return new Response(
        JSON.stringify({ error: 'Invalid symbol or API error' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (quoteData['Note']) {
      return new Response(
        JSON.stringify({ error: 'API rate limit reached. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quote = quoteData['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No data found for this symbol' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get company overview for additional details
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
    const overviewResponse = await fetch(overviewUrl);
    const overview = await overviewResponse.json();
    
    console.log('Alpha Vantage Overview Response:', JSON.stringify(overview));

    const stockData = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      name: overview.Name || symbol,
      sector: overview.Sector || 'N/A',
      marketCap: overview.MarketCapitalization ? parseInt(overview.MarketCapitalization) : null,
      pe: overview.PERatio ? parseFloat(overview.PERatio) : null,
      pb: overview.PriceToBookRatio ? parseFloat(overview.PriceToBookRatio) : null,
      roe: overview.ReturnOnEquityTTM ? parseFloat(overview.ReturnOnEquityTTM) * 100 : null,
      dividendYield: overview.DividendYield ? parseFloat(overview.DividendYield) * 100 : null,
      eps: overview.EPS ? parseFloat(overview.EPS) : null,
      beta: overview.Beta ? parseFloat(overview.Beta) : null,
      week52High: overview['52WeekHigh'] ? parseFloat(overview['52WeekHigh']) : null,
      week52Low: overview['52WeekLow'] ? parseFloat(overview['52WeekLow']) : null,
      description: overview.Description || '',
    };

    console.log('Successfully fetched stock data:', stockData);

    return new Response(
      JSON.stringify(stockData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
