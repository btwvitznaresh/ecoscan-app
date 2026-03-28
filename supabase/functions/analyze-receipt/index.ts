import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { receiptUrl } = await req.json();

    if (!receiptUrl) {
      return new Response(JSON.stringify({ error: "receiptUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Download the receipt image
    const { data: fileData } = await supabase.storage
      .from("receipts")
      .download(receiptUrl);

    if (!fileData) {
      return new Response(JSON.stringify({ error: "Could not download receipt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    const mimeType = "image/jpeg";

    // Call AI to analyze the receipt
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert at analyzing grocery receipts and estimating carbon footprints. 
            Analyze the receipt image and extract grocery items. For each item, estimate the CO2 equivalent in kg.
            Also suggest eco-friendly swaps for high-carbon items.
            Use these CO2 guidelines per kg of product:
            - Beef: ~13.3 kg CO2
            - Cheese: ~5.5 kg CO2
            - Pork: ~3.5 kg CO2
            - Chicken: ~3.2 kg CO2
            - Eggs: ~2.0 kg CO2
            - Rice: ~2.7 kg CO2
            - Milk: ~1.6 kg CO2
            - Fish: ~2.5 kg CO2
            - Vegetables: ~0.5 kg CO2
            - Fruits: ~0.5 kg CO2
            - Bread: ~0.8 kg CO2
            - Lentils/Beans: ~0.4 kg CO2`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this grocery receipt. Extract the items with quantities and estimate CO2 for each.",
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image}` },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_receipt_analysis",
              description: "Report the analyzed receipt items with CO2 estimates and swap suggestions",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Item name with quantity" },
                        co2: { type: "number", description: "Estimated CO2 in kg" },
                      },
                      required: ["name", "co2"],
                    },
                  },
                  swaps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        original: { type: "string" },
                        swap: { type: "string" },
                        saveCO2: { type: "number" },
                      },
                      required: ["original", "swap", "saveCO2"],
                    },
                  },
                },
                required: ["items", "swaps"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_receipt_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("AI did not return structured data");
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    const { items, swaps } = analysis;

    const totalCO2 = items.reduce((sum: number, i: { co2: number }) => sum + i.co2, 0);
    const roundedCO2 = Math.round(totalCO2 * 10) / 10;

    // Grade calculation
    let grade = "F";
    const perItem = items.length > 0 ? roundedCO2 / items.length : roundedCO2;
    if (perItem < 0.8) grade = "A";
    else if (perItem < 1.5) grade = "B";
    else if (perItem < 2.5) grade = "C";
    else if (perItem < 4) grade = "D";

    // Save to database
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: scan, error: scanError } = await adminClient
      .from("scans")
      .insert({
        user_id: userId,
        total_co2: roundedCO2,
        grade,
        receipt_url: receiptUrl,
      })
      .select("id")
      .single();

    if (scanError) throw scanError;

    // Insert items
    if (items.length > 0) {
      const { error: itemsError } = await adminClient.from("scan_items").insert(
        items.map((item: { name: string; co2: number }) => ({
          scan_id: scan.id,
          name: item.name,
          co2: Math.round(item.co2 * 10) / 10,
        }))
      );
      if (itemsError) throw itemsError;
    }

    // Insert swap suggestions
    if (swaps && swaps.length > 0) {
      const { error: swapsError } = await adminClient.from("swap_suggestions").insert(
        swaps.map((s: { original: string; swap: string; saveCO2: number }) => ({
          scan_id: scan.id,
          original: s.original,
          swap: s.swap,
          save_co2: Math.round(s.saveCO2 * 10) / 10,
        }))
      );
      if (swapsError) throw swapsError;
    }

    return new Response(
      JSON.stringify({
        scanId: scan.id,
        totalCO2: roundedCO2,
        grade,
        items: items.map((i: { name: string; co2: number }) => ({
          name: i.name,
          co2: Math.round(i.co2 * 10) / 10,
        })),
        swaps: (swaps || []).map((s: { original: string; swap: string; saveCO2: number }) => ({
          original: s.original,
          swap: s.swap,
          saveCO2: Math.round(s.saveCO2 * 10) / 10,
        })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("analyze-receipt error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
