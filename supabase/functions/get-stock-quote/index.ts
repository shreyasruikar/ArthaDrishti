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

    console.log(`Fetching quote for symbol: ${symbol}`);

    // Get quote data from Yahoo Finance
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();

    if (quoteData.chart?.error) {
      return new Response(
        JSON.stringify({ error: 'Invalid symbol or API error' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = quoteData.chart?.result?.[0];
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'No data found for this symbol' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];

    // Get additional company info
    const summaryUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,price,defaultKeyStatistics,assetProfile`;
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();
    const quoteSummary = summaryData.quoteSummary?.result?.[0];

    const stockData = {
      symbol: meta.symbol,
      price: meta.regularMarketPrice || 0,
      change: (meta.regularMarketPrice - meta.previousClose) || 0,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
      open: quote?.open?.[0] || meta.regularMarketPrice,
      high: quote?.high?.[0] || meta.regularMarketPrice,
      low: quote?.low?.[0] || meta.regularMarketPrice,
      volume: quote?.volume?.[0] || 0,
      previousClose: meta.previousClose || 0,
      name: quoteSummary?.price?.longName || quoteSummary?.price?.shortName || symbol,
      sector: quoteSummary?.assetProfile?.sector || 'N/A',
      marketCap: quoteSummary?.price?.marketCap || quoteSummary?.summaryDetail?.marketCap || null,
      pe: quoteSummary?.summaryDetail?.trailingPE || null,
      pb: quoteSummary?.defaultKeyStatistics?.priceToBook || null,
      roe: quoteSummary?.defaultKeyStatistics?.returnOnEquity ? quoteSummary.defaultKeyStatistics.returnOnEquity * 100 : null,
      dividendYield: quoteSummary?.summaryDetail?.dividendYield ? quoteSummary.summaryDetail.dividendYield * 100 : null,
      eps: quoteSummary?.defaultKeyStatistics?.trailingEps || null,
      beta: quoteSummary?.defaultKeyStatistics?.beta || null,
      week52High: quoteSummary?.summaryDetail?.fiftyTwoWeekHigh || null,
      week52Low: quoteSummary?.summaryDetail?.fiftyTwoWeekLow || null,
      description: quoteSummary?.assetProfile?.longBusinessSummary || '',
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
