// Supabase Edge Function: device-tap
// Called by HermitX ESP32 boards when an NFC wristband is tapped
// POST /functions/v1/device-tap
// Headers: Authorization: Bearer <device_api_key>
// Body: { "device_id": "uuid", "card_uid": "1A2B3C4D", "timestamp": 1640000000 }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-device-api-key, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = req.headers.get("x-device-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing device API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await req.json();
    const { device_id, card_uid, timestamp } = body;

    if (!device_id || !card_uid) {
      return new Response(JSON.stringify({ error: "Missing device_id or card_uid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify device API key
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id, location_id, status")
      .eq("id", device_id)
      .eq("api_key", apiKey)
      .single();

    if (deviceError || !device) {
      return new Response(JSON.stringify({ error: "Invalid device or API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process the tap using the database function
    const tapTimestamp = timestamp
      ? new Date(timestamp * 1000).toISOString()
      : new Date().toISOString();

    const { data: result, error: tapError } = await supabase.rpc("process_nfc_tap", {
      p_device_id: device_id,
      p_card_uid: card_uid,
      p_timestamp: tapTimestamp,
    });

    if (tapError) {
      console.error("Tap processing error:", tapError);
      return new Response(JSON.stringify({ error: "Failed to process tap", details: tapError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the event
    await supabase.from("device_logs").insert({
      device_id: device_id,
      event_type: "nfc_tap",
      payload: { card_uid, result, timestamp: tapTimestamp },
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
