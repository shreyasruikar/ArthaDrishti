import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceAlertRequest {
  email: string;
  symbol: string;
  currentPrice: number;
  changePercent: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, symbol, currentPrice, changePercent }: PriceAlertRequest = await req.json();

    console.log(`Sending price alert for ${symbol} to ${email}`);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ArthaDrishti <onboarding@resend.dev>",
        to: [email],
        subject: `Price Alert: ${symbol} has moved ${changePercent > 0 ? "up" : "down"} ${Math.abs(changePercent).toFixed(2)}%`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Price Alert - ${symbol}</h1>
            <p>Your watchlist stock <strong>${symbol}</strong> has significant price movement:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Current Price:</strong> ₹${currentPrice.toFixed(2)}</p>
              <p style="margin: 10px 0 0 0;"><strong>Change:</strong> <span style="color: ${changePercent > 0 ? "#16a34a" : "#dc2626"};">${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%</span></p>
            </div>
            <p>View full details on ArthaDrishti</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">You're receiving this because ${symbol} is in your watchlist.</p>
          </div>
        `,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Error sending email:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-price-alert function:", error);
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
