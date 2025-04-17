
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useUserSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userSettingsId, setUserSettingsId] = useState<string | null>(null);
  
  // User profile settings
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState(25);
  const [overtimeRate, setOvertimeRate] = useState(37.5);
  const [overtimeThreshold, setOvertimeThreshold] = useState(8);
  const [enableLocationVerification, setEnableLocationVerification] = useState(true);
  const [enableOvertimeCalculation, setEnableOvertimeCalculation] = useState(true);
  
  // Load user settings from Supabase
  useEffect(() => {
    loadUserSettings();
  }, []);
  
  const loadUserSettings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access your profile",
          variant: "destructive"
        });
        return;
      }
      
      setUserId(userData.user.id);
      
      const { data: settingsData, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive"
        });
        return;
      }
      
      if (settingsData) {
        setName(settingsData.name || '');
        setHourlyRate(settingsData.hourly_rate);
        setOvertimeRate(settingsData.overtime_rate || 37.5);
        setOvertimeThreshold(settingsData.overtime_threshold || 8);
        setEnableLocationVerification(settingsData.enable_location_verification ?? true);
        setEnableOvertimeCalculation(settingsData.enable_overtime_calculation ?? true);
        setUserSettingsId(settingsData.id);
      }
    } catch (error) {
      console.error("Error in profile page:", error);
    }
  };
  
  const saveSettings = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your settings",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (userSettingsId) {
        // For updates, we don't need to include user_id
        const updateData = {
          name,
          hourly_rate: hourlyRate,
          overtime_rate: overtimeRate,
          overtime_threshold: overtimeThreshold,
          enable_location_verification: enableLocationVerification,
          enable_overtime_calculation: enableOvertimeCalculation,
          updated_at: new Date().toISOString()
        };
        
        const result = await supabase
          .from('user_settings')
          .update(updateData)
          .eq('id', userSettingsId);
          
        if (result.error) {
          throw result.error;
        }
      } else {
        // For inserts, we need to include user_id
        const insertData = {
          user_id: userId,
          name,
          hourly_rate: hourlyRate,
          overtime_rate: overtimeRate,
          overtime_threshold: overtimeThreshold,
          enable_location_verification: enableLocationVerification,
          enable_overtime_calculation: enableOvertimeCalculation,
          updated_at: new Date().toISOString()
        };
        
        const result = await supabase
          .from('user_settings')
          .insert(insertData);
          
        if (result.error) {
          throw result.error;
        }
      }
      
      toast({
        title: "Settings Saved",
        description: "Your profile settings have been updated successfully"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    name,
    setName,
    hourlyRate,
    setHourlyRate,
    overtimeRate,
    setOvertimeRate,
    overtimeThreshold,
    setOvertimeThreshold,
    enableLocationVerification,
    setEnableLocationVerification,
    enableOvertimeCalculation,
    setEnableOvertimeCalculation,
    saveSettings
  };
}
