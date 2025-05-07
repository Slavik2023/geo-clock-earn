
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useSuperAdminProfile() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const createSuperAdminProfile = async () => {
    setIsUpdating(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user || !user.user) {
        throw new Error("You must be logged in to become a super admin");
      }

      // Call the Supabase edge function to update user metadata
      const url = `${supabase.supabaseUrl}/functions/v1/update-user-metadata`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.user.id,
          metadata: {
            is_super_admin: true,
            super_admin_since: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user profile");
      }

      // Update the user_settings table
      const { error: settingsError } = await supabase
        .from("user_settings")
        .update({ 
          role: "super_admin",
          is_admin: true 
        })
        .eq("user_id", user.user.id);

      if (settingsError) {
        throw settingsError;
      }

      toast({
        title: "Success!",
        description: "You are now a super admin",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating super admin profile:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create super admin profile",
      });
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    createSuperAdminProfile,
    isUpdating,
  };
}
