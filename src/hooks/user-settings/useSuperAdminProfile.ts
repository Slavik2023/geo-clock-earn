
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useSuperAdminProfile() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const createSuperAdminProfile = async () => {
    setIsLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create a super admin profile",
          variant: "destructive"
        });
        return;
      }
      
      // Update user settings with super_admin role
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          role: 'super_admin', 
          is_admin: true 
        })
        .eq('user_id', userData.user.id);
      
      if (error) throw error;
      
      toast({
        title: "Super Admin Created",
        description: "You now have super admin privileges"
      });
    } catch (error) {
      console.error("Error creating super admin profile:", error);
      toast({
        title: "Error",
        description: "Failed to create super admin profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return { createSuperAdminProfile, isLoading };
}
