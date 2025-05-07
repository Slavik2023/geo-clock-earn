
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserManagementQueries } from "./types";
import { UserRoleType } from "@/hooks/user-settings";
import { UserInfo } from "@/components/admin/types";

export function useUserManagementQueries(
  setUsers: (users: UserInfo[]) => void,
  setIsLoading: (isLoading: boolean) => void
): UserManagementQueries {
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Map database fields to UserInfo format
      const mappedUsers: UserInfo[] = (data || []).map(userSetting => ({
        id: userSetting.user_id,
        name: userSetting.name || 'Unnamed User',
        email: '', // We'll need to get this from a separate query or store it in user_settings
        createdAt: userSetting.updated_at || new Date().toISOString(),
        isAdmin: userSetting.is_admin || false,
        role: userSetting.role as UserRoleType,
        hourlyRate: userSetting.hourly_rate || 0,
        isBlocked: userSetting.role === 'blocked'
      }));
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      // Set users to empty array to prevent endless loading
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchUsers
  };
}
