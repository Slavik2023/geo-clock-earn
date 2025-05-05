
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";

export function useSuperAdminProfile() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const createSuperAdminProfile = async (email: string = "") => {
    setIsLoading(true);
    try {
      if (!email) {
        toast({
          title: "Error",
          description: "Please provide an email address",
          variant: "destructive"
        });
        return false;
      }

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
              enable_overtime_calculation: true,
              email: email
            });
            
          if (insertError) {
            throw insertError;
          }
        }
        
        // Create audit log
        const auditDetails = {
          email: email,
          role: 'super_admin',
          is_admin: true
        };
        
        await supabase
          .from('audit_logs')
          .insert({
            user_id: await getCurrentUserId(),
            action: 'create_superadmin',
            entity_type: 'user_settings',
            details: auditDetails as Json
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

  // Helper function to get current user ID
  const getCurrentUserId = async (): Promise<string> => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || 'system';
  };

  return {
    isLoading,
    createSuperAdminProfile
  };
}
