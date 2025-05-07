
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/App";
import { useUserSettings } from "./user-settings";
import { UserRoleType } from "./user-settings";

export function useSuperAdmin() {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAllUsers();
    }
  }, [isSuperAdmin, user]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(term) || 
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

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
    isLoading,
    users: filteredUsers,
    searchTerm,
    setSearchTerm,
    fetchAllUsers,
    updateUserRole,
    blockUser,
    setSuperAdminStatus
  };
}
