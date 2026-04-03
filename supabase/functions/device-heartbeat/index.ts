// Supabase Edge Function: device-heartbeat
// Called by HermitX ESP32 boards every 30 seconds
// POST /functions/v1/device-heartbeat
// Headers: x-device-api-key: <device_api_key>
// Body: { "device_id": "uuid", "firmware_version": "1.2.0", "uptime": 3600, "free_heap": 200000 }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-device-api-key, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
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

    const body = await req.json();
    const { device_id, firmware_version, uptime, free_heap } = body;

    if (!device_id) {
      return new Response(JSON.stringify({ error: "Missing device_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify device API key and update heartbeat
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .update({
        status: "online",
        last_heartbeat: new Date().toISOString(),
        firmware_version: firmware_version || undefined,
      })
      .eq("id", device_id)
      .eq("api_key", apiKey)
      .select("id, location_id, config")
      .single();

    if (deviceError || !device) {
      return new Response(JSON.stringify({ error: "Invalid device or API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log heartbeat
    await supabase.from("device_logs").insert({
      device_id: device_id,
      event_type: "heartbeat",
      payload: { firmware_version, uptime, free_heap },
    });

    // Check for active emergency events
    const { data: emergencies } = await supabase
      .from("emergency_events")
      .select("type, message")
      .eq("is_active", true)
      .limit(1);

    // Return config + any active emergency commands
    const response: Record<string, any> = {
      success: true,
      config: device.config || {},
      timestamp: Math.floor(Date.now() / 1000),
    };

    if (emergencies && emergencies.length > 0) {
      response.emergency = {
        type: emergencies[0].type,
        message: emergencies[0].message,
      };
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Heartbeat error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
