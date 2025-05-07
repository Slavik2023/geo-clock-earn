
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SuperAdminMutations } from "./types";
import { useAuth } from "@/App";
import { useUserSettings } from "@/hooks/user-settings";
import { UserRoleType } from "@/hooks/user-settings";

export function useSuperAdminActions(
  setIsLoading: (isLoading: boolean) => void,
  fetchAllUsers: () => Promise<void>
): SuperAdminMutations {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserSettings();

  const updateUserRole = async (userId: string, role: UserRoleType) => {
    if (!user || !isSuperAdmin) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success('User role updated successfully');
      await fetchAllUsers();
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (userId: string, isBlocked: boolean) => {
    if (!user || !isSuperAdmin) return false;
    
    setIsLoading(true);
    try {
      // If unblocking, set role to 'user', otherwise set to 'blocked'
      const role = isBlocked ? 'user' as UserRoleType : 'blocked' as UserRoleType;
      
      const { error } = await supabase
        .from('user_settings')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: isBlocked ? 'unblock_user' : 'block_user',
        entity_type: 'user_settings',
        details: { target_user_id: userId, action: isBlocked ? 'unblock' : 'block' }
      });
      
      return true;
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast.error(`Failed to ${isBlocked ? 'unblock' : 'block'} user`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setSuperAdminStatus = async (email: string) => {
    if (!user || !isSuperAdmin) return false;
    
    setIsLoading(true);
    try {
      // Get user ID from email using RPC or direct query
      const { data: userId, error: userIdError } = await supabase
        .rpc('get_user_id_by_email', { email_param: email });
      
      if (userIdError || !userId) {
        toast.error(`User with email ${email} not found. The user must register first.`);
        return false;
      }
      
      const { error } = await supabase
        .from('user_settings')
        .update({ role: 'super_admin' as UserRoleType })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'set_super_admin',
        entity_type: 'user_settings',
        details: { email, role: 'super_admin' }
      });
      
      toast.success(`User ${email} has been assigned as system super administrator`);
      return true;
    } catch (error) {
      console.error('Error setting super admin:', error);
      toast.error('Failed to assign super admin');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserRole,
    blockUser,
    setSuperAdminStatus
  };
}
