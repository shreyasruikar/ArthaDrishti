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
    const { keywords } = await req.json();
    
    if (!keywords) {
      return new Response(
        JSON.stringify({ error: 'Keywords are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching stocks for keywords: ${keywords}`);

    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(keywords)}&quotesCount=10&newsCount=0`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.quotes) {
      return new Response(
        JSON.stringify({ error: 'No results found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = data.quotes.map((quote: any) => ({
      symbol: quote.symbol,
      name: quote.longname || quote.shortname || quote.symbol,
      type: quote.quoteType || 'EQUITY',
      region: quote.exchDisp || 'US',
      currency: quote.currency || 'USD',
      matchScore: 1.0,
    })).filter((item: any) => item.type === 'EQUITY');

    console.log(`Found ${results.length} matching stocks`);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching stocks:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
