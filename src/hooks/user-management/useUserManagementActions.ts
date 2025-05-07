
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserManagementMutations } from "./types";
import { UserFormData, UserInfo } from "@/components/admin/types";
import { UserRoleType } from "@/hooks/user-settings";

export function useUserManagementActions(
  fetchUsers: () => Promise<void>,
  setIsLoading: (isLoading: boolean) => void
): UserManagementMutations {
  const updateUser = async (userId: string, userData: UserFormData) => {
    setIsLoading(true);
    try {
      // Update user settings in the database
      const { error } = await supabase
        .from('user_settings')
        .update({
          name: userData.name,
          role: userData.role as UserRoleType,
          hourly_rate: userData.hourlyRate,
          is_admin: userData.isAdmin
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success("User information updated");
      
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ is_admin: !isAdmin })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success(isAdmin ? "Admin status revoked" : "Admin status granted");
      
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error("Failed to update admin status");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBlockUser = async (userId: string, isBlocked: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          role: isBlocked ? 'user' as UserRoleType : 'blocked' as UserRoleType
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error toggling block status:', error);
      toast.error("Failed to update user status");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      // We don't actually delete the user, just mark them as deleted
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          role: 'deleted' as UserRoleType
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success("User marked as deleted");
      
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUser,
    deleteUser,
    toggleAdminStatus,
    toggleBlockUser
  };
}
