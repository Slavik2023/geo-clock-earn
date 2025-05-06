
import { supabase } from "@/integrations/supabase/client";

export async function createUserSettings(userId: string, email: string) {
  try {
    console.log("Creating user settings for:", userId, email);
    
    // First check if user settings already exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking user settings:", checkError);
      throw checkError;
    }
    
    if (existingSettings) {
      console.log("User settings already exist, no need to create");
      return true;
    }
    
    // Create new user settings
    const { error: insertError } = await supabase
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
      });
    
    if (insertError) {
      console.error("Error creating user settings:", insertError);
      throw insertError;
    }
    
    console.log("User settings created successfully");
    return true;
  } catch (error) {
    console.error("Error creating user settings:", error);
    return false;
  }
}
