
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
      // First get user settings data
      const { data: userSettings, error: userSettingsError } = await supabase
        .from('user_settings')
        .select('*');
      
      if (userSettingsError) {
        console.error('Supabase error fetching user settings:', userSettingsError);
        throw userSettingsError;
      }
      
      // Get emails from auth.users through a server function if possible
      // For now, we have to work with what we have and create a mapping
      
      // Map database fields to UserInfo format
      const mappedUsers: UserInfo[] = (userSettings || []).map(userSetting => ({
        id: userSetting.user_id,
        name: userSetting.name || 'Unnamed User',
        email: `user_${userSetting.user_id.substring(0, 6)}@example.com`, // Placeholder email
        createdAt: userSetting.updated_at || new Date().toISOString(),
        isAdmin: userSetting.is_admin || false,
        role: userSetting.role as UserRoleType,
        hourlyRate: userSetting.hourly_rate || 0,
        isBlocked: userSetting.role === 'blocked'
      }));
      
      // Add some mock data if in development and no real users are returned
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
          },
          {
            id: '3',
            name: 'Demo Super Admin',
            email: 'superadmin@example.com',
            createdAt: new Date().toISOString(),
            isAdmin: true,
            role: 'super_admin',
            hourlyRate: 75,
            isBlocked: false
          }
        );
      }
      
      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      // Provide more detailed error message based on the error type
      if (error.message?.includes('Failed to fetch')) {
        toast.error('Network error: Unable to connect to the database. Please check your internet connection.');
      } else if (error.code === 'PGRST301') {
        toast.error('Authentication error: Please log in again.');
      } else {
        toast.error('Failed to load users: ' + (error.message || 'Unknown error'));
      }
      
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
