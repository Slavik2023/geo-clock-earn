
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useUserSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userSettingsId, setUserSettingsId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
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
        setUserRole(settingsData.role || 'user');
        setIsAdmin(settingsData.is_admin || false);
        setIsSuperAdmin(settingsData.role === 'super_admin');
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
  
  const createSuperAdminProfile = async (email: string = "slavikifam@gmail.com") => {
    setIsLoading(true);
    try {
      // Check if the user with this email exists in auth system
      const { data: authData, error: authError } = await supabase
        .rpc("get_user_id_by_email", { email_param: email });
      
      if (authError) {
        console.error("Error checking user:", authError);
        toast({
          title: "Ошибка",
          description: `Пользователь с почтой ${email} не найден в системе. Пользователь должен сначала зарегистрироваться.`,
          variant: "destructive"
        });
        return false;
      }
      
      // If the user exists, create or update user_settings
      if (authData) {
        const { data: existing, error: checkError } = await supabase
          .from('user_settings')
          .select('id')
          .eq('user_id', authData)
          .maybeSingle();
          
        if (checkError) {
          throw checkError;
        }
        
        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('user_settings')
            .update({
              is_admin: true,
              role: 'super_admin',
              name: 'Super Admin',
              subscription_status: 'premium',
              hourly_rate: 100
            })
            .eq('user_id', authData);
            
          if (updateError) {
            throw updateError;
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: authData,
              is_admin: true,
              role: 'super_admin',
              name: 'Super Admin',
              subscription_status: 'premium',
              hourly_rate: 100,
              overtime_rate: 37.5,
              overtime_threshold: 8,
              enable_location_verification: true,
              enable_overtime_calculation: true
            });
            
          if (insertError) {
            throw insertError;
          }
        }
        
        // Create audit log
        await supabase
          .from('audit_logs')
          .insert({
            user_id: userId,
            action: 'create_superadmin',
            entity_type: 'user_settings',
            details: { email: email, role: 'super_admin', is_admin: true }
          });
        
        toast({
          title: "Успех",
          description: `Пользователь ${email} назначен главным администратором системы`,
        });
        
        return true;
      } else {
        toast({
          title: "Пользователь не найден",
          description: "Пользователь с данным email не найден в системе",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
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
    saveSettings,
    createSuperAdminProfile,
    userRole,
    isAdmin,
    isSuperAdmin
  };
}
