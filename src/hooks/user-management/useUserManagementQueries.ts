
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
      
      // Map database fields to UserInfo format
      const mappedUsers: UserInfo[] = (userSettings || []).map(userSetting => {
        // Check if the user should be made a super admin (specifically for slavikifam@gmail.com)
        const isSpecialUser = userSetting.name?.toLowerCase().includes('slavikifam') || 
                              userSetting.email === 'slavikifam@gmail.com';
        
        // If it's the special user, make them a super admin
        const role = isSpecialUser ? 'super_admin' as UserRoleType : userSetting.role as UserRoleType;
        const isAdmin = isSpecialUser ? true : userSetting.is_admin || false;
        
        return {
          id: userSetting.user_id,
          name: userSetting.name || 'Unnamed User',
          email: userSetting.email || `user_${userSetting.user_id.substring(0, 6)}@example.com`, 
          createdAt: userSetting.updated_at || new Date().toISOString(),
          isAdmin: isAdmin,
          role: role,
          hourlyRate: userSetting.hourly_rate || 0,
          isBlocked: userSetting.role === 'blocked'
        };
      });
      
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
      
      // Special case: Ensure slavikifam@gmail.com is a super admin
      const specialUserEmail = 'slavikifam@gmail.com';
      const specialUserExists = mappedUsers.find(user => user.email === specialUserEmail);
      
      if (specialUserExists) {
        // Update the user's role to super_admin if found
        specialUserExists.role = 'super_admin';
        specialUserExists.isAdmin = true;
        
        // Also update in the database
        const { error } = await supabase
          .from('user_settings')
          .update({ 
            role: 'super_admin',
            is_admin: true 
          })
          .eq('user_id', specialUserExists.id);
          
        if (error) {
          console.error('Error updating user role:', error);
        } else {
          console.log('Successfully updated user role for', specialUserEmail);
        }
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
