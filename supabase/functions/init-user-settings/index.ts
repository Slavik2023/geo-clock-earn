
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the request body
    const { userId, email } = await req.json();
    
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "User ID and email are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if user settings already exist
    const { data: existingSettings, error: checkError } = await supabaseClient
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      return new Response(
        JSON.stringify({ error: checkError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // If settings already exist, return them
    if (existingSettings) {
      return new Response(
        JSON.stringify({ message: "User settings already exist", settings: existingSettings }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Create new user settings
    const { data: newSettings, error: insertError } = await supabaseClient
      .from('user_settings')
      .insert({
        user_id: userId,
        name: email.split('@')[0], // Use part of email as initial name
        hourly_rate: 25,
        overtime_rate: 37.5,
        overtime_threshold: 8,
        enable_location_verification: true,
        enable_overtime_calculation: true,
        role: 'user',
        is_admin: false
      })
      .select()
      .single();
    
    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "User settings created successfully", settings: newSettings }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
