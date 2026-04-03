// Supabase Edge Function: program-wristband
// Called by HermitX ESP32 boards to register/program a new NFC wristband
// POST /functions/v1/program-wristband
// Headers: x-device-api-key: <device_api_key>
// Body: { "device_id": "uuid", "card_uid": "hex string", "camper_id": "uuid" (optional), "label": "string" (optional) }

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
    const { device_id, card_uid, camper_id, label } = body;

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

    // Check if wristband with this card_uid already exists
    const { data: existingWristband, error: lookupError } = await supabase
      .from("nfc_wristbands")
      .select("id, is_active, camper_id")
      .eq("card_uid", card_uid)
      .single();

    let wristbandId: string;
    let assignedCamper = null;

    if (existingWristband) {
      // Wristband exists
      if (existingWristband.is_active) {
        // Already active and registered
        return new Response(
          JSON.stringify({ error: "wristband_already_registered", wristband_id: existingWristband.id }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        // Reactivate existing wristband
        const updatePayload: { is_active: boolean; camper_id?: string | null; label?: string } = {
          is_active: true,
        };

        if (camper_id) {
          updatePayload.camper_id = camper_id;
        }
        if (label) {
          updatePayload.label = label;
        }

        const { data: updatedWristband, error: updateError } = await supabase
          .from("nfc_wristbands")
          .update(updatePayload)
          .eq("id", existingWristband.id)
          .select("id, camper_id")
          .single();

        if (updateError) {
          console.error("Wristband reactivation error:", updateError);
          return new Response(
            JSON.stringify({ error: "Failed to reactivate wristband", details: updateError.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        wristbandId = updatedWristband.id;
        assignedCamper = updatedWristband.camper_id;
      }
    } else {
      // New wristband - insert it
      const insertPayload: {
        card_uid: string;
        is_active: boolean;
        camper_id?: string;
        label?: string;
        assigned_at?: string;
      } = {
        card_uid,
        is_active: true,
      };

      if (camper_id) {
        insertPayload.camper_id = camper_id;
        insertPayload.assigned_at = new Date().toISOString();
      }

      if (label) {
        insertPayload.label = label;
      }

      const { data: newWristband, error: insertError } = await supabase
        .from("nfc_wristbands")
        .insert([insertPayload])
        .select("id, camper_id")
        .single();

      if (insertError) {
        console.error("Wristband insertion error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to register wristband", details: insertError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      wristbandId = newWristband.id;
      assignedCamper = newWristband.camper_id;
    }

    // Log the event
    await supabase.from("device_logs").insert({
      device_id: device_id,
      event_type: "wristband_programmed",
      payload: { card_uid, wristband_id: wristbandId, camper_id: assignedCamper, label },
    });

    return new Response(
      JSON.stringify({
        success: true,
        function: "program-wristband",
        wristband_id: wristbandId,
        assigned_camper: assignedCamper,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
