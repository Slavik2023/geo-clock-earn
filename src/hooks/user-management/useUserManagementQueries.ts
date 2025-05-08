
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
      console.log("Fetching all users from user_settings table");
      
      // First get all users from auth.users through the user_settings table
      const { data: userSettings, error: userSettingsError } = await supabase
        .from('user_settings')
        .select('*');
      
      if (userSettingsError) {
        console.error('Error fetching user settings:', userSettingsError);
        throw userSettingsError;
      }

      console.log("Raw user settings data:", userSettings);
      
      // Map database fields to UserInfo format
      const mappedUsers: UserInfo[] = (userSettings || []).map(userSetting => {
        // Determine email - use actual email if we have it or generate one based on user_id
        const email = userSetting.name?.includes('@') 
          ? userSetting.name 
          : `user_${userSetting.user_id.substring(0, 6)}@example.com`;
        
        return {
          id: userSetting.user_id,
          name: userSetting.name || 'Unnamed User',
          email: email, 
          createdAt: userSetting.updated_at || new Date().toISOString(),
          isAdmin: userSetting.is_admin || false,
          role: userSetting.role as UserRoleType,
          hourlyRate: userSetting.hourly_rate || 0,
          isBlocked: userSetting.role === 'blocked'
        };
      });

      console.log("Mapped users for display:", mappedUsers);
      
      // If this is in development mode and no users, add mock data
      if (mappedUsers.length === 0 && process.env.NODE_ENV === 'development') {
        console.log('Adding mock data for development');
        mappedUsers.push(
          {
            id: '1',
            name: 'Demo Admin',
            email: 'admin@example.com',
            createdAt: new Date().toISOString(),
            isAdmin: true,
            role: 'admin',
            hourlyRate: 50,
            isBlocked: false
          },
          {
            id: '2',
            name: 'Demo User',
            email: 'user@example.com',
            createdAt: new Date().toISOString(),
            isAdmin: false,
            role: 'user',
            hourlyRate: 25,
            isBlocked: false
          }
        );
      }
      
      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      toast.error('Failed to load users: ' + (error.message || 'Unknown error'));
      
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
