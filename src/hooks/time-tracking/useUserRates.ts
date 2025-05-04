
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRates(userId: string | null) {
  const [hourlyRate, setHourlyRate] = useState(25);
  const [overtimeRate, setOvertimeRate] = useState(37.5);
  const [overtimeThreshold, setOvertimeThreshold] = useState(8);

  useEffect(() => {
    if (!userId) return;
    
    async function loadUserSettings() {
      // Load user settings from Supabase
      const { data: settingsData, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (settingsData) {
        setHourlyRate(settingsData.hourly_rate);
        setOvertimeRate(settingsData.overtime_rate || 37.5);
        setOvertimeThreshold(settingsData.overtime_threshold || 8);
      }
      
      if (error) {
        console.error("Error loading user settings:", error);
      }
    }
    
    loadUserSettings();
  }, [userId]);

  return {
    hourlyRate,
    setHourlyRate,
    overtimeRate,
    setOvertimeRate,
    overtimeThreshold,
    setOvertimeThreshold
  };
}
