
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SuperAdminQueries, SuperAdminUser } from "./types";
import { useAuth } from "@/App";
import { useUserSettings } from "@/hooks/user-settings";

export function useSuperAdminQueries(
  setUsers: (users: SuperAdminUser[]) => void,
  setFilteredUsers: (users: SuperAdminUser[]) => void,
  setIsLoading: (isLoading: boolean) => void
): SuperAdminQueries {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserSettings();

  const fetchAllUsers = async () => {
    if (!user || !isSuperAdmin) return;
    
    setIsLoading(true);
    try {
      // First get all user settings
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*');
      
      if (settingsError) throw settingsError;
      
      // Create enhanced users with email field (even if it's just a placeholder)
      const enhancedUsers = (userSettings || []).map(userSetting => {
        return {
          ...userSetting,
          // Use a placeholder email if not available in the user_settings table
          email: `user-${userSetting.user_id.substring(0, 8)}@example.com`
        };
      });
      
      setUsers(enhancedUsers);
      setFilteredUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchAllUsers,
  };
}
