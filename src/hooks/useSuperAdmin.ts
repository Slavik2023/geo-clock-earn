
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useSuperAdmin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Create audit log as a separate function
  const createAuditLog = async (email: string) => {
    try {
      const { data } = await supabase.auth.getUser();
      const currentUserId = data?.user?.id || 'system';
      
      await supabase.from("audit_logs").insert({
        user_id: currentUserId,
        action: "set_super_admin",
        entity_type: "user_settings",
        details: { email, role: "super_admin" }
      });
    } catch (logError) {
      console.error("Error creating audit log:", logError);
    }
  };

  const setSuperAdminStatus = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // First, get the user ID by email
      const { data: users, error: userError } = await supabase
        .from("user_settings")
        .select("user_id")
        .eq("email", email);
      
      if (userError) {
        throw userError;
      }
      
      // Handle case when user is not found
      if (!users || users.length === 0) {
        // User not found, create a record for this email in user_settings
        // Get the user ID from auth.users
        const { data: authData, error: authError } = await supabase
          .rpc("get_user_id_by_email", { email_param: email });
        
        if (authError || !authData) {
          toast({
            title: "Ошибка",
            description: `Пользователь с почтой ${email} не найден. Пользователь должен сначала зарегистрироваться.`,
            variant: "destructive"
          });
          return false;
        }
        
        // Create the user settings record with admin privileges
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: authData,
            email: email,
            name: "Super Admin",
            is_admin: true,
            role: "super_admin",
            subscription_status: "premium",
            hourly_rate: 100
          });
        
        if (insertError) {
          throw insertError;
        }
      } else {
        // User found, update to super admin status
        const userId = users[0].user_id;
        
        const { error: updateError } = await supabase
          .from("user_settings")
          .update({
            is_admin: true,
            role: "super_admin",
            subscription_status: "premium"
          })
          .eq("user_id", userId);
        
        if (updateError) {
          throw updateError;
        }
      }
      
      // Create audit log separately
      await createAuditLog(email);
      
      toast({
        title: "Успех",
        description: `Пользователь ${email} назначен главным администратором системы`,
      });
      
      return true;
    } catch (error) {
      console.error("Error setting super admin status:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось назначить суперадмина",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setSuperAdminStatus
  };
}
