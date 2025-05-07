
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
      
      // First get user settings data with all columns
      const { data: userSettings, error: userSettingsError } = await supabase
        .from('user_settings')
        .select('*');
      
      if (userSettingsError) {
        console.error('Supabase error fetching user settings:', userSettingsError);
        throw userSettingsError;
      }

      console.log("Raw user settings data:", userSettings);
      
      if (!userSettings || userSettings.length === 0) {
        console.log("No user settings found, checking auth.users directly");
        
        // As a fallback, try to get user IDs from sessions table
        const { data: sessionUsers } = await supabase
          .from('sessions')
          .select('user_id')
          .order('start_time', { ascending: false });
          
        if (sessionUsers && sessionUsers.length > 0) {
          // Create placeholder user settings for users with sessions
          const uniqueUserIds = [...new Set(sessionUsers.map(session => session.user_id))];
          console.log("Found users in sessions:", uniqueUserIds);
          
          // Create placeholder user settings
          const placeholderUsers = uniqueUserIds.map(userId => ({
            id: userId,
            user_id: userId,
            name: `User ${userId.substring(0, 6)}`,
            email: `user_${userId.substring(0, 6)}@example.com`,
            hourly_rate: 25,
            role: 'user' as UserRoleType,
            is_admin: false,
            updated_at: new Date().toISOString()
          }));
          
          setUsers(
            placeholderUsers.map(user => ({
              id: user.user_id,
              name: user.name,
              email: user.email || `user_${user.user_id.substring(0, 6)}@example.com`,
              createdAt: user.updated_at,
              isAdmin: user.is_admin || false,
              role: user.role as UserRoleType,
              hourlyRate: user.hourly_rate || 25,
              isBlocked: user.role === 'blocked'
            }))
          );
          setIsLoading(false);
          return;
        }
      }
      
      // Map database fields to UserInfo format
      const mappedUsers: UserInfo[] = (userSettings || []).map(userSetting => {
        // Check if the user should be made a super admin (specifically for slavikifam@gmail.com)
        const isSpecialUser = userSetting.name?.toLowerCase().includes('slavikifam') || 
                              userSetting.name?.includes('slavikifam@gmail.com');
        
        // If it's the special user, make them a super admin
        const role = isSpecialUser ? 'super_admin' as UserRoleType : userSetting.role as UserRoleType;
        const isAdmin = isSpecialUser ? true : userSetting.is_admin || false;
        
        // Determine email - use actual email if we have it or generate one based on user_id
        const email = userSetting.name?.includes('@') 
          ? userSetting.name 
          : `user_${userSetting.user_id.substring(0, 6)}@example.com`;
        
        return {
          id: userSetting.user_id,
          name: userSetting.name || 'Unnamed User',
          email: email, 
          createdAt: userSetting.updated_at || new Date().toISOString(),
          isAdmin: isAdmin,
          role: role,
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
      
      // Special case: Ensure slavikifam@gmail.com is a super admin
      const specialUserEmail = 'slavikifam@gmail.com';
      const specialUserExists = mappedUsers.find(user => 
        user.email === specialUserEmail || 
        user.name?.includes(specialUserEmail)
      );
      
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
